## Context

See `proposal.md` for motivation. Relevant current state:

- `src/styles/_variables.scss` defines SCSS variables and a `:root { --token: #{$scss-var}; }` block, but that custom-property block is barely consumed — almost every component partial and CSS module references the `$scss-var` directly, which the SCSS compiler bakes into a literal value at build time. Only `.overlay-wrapper` (`_core_theme.scss`) and a few spots in `_component_input.scss` / `_navigation.scss` read `var(--...)` at runtime today.
- `html { color-scheme: dark; }` is hardcoded in `_core_theme.scss`.
- `src/providers/FormContext.ts` + `src/providers/FormProvider.tsx` is the existing precedent for a context/provider pair exported via `src/index.ts`, paired with a hook (`useFormContext`) in the same file as the context.
- No visual regression tooling exists (`vitest`/`playwright` are devDependencies but unused; no test files exist per `CLAUDE.md`), so the only verification available for "did dark mode still look right after the rewrite" is manual Storybook inspection.

## Goals / Non-Goals

**Goals:**
- Every themeable token resolves at paint time via `var(--token)`, so flipping `data-theme` repaints the whole tree with no rebuild.
- Dark-theme output after the rewrite is visually identical to today's output (this is a mechanical conversion of the dark values, not a dark-theme redesign).
- Light-theme values are a deliberate, contrast-checked palette in the same brand family, not an automated inversion.

**Non-Goals:**
- Nested/multiple simultaneous themes on one page (e.g. a light widget embedded in a dark page). `ThemeProvider` targets `document.documentElement` only.
- Theme persistence (localStorage) or OS `prefers-color-scheme` detection — explicitly deferred per the in-memory-only decision.
- A three-way "system" theme option — only `"dark"` and `"light"` are supported values.
- Rewriting `CLAUDE.md`'s styling section (tracked as a task, not designed here).

## Decisions

### D1: Split tokens into "theme-invariant" and "themeable" sets

Not every token needs a light counterpart. Typography families/sizes, spacing, radii, transition/animation durations, and sizing tokens (`$btn-size-*`, `$swatch-size-*`, `$max-width`, etc.) don't change between themes and keep their current unprefixed names (`$font-base`, `$radius-md`, ...).

Only color- and shadow-bearing tokens are themeable and get the `$dark-*` / `$light-*` split agreed in the proposal:

- Backgrounds: `bg-main`, `bg-surface`, `bg-surface-hover`, `bg-overlay`, `bg-glass`
- Text: `text-main`, `text-muted`, `text-dim`
- Brand: `brand-accent`, `brand-hover`, `brand-active`, `brand-border-strong`, `brand-border-muted`, `accent-pink-soft`, `brand-surface-subtle`, `brand-text-dark`, `brand-disabled`
- Feedback: `color-stretch`, `color-success`, `color-warning`, `color-danger`, `color-info`, `disabled-bg`, `disabled-text`
- Borders: `border-subtle`, `border-color`, `border-focus`, `border-hover`, `border-active`
- Inputs: `input-bg`, `input-border`, `input-focus-border`, `input-focus-ring`
- Shadows: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-glow-md`, `shadow-glow`, `shadow-focus-ring`, `shadow-hover-glow`, `shadow-text-sm`, `shadow-text`

The existing `$color-success-bg`/`$color-success-text` style "badge" pairs (success/warning/danger/info bg+text) are already light-surface-plus-dark-text combinations designed to read as a fixed-appearance chip regardless of page theme (they're not currently swapped per-theme, and nothing suggests they should start being dark in dark mode). These stay **theme-invariant** — unprefixed, unchanged.

Derived button/card/input tokens that simply alias a themeable base (e.g. `$btn-primary-bg: $brand-accent`) don't get their own dark/light pair — in the CSS layer they become `var(--btn-primary-bg, var(--brand-accent))`-style aliases that resolve through whichever theme is active automatically (see D3 for the alpha-derived ones, which need one extra step).

**Alternative considered:** give every token, including invariant ones, a dark/light pair for consistency. Rejected — it doubles the rename surface for no behavioral benefit and obscures which tokens actually vary by theme.

### D2: `:root` + `[data-theme]` composition, dark as the implicit default

```scss
:root,
[data-theme='dark'] {
  --bg-main: #{$dark-bg-main};
  --color-scheme: dark;
  // ...all themeable tokens, dark values
}

[data-theme='light'] {
  --bg-main: #{$light-bg-main};
  --color-scheme: light;
  // ...all themeable tokens, light values
}

html {
  color-scheme: var(--color-scheme);
}
```

Custom properties inherit down the DOM tree, so `[data-theme="light"]` works whether it's set on `<html>`, a Storybook wrapper `<div>`, or any consumer-chosen ancestor — it does not have to be `:root`/`<html>` specifically. Keeping dark under the bare `:root` selector (in addition to `[data-theme="dark"]`) means any existing consumer who never adopts `data-theme` at all sees no visual change — satisfying the "dark-theme output stays identical" goal without requiring every consumer to migrate immediately.

**Alternative considered:** require `data-theme="dark"` explicitly with no bare `:root` fallback. Rejected — silently changes behavior (falls back to browser/UA styles or unstyled) for any existing consumer that doesn't add the attribute, which is a bigger break than the SCSS rename alone.

### D3: Alpha-derived colors use runtime RGB-channel custom properties, not precomputed rgba pairs

Several tokens are computed with SCSS color functions at build time, e.g. `$btn-success-bg: rgba($color-success, 0.12)`. Because `rgba()`/`darken()` etc. run at compile time, the *literal* result would need its own separate dark/light precomputed pair for every such derived token, doubling the surface again.

Instead, themeable base colors that feed alpha derivations also get an RGB-triplet custom property (e.g. `--color-success-rgb: 52, 211, 153;`), and derived usages switch to the runtime-evaluated form:

```scss
// before
$btn-success-bg: rgba($color-success, 0.12);
// ...
background-color: $btn-success-bg;

// after
background-color: rgb(var(--color-success-rgb) / 0.12);
```

This automatically re-resolves under whichever theme is active, since it reads the live custom property rather than a value baked in at build time. Applies to `color-success`, `color-danger`, `bg-surface-hover` (ghost button hover), `border-subtle` (ghost border), `brand-border-strong` (hover border), and `bg-glass`.

**Alternative considered:** precompute a full second `rgba(...)` literal per theme for every alpha-derived token (e.g. `$dark-btn-success-bg`, `$light-btn-success-bg`). Rejected — roughly doubles the token count for values that are mechanically derivable from a base color already being themed, and is more error-prone to keep in sync than a single RGB-triplet source of truth.

### D4: Shadows get explicit dark/light literal pairs (not the RGB-channel trick)

Unlike flat fills, shadows are composite (offset + blur + spread + color) and some are theme-*specific effects*, not just recolored: `$shadow-hover-glow: rgba(255, 255, 255, 0.15)` is a white glow that is only visible against a dark surface — on a light surface it needs to become a dark/neutral shadow (or a differently-tinted glow) to read as "elevation" at all, not merely a lighter version of the same color. `$shadow-glow`/`$shadow-glow-md`/`$shadow-focus-ring` (the pink-tinted glows) keep their brand-rose hue but likely need reduced opacity/blur on light backgrounds where high-opacity glows read as muddy rather than luminous. `$shadow-sm/md/lg` (plain black elevation shadows) can likely reuse similar black values in both themes, but are still declared per-theme for consistency and future tuning room.

**Alternative considered:** apply the same RGB-channel + runtime-alpha pattern to shadows. Rejected for the glow shadows specifically because the *hue itself* (white vs. dark) needs to change, not just sit at a different opacity of the same color — that's a per-theme literal, not a parameterizable alpha.

### D5: `ThemeProvider` / `useTheme` shape

Follows the existing `FormContext`/`FormProvider` split (`src/providers/ThemeContext.ts`, `src/providers/ThemeProvider.tsx`), plus a `useTheme` hook. Sketch:

```ts
// ThemeContext.ts
export type Theme = 'dark' | 'light';
interface ThemeContextValue { theme: Theme; setTheme: (t: Theme) => void }
export const ThemeContext = createContext<ThemeContextValue | null>(null);
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
```

```tsx
// ThemeProvider.tsx
interface ThemeProviderProps {
  theme?: Theme;            // controlled
  defaultTheme?: Theme;     // uncontrolled, defaults to 'dark'
  onThemeChange?: (t: Theme) => void;
  children: React.ReactNode;
}
export function ThemeProvider({ theme, defaultTheme = 'dark', onThemeChange, children }: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<Theme>(defaultTheme);
  const activeTheme = theme ?? internalTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const setTheme = theme !== undefined
    ? (t: Theme) => onThemeChange?.(t)
    : setInternalTheme;

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

This is the standard controlled/uncontrolled merge pattern (value = `theme ?? internalState`) — no extra DOM node is rendered, satisfying the "no wrapper element" decision.

### D6: Storybook wiring

`preview.tsx` gets a `globalTypes.theme` toolbar entry (icon + `dark`/`light` items) and a decorator that renders `<ThemeProvider theme={globals.theme} onThemeChange={...}>` around the existing `.layout.layout-storybook` wrapper, using Storybook's `useGlobals` (or the decorator's `context.globals`) as the source of truth so the toolbar control and `ThemeProvider` stay in sync — this exercises the real controlled-mode API rather than a parallel ad hoc mechanism.

### D7: SCSS variable rename is mechanical

Every current themeable `$token` (per the D1 list) becomes `$dark-token`, and a new `$light-token` is added alongside with the hand-tuned value. Non-themeable tokens are untouched. The full rename mapping is tracked as a checklist in `tasks.md` rather than enumerated here.

## Proposed Light Palette

Hand-tuned starting values, keeping the existing warm-rose brand hue family but re-balanced for a light surface. **Please review** — these are a first pass, not final:

| Token | Dark (current) | Proposed Light | Notes |
|---|---|---|---|
| `bg-main` | `#121214` | `#f3eef0` | Warm-tinted light floor, not pure white, so elevated surfaces have room to read as "raised" |
| `bg-surface` | `#1a1a1e` | `#ffffff` | Cards/surfaces are the elevated, whitest layer |
| `bg-surface-hover` | `#26262b` | `#f7eef1` | Soft rose-tinted hover, distinguishable from both `bg-main` and `bg-surface` |
| `bg-overlay` | `#2d2d34` | `#fbf3f6` | Popovers slightly more tinted than surface, needs its own shadow to read as floating |
| `bg-glass` | `rgba(26,26,30,0.75)` | `rgba(255,255,255,0.75)` | |
| `text-main` | `#ffffff` | `#241820` | Warm near-black, not pure black, to match the palette's undertone |
| `text-muted` | `#a1a1aa` | `#6b5a61` | |
| `text-dim` | `#71717a` | `#9c8b92` | |
| `brand-accent` | `#9d5a70` | `#8a4a5e` | Slightly deepened so white button text keeps AA contrast on a lighter page |
| `brand-hover` | `#b0677e` | `#9d5a70` | Light theme's hover reuses today's dark base tone |
| `brand-active` | `#884c60` | `#6f3b4b` | |
| `brand-border-strong` | `#b8738a` | `#c98da0` | Borders can stay lighter/softer than text since they don't carry contrast requirements |
| `brand-border-muted` | `#4d2c36` | `#f0d8de` | |
| `accent-pink-soft` | `#fce7f3` | `#f7dbe4` | Needs more saturation than the dark-theme version to stay visible against a light page |
| `brand-surface-subtle` | `#fdf2f6` | `#f6e3ea` | |
| `brand-text-dark` | `#6e2e43` | `#6e2e43` | Already designed as dark text on a soft pink chip; unchanged |
| `color-stretch` | `#06b6d4` | `#0e7490` | Deepened for AA on light backgrounds |
| `color-success` | `#34d399` | `#047857` | |
| `color-warning` | `#fbbf24` | `#b45309` | Amber is the biggest offender against white — needs the largest shift |
| `color-danger` | `#f87171` | `#dc2626` | |
| `color-info` | `#38bdf8` | `#0369a1` | |
| `disabled-bg` | `#27272a` | `#ece6e8` | |
| `border-subtle` | `#27272a` | `#e7dfe2` | |
| `border-color` | `#3f3f46` | `#d8ccd1` | |
| `border-focus` | `#f2a9c4` | `#c14b73` | Focus ring needs to be a stronger, more saturated tone to stay visible on a light surface |
| `input-bg` | `#18181b` | `#ffffff` | |
| `shadow-sm/md/lg` | black @ 0.4/0.5/0.6 | black @ 0.08/0.10/0.14 | Same black hue, much lower opacity — dark-theme opacities would look like heavy smudges on a light surface |
| `shadow-glow`, `shadow-glow-md`, `shadow-focus-ring` | pink glow @ 0.3/0.3/0.25 | pink glow @ 0.18/0.18/0.15 | Same rose hue, reduced opacity/spread so it reads as a subtle halo, not a muddy blob |
| `shadow-hover-glow` | white @ 0.15 | `rgba(36, 24, 32, 0.08)` (dark, not white) | Must flip hue, not just lighten — see D4 |

Feedback badge pairs (`color-success-bg`/`-text`, etc.) and all non-color tokens are unchanged (see D1).

## Risks / Trade-offs

- **[Risk]** Mechanically rewriting ~13 files' worth of color declarations could introduce visual regressions in the existing dark theme. → **Mitigation**: convert one file at a time, compare each component's Storybook rendering against `main` before/after; the dark values themselves aren't changing, only their source (literal → `var()`), so any diff indicates a mistake in the conversion.
- **[Risk]** Hand-tuned light values are a first pass and may not hit WCAG AA in all cases (especially text-on-brand-accent and focus rings). → **Mitigation**: run the proposed palette table through a contrast checker during implementation and adjust before merging; flagged as an open question below.
- **[Risk]** Breaking SCSS variable rename affects any downstream consumer importing `_variables.scss` directly. → **Mitigation**: major version bump, and a migration note (old name → new name) in the CHANGELOG/README.
- **[Risk]** `rgb(var(--x-rgb) / alpha)` syntax requires the "space-separated RGB with slash alpha" CSS syntax (broadly supported in evergreen browsers). → **Mitigation**: acceptable given this library already targets modern peer React versions and has no stated legacy-browser requirement.

## Migration Plan

1. Land the token rename + light values + `var()` conversion + `ThemeProvider`/`useTheme` + Storybook toggle as a single change (per the proposal's "convert everything now" decision) — a partially-converted state would leave some components frozen to dark regardless of the toggle.
2. Bump the package to the next major version on release, since the SCSS variable rename is breaking for direct `_variables.scss` consumers.
3. Add a short migration note to the README/CHANGELOG listing the old → new variable names.
4. No migration needed for consumers who only use compiled components/CSS classes (not raw SCSS variables) — they're unaffected until they opt into `data-theme="light"` or `ThemeProvider`.

## Open Questions

- The proposed light palette (table above) hasn't been run through an automated contrast checker yet — some values (e.g. `border-focus`, `brand-accent` with white button text) may need minor adjustment once checked. This doesn't change the approach or task breakdown, only the final hex values, so it can be resolved during implementation.
