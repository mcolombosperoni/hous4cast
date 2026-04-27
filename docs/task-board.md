# Task Board

## Current Increment
- Name: Push C - UX baseline
- Status: `in-progress`

## Tasks
| ID | Task | Status | Notes |
|---|---|---|---|
| T01 | Scaffold Vite React TypeScript baseline | done | Initial app scaffolded |
| T02 | Configure lint/format/type-check scripts | done | ESLint + Prettier + TS strict |
| T03 | Configure unit/component test stack | done | Vitest + Testing Library + smoke test |
| T04 | Configure acceptance test stack | done | Playwright smoke + multibrowser config |
| T05 | Add governance docs and ADRs | done | `docs/` setup completed |
| T06 | Update `AGENTS.md` with final conventions | done | Aligned with decisions and workflow |
| T07 | Configure CI test workflow | done | push/PR runs quality gates |
| T08 | Configure tag-based Pages release workflow | done | release on `release/*` tags only |
| T09 | Update `.gitignore` for IntelliJ and local artifacts | done | `.idea/`, `*.iml`, local files ignored |
| T10 | Define typed config model (`src/configs/types.ts`) | done | `AgencyConfig`, `ZoneRate`, `EstimateInput`, `EstimateResult` |
| T11 | Create first agency config (`gabetti-busto-arsizio`) | done | 3 zones × 3 property types with price/sqm |
| T12 | Create config registry (`src/configs/registry.ts`) | done | `getConfig()`, `getAllConfigs()` |
| T13 | Implement EstimationEngine class | done | Pure class, low/mid/high ±10% spread, typed errors, TS1294 fix for `erasableSyntaxOnly` |
| T14 | Unit tests for EstimationEngine | done | 7 test cases: nominal, zone not found, type not supported, sqm boundaries |
| T15 | EstimateForm + EstimateResult components | done | Fully i18n-aware (IT/EN), Tailwind dark-mode styled |
| T16 | Rewrite EstimatePage with form + inline result | done | Resolves configId via registry, 404-inline if missing |
| T17 | Implement locale resolver order (`lang`/`dl`/storage/browser/fallback) | in-progress | Start Push C: align app preference bootstrap with ADR-0003 |
| T18 | Complete UX baseline (language switch + dark mode polish) | todo | Finish IT/EN toggle persistence and mobile-first pass |

## Waiting Approval
- None

## Done
- Push A — Foundation and CI/CD guardrails
- Push B — First estimator slice

## Wont-Do
- None
