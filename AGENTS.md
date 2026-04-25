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
- Publish GitHub Pages only from tags matching `release/*`.

## Repository Conventions
- Keep `.env` files out of git; maintain `.env.example`.
- Never commit build output directories.
- Ignore JetBrains files (`.idea/`, `*.iml`).
- Keep project plan and ADR files updated in `docs/` at the end of each task.

## Local Commands
```bash
pnpm install
pnpm dev
pnpm lint
pnpm type-check
pnpm test:run
pnpm build
pnpm test:e2e
```
