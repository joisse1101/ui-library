## 1. Token layer (`src/styles/_variables.scss`)

- [ ] 1.1 Rename every themeable `$token` (the D1 list in design.md: backgrounds, text, brand/accent, feedback colors, borders, inputs, shadows) to `$dark-token`, and update every in-file reference (e.g. `$brand-disabled: $text-dim;` → `$dark-brand-disabled: $dark-text-dim;`). Verify by grepping the file for the old unprefixed names and confirming zero remaining hits among the D1 list.
- [ ] 1.2 Add the corresponding `$light-token` variable for each renamed token, using the values proposed in design.md's palette table (adjust any you want to change before implementing). Verify every `$dark-*` token has a matching `$light-*` counterpart.
- [ ] 1.3 Add `$dark-*-rgb` / `$light-*-rgb` triplet variables (e.g. `$dark-color-success-rgb: 52, 211, 153;`) for the bases used in alpha-derived values per D3 (`color-success`, `color-danger`, `bg-surface-hover`, `border-subtle`, `brand-border-strong`, `bg-glass`).
- [ ] 1.4 Rewrite the `:root { ... }` custom-property block into `:root, [data-theme='dark'] { ... }` (dark values) and a new `[data-theme='light'] { ... }` block (light values), per D2, including the `--color-scheme` custom property and RGB-triplet properties from 1.3. Leave non-themeable tokens (typography, spacing, radii, sizing) as plain `--token: #{$token};` entries unchanged outside these theme blocks.
- [ ] 1.5 Add `html { color-scheme: var(--color-scheme); }` (or fold into `_core_theme.scss` if that reads more naturally alongside the existing `html { ... }` block — see task 2.1) and remove the old hardcoded `color-scheme: dark;`.
- [ ] 1.6 Run `npm run build` and confirm the SCSS compiles with no errors and `dist/ui-library.css` contains both `[data-theme='dark']` and `[data-theme='light']` rule blocks.

## 2. Shared style partials → `var()`

- [ ] 2.1 Convert `src/styles/_core_theme.scss` color/shadow declarations from `$token` to `var(--token)` (including removing/relocating the old `color-scheme: dark` per 1.5). Verify by grepping the file for remaining themeable `$token` references (should be none) and comparing rendered Storybook output against `main` for visual parity in dark mode.
- [ ] 2.2 Convert `src/styles/_component_button.scss`, including the alpha-derived declarations, to the `rgb(var(--x-rgb) / alpha)` pattern from D3 where applicable. Verify no themeable `$token` references remain and dark-mode buttons render unchanged in Storybook.
- [ ] 2.3 Convert `src/styles/_component_card.scss` to `var()`. Verify no themeable `$token` references remain and dark-mode cards render unchanged in Storybook.
- [ ] 2.4 Convert `src/styles/_component_input.scss` to `var()` (note: this file already has some `var(--...)` usage — reconcile with the new token names rather than introducing a second parallel scheme). Verify no themeable `$token` references remain and dark-mode inputs render unchanged in Storybook.
- [ ] 2.5 Convert `src/styles/_navigation.scss` to `var()`. Verify no themeable `$token` references remain and dark-mode Header/Footer render unchanged in Storybook.
- [ ] 2.6 Convert `src/styles/_component_toast.scss` to `var()` (no story exists for this — verify by temporarily rendering a `sonner` toast in a scratch story or the browser console against both themes, then remove the scratch story).
- [ ] 2.7 Convert `src/styles/_component_code_blocks.scss` to `var()`. Verify no themeable `$token` references remain and dark-mode code blocks render unchanged in Storybook.

## 3. Component-owned styles → `var()`

- [ ] 3.1 Convert `src/components/Switch/Switch.module.scss` to `var()`. Verify the Switch story renders unchanged in dark mode and correctly in light mode once the toggle exists (task 5).
- [ ] 3.2 Convert `src/components/Modal/Modal.module.scss` to `var()`. Verify the Modal story renders unchanged in dark mode.
- [ ] 3.3 Convert `src/components/TextArea/TextArea.module.scss` to `var()`. Verify the TextArea story renders unchanged in dark mode.
- [ ] 3.4 Convert `src/components/Tabs/Tabs.module.scss` to `var()`. Verify the Tabs story renders unchanged in dark mode.
- [ ] 3.5 Convert `src/components/ColourPalettePicker/ColourPalettePicker.scss` to `var()`, keeping its nested global-class overrides (e.g. `.color-row .btn-danger`) intact per the plain-SCSS-file convention. Verify the story renders unchanged in dark mode.
- [ ] 3.6 Convert `src/components/CardCarousel/CardCarousel.scss` to `var()`, keeping its `.carousel .card` global override intact. Verify the story renders unchanged in dark mode.
- [ ] 3.7 Update `src/styles/variables.module.scss` (the JS-importable token re-export used by `utils/colours.ts`) to point at whichever `$dark-*`/`$light-*` names replaced the ones it currently re-exports, and check `src/utils/colours.ts` still compiles against it. Verify with `npm run build`.

## 4. `ThemeProvider` / `useTheme`

- [ ] 4.1 Create `src/providers/ThemeContext.ts` exporting the `Theme` type (`'dark' | 'light'`), `ThemeContext`, and the `useTheme` hook (throws if used outside a provider), per the D5 sketch in design.md. Verify with `npx tsc --noEmit`.
- [ ] 4.2 Create `src/providers/ThemeProvider.tsx` implementing the controlled/uncontrolled merge pattern from D5 (`theme`/`defaultTheme`/`onThemeChange` props, effect setting `document.documentElement.dataset.theme`). Verify with `npx tsc --noEmit`.
- [ ] 4.3 Add `ThemeProvider` and `useTheme` to `src/index.ts`'s barrel exports. Verify by importing both from the package entry point in a scratch file and confirming `npx tsc --noEmit` passes.
- [ ] 4.4 Write a `ThemeProvider.stories.tsx` (or fold a demo into an existing relevant story) showing a toggle button using `useTheme()` to flip between themes, so the provider is exercised somewhere in Storybook independent of the global toolbar toggle. Verify manually in `npm run storybook` that clicking the toggle repaints the demo.

## 5. Storybook wiring

- [ ] 5.1 Add a `theme` entry to `globalTypes` in `.storybook/preview.tsx` (toolbar icon + `dark`/`light` items, default `dark`) per D6. Verify the toolbar control appears when running `npm run storybook`.
- [ ] 5.2 Update the existing `decorators` entry in `.storybook/preview.tsx` to wrap the `.layout.layout-storybook` div in `<ThemeProvider theme={context.globals.theme} onThemeChange={...}>` (or the `useGlobals` equivalent), syncing the toolbar control to the provider per D6. Verify toggling the toolbar control repaints every story between dark and light.
- [ ] 5.3 Spot-check a representative cross-section of stories (Button, Card, TextArea, Modal, Tabs, ColourPalettePicker, CardCarousel, Header/Footer) in both toolbar states and note any light-theme contrast/legibility issues against the design.md palette table for follow-up.

## 6. Docs & release prep

- [ ] 6.1 Update `CLAUDE.md`'s Styling section to describe the dark/light token contract, the `$dark-*`/`$light-*` naming convention, the `[data-theme]` selector mechanism, and the `ThemeProvider`/`useTheme` export.
- [ ] 6.2 Add a CHANGELOG/README note listing the old → new SCSS variable name mapping for consumers who import `_variables.scss` directly, and call out the major version bump. Verify the note covers every renamed token from task 1.1.
- [ ] 6.3 Bump `package.json` version to the next major version, reflecting the breaking SCSS rename.

## 7. Final verification

- [ ] 7.1 Run `npm run build` and confirm it completes with no type or build errors.
- [ ] 7.2 Run `npm run build-storybook` and confirm it completes with no errors.
- [ ] 7.3 Grep `src/` for any remaining references to the original unprefixed themeable token names (the D1 list) outside of `_variables.scss` itself, confirming the conversion in sections 2-3 is complete.
