# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@joisse1101/ui-library` — a personal React + TypeScript component library built with Vite, styled with SCSS, and documented/developed through Storybook. It's published to GitHub Packages and consumed by other projects (e.g. via `yalc`).

## Commands

- `npm run build` — type-checks (`tsc`) then builds the library with Vite (outputs `dist/index.es.js`, `dist/index.cjs.js`, `dist/index.d.ts`, `dist/ui-library.css`).
- `npm run storybook` — runs Storybook dev server on port 6006. This is the primary way to visually develop/verify components.
- `npm run build-storybook` — builds the static Storybook site (same output GitHub Pages deploys from).
- `npm run yalc:push` — builds then pushes to a local `yalc` store, for testing this library inside a consuming project without publishing.

There is no lint script or test script defined in `package.json` (ESLint config exists but must be run via `npx eslint .`; no test files exist yet despite `vitest`/`playwright` devDependencies being present).

## Architecture

### Package structure
- Library entry point is `src/index.ts`, a hand-maintained barrel file exporting components, layouts, hooks, and utils. **Every new public component/hook/util must be added here explicitly** — nothing is auto-exported.
- Vite builds `src/index.ts` as a library (`vite.config.ts`) in ES + CJS formats; `react`, `react-dom`, and `react-router-dom` are peer deps and externalized from the bundle.
- `vite-plugin-dts` generates the `.d.ts` bundle during build.
- Consumers import compiled CSS separately via the `./ui-library.css` export, and can import `./styles/_variables.scss` directly for SCSS variable access (see `package.json` `exports`).

### Path aliases
`@<path>` resolves to `src/<path>` (e.g. `@components/Header`, `@hooks/useCanSideScroll`, `@utils/colours`, `@stories/DocsPage`, and even `@index` for the barrel file itself). This is configured in two places that must stay in sync: `tsconfig.app.json` (`paths: { "@*": ["./src/*"] }`) and `vite.config.ts` (`resolve.alias`). Storybook picks up the same aliases via the `vite-tsconfig-paths` plugin in `.storybook/main.ts`. Both alias imports (`@hooks/...`) and relative imports (`../hooks/...`) are used interchangeably across the codebase — no strong convention on which to prefer.

### Component conventions
- Each component lives in `src/components/` as a pair: `ComponentName.tsx` + `ComponentName.stories.tsx`. Stories are excluded from the TS build (`tsconfig.app.json` excludes `*.stories.tsx`) and from the library bundle.
- Components are typed `React.FC<Props>` with `Props` extending the relevant native HTML element attributes where applicable (see `Button.tsx`), and typically build a `className` string via an array + `.filter(Boolean).join(' ')` pattern rather than a classnames library.
- Shared option/selector types live in `src/types/selectors.ts` (`Option = { label, value }`), used by `ButtonSelector`, `RadioSelector`, `InlineSelect`, etc. (Note: `src/selectors.ts` at the root duplicates this type — check both when touching selector types.)
- Horizontally-scrollable components (`ButtonSelector`, `RadioSelector`, `Tabs`) share the `useCanSideScroll` hook (`src/hooks/useCanSideScroll.ts`) plus the `.overlay-wrapper` / `.overlay-left` / `.overlay-right` CSS pattern in `_core_theme.scss` for fade-edge scroll affordances.
- Responsive behavior is driven by the `useMediaQuery` hook (`src/hooks/display.ts`), not raw `matchMedia` calls scattered in components.

### Styling
- SCSS partials live in `src/styles/`, prefixed `_component_*.scss` per component, plus `_core_theme.scss` (base reset/typography/theme tokens) and `_variables.scss` (design tokens: colors, spacing, radii, shadows, fonts).
- `src/styles/index.scss` is the aggregator that `@use`s the core theme and most component partials — this is what gets bundled into `dist/ui-library.css` and is imported once from `src/index.ts`.
- **Newer components (`Switch`, `InlineSelect`, `TextArea`) instead import their own SCSS partial directly in the component file** (e.g. `import '../styles/_component_switch.scss'`) rather than being registered in `index.scss`. When adding a new component's styles, prefer this self-contained pattern over editing `index.scss`, but be aware both patterns currently coexist.
- `variables.module.scss` re-exports select SCSS variables (`colorStretch`, `colorSuccess`, etc.) as a JS-importable CSS module for components that need design tokens in TS (e.g. color computations in `ColourPalettePicker`/`utils/colours.ts`).
- The theme is dark-only (`color-scheme: dark` in `_core_theme.scss`); there is no light-mode toggle.

### Storybook
- Stories live alongside components and are auto-discovered (`src/**/*.stories.tsx`).
- Two internal-only helpers under `src/stories/` (not exported from the library) are used across many stories: `DocsPage` (a custom autodocs page composing Storybook's `addon-docs` blocks) and `ResponsiveMatrix` (renders a component at multiple widths — "Compact View" 360px and "Full View" 100% — to demonstrate responsive behavior).
- Storybook is deployed to GitHub Pages on every push to `main` (`.github/workflows/deploy-storybook.yml`).

### Publishing
- Releases are published to GitHub Packages (`npm.pkg.github.com`, scope `@joisse1101`) via `.github/workflows/publish.yml`, triggered by a published GitHub Release (not on every merge to `main`).
