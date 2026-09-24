## Purpose

Defines the automated test contract for the component library: which layers of the codebase must be covered, how each layer is exercised, and how the checks are enforced before changes are merged. It exists so regressions in shared logic and component behaviour are caught in this repository rather than in downstream consumers.

## ADDED Requirements

### Requirement: Single command runs the full test suite
The repository SHALL provide one command that runs every automated test (both logic-level tests and component behaviour tests) once and exits non-zero if any test fails.

#### Scenario: Full suite passes on a clean checkout
- **WHEN** a contributor installs dependencies and runs the test command on an unmodified branch
- **THEN** all logic-level and component behaviour tests execute and the command exits with a zero status

#### Scenario: A failing assertion fails the command
- **WHEN** any test in either layer fails
- **THEN** the test command exits with a non-zero status and reports which test failed

### Requirement: Shared logic is covered by fast, DOM-independent tests
Hooks, providers and utility functions that contain logic SHALL have tests that run without launching a real browser. Coverage SHALL include every validation branch of the form abstraction (required, pattern, minimum, maximum, custom validation, and error clearing when a value changes), value reset, selection toggling, colour computation, theme selection (controlled and uncontrolled), and media-query-driven behaviour.

#### Scenario: Form validation branches are asserted
- **WHEN** the form logic is exercised with values that violate each configured rule in turn
- **THEN** each rule produces its configured error message, and a value that satisfies all rules produces no error and allows submission

#### Scenario: Editing a field clears only that field's error
- **WHEN** a form has errors on multiple fields and one field's value is changed
- **THEN** only that field's error is cleared and the other fields' errors remain

#### Scenario: Logic tests do not require a browser
- **WHEN** only the logic-level tests are run
- **THEN** they complete without launching a browser instance

### Requirement: Interactive components have behaviour-level tests
Every interactive component in the library SHALL have automated tests that perform user interactions and assert the resulting behaviour, not merely that the component renders. Interactions covered SHALL include clicking, typing, selecting, display of validation errors, controlled versus uncontrolled operation, and the disabled state, wherever each applies to the component.

#### Scenario: Interaction produces the expected change
- **WHEN** a test clicks, types into, or selects an option in an interactive component
- **THEN** the test asserts the resulting value, callback invocation, or rendered state

#### Scenario: Disabled component ignores interaction
- **WHEN** a test attempts to interact with a component in its disabled state
- **THEN** the test asserts that no value change or callback occurs

#### Scenario: Form-bound field surfaces its validation error
- **WHEN** a field component is bound to a form whose rules the field's value violates and the form is submitted
- **THEN** the test asserts that the field displays the configured error message

### Requirement: Static components remain render-checked
Components with no interactive behaviour SHALL still be rendered by the automated test suite so that a component that throws on mount fails the run.

#### Scenario: Static component throws on render
- **WHEN** a static component throws while rendering
- **THEN** the test suite fails

### Requirement: Public exports are verified
The test suite SHALL verify that the library's public entry point exposes every intended component, hook, provider and utility, so that a component omitted from the entry point is detected.

#### Scenario: Export missing from the entry point
- **WHEN** an intended public export is absent from the library's entry point
- **THEN** the test suite fails and identifies the missing export

### Requirement: Checks are enforced on pull requests
Lint and the full test suite SHALL run automatically on every pull request targeting the main branch, and a failure in either SHALL be reported as a failed check.

#### Scenario: Pull request with a failing test
- **WHEN** a pull request is opened or updated and any test fails
- **THEN** the automated check for that pull request is reported as failed

#### Scenario: Pull request with a lint error
- **WHEN** a pull request is opened or updated and lint reports an error
- **THEN** the automated check for that pull request is reported as failed

#### Scenario: Automated run can execute browser-based tests
- **WHEN** the automated check runs on a fresh runner
- **THEN** it provisions whatever the browser-based tests need, so the full suite runs rather than skipping component tests
