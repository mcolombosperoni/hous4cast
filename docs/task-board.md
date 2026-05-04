# Task Board

## Current Increment
- Epic: Epic I — Admin-editable estimation config
- Status: `waiting-approval`
- All tasks T47–T56 delivered and tested.

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
| T30 | H | US-07 | Implement React form UI (fixed fields for all agencies) | done | Covered by US-08 / T43 — form fully implemented |
| T31 | H | US-07 | Implement field validation and user feedback | done | Covered by US-08 — Zod validation + privacy error |
| T32 | H | US-07 | Add full localization support (EN/IT) | done | Covered by US-08 — full EN/IT labels and locale switch |
| T33 | H | US-07 | Add e2e and incremental validation tests | done | Covered by US-08 / T46 — Playwright suite |
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
| T47 | I | US-09 | ADR-0013: document Firestore schema and merge strategy for estimation config | done | New ADR: collection `estimationConfig`, doc = configId, partial AgencyConfig (excl. id/agencyName/branding/formFields); deep-merge Firestore over static base; localStorage fallback key |
| T48 | I | US-09 | E2E acceptance tests (outside-in): admin edits zone multiplier → save → estimate page reflects new value | done | Playwright: open admin, edit a zone multiplier, save, navigate to estimate page, assert result differs. Cover localStorage fallback. |
| T49 | I | US-09 | Implement `estimationConfigApi.ts` — Firestore read/write + localStorage fallback | done | New `src/app/estimationConfigApi.ts`: `saveEstimationConfig(configId, override)` and `loadEstimationConfig(configId)`. New `EstimationConfigOverride` utility type in `types.ts`. |
| T50 | I | US-09 | Add `getConfigWithOverrides(configId)` to registry — async, merges runtime overrides | done | Async variant alongside sync `getConfig()`. `EstimatePage` switches to async. Sync `getConfig()` kept for tests and admin pre-load. |
| T51 | I | US-09 | Unit tests for `estimationConfigApi` and `getConfigWithOverrides` | done | Vitest: mock Firestore + localStorage. Test save→load, Firestore unavailable fallback, no override → static base, merge correctness. |
| T52 | I | US-09 | Build `AdminEstimationConfig` editor UI component — all factor fields | done | All fields editable: zones, sqmBucketPrices, conditionFactors, floorFactors, eraFactors, accessoriesBonuses, privacy IT/EN, spreadFactor. Unit + e2e tests added. |
| T53 | I | US-09 | Wire `AdminEstimationConfig` into `AdminPage.tsx` | done | New accordion section "Estimation Config" for the selected configId. |
| T54 | I | US-09 | Component tests for `AdminEstimationConfig` | done | Vitest + RTL: renders pre-loaded values, edits a field, calls `saveEstimationConfig` on save, shows validation errors. Mock API. |
| T55 | I | US-09 | Update `EstimatePage` to use `getConfigWithOverrides()` | done | Replace sync `getConfig()` with async variant. Add loading state (spinner). No engine/form changes needed. |
| T56 | I | US-09 | Expand e2e coverage: offline/localStorage fallback and full admin→estimate journey | done | Playwright: (1) save override → reload with Firestore offline → localStorage config used; (2) clear override → static base used; (3) full admin-save → estimate result reflects new values. |

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
- Epic H — Configurable form and branding (palette, logo, image)

## Backlog (planned, not yet started)
| Epic | User Story | Description |
|------|-----------|-------------|
| J | US-10 | Branding applied to estimate page — palette, logo, cover image rendered on `/estimate/:configId` |
| K | US-11 | Lead capture and agent notification — save leads to Firestore, email the agent |
| L | US-12 | Multi-agency support — second agency config fully operational |
| M | US-13 | Estimate PDF export — branded downloadable PDF from result page |
| N | US-14 | Admin leads dashboard — view, filter, export leads from admin panel |

## Wont-Do
- None
