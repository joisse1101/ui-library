## Why

The library's only automated tests today are Storybook stories run through `@storybook/addon-vitest`, and none of the 18 story files defines a `play` function. They are render-only smoke tests: they fail if a story throws on mount, but assert no behaviour. Logic with real branching (`useForm` validation, `useArraySelection`, `colours.ts`) has no tests at all, and no CI gate runs lint or tests before merge or publish. Consumers pull this library in via `yalc`, so regressions surface in other projects first.

## What Changes

- Add a second, lightweight vitest project (jsdom) for pure logic and hooks, alongside the existing Storybook browser project, with the needed dev dependencies.
- Add colocated `*.test.ts(x)` unit tests for hooks, providers and utils: `useForm`, `useField`, `FormProvider`, `useArraySelection`, `display` (`useMediaQuery`, with a stubbed `matchMedia`), `ThemeProvider`, and `utils/colours`. `useCanSideScroll` needs real layout (`scrollWidth`, `ResizeObserver`), which jsdom lacks, so it is covered in the browser project through the scrollable components that use it (`ButtonSelector`, `RadioSelector`, `Tabs`).
- Add `play` functions to component stories covering core interactions (click, type, select, validation error shown, controlled/uncontrolled, disabled) for the interactive components: `Button`, `Switch`, `TextInput`, `TextArea`, `NumberInput`, `DateInput`, `ButtonSelector`, `RadioSelector`, `InlineSelect`, `Tabs`, `WeekSelector`, `Modal`, `CardCarousel`, `ColourPalettePicker`.
- Keep the static components (`Card`, `Header`, `Footer`, `MainLayout`) as smoke tests, and add a check that every intended public export in `src/index.ts` resolves.
- Add a GitHub Actions workflow that runs `npm run lint` and `npm test` (including `npx playwright install --with-deps chromium`) on pull requests.
- Non-goals: keyboard/accessibility sweeps, visual regression, coverage thresholds, deduplicating `src/selectors.ts` with `src/types/selectors.ts`, and any change to component behaviour or shipped styles. Nothing that looks unused is removed.

## Capabilities

### New Capabilities
- `testing`: the library's automated test contract, covering which layers are tested and by what mechanism (unit project for logic/hooks, story play functions for component behaviour), the required scope of coverage, and the CI gate that enforces it.

### Modified Capabilities
<!-- None. No existing spec's requirements change; `theming` is only exercised by tests, not altered. -->

## Impact

- **Code:** new `*.test.ts(x)` files under `src/hooks`, `src/providers`, `src/utils`, `src/index`; `play` functions added to existing `*.stories.tsx` files. No production source changes expected.
- **Config:** `vite.config.ts` (`test.projects` gains a `unit` project); `package.json` (dev dependencies such as `jsdom` and `@testing-library/react`, possibly a `test:unit` script); `tsconfig.app.json` (exclude `*.test.ts(x)` from the type-check/declaration build, as stories already are).
- **CI:** new workflow under `.github/workflows/` (no change to `publish.yml` or `deploy-storybook.yml`).
- **Published package:** unaffected. Tests and stories stay excluded from the bundle.
