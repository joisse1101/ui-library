## Why

The library's design tokens (`_variables.scss`) currently define a single, dark-only theme, and most component stylesheets compile those tokens into literal color values at build time rather than referencing CSS custom properties. There's no way to preview components in a light theme in Storybook, and no way for consuming apps to offer a light mode at all.

## What Changes

- **BREAKING**: Rename existing dark-theme SCSS variables for symmetry with the new light set (e.g. `$bg-main` → `$dark-bg-main`), so both themes have an explicit, matching name. Any consumer importing `src/styles/_variables.scss` directly for its SCSS variables must update to the new names.
- Add hand-tuned light-theme equivalents for every themeable (color/shadow) token — backgrounds, text, borders, brand/accent, feedback colors, shadows/glows — re-balanced for contrast on a light surface rather than a mechanical inversion of the dark values.
- Convert color/shadow declarations across all component stylesheets and CSS modules (currently ~13 files, including `_core_theme.scss`, `_component_button.scss`, `_component_card.scss`, `_component_input.scss`, `_navigation.scss`, `_component_toast.scss`, `_component_code_blocks.scss`, and the `Switch`, `Modal`, `TextArea`, `Tabs`, `ColourPalettePicker`, `CardCarousel` component styles) from compiled `$scss-variable` references to `var(--css-custom-property)` references, so theme switching happens at paint time instead of build time.
- Define theme selection via a `[data-theme="light"]` / `[data-theme="dark"]` attribute selector overriding the CSS custom properties on `:root`, including flipping the native `color-scheme` property so browser-native form controls and scrollbars match.
- Add a new exported `ThemeProvider` component and `useTheme` hook (following the existing `FormProvider`/`useFormContext` pattern in `src/providers/`) that sets `data-theme` on `document.documentElement`. Supports both uncontrolled use (`defaultTheme` prop, in-memory state, no persistence) and controlled use (`theme` + `onThemeChange` props), so Storybook's toolbar can drive it externally.
- Add a Storybook toolbar toggle (global type) that switches all stories between dark and light via the same `ThemeProvider` in controlled mode.
- Ship both theme variants in the published `ui-library.css`, so the light theme is available to consuming apps, not just Storybook.

## Capabilities

### New Capabilities
- `theming`: Defines the dark/light design-token contract (CSS custom properties, attribute-based selection, `color-scheme` behavior) and the `ThemeProvider`/`useTheme` API for switching between them at runtime.

### Modified Capabilities
_None — no existing specs define current styling behavior._

## Impact

- **Breaking**: `src/styles/_variables.scss` — public SCSS variable names change; consumers importing this file directly must migrate. Warrants a major version bump.
- **Code**: All files under "What Changes" above that currently reference `$scss-variable` colors/shadows; new `src/providers/ThemeContext.ts`, `src/providers/ThemeProvider.tsx`, `src/hooks/useTheme.ts` (or equivalent); `src/index.ts` barrel additions.
- **Storybook**: `.storybook/preview.tsx` (new decorator + `globalTypes` toggle).
- **Docs**: `CLAUDE.md` styling section will need updates once implemented to describe the new token/theme-switching contract (tracked as a task, not part of this proposal's scope to rewrite now).
