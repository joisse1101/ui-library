## Context

Tests today are `*.stories.tsx` files run in headless Chromium by `@storybook/addon-vitest` (the sole `storybook` project in `vite.config.ts`'s `test.projects`). No story has a `play` function, so they only prove a story mounts. See proposal.md for motivation and scope.

Constraints that shape the approach:
- `npm run build` runs `tsc` against `tsconfig.app.json` and `vite-plugin-dts` uses the same config. Stories are excluded there; any new `*.test.ts(x)` file must be excluded too or it leaks into type-checking and the `.d.ts` bundle.
- Path aliases (`@hooks/...`, `@components/...`) are resolved by `vite-tsconfig-paths` only inside Storybook (`.storybook/main.ts`). `vite.config.ts` itself aliases just `@` -> `src`, so a new vitest project needs its own alias resolution if tests use `@x/...` imports.
- Several hooks touch browser-only APIs. `useMediaQuery` uses `window.matchMedia`; `useCanSideScroll` uses `scrollWidth`, `clientWidth`, `requestAnimationFrame` and `ResizeObserver`.
- `src/index.ts` imports `styles/index.scss` as a side effect, and components import `.module.scss`/`.scss` files.

## Goals / Non-Goals

**Goals:**
- Two clearly separated test layers with one `npm test` entry point.
- A repeatable pattern (T0 exemplars) so later tiers are mechanical.
- Tests that fail on real regressions in behaviour, not on styling or markup detail.

**Non-Goals:**
- Coverage thresholds or coverage reporting gates.
- Testing SCSS output or theme token values (covered by the existing `theming` spec and visual review in Storybook).
- Changing production code to make it "more testable". If a test can't be written without a source change, that is flagged, not silently fixed.

## Decisions

### 1. Two vitest projects: `unit` (jsdom) and `storybook` (Chromium)
Pure logic (`useForm`, `useField`, `FormProvider`, `useArraySelection`, `useMediaQuery`, `ThemeProvider`, `utils/colours`, barrel exports) runs in a new `unit` project with `environment: 'jsdom'`, matching `src/**/*.test.{ts,tsx}`. Component behaviour stays in the existing `storybook` project.

- *Why:* these tests need no layout or paint, and jsdom starts in milliseconds versus a Chromium launch. It also keeps `renderHook` semantics standard.
- *Alternative:* everything in the browser project via `renderHook` or story play functions. Rejected: slower, and hook tests written as stories add fake UI purely to host a hook.
- *Alternative:* `happy-dom`. Rejected: `jsdom` is the more conventional pairing with `@testing-library/react` and has fewer API gaps.

### 2. `@testing-library/react` (`renderHook`, `render`) in the unit project
Added as a dev dependency together with `jsdom`. `@testing-library/jest-dom` is not added; assertions on DOM in unit tests stay minimal, and DOM-heavy assertions belong in play functions.

### 3. Component behaviour is tested with story `play` functions
Each interactive component's existing `*.stories.tsx` gains `play` functions using Storybook's `storybook/test` utilities (`userEvent`, `within`, `expect`, `fn`). Stories that demo a behaviour (e.g. validation error, disabled) get the assertion attached to that story rather than new stories being added, except where a scenario has no existing story.

- *Why:* CLAUDE.md already defines stories as the tests for a component. Play functions run in the same Storybook the maintainer uses for visual work, so a failing interaction can be replayed and debugged interactively.
- *Alternative:* separate `*.test.tsx` browser tests using `vitest-browser-react`. Rejected: duplicates the fixture setup already in stories, and diverges from the documented convention.

### 4. `useCanSideScroll` is verified through components, not in isolation
It is exercised in the browser project via `ButtonSelector`, `RadioSelector` and `Tabs` stories with content wide enough to overflow, asserting the left/right overlay affordances appear and update after scrolling.

- *Why:* jsdom has no layout, so `scrollWidth`/`clientWidth` are 0 and a jsdom test would either be vacuous or need a mock that re-implements the browser.
- *Alternative:* mock `ResizeObserver` and element dimensions in jsdom. Rejected: the test would mostly assert the mock.

### 5. Unit project alias resolution
The `unit` project uses the same alias mechanism as Storybook (`vite-tsconfig-paths`, already a dev dependency) so tests may use `@hooks/...`. Unit tests default to relative imports for the module under test to keep them independent of the aliasing setup.

### 6. Exclude tests from the library build
`tsconfig.app.json` gains an `exclude` entry for `**/*.test.ts` and `**/*.test.tsx` alongside the existing `*.stories.tsx` exclusion. Test-only globals/types come from explicit imports (`import { describe, it, expect } from 'vitest'`) so no global `types` entry is needed and the published `.d.ts` is unaffected. `npm run build` output is compared before and after as a check that nothing leaks.

### 7. Barrel-export test asserts an explicit expected list
A unit test imports `src/index.ts` and compares its export names to an explicit list in the test. Adding a public export requires updating the list, which is the point: a component silently dropped from the barrel (a hand-maintained file, per CLAUDE.md) fails loudly.

- *Alternative:* auto-derive expected exports from the `src/components/*` folders. Rejected: it would also assert on private components (e.g. `Carousel`) and hides intent.

### 8. CI as a separate workflow
A new workflow runs on `pull_request` to `main`: `npm ci`, `npx playwright install --with-deps chromium`, `npm run lint`, `npm test`. `publish.yml` and `deploy-storybook.yml` are left untouched. Enforcing it as a required status check is a GitHub repo setting, done by the maintainer outside this change.

## Risks / Trade-offs

- [SCSS/CSS-module imports break in the jsdom project when a test imports the barrel or a styled component] -> Vitest stubs CSS by default; the barrel test is the first exemplar in T0 so any config gap surfaces immediately, before later tiers build on it.
- [Play functions make stories slower and flakier in CI (real Chromium, animations, timers)] -> Use `await`ed `userEvent` and `findBy*`/`waitFor` queries instead of fixed delays; avoid asserting on transitions. Keep to core interactions only, per the agreed depth.
- [Tests coupled to markup/class names, which the SCSS-Modules migration hashes] -> Query by role, label and text via `within(canvas)`, never by CSS class.
- [`latest` version pins for `vitest`, `@vitest/browser-playwright` and `playwright` in `package.json` can shift under CI] -> Not changed here, but the CI workflow relies on the lockfile via `npm ci`; noted so a drift-driven failure is recognisable.
- [`ColourPalettePicker` and `Modal` are the most stateful components and may need fixtures larger than a story] -> They are their own tier (T4) so scope can be trimmed to the highest-risk flows without blocking the rest.
- [Adding tests may expose real bugs] -> Fixing them is out of scope; each is recorded and raised separately rather than folded into this change.
