## Purpose

Defines the dark/light design-token contract for the component library — how the two themes are represented as CSS, how a consumer or Storybook selects between them at runtime, and the `ThemeProvider`/`useTheme` API used to drive that selection from React.

## ADDED Requirements

### Requirement: Dual-theme CSS custom property contract
The library SHALL expose every themeable design token (backgrounds, text, borders, brand/accent colors, feedback colors, and shadows) as a CSS custom property with a distinct value for the dark theme and the light theme, selectable via a `data-theme` attribute on any ancestor element.

#### Scenario: Light theme overrides token values
- **WHEN** an ancestor element has `data-theme="light"`
- **THEN** descendant elements resolve themeable custom properties (e.g. `--bg-main`, `--text-main`, `--brand-accent`) to their light-theme values

#### Scenario: No theme attribute present defaults to dark
- **WHEN** no ancestor element in the document sets a `data-theme` attribute
- **THEN** themeable custom properties resolve to their dark-theme values, matching the library's current (pre-light-theme) visual output

#### Scenario: Explicit dark attribute matches the default
- **WHEN** an ancestor element has `data-theme="dark"`
- **THEN** themeable custom properties resolve to the same dark-theme values as when no `data-theme` attribute is present

### Requirement: Native control color-scheme follows the active theme
The library SHALL set the CSS `color-scheme` property to match the active theme so browser-native form controls and scrollbars render consistently with the rest of the UI.

#### Scenario: Light theme requests light native controls
- **WHEN** an ancestor element has `data-theme="light"`
- **THEN** `color-scheme: light` is in effect for that subtree

#### Scenario: Dark theme (or no attribute) requests dark native controls
- **WHEN** no `data-theme` attribute is present, or an ancestor element has `data-theme="dark"`
- **THEN** `color-scheme: dark` is in effect for that subtree

### Requirement: Published styles include both themes
The library's built stylesheet SHALL include the CSS for both the dark and light themes, so a consuming application can opt into the light theme without any additional build step or separate stylesheet import.

#### Scenario: Consumer enables light theme without extra imports
- **WHEN** a consuming application imports the library's published stylesheet and sets `data-theme="light"` on an element in its tree
- **THEN** components under that element render with light-theme values, using only the single published stylesheet already imported

### Requirement: ThemeProvider component
The library SHALL export a `ThemeProvider` component that applies the active theme by setting the `data-theme` attribute on the document root element, and supports both uncontrolled and controlled usage.

#### Scenario: Uncontrolled usage with a default theme
- **WHEN** `ThemeProvider` is rendered with a `defaultTheme` prop and no `theme` prop
- **THEN** the document root's `data-theme` attribute is set to `defaultTheme` on mount, and the provider manages subsequent changes internally

#### Scenario: Uncontrolled usage with no default specified
- **WHEN** `ThemeProvider` is rendered with neither a `theme` nor a `defaultTheme` prop
- **THEN** the document root's `data-theme` attribute is set to `"dark"` on mount

#### Scenario: Controlled usage driven by an external toggle
- **WHEN** `ThemeProvider` is rendered with a `theme` prop and an `onThemeChange` callback
- **THEN** the document root's `data-theme` attribute always reflects the current `theme` prop value, and any internal request to change theme calls `onThemeChange` instead of changing state internally

#### Scenario: Theme choice does not persist across reloads
- **WHEN** a user changes the theme via an uncontrolled `ThemeProvider` and then reloads the page
- **THEN** the theme resets to `defaultTheme` (or `"dark"` if unset) rather than restoring the previously chosen theme

### Requirement: useTheme hook
The library SHALL export a `useTheme` hook that lets descendants of `ThemeProvider` read the current theme and request a change.

#### Scenario: Reading the current theme
- **WHEN** a component calls `useTheme()` while rendered inside a `ThemeProvider`
- **THEN** it receives the theme currently applied by that `ThemeProvider`

#### Scenario: Requesting a theme change
- **WHEN** a component calls the setter returned by `useTheme()` with a new theme value
- **THEN** the enclosing `ThemeProvider` updates the applied theme (via its own state in uncontrolled mode, or via `onThemeChange` in controlled mode)

### Requirement: Storybook theme toggle
Storybook SHALL provide a single global toolbar control that switches every story between the dark and light theme.

#### Scenario: Toggling the toolbar control updates all stories
- **WHEN** a user switches the Storybook toolbar theme control to light
- **THEN** the currently displayed story (and canvas/docs preview) re-renders with the light theme applied, without needing a page reload

#### Scenario: Toolbar default matches current behavior
- **WHEN** Storybook loads without the user having changed the toolbar control
- **THEN** stories render in the dark theme, matching the library's current default
