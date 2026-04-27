# 0008 - Release only by approval tag

- Status: accepted
- Date: 2026-04-25

## Context
Pushes must not auto-publish. Demo approval is required before release.

## Decision
Split CI and CD:
- CI (`push`/`pull_request`) runs lint, type-check, tests and build.
- CD runs only on tags matching `release/*`.
- Tags are created only after explicit stakeholder approval.
- Release creation is automated through `pnpm release:patch|minor|major`, which:
  - bumps `package.json` version,
  - commits `chore(release): vX.Y.Z`,
  - creates tag `release/vX.Y.Z`,
  - pushes `main` and the release tag.
- `package.json` is the version source of truth for UI and release metadata.
- CD validates tag/version consistency (`release/vX.Y.Z` must match `package.json` version).

## Alternatives considered
- Auto deploy on every push: rejected.
- Manual artifact upload outside CI: rejected.

## Consequences
- Predictable releases and business sign-off.
- Clear traceability between approved demo and published build.
- Fewer manual release mistakes thanks to a single release command.
- Deploy is blocked early if tag and application version diverge.

