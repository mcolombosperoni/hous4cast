# AGENTS.md - hous4cast

## Project Overview
hous4cast is a config-driven web app that lets real estate agents generate branded estimation pages and QR codes.

## Current Architecture
- Frontend: Vite + React + TypeScript strict.
- UI: Tailwind CSS, mobile-first, dark mode toggle.
- Routing: hash mode for GitHub Pages compatibility.
- Content model: agency-specific copy and calculation params are defined in typed config files.

## i18n and Theme Rules
- Supported locales for MVP: `it`, `en`.
- Locale resolution order:
  1. `lang` query param
  2. `dl` query param from admin-generated QR
  3. `localStorage.preferredLocale`
  4. `navigator.language` normalized
  5. fallback `en`
- Theme (`light`/`dark`) is user-switchable and persisted in `localStorage.preferredTheme`.
  - If `preferredTheme` is set to an invalid value (e.g., `'system'`), the app defaults to `'light'`. See `AppPreferencesProvider` and its tests for details.

## Testing Approach (Agent Rules)
- Always follow an outside-in (user-centric) approach for new features and changes:
  - Start from end-to-end (acceptance) tests that describe the user journey and use cases, grouped by actor/story.
  - Only after, add or update unit/component tests to cover the internal logic and edge cases.
- All new or changed features must be covered by both e2e and unit/component tests as appropriate.
- Tests must be committed in the same commit as the feature or fix they cover.
- Comments and structure in tests must always be in English, except for UI content/labels.
- E2E tests must describe real user scenarios, not just field-level validation.
- Never leave code changes untested.
- Never push code that is not covered by tests reflecting the current state and requirements.
- If a requirement or rule is not clear, prefer the most user-centric and maintainable approach.

## Testing Strategy
- Unit/component tests: Vitest + Testing Library.
- Acceptance tests: Playwright on Chromium, Firefox, WebKit.
- Quality gate before push increment:
  1. `pnpm lint`
  2. `pnpm type-check`
  3. `pnpm test:run`
  4. `pnpm build`
  5. `pnpm test:e2e`

## Delivery Workflow
- Task statuses: `todo`, `in-progress`, `developed`, `waiting-approval`, `done`, `wont-do`.
- Push only at increment completion.
- After push, stop and wait explicit approval before continuing.
- Releases are performed only from a clean working tree and on the `main` branch using:
  - `pnpm release:patch`, `pnpm release:minor`, or `pnpm release:major`
  - These commands bump the version, commit, tag as `release/vX.Y.Z`, and push both `main` and the tag.
  - Tag-triggered workflow publishes GitHub Pages.
  - Tag is verified to match the version via `pnpm release:verify-tag` (see `scripts/verify-release-tag.mjs`).

## Repository Conventions
- Keep `.env` files out of git; maintain `.env.example`.
- Never commit build output directories.
- Ignore JetBrains files (`.idea/`, `*.iml`).
- Keep project plan and ADR files updated in `docs/` at the end of each task.

## Local Commands
```bash
pnpm install
pnpm dev
pnpm preview
pnpm lint
pnpm type-check
pnpm test:run
pnpm build
pnpm test:e2e
```
