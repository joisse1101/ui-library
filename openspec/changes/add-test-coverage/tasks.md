## 1. Foundation (T0, do first)

- [x] 1.1 Run `npm test` on the untouched branch and record the baseline; verify it passes (or list pre-existing failures before changing anything)
- [x] 1.2 Add `jsdom` and `@testing-library/react` as dev dependencies and verify `npm ls jsdom @testing-library/react` resolves
- [x] 1.3 Add a `unit` project to `test.projects` in `vite.config.ts` (jsdom environment, `src/**/*.test.{ts,tsx}`, tsconfig-paths aliasing) and verify a trivial placeholder test is picked up by `npm test` alongside the `storybook` project
- [x] 1.4 Exclude `**/*.test.ts` and `**/*.test.tsx` in `tsconfig.app.json` and verify `npm run build` succeeds with an unchanged `dist/index.d.ts` (no test types leaked)
- [x] 1.5 Add a `test:unit` script (unit project only) and verify it runs without launching a browser
- [x] 1.6 Write the exemplar unit test `src/utils/colours.test.ts` and verify it passes under `npm run test:unit`, as the pattern for later unit tests
- [x] 1.7 Write the exemplar play function on `Switch` (interaction + assertion via `storybook/test`) and verify it passes under `npm test` and visibly runs in the Storybook Interactions panel
- [x] 1.8 Write `src/index.test.ts` asserting the barrel's export names equal an explicit expected list, and verify importing the barrel (with its SCSS side effects) works in jsdom; remove the placeholder test from 1.3

## 2. Logic layer (T1)

- [ ] 2.1 Add `src/hooks/useForm.test.ts` covering required, pattern, min, max, custom `validate` (receiving all values), skipping non-required rules on empty values, `setValue` clearing only that field's error, `reset` (default and explicit values), and `handleSubmit` calling `preventDefault` and `onValid` only when valid; verify it passes
- [ ] 2.2 Add `src/hooks/useField.test.tsx` covering form-bound mode (value, error, `setValue` writes through) and the standalone passthrough (no `name` or no provider); verify it passes
- [ ] 2.3 Add `src/providers/FormProvider.test.tsx` verifying a child under the provider sees the form's values/errors and that `useFormContext` outside a provider returns nothing; verify it passes
- [ ] 2.4 Add `src/hooks/useArraySelection.test.ts` covering add, remove and toggle behaviour; verify it passes
- [ ] 2.5 Add `src/hooks/display.test.ts` with a stubbed `matchMedia`, covering initial match, change events updating the value, and listener cleanup on unmount; verify it passes
- [ ] 2.6 Add `src/providers/ThemeProvider.test.tsx` covering uncontrolled default (`dark`), `defaultTheme`, controlled `theme` + `onThemeChange`, `data-theme` set on `document.documentElement`, and `useTheme` outside a provider; verify it passes
- [ ] 2.7 Extend `src/utils/colours.test.ts` to cover every exported function's branches; verify it passes. Also replace the `vi.mock` of `@styles/variables.module.scss` (added in 1.6) with real SCSS processing for that one module (`css: { include: /variables\.module\.scss$/ }` in the `unit` project) so `getStatusColor` reads the real tokens, and assert all four exist, are valid hex and are distinct. Cover invalid hex input and negative/fractional `steps` too, recording current behaviour (e.g. `NaN` output) rather than changing it

## 3. Simple inputs (T2)

- [ ] 3.1 Add play functions to `Button` stories: click fires `onClick`, disabled does not; verify under `npm test`
- [ ] 3.2 Extend `Switch` play functions: toggle on/off, controlled vs uncontrolled, disabled; verify under `npm test`
- [ ] 3.3 Add play functions to `TextInput` stories: typing updates value/`onChange`, form-bound value and validation error shown after submit, disabled; verify under `npm test`
- [ ] 3.4 Add play functions to `TextArea` stories: typing, character/value handling, form-bound error, disabled; verify under `npm test`
- [ ] 3.5 Add play functions to `NumberInput` stories: typing numbers, min/max handling, form-bound error, disabled; verify under `npm test`
- [ ] 3.6 Add play functions to `DateInput` stories: entering a date updates value, form-bound error, disabled; verify under `npm test`

- [ ] 3.7 Fix the controlled/uncontrolled bug in `TextInput`, `DateInput` and `NumberInput` (found in 1.1: React logs "contains an input ... with both `value` and `defaultValue` props"). Suspected cause: each renders `value={field.value ?? ''}`, so the input is always controlled while a consumer's `defaultValue` arrives via `...props`. Do this only after 3.3, 3.5 and 3.6 have pinned the working behaviour (controlled `value`/`onChange`, form-bound), in this order: (a) reproduce and record what `defaultValue` and typing without `value` actually do today; (b) confirm the intended standalone semantics with the maintainer before changing code; (c) add play functions for that behaviour and see them fail; (d) fix the components without changing their public props; (e) check `TextArea` for the same class of issue; (f) verify `npm test` is green and the warning no longer appears in the run output

## 4. Selector family (T3)

- [ ] 4.1 Add play functions to `ButtonSelector` stories: single and multi select, `onChange` payload, form-bound value, disabled; verify under `npm test`
- [ ] 4.2 Add play functions to `RadioSelector` stories: selecting an option updates value/`onChange`, only one selected at a time; verify under `npm test`
- [ ] 4.3 Add play functions to `InlineSelect` stories: choosing an option updates value/`onChange`; verify under `npm test`
- [ ] 4.4 Extend `Tabs` play functions: switching tabs shows the matching panel and calls `onChange`; verify under `npm test`
- [ ] 4.5 Extend `WeekSelector` play functions: selecting/deselecting days and the resulting value; verify under `npm test`
- [ ] 4.6 Add overflow stories/play functions for `ButtonSelector`, `RadioSelector` and `Tabs` asserting the left/right scroll overlays appear and update after scrolling (this covers `useCanSideScroll`); verify under `npm test`

## 5. Complex components (T4)

- [ ] 5.1 Extend `Modal` play functions: open, close via button and backdrop/Escape as implemented today, content rendered while open and absent while closed, and the form-in-modal story's submit-with-errors flow; verify under `npm test`
- [ ] 5.2 Add play functions to `CardCarousel` stories: navigation controls move between cards and respect the first/last bounds as implemented today; verify under `npm test`
- [ ] 5.3 Add play functions to `ColourPalettePicker` stories: add, edit and remove a colour, and the resulting `onChange` payload; verify under `npm test`

## 6. Static components and exports (T5)

- [ ] 6.1 Confirm `Card`, `Header`, `Footer` and `MainLayout` render in the suite (add a story or smoke test where none exists, e.g. `MainLayout`) and verify a deliberate throw in each fails `npm test` before reverting it
- [ ] 6.2 Reconcile the expected export list in `src/index.test.ts` against every component, hook, provider and util intended to be public; verify it passes and that temporarily removing an export makes it fail

## 7. CI gate (T6)

- [ ] 7.1 Add `.github/workflows/ci.yml` running on `pull_request` to `main`: `npm ci`, `npx playwright install --with-deps chromium`, `npm run lint`, `npm test`; verify the workflow YAML is valid and passes on a pull request from this branch
- [ ] 7.2 Verify the workflow fails when a test is deliberately broken on a throwaway branch, then remove the deliberate failure
- [ ] 7.3 Update the "Known issues" and Commands sections in `CLAUDE.md` to reflect the new unit project, `test:unit` script, play-function convention and the CI workflow; verify the described commands match `package.json`

## 8. Wrap-up

- [ ] 8.1 Run `npm run lint`, `npm test` and `npm run build` together on the final branch and verify all pass with no test files present in `dist/`
- [ ] 8.2 List any other real bugs the tests exposed (the `defaultValue` bug is handled in 3.7) that are not fixed here, so they can be raised as separate changes
