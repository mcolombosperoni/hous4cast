# Task Board

## Current Increment
- Name: Push B - First estimator slice
- Status: `developed`

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
| T10 | Define typed config model (`src/configs/types.ts`) | developed | `AgencyConfig`, `ZoneRate`, `EstimateInput`, `EstimateResult` |
| T11 | Create first agency config (`gabetti-busto-arsizio`) | developed | 3 zones × 3 property types with price/sqm |
| T12 | Create config registry (`src/configs/registry.ts`) | developed | `getConfig()`, `getAllConfigs()` |
| T13 | Implement EstimationEngine class | developed | Pure class, low/mid/high ±10% spread, typed errors |
| T14 | Unit tests for EstimationEngine | developed | 7 test cases: nominal, zone not found, type not supported, sqm boundaries |
| T15 | EstimateForm + EstimateResult components | developed | Fully i18n-aware (IT/EN), Tailwind dark-mode styled |
| T16 | Rewrite EstimatePage with form + inline result | developed | Resolves configId via registry, 404-inline if missing |

## Waiting Approval
- Push B — waiting for explicit approval before continuing

## Done
- Push A — Foundation and CI/CD guardrails

## Wont-Do
- None
