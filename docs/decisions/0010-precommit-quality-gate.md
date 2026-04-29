# ADR-0010: Enforce Lint, Type-Check, and Tests on Pre-Commit

## Status
Proposed

## Context
To ensure code quality and prevent broken builds, every commit must pass lint, type-check, and all tests. Currently, these checks are run manually, but mistakes or oversights can occur. Automating these checks as a pre-commit hook will enforce the working agreement and reduce errors.

## Decision
We will use [Husky](https://typicode.github.io/husky/) to add a pre-commit hook that runs:
- `pnpm lint`
- `pnpm type-check`
- `pnpm test:run`

If any of these commands fail, the commit will be aborted.

## Consequences
- Developers cannot commit code that does not pass lint, type-check, and all tests.
- This enforces the project's quality gate and working agreement automatically.
- Initial commit may be slightly slower, but ensures reliability.

## Implementation Steps
1. Add Husky as a dev dependency: `pnpm add -D husky`
2. Initialize Husky: `pnpm husky install`
3. Add a pre-commit hook in `.husky/pre-commit` with:
   ```sh
   #!/bin/sh
   . "$(dirname "$0")/_/husky.sh"
   pnpm lint && pnpm type-check && pnpm test:run
   ```
4. Document this ADR and update onboarding docs if needed.

---

_Last updated: 2026-04-29_

