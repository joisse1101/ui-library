# @joisse1101/ui-library

A personal React + TypeScript component library built with Vite, styled with SCSS, and developed/documented through Storybook. Published to GitHub Packages and consumed by other projects (typically via `yalc` during development, or as a versioned dependency once released).

Live Storybook: https://joisse1101.github.io/ui-library/

## Requirements

- Node 24 (matches the version used in CI — see `.github/workflows/publish.yml` / `deploy-storybook.yml`)
- npm

## Setup

```bash
npm install
```

There's no `.env` or other local configuration required to build or run Storybook.

## Commands

- `npm run storybook` — starts the Storybook dev server on port 6006. This is the primary way to visually develop and verify components.
- `npm run build` — type-checks (`tsc`) then builds the library with Vite. Outputs `dist/index.es.js`, `dist/index.cjs.js`, `dist/index.d.ts`, and `dist/ui-library.css`.
- `npm run build-storybook` — builds the static Storybook site into `storybook-static/` (the same output GitHub Pages deploys from).
- `npm run yalc:push` — builds the library, then pushes it to the local `yalc` store, for testing changes inside a consuming project without publishing a release.
- `npm run lint` — runs ESLint over the repo.
- `npm test` — runs the test suite once via `vitest run`. `npm run test:watch` runs it in watch mode.

Tests are powered by the `@storybook/addon-vitest` addon: every `*.stories.tsx` file is run as a browser test (Chromium, via Playwright) rather than living in separate `*.test.tsx` files. Writing or updating a component's stories is how you add test coverage for it.

## Using this library in another project

### During development (yalc)

From this repo:

```bash
npm run yalc:push
```

From the consuming project:

```bash
yalc add @joisse1101/ui-library
```

Re-run `npm run yalc:push` after making changes to push updates.

### As a published dependency

Releases are published to GitHub Packages (`npm.pkg.github.com`, scope `@joisse1101`) whenever a GitHub Release is published — not on every merge to `main`. To install a published version in a consuming project, add a `.npmrc` pointing the `@joisse1101` scope at GitHub Packages, then install as usual:

```
@joisse1101:registry=https://npm.pkg.github.com
```

```bash
npm install @joisse1101/ui-library
```

Consumers also need to import the compiled CSS separately:

```ts
import '@joisse1101/ui-library/ui-library.css';
```

SCSS variables are available directly via `@joisse1101/ui-library/styles/_variables.scss` for projects that want to consume the design tokens at build time.

## Architecture

See `CLAUDE.md` in this repo for a detailed breakdown of package structure, path aliases, component conventions, the styling system (shared SCSS vs. component-owned CSS Modules), dark/light theming, and Storybook setup.
