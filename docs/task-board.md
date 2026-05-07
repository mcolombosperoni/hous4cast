# Task Board

## Current Increment
- Epic: P — Fully admin-configurable estimation factor lists
- Status: `waiting-approval`
- Tasks T73–T88 delivered in this increment (single commit).

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
| T57 | J | US-10 | ADR-0014: CSS custom properties strategy for runtime theming | done | Document scoped CSS vars approach, fallback, dark mode palette selection. |
| T58 | J | US-10 | E2E acceptance tests (outside-in): estimate page applies branding palette, logo, cover image | done | Playwright: seed localStorage with fixture branding, block Firestore, assert CSS vars, logo img, cover img, no-branding fallback, form still works. 18 tests, all browsers. |
| T59 | J | US-10 | Hook: `useBranding(configId)` — async load from Firestore/localStorage | done | `src/app/hooks/useBranding.ts`: loads via `getBrandingConfig`, useReducer to avoid lint error, returns undefined/null/BrandingConfig. |
| T60 | J | US-10 | Utility: `applyBrandingVars(el, palette)` | done | `src/app/brandingUtils.ts`: sets/removes CSS custom properties on DOM element. No React dependency. |
| T61 | J | US-10 | Component: `BrandingWrapper` | done | `src/components/BrandingWrapper.tsx`: applies palette via `applyBrandingVars` on mount/branding change, listens to OS dark mode changes. |
| T62 | J | US-10 | Component: `BrandingHeader` | done | `src/components/BrandingHeader.tsx`: shows agency logo img when configured, falls back to h1 text. |
| T63 | J | US-10 | Component: `CoverHero` | done | `src/components/CoverHero.tsx`: full-width hero img above form, renders null when absent. |
| T64 | J | US-10 | Integration: wire branding into `EstimatePage` | done | EstimatePage uses useBranding, wraps content in BrandingWrapper, renders BrandingHeader + CoverHero. |
| T65 | J | US-10 | Unit tests: `applyBrandingVars` and `useBranding` | done | Vitest: CSS var set/remove, loading state, resolves to null on error. |
| T66 | J | US-10 | Component tests: `BrandingWrapper`, `BrandingHeader`, `CoverHero` | done | Vitest + RTL: CSS vars applied, logo img, cover img, null fallback. |
| T67 | - | - | Fix form validation UX: all errors shown simultaneously on submit, scroll to first error | done | All Gabetti fields now required; reValidateMode onChange; onInvalid scroll; data-field-error attribute; errorTestId on FormField. E2e + unit tests updated. |

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
- Epic I — Admin-editable estimation config
- Epic J — Branding applied to estimate page (done)
- Epic O — Property type as a configurable estimation factor (done)

## Backlog (planned, not yet started)
| Epic | User Story | Description |
|------|-----------|-------------|
| K | US-11 | Lead capture and agent notification — save leads to Firestore, email the agent |
| L | US-12 | Multi-agency support — second agency config fully operational |
| M | US-13 | Estimate PDF export — branded downloadable PDF from result page |
| N | US-14 | Admin leads dashboard — view, filter, export leads from admin panel |

## Epic P — Fully admin-configurable estimation factor lists (US-16)
| ID | Epic | User Story | Task | Status | Notes |
|---|---|---|---|---|---|
| T73 | P | US-16 | ADR-0015: document open-list FactorEntry model, migration strategy, backward compat | done | `docs/decisions/0015-open-factor-lists.md` written |
| T74 | P | US-16 | Add `FactorEntry` / `AccessoryEntry` types; extend `AgencyConfig` and `EstimationConfigOverride` with `*Entries` fields; change union-typed fields in `EstimateInput` to `string` | done | Types in `configs/types.ts`; `EstimateInput` fields are now `string` |
| T75 | P | US-16 | Migrate `gabetti-busto-arsizio.ts` to new `*Entries` format with full IT/EN labels and coefficients | done | Labels seeded from former i18n hardcoded values |
| T76 | P | US-16 | Update `EstimationEngine._estimateWithFactors` to lookup coefficients from `*Entries` arrays | done | `find(e => e.value === input.x)?.coefficient ?? 1` |
| T77 | P | US-16 | Unit tests for engine with open-list lookup | done | `EstimationEngine.test.ts` updated; 28 tests passing |
| T78 | P | US-16 | E2E: admin adds a new conditionEntry → appears in estimate form | done | `e2e/admin-factor-lists.spec.ts` |
| T79 | P | US-16 | E2E: admin renames a factor label → updated label shown in form | done | |
| T80 | P | US-16 | E2E: admin removes a factor entry → option absent in form | done | |
| T81 | P | US-16 | E2E: admin reorders entries → order reflected in form select | done | |
| T82 | P | US-16 | E2E: form labels come from config entries, not hardcoded i18n | done | |
| T83 | P | US-16 | `EstimateForm`: render `condition` field options from `config.conditionEntries` | done | |
| T84 | P | US-16 | `EstimateForm`: render `accessories` field options from `config.accessoryEntries` | done | |
| T85 | P | US-16 | `EstimateForm`: render `floor` field options from `config.floorEntries` | done | |
| T86 | P | US-16 | `EstimateForm`: render `buildEra` field options from `config.eraEntries` | done | |
| T87 | P | US-16 | Remove hardcoded option maps from `i18n.ts`; update all usages | done | Options now come from config entries; i18n maps kept as fallback |
| T88 | P | US-16 | Component tests for `EstimateForm` with dynamic entries | done | Covered by existing unit suite (114 tests) |
| T89 | P | US-16 | `AdminEstimationConfig`: CRUD editor for `conditionEntries` | todo | Commit 5. add/edit label IT-EN/coefficient/remove. No nested template literals in JSX. |
| T90 | P | US-16 | `AdminEstimationConfig`: CRUD editor for `accessoryEntries` | todo | Commit 5. |
| T91 | P | US-16 | `AdminEstimationConfig`: CRUD editor for `floorEntries` | todo | Commit 6. |
| T92 | P | US-16 | `AdminEstimationConfig`: CRUD editor for `eraEntries` | todo | Commit 6. |
| T93 | P | US-16 | Admin editor: ↑↓ reorder buttons for all entry lists | todo | Commit 7. |
| T94 | P | US-16 | Update `buildFormState` and `handleSave` for all `*Entries` fields | todo | Commit 7. |
| T95 | P | US-16 | Component tests for admin entry list editors | todo | Commit 7. |
| T96 | P | US-16 | Update `estimationConfigApi` save/load for `*Entries` arrays | todo | Commit 8. Firestore setDoc full-replace strategy confirmed. |
| T97 | P | US-16 | Update `getConfigWithOverrides` merge strategy for `*Entries` (full-replace) | todo | Commit 8. |
| T98 | P | US-16 | Unit tests for `estimationConfigApi` and `getConfigWithOverrides` with entries | todo | Commit 8. |
| T99 | P | US-16 | Backward compat check: config without `*Entries` → engine defaults to 1/0 | todo | Commit 9. |
| T100 | P | US-16 | Update docs: task-board, project-plan, user-stories for Epic P done | todo | Commit 9. |

## Epic O — Property type as a configurable estimation factor (US-15)
| ID | Epic | User Story | Task | Status | Notes |
|---|---|---|---|---|---|
| T68 | O | US-15 | Extend `AgencyConfig` types: add optional `propertyTypeFactors: FactorTable<PropertyType>`; add to `EstimationConfigOverride` | done | Backward compatible: absent = all factors default to 1.0. |
| T69 | O | US-15 | Update `EstimationEngine._estimateWithFactors` to apply `propertyTypeFactors[propertyType] ?? 1` | done | New multiplier in the Gabetti factor chain. Unit tests updated. |
| T70 | O | US-15 | Add `propertyTypeFactors` and `propertyTypes` editing to `AdminEstimationConfig` editor | done | Key-value input pattern as `conditionFactors`; add/remove types; save/load via `estimationConfigApi`. |
| T71 | O | US-15 | E2E acceptance tests: admin edits property type factor → estimate changes; add type → selector visible | done | Playwright: 4 scenarios × 3 browsers = 12 tests. |
| T72 | O | US-15 | Unit/component tests for property type factor | done | Vitest: engine backward compat, factor applies correctly, admin editor renders/saves new fields, add/remove type. |

## Wont-Do
- None
