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

## Alternatives considered
- Auto deploy on every push: rejected.
- Manual artifact upload outside CI: rejected.

## Consequences
- Predictable releases and business sign-off.
- Clear traceability between approved demo and published build.

