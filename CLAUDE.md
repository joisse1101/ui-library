# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@joisse1101/ui-library` — a personal React + TypeScript component library built with Vite, styled with SCSS, and documented/developed through Storybook. It's published to GitHub Packages and consumed by other projects (e.g. via `yalc`).

## Commands

- `npm run build` — type-checks (`tsc`) then builds the library with Vite (outputs `dist/index.es.js`, `dist/index.cjs.js`, `dist/index.d.ts`, `dist/ui-library.css`).
- `npm run storybook` — runs Storybook dev server on port 6006. This is the primary way to visually develop/verify components.
- `npm run build-storybook` — builds the static Storybook site (same output GitHub Pages deploys from).
- `npm run yalc:push` — builds then pushes to a local `yalc` store, for testing this library inside a consuming project without publishing.
- `npm run lint` — runs ESLint over the repo.
- `npm test` — runs `vitest run` once (CI-friendly); `npm run test:watch` runs it in watch mode. There are no separate `*.test.tsx` files — the `@storybook/addon-vitest` addon (wired in `vite.config.ts`'s `test.projects` and `.storybook/main.ts`'s `addons`) runs every `*.stories.tsx` file as a browser test via `vitest`'s Playwright provider (Chromium, headless). Writing/adjusting stories *is* writing/adjusting tests for that component.

## Architecture

### Package structure
- Library entry point is `src/index.ts`, a hand-maintained barrel file exporting components, layouts, hooks, and utils. **Every new public component/hook/util must be added here explicitly** — nothing is auto-exported.
- Vite builds `src/index.ts` as a library (`vite.config.ts`) in ES + CJS formats; `react`, `react-dom`, and `react-router-dom` are peer deps and externalized from the bundle.
- `vite-plugin-dts` generates the `.d.ts` bundle during build.
- Consumers import compiled CSS separately via the `./ui-library.css` export, and can import `./styles/_variables.scss` directly for SCSS variable access (see `package.json` `exports`).

### Path aliases
`@<path>` resolves to `src/<path>` (e.g. `@components/Header`, `@hooks/useCanSideScroll`, `@utils/colours`, `@stories/DocsPage`, and even `@index` for the barrel file itself). This is configured in two places that must stay in sync: `tsconfig.app.json` (`paths: { "@*": ["./src/*"] }`) and `vite.config.ts` (`resolve.alias`). Storybook picks up the same aliases via the `vite-tsconfig-paths` plugin in `.storybook/main.ts`. Both alias imports (`@hooks/...`) and relative imports (`../hooks/...`) are used interchangeably across the codebase — no strong convention on which to prefer.

### Component conventions
- Each component lives in its own folder under `src/components/ComponentName/`, containing `ComponentName.tsx`, `ComponentName.stories.tsx`, an `index.ts` barrel (`export { ComponentName } from './ComponentName';`), and — where the component owns exclusive styles — its own SCSS file colocated alongside. Stories are excluded from the TS build (`tsconfig.app.json` excludes `*.stories.tsx`) and from the library bundle.
- The root `src/index.ts` imports from `./components/ComponentName` (the folder), which resolves to that folder's `index.ts`. Cross-component imports (e.g. `TextArea` using `Button`) go through the `@components/ComponentName` alias rather than a relative `../` path.
- A component that's purely private to another (e.g. `Carousel`, used only by `CardCarousel`) is colocated inside that owner's folder without its own top-level entry or barrel export.
- Components are typed `React.FC<Props>` with `Props` extending the relevant native HTML element attributes where applicable (see `Button.tsx`), and typically build a `className` string via an array + `.filter(Boolean).join(' ')` pattern rather than a classnames library.
- Shared option/selector types live in `src/types/selectors.ts` (`Option = { label, value }`), used by `ButtonSelector`, `RadioSelector`, `InlineSelect`, etc. (Note: `src/selectors.ts` at the root duplicates this type — check both when touching selector types.)
- Horizontally-scrollable components (`ButtonSelector`, `RadioSelector`, `Tabs`) share the `useCanSideScroll` hook (`src/hooks/useCanSideScroll.ts`) plus the `.overlay-wrapper` / `.overlay-left` / `.overlay-right` CSS pattern in `_core_theme.scss` for fade-edge scroll affordances.
- Responsive behavior is driven by the `useMediaQuery` hook (`src/hooks/display.ts`), not raw `matchMedia` calls scattered in components.

### Styling
Styles fall into two categories, and it matters which one you're touching:

- **Shared/global utility layers** — genuinely reused across multiple components, or styling bare HTML elements consumers render outside these components entirely. These stay as plain SCSS partials in `src/styles/` (`_component_button.scss` for the whole `.btn`/`.btn-*` system used by `Button`, `Modal`, `Tabs`, `WeekSelector`, `ButtonSelector`, and `ColourPalettePicker`; `_component_card.scss` for `.card`/`.input-card`/`.form-card` used by `Card`, `CardCarousel`, and `ColourPalettePicker`; `_component_input.scss` for shared form primitives — `.form-group`, `.label`, `.input-wrapper`, `.radio-option` — plus base styling for bare `input`/`label`/`select` elements; `_navigation.scss` for `Header`/`Footer`'s Jekyll/minima-theme classes), plus `_core_theme.scss` (base reset/theme tokens, applied unconditionally) and `_variables.scss` (design tokens). All of these are still aggregated centrally via `src/styles/index.scss`, imported once from `src/index.ts`. **Before assuming a component's styles are exclusive to it, grep for its class names across `src/components/` — several look component-specific but aren't.**
- **Don't delete a class or partial just because nothing in this repo's own components references it.** Consumers (this library is consumed via `yalc` by other personal projects) compose their own markup directly against exported global classes, so "unused within this repo" doesn't mean dead — e.g. `_component_toast.scss` styles the third-party `sonner` toast library's `[data-sonner-*]` attributes with no `Toast` component here at all, and both `_component_loading_spinner.scss` and parts of `ColourPalettePicker`'s accordion-related classes look orphaned (no component here renders them) but are actively used by downstream projects. Always confirm with the maintainer before removing anything that looks unused, however dead it appears from this repo alone.
- **Component-owned styles** — used by exactly one component and nothing else. These are colocated in that component's folder and self-imported directly from the `.tsx` file (never registered in `index.scss`):
  - Where the styles have zero interaction with the shared utility layers above, they're real **CSS Modules** (`ComponentName.module.scss`, imported as `import styles from './ComponentName.module.scss'`, classes referenced as `styles['some-class']`). Current examples: `Switch`, `InlineSelect`, `TextArea`, `Tabs`, `Modal`, `WeekSelector`.
  - Where the component's own stylesheet nests overrides of a shared global class (e.g. `ColourPalettePicker`'s `.color-row .btn-danger` override, or `CardCarousel`'s `.carousel .card` targeting the global `.card`), it stays a **plain, non-hashed SCSS file** colocated and self-imported (e.g. `import './ColourPalettePicker.scss'`) rather than a `.module.scss` — CSS Modules would hash the nested global class reference and silently break the override. Current examples: `ColourPalettePicker`, `CardCarousel`.
  - Any `@use 'variables'` / `@use 'component_button'` etc. inside a colocated file needs the relative path adjusted to `../../styles/...` since it no longer lives in `src/styles/`.
- `variables.module.scss` (in `src/styles/`) re-exports select SCSS variables (`colorStretch`, `colorSuccess`, etc.) as a JS-importable CSS module for components that need design tokens in TS (e.g. color computations in `ColourPalettePicker`/`utils/colours.ts`).

### Theming (dark/light)
- Every themeable (color/shadow) SCSS token in `_variables.scss` is split into a `$dark-*` / `$light-*` pair (e.g. `$dark-bg-main` / `$light-bg-main`); non-themeable tokens (typography, spacing, radii, sizing) keep their plain unprefixed names and don't get a light counterpart. When adding a new themeable token, add both the `$dark-*` and `$light-*` SCSS variables and a value for each in the two `[data-theme]` blocks below — never introduce a new plain unprefixed color/shadow variable.
- All component stylesheets and CSS modules consume these tokens exclusively via `var(--token)` (e.g. `var(--bg-main)`), never the SCSS variable directly — theme switching happens at paint time, not build time. The CSS custom-property *names* (`--bg-main`, `--brand-accent`, etc.) are stable across the rename; only the backing SCSS variable names differ per theme.
- `_variables.scss` emits `:root, [data-theme='dark'] { --bg-main: #{$dark-bg-main}; ... }` and a separate `[data-theme='light'] { --bg-main: #{$light-bg-main}; ... }` block. Dark is the implicit default (bare `:root` carries dark values), so any consumer that never sets `data-theme` sees no change. `--color-scheme` is themed the same way and consumed via `html { color-scheme: var(--color-scheme); }` in `_core_theme.scss`, so native form controls/scrollbars follow the active theme.
- Alpha-derived colors (e.g. `rgba($color-success, 0.12)`) can't be precomputed per theme without doubling the token count, so their base tokens also get a `$dark-*-rgb` / `$light-*-rgb` triplet (e.g. `--color-success-rgb: 52, 211, 153;`), and usages read `rgb(var(--color-success-rgb) / 0.12)` at runtime instead of a baked-in literal. Shadows are the exception — they're declared as full per-theme literals (not the RGB-channel trick) since some (e.g. the hover glow) need to flip hue between themes, not just dim.
- `ThemeProvider` (`src/providers/ThemeProvider.tsx`) and `useTheme` (`src/providers/ThemeContext.ts`), exported from `src/index.ts`, set `data-theme` on `document.documentElement`. Supports uncontrolled (`defaultTheme`, defaults to `"dark"`) and controlled (`theme` + `onThemeChange`) usage, following the `FormContext`/`FormProvider` pattern. No persistence (localStorage) or `prefers-color-scheme` detection — theme choice is in-memory only.
- Storybook's toolbar has a `theme` global (`.storybook/preview.tsx`) wired to `ThemeProvider` in controlled mode, defaulting to dark, so every story can be previewed in both themes.

### Storybook
- Stories live alongside components and are auto-discovered (`src/**/*.stories.tsx`).
- Two internal-only helpers under `src/stories/` (not exported from the library) are used across many stories: `DocsPage` (a custom autodocs page composing Storybook's `addon-docs` blocks) and `ResponsiveMatrix` (renders a component at multiple widths — "Compact View" 360px and "Full View" 100% — to demonstrate responsive behavior).
- Storybook is deployed to GitHub Pages on every push to `main` (`.github/workflows/deploy-storybook.yml`).

### Publishing
- Releases are published to GitHub Packages (`npm.pkg.github.com`, scope `@joisse1101`) via `.github/workflows/publish.yml`, triggered by a published GitHub Release (not on every merge to `main`).

## Known issues (to fix)
- `npm run lint` currently fails with 8 pre-existing errors, surfaced once the `lint` script was added:
  - `src/components/CardCarousel/Carousel.tsx` — three `react-hooks/refs` errors (reading `.current` during render instead of in an effect/event handler).
  - `src/hooks/display.ts` — one `react-hooks/set-state-in-effect` error (calling `setMatches` synchronously in the effect body instead of via `useState`'s lazy initializer or `useSyncExternalStore`).
- No CI gate runs `npm run lint` / `npm test` on PRs or before publish. `.github/workflows/publish.yml` and `.github/workflows/deploy-storybook.yml` only run `npm ci` + build steps. A CI workflow for lint+test would also need `npx playwright install --with-deps chromium` since tests run in a real headless Chromium via `@storybook/addon-vitest`.
