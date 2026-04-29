# Task Board

## Current Increment
- Name: Epic H - Configurable form and branding
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
| T17 | Implement locale resolver order (`lang`/`dl`/storage/browser/fallback) | done | Bootstrap aligned with ADR-0003 and covered by provider tests |
| T18 | Complete UX baseline (language switch + dark mode polish) | done | Shell copy localized, topbar accessibility improved, locale/theme behavior covered by tests |
| T19 | Implement admin config list (`/admin`) | done | Render registry entries with IT/EN copy, multi-config coverage, and metadata tests |
| T20 | Add QR generation for selected config | done | QR payload with `dl` locale hint, locale switcher in admin box, preview link with dl |
| T21 | Add printable QR view | done | Route `/admin/qr/:configId?dl=`, print-friendly layout, Print button, fallback 404 |
| T22 | Expand acceptance coverage for admin multi-config flow | done | Playwright: selection state, preview link with `dl`, print QR page opening, hash-query locale regression |
| T23 | Add acceptance fallback coverage for invalid config routes | done | Playwright: invalid estimate config and invalid print-QR config fallback |
| T24 | Add e2e regression coverage for lang/dl precedence in hash routing | done | Playwright: `lang` precedence over `dl` across search/hash query combinations |
| T25 | Add e2e persistence coverage for locale/theme preferences | done | Playwright: locale + theme persist across route changes and reload |
| T26 | Automate release command and enforce tag/version consistency | done | Add `release:*` scripts and CI check `release/vX.Y.Z` == `package.json` version |
| T27 | Add copy QR link action in admin | done | Copy-to-clipboard CTA with localized feedback and test coverage |
| T28 | Analyze and map Gabetti form fields | done | Markdown table, field details |
| T29 | Define config structure for form (EN/IT, branding, privacy) | todo | Ready for localization |
| T30 | Implement configurable React form UI | todo | Mobile-first, dark mode |
| T31 | Implement field validation and user feedback | todo | Errors, confirmations, privacy |
| T32 | Add full localization support (EN/IT) | todo | Language switch, persistence |
| T33 | Add e2e and incremental validation tests | todo | Playwright, acceptance |
| T34 | Implement admin UI for palette, logo, image (accordion layout) | todo | Color pickers, upload, preview |
| T35 | Persist agency branding config | todo | Save to config file or backend |
| T36 | Acceptance and unit tests for admin branding UI | todo | Vitest + Playwright |

## Waiting Approval
- None

## Done
- Epic A — Foundation and CI/CD guardrails
- Epic B — First estimator slice
- Epic C — UX baseline
- Epic D — Admin and QR
- Epic E — Hardening
- Epic F — Release automation
- Epic G — Admin sharing UX

## Wont-Do
- None
