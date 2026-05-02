# Task Board

## Current Increment
- Epic: Epic H - Configurable form and branding (palette, logo, image)
- Status: `waiting-approval`
- Next: US-08 complete — all T40–T46 done

## Tasks
| ID | Epic | User Story | Task | Status | Notes |
|---|---|---|---|---|---|
| T01 | A | US-01 | Scaffold Vite React TypeScript baseline | done | Initial app scaffolded |
| T02 | A | - | Configure lint/format/type-check scripts | done | ESLint + Prettier + TS strict |
| T03 | A | - | Configure unit/component test stack | done | Vitest + Testing Library + smoke test |
| T04 | A | - | Configure acceptance test stack | done | Playwright smoke + multibrowser config |
| T05 | A | - | Add governance docs and ADRs | done | `docs/` setup completed |
| T06 | A | - | Update `AGENTS.md` with final conventions | done | Aligned with decisions and workflow |
| T07 | A | - | Configure CI test workflow | done | push/PR runs quality gates |
| T08 | A | - | Configure tag-based Pages release workflow | done | release on `release/*` tags only |
| T09 | A | - | Update `.gitignore` for IntelliJ and local artifacts | done | `.idea/`, `*.iml`, local files ignored |
| T10 | B | US-02 | Define typed config model (`src/configs/types.ts`) | done | `AgencyConfig`, `ZoneRate`, `EstimateInput`, `EstimateResult` |
| T11 | B | US-02 | Create first agency config (`gabetti-busto-arsizio`) | done | 3 zones × 3 property types with price/sqm |
| T12 | B | US-02 | Create config registry (`src/configs/registry.ts`) | done | `getConfig()`, `getAllConfigs()` |
| T13 | B | US-02 | Implement EstimationEngine class | done | Pure class, low/mid/high ±10% spread, typed errors, TS1294 fix for `erasableSyntaxOnly` |
| T14 | B | US-02 | Unit tests for EstimationEngine | done | 7 test cases: nominal, zone not found, type not supported, sqm boundaries |
| T15 | C | US-03, US-04 | EstimateForm + EstimateResult components | done | Fully i18n-aware (IT/EN), Tailwind dark-mode styled |
| T16 | C | US-03, US-04 | Rewrite EstimatePage with form + inline result | done | Resolves configId via registry, 404-inline if missing |
| T17 | C | US-03 | Implement locale resolver order (`lang`/`dl`/storage/browser/fallback) | done | Bootstrap aligned with ADR-0003 and covered by provider tests |
| T18 | C | US-03, US-04 | Complete UX baseline (language switch + dark mode polish) | done | Shell copy localized, topbar accessibility improved, locale/theme behavior covered by tests |
| T19 | D | US-05 | Implement admin config list (`/admin`) | done | Render registry entries with IT/EN copy, multi-config coverage, and metadata tests |
| T20 | D | US-05 | Add QR generation for selected config | done | QR payload with `dl` locale hint, locale switcher in admin box, preview link with dl |
| T21 | D | US-05 | Add printable QR view | done | Route `/admin/qr/:configId?dl=`, print-friendly layout, Print button, fallback 404 |
| T22 | D | US-05 | Expand acceptance coverage for admin multi-config flow | done | Playwright: selection state, preview link with `dl`, print QR page opening, hash-query locale regression |
| T23 | D | US-05 | Add acceptance fallback coverage for invalid config routes | done | Playwright: invalid estimate config and invalid print-QR config fallback |
| T24 | E | US-03, US-05 | Add e2e regression coverage for lang/dl precedence in hash routing | done | Playwright: `lang` precedence over `dl` across search/hash query combinations |
| T25 | E | US-03, US-04 | Add e2e persistence coverage for locale/theme preferences | done | Playwright: locale + theme persist across route changes and reload |
| T26 | F | - | Automate release command and enforce tag/version consistency | done | Add `release:*` scripts and CI check `release/vX.Y.Z` == `package.json` version |
| T27 | G | US-06 | Add copy QR link action in admin | done | Copy-to-clipboard CTA with localized feedback and test coverage |
| T28 | H | US-07 | Analyze and map Gabetti form fields | done | Markdown table, field details |
| T29 | H | US-07 | Define config structure for form (EN/IT, branding, privacy) | done | Ready for localization |
| T30 | H | US-07 | Implement React form UI (fixed fields for all agencies) | todo | Mobile-first, dark mode |
| T31 | H | US-07 | Implement field validation and user feedback | todo | Errors, confirmations, privacy |
| T32 | H | US-07 | Add full localization support (EN/IT) | todo | Language switch, persistence |
| T33 | H | US-07 | Add e2e and incremental validation tests | todo | Playwright, acceptance |
| T34 | H | US-Admin | Implement admin UI for palette, logo, image (accordion layout) | done | Color pickers, upload, preview |
| T35 | H | US-Admin | Persist agency branding config | done | Palette saved to Firestore; images to Firebase Storage |
| T36 | H | US-Admin | Acceptance and unit tests for admin branding UI | done | Vitest + Playwright |
| T37 | H | - | Add husky pre-commit hook for lint, type-check, tests | done | Technical task, ADR-0010 |
| T38 | H | US-Admin-Image | Implement upload e preview di logo e immagine in admin UI | done | Accordion Logo/Immagine, blob preview, upload on save, delete |
| T39 | H | US-Admin-Image | Test unitari/e2e upload e preview immagini | done | Vitest (brandingApi) + Playwright (9 e2e tests) |
| T40 | H | US-08 | Extend AgencyConfig types with new form fields (indirizzo, stato, accessori, piano, età, email, telefono) | done | Types + config update |
| T41 | H | US-08 | Update gabetti-busto-arsizio config with all field options and coefficients | done | Migration from Tally logic |
| T42 | H | US-08 | Extend EstimationEngine to support multiplicative/additive coefficients for state, floor, age, accessories | done | Engine refactor |
| T43 | H | US-08 | Add missing form fields to EstimateForm component | done | indirizzo, stato, accessori, piano, età, email, telefono |
| T44 | H | US-08 | Update EstimateResult to display new computed fields | done | Show min/max with all factors |
| T45 | H | US-08 | Unit tests for extended EstimationEngine | done | Vitest |
| T46 | H | US-08 | Acceptance tests for extended form (e2e) | done | Playwright |

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
