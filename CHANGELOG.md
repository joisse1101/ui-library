# Changelog

## 2.0.0

### Breaking

Added a light theme alongside the existing dark theme. Themeable (color/shadow) SCSS variables exported from `src/styles/_variables.scss` were renamed to a `$dark-*` / `$light-*` pair so both themes have an explicit, symmetric name. **Only consumers who `@import`/`@use` `_variables.scss` directly for its SCSS variables are affected** — if you only consume the compiled `ui-library.css` and component classes, no change is needed.

The CSS custom property names themselves (`--bg-main`, `--brand-accent`, etc.) are unchanged; only the backing SCSS variable names changed. Every old name below now resolves to the `$dark-*` variant if you were relying on the old (implicitly dark) value:

| Old SCSS variable | New (dark) | New (light) |
|---|---|---|
| `$bg-main` | `$dark-bg-main` | `$light-bg-main` |
| `$bg-surface` | `$dark-bg-surface` | `$light-bg-surface` |
| `$bg-surface-hover` | `$dark-bg-surface-hover` | `$light-bg-surface-hover` |
| `$bg-overlay` | `$dark-bg-overlay` | `$light-bg-overlay` |
| `$bg-glass` | `$dark-bg-glass` | `$light-bg-glass` |
| `$text-main` | `$dark-text-main` | `$light-text-main` |
| `$text-muted` | `$dark-text-muted` | `$light-text-muted` |
| `$text-dim` | `$dark-text-dim` | `$light-text-dim` |
| `$brand-accent` | `$dark-brand-accent` | `$light-brand-accent` |
| `$brand-hover` | `$dark-brand-hover` | `$light-brand-hover` |
| `$brand-active` | `$dark-brand-active` | `$light-brand-active` |
| `$brand-border-strong` | `$dark-brand-border-strong` | `$light-brand-border-strong` |
| `$brand-border-muted` | `$dark-brand-border-muted` | `$light-brand-border-muted` |
| `$accent-pink-soft` | `$dark-accent-pink-soft` | `$light-accent-pink-soft` |
| `$brand-surface-subtle` | `$dark-brand-surface-subtle` | `$light-brand-surface-subtle` |
| `$brand-text-dark` | `$dark-brand-text-dark` | `$light-brand-text-dark` |
| `$brand-disabled` | `$dark-brand-disabled` | `$light-brand-disabled` |
| `$color-stretch` | `$dark-color-stretch` | `$light-color-stretch` |
| `$color-success` | `$dark-color-success` | `$light-color-success` |
| `$color-warning` | `$dark-color-warning` | `$light-color-warning` |
| `$color-danger` | `$dark-color-danger` | `$light-color-danger` |
| `$color-info` | `$dark-color-info` | `$light-color-info` |
| `$disabled-bg` | `$dark-disabled-bg` | `$light-disabled-bg` |
| `$disabled-text` | `$dark-disabled-text` | `$light-disabled-text` |
| `$border-subtle` | `$dark-border-subtle` | `$light-border-subtle` |
| `$border-color` | `$dark-border-color` | `$light-border-color` |
| `$border-focus` | `$dark-border-focus` | `$light-border-focus` |
| `$border-hover` | `$dark-border-hover` | `$light-border-hover` |
| `$border-active` | `$dark-border-active` | `$light-border-active` |
| `$input-bg` | `$dark-input-bg` | `$light-input-bg` |
| `$input-border` | `$dark-input-border` | `$light-input-border` |
| `$input-focus-border` | `$dark-input-focus-border` | `$light-input-focus-border` |
| `$input-focus-ring` | `$dark-input-focus-ring` | `$light-input-focus-ring` |
| `$shadow-sm` | `$dark-shadow-sm` | `$light-shadow-sm` |
| `$shadow-md` | `$dark-shadow-md` | `$light-shadow-md` |
| `$shadow-lg` | `$dark-shadow-lg` | `$light-shadow-lg` |
| `$shadow-glow-md` | `$dark-shadow-glow-md` | `$light-shadow-glow-md` |
| `$shadow-glow` | `$dark-shadow-glow` | `$light-shadow-glow` |
| `$shadow-focus-ring` | `$dark-shadow-focus-ring` | `$light-shadow-focus-ring` |
| `$shadow-hover-glow` | `$dark-shadow-hover-glow` | `$light-shadow-hover-glow` |
| `$shadow-text-sm` | `$dark-shadow-text-sm` | `$light-shadow-text-sm` |
| `$shadow-text` | `$dark-shadow-text` | `$light-shadow-text` |

Typography, spacing, radii, and sizing variables (`$font-base`, `$radius-md`, `$btn-size-md-height`, etc.) are unchanged — they don't vary by theme.

### Added

- Light theme: every themeable token now has a hand-tuned light-surface value, selectable via `[data-theme="light"]` on any ancestor element (defaults to dark when unset).
- `ThemeProvider` component and `useTheme` hook (`src/providers/`), exported from the package root, for setting/reading the active theme from React. Supports uncontrolled (`defaultTheme`) and controlled (`theme` + `onThemeChange`) usage.
- Storybook toolbar toggle for switching every story between dark and light.
- `color-scheme` now follows the active theme, so native form controls and scrollbars match.
