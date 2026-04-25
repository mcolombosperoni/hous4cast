# hous4cast - Project Plan

## Scope
- Build a config-driven property estimation web app deployable on GitHub Pages.
- Keep delivery incremental: every pushed increment must be demo-ready.
- Release only after explicit approval and release tag creation.

## Working Agreement
- Task statuses: `todo`, `in-progress`, `developed`, `waiting-approval`, `done`, `wont-do`.
- Push only when an increment is complete and validated.
- After each push, stop execution and wait for explicit approval to continue.
- Publish GitHub Pages only from an approved release tag (`release/*`).

## Quality Gates (required before increment push)
1. `pnpm lint`
2. `pnpm type-check`
3. `pnpm test --run`
4. `pnpm test:e2e`
5. `pnpm build`

## Increment Checkpoints

### Push A - Foundation and CI/CD guardrails
- Governance docs and ADRs in `docs/`.
- Vite + React + TypeScript + Tailwind baseline.
- Test stack wiring (Vitest + Playwright smoke).
- CI workflow (test-only on push/PR).
- Release workflow (publish only on approved release tags).

### Push B - First estimator slice
- Config registry + typed config model.
- Estimation engine class + tests.
- Public route `/#/estimate/:configId` with submit and inline result.

### Push C - UX baseline
- i18n switch (IT/EN) with URL + storage resolution.
- Dark mode + mobile-first UI pass.

### Push D - Admin and QR
- `/admin` config list.
- QR generation with default locale hint.
- Printable QR page.

### Push E - Hardening
- Expanded acceptance scenarios and multibrowser checks.
- Bugfixing and release candidate stabilization.

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

