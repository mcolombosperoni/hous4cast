# hous4cast - Project Plan

## Scope
- Build a config-driven property estimation web app deployable on GitHub Pages.
- Keep delivery incremental: every pushed increment must be demo-ready.
- Release only after explicit approval and release tag creation.

## Working Agreement
- Task statuses: `todo`, `in-progress`, `developed`, `waiting-approval`, `done`, `wont-do`.
- Advance to the next epic only when the current increment is complete and validated.
- After each push, stop execution and wait for explicit approval to continue.
- Publish GitHub Pages only from an approved release tag (`release/*`).
- Create releases via `pnpm release:patch|minor|major` (bump, commit, tag, push).
- Enforce `release/vX.Y.Z` == `package.json` version in the tag-based CD workflow.

## Quality Gates (required before increment push)
1. `pnpm lint`
2. `pnpm type-check`
3. `pnpm test --run`
4. `pnpm test:e2e`
5. `pnpm build`

## Increment Checkpoints

### Epic A - Foundation and CI/CD guardrails
- Governance docs and ADRs in `docs/`.
- Vite + React + TypeScript + Tailwind baseline.
- Test stack wiring (Vitest + Playwright smoke).
- CI workflow (test-only on push/PR).
- Release workflow (publish only on approved release tags).

### Epic B - First estimator slice
- Config registry + typed config model.
- Estimation engine class + tests.
- Public route `/#/estimate/:configId` with submit and inline result.

### Epic C - UX baseline
- i18n switch (IT/EN) with URL + storage resolution.
- Dark mode + mobile-first UI pass.

### Epic D - Admin and QR
- `/admin` config list.
- QR generation with default locale hint.
- Printable QR page.

### Epic E - Hardening
- Expanded acceptance scenarios and multibrowser checks.
- Bugfixing and release candidate stabilization.

### Epic F - Release automation
- Automated release command (`pnpm release:patch|minor|major`).
- Package version as source of truth and tag/version guardrail in CD.

### Epic G - Admin sharing UX
- Copy-to-clipboard action for generated estimate link in Admin.
- Localized success/error feedback and related unit/e2e coverage.

### Epic H - Configurable Valuation Form
- Mapping and digitalization of the Gabetti form fields.
- Localized and customizable TypeScript config structure.
- Configurable and localized React form UI.
- Validation, user feedback, and privacy compliance.
- End-to-end and e2e testing.

## Language Resolution Policy
Order of precedence:
1. `lang` query parameter
2. `dl` query parameter (default locale from admin-generated QR)
3. `localStorage.preferredLocale`
4. Browser locale (`navigator.language` normalized)
5. Fallback `en`

## Daily Resume Checklist
- Read `docs/task-board.md` (`in-progress`, `waiting-approval`, `blocked`).
- Read latest ADR changes in `docs/decisions/README.md`.
- Run local checks: lint, type-check, unit tests before coding.
- Update task status at end of session.

## Local Validation Toolkit
```bash
pnpm install
pnpm dev
pnpm lint
pnpm type-check
pnpm test --run
pnpm test:e2e
pnpm build
```
