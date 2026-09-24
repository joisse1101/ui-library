# Findings exposed by the new tests

Real issues noticed while writing tests that are **out of scope for this change** (see design.md, Non-Goals). Each is a candidate for its own change. Task 8.2 consolidates this list at the end.

Entries are appended as test groups are completed.

## Group 4: Selector family

### 1. `ButtonSelector` group has no accessible name when `label` contains spaces
`ButtonSelector.tsx` uses the `label` string directly as an element `id` (`<div id={label}>`) and as `aria-labelledby={label}`. `aria-labelledby` is a space-separated list of ids, so `label="Select Frameworks"` points at two ids (`Select`, `Frameworks`) that don't exist. Ids with spaces are also invalid HTML. Compare `RadioSelector`, which builds its id with `useId()`.
Two `ButtonSelector`s with the same label would also produce duplicate ids.
**Suggested fix:** generate the id with `useId()`, as `RadioSelector` does.

### 2. `ButtonSelector` selection state is only conveyed by a CSS class
Selected options get `.selected` but the buttons expose no `aria-pressed` (or equivalent), so assistive tech can't tell which are selected. The tests currently assert on the `selected` class because nothing else is available.
**Suggested fix:** add `aria-pressed={isSelected}` to each option button (and update the tests to assert on it).

### 3. `InlineSelect` `value` is documented as "initially selected" but behaves as fully controlled
The `value` argType says "Currently selected or initially selected value", but when `value` matches an option the component is controlled: `onChange` fires but the select never changes unless the parent updates `value`. The `Default` story passes a fixed `value: 'option1'`, so its select can't be changed in Storybook. There is no `defaultValue` prop for the "initial value" case.
Current behaviour is pinned by `ControlledIgnoresChangesUntilParentUpdates` and `UnknownValueFallsBackToUncontrolled`.
**Suggested fix:** decide the intended semantics (add `defaultValue`, or correct the docs and the `Default` story), the same question as task 3.7 for the text inputs.

### 4. `Tabs` isn't semantically a tab widget
Tab headers are `<div role="button">` elements, with no `tablist`, `tab` or `tabpanel` roles, no `aria-selected` and no `aria-controls`. Inactive panels are hidden with `display: none`, and disabled tabs use `aria-disabled` plus `pointer-events: none`. Keyboard interaction (focus, Enter/Space, arrow keys) is not implemented, although the component docs claim it "manages focus keyboard interactions".
**Suggested fix:** adopt the WAI-ARIA tabs pattern, or correct the docs. The tests query by role `button` today and would need updating.
