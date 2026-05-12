# Project Plan

## Overview
This document outlines the high-level plan for the development of the hous4cast platform, including major epics, milestones, and delivery workflow. It is kept in sync with the task board and user stories. All three documents (plan, user stories, task board) must remain in sync and traceable: every task must reference its user story, and every user story must reference its epic.

## Epics & Milestones
- Epic A: Foundation and CI/CD guardrails ✅
- Epic B: First estimator slice ✅
- Epic C: UX baseline ✅
- Epic D: Admin and QR ✅
- Epic E: Hardening ✅
- Epic F: Release automation ✅
- Epic G: Admin sharing UX ✅
- Epic H: Configurable form and branding (palette, logo, image) ✅
- Epic I: Admin-editable estimation config ✅
- Epic J: Branding applied to estimate page ✅
- Epic K: Lead capture and agent notification _(planned)_
- Epic L: Multi-agency support ~~_(planned)_~~ → **superseded by Epic S** (dynamic agency creation from admin)
- Epic M: Estimate PDF export _(planned)_
- Epic N: Admin leads dashboard _(planned)_
- Epic O: Property type as a configurable estimation factor ✅
- Epic P: Fully admin-configurable estimation factor lists ✅
- Epic Q: Admin-configurable Sqm Bucket Prices and legacy factor tables as open lists ✅
- Epic R: Zone and property type reorder/remove in admin ✅
  - Epic S: Dynamic agency creation in admin ✅
  - Epic S+: Admin UX improvements — delete agency, full default template, locale-aware editor with calc hints, type system cleanup, engine graceful fallback, a11y nested-button fix ✅
- Epic T: Cookie consent and GDPR compliance _(planned)_
- Epic U: Admin authentication with Firebase Auth _(planned)_
- Epic V: GDPR right to erasure and per-agency Privacy Policy page _(planned)_

## Epic A — Foundation and CI/CD guardrails

Goal: establish the project skeleton with Vite + React + TypeScript strict, Tailwind CSS, hash routing for GitHub Pages compatibility, ESLint, Vitest, Playwright, and a pre-commit quality gate (lint + type-check + unit tests).

Key design decisions:
- Stack chosen: Vite, React, TypeScript strict, Tailwind. See ADR-0001.
- Deployment target: GitHub Pages via tag-triggered workflow. See ADR-0002.
- Hash routing (`HashRouter`) for static hosting compatibility.
- Pre-commit hook runs `pnpm lint && pnpm type-check && pnpm test:run`. See ADR-0010.

## Epic B — First estimator slice

Goal: end-to-end value delivery — a seller can navigate to `/estimate/:configId`, fill a minimal form (zone, sqm), and receive an instant estimated price range.

Key design decisions:
- Config-driven content model: agency-specific params defined in typed config files. See ADR-0004.
- `EstimationEngine` computes `min/mid/max` from `pricePerSqm × sqm × spreadFactor`. See ADR-0005.
- Result rendered inline after submit (no page navigation). See ADR-0005.

## Epic C — UX baseline

Goal: mobile-first responsive layout, dark/light mode toggle persisted in `localStorage`, locale switcher (IT/EN) with resolution order from query param → localStorage → navigator.language.

Key design decisions:
- Mobile-first with Tailwind CSS utility classes. See ADR-0007.
- `AppPreferencesProvider` manages `theme` and `locale` state with localStorage persistence.
- Locale resolution order defined in ADR-0003.
- Invalid `preferredTheme` values (e.g. `'system'`) default to `'light'`.

## Epic D — Admin and QR

Goal: an internal admin page (`/admin`) lets the agent select a configured agency, preview the estimate form, and generate a QR code linking to the branded estimate page.

Key design decisions:
- Admin route at `/#/admin`; QR print route at `/#/admin/qr/:configId`.
- QR generated client-side via `qrcode.react`.
- QR URL encodes `dl` param for deep-link locale resolution.

## Epic E — Hardening

Goal: increase test coverage, fix edge cases in the estimation engine (NaN, missing zones), improve error states (loading, config not found), and ensure all public-facing pages handle missing data gracefully.

Key design decisions:
- Unit tests for `EstimationEngine` covering edge cases (missing zone, zero sqm, unknown property type).
- `NotFoundPage` for unknown `configId` routes.
- Loading state shown during async config fetch.

## Epic F — Release automation

Goal: establish a repeatable, tag-triggered release workflow: `pnpm release:patch/minor/major` bumps version, commits, tags as `release/vX.Y.Z`, and pushes — triggering the GitHub Pages deploy.

Key design decisions:
- Release scripts in `scripts/release.mjs` and `scripts/verify-release-tag.mjs`. See ADR-0008.
- Tags follow `release/vX.Y.Z` convention.
- Deployment only from `main` branch on a clean working tree.

## Epic G — Admin sharing UX

Goal: the admin can share the estimate page URL and QR code with sellers directly from the admin panel, with a copy-to-clipboard button and a print-friendly QR layout.

Key design decisions:
- `QrPrintPage` at `/#/admin/qr/:configId` renders a print-optimised QR + URL.
- Copy-URL button uses `navigator.clipboard`.

## Epic H — Configurable form and branding (palette, logo, image)

Goal: each agency can configure its own colour palette (light/dark), logo URL, and cover image URL via the admin panel. Settings are saved to Firestore and localStorage.

Key design decisions:
- `AdminBrandingConfig` component with colour pickers (react-colorful). See ADR-0011.
- Images stored as URLs on Cloudinary; uploaded via the admin panel. See ADR-0012.
- Branding stored in Firestore `branding/{configId}` and localStorage `hous4cast:branding:{configId}`. See ADR-0014.
- CSS custom properties inject palette into the estimate page. See ADR-0014.

## Epic I — Admin-editable Estimation Config

Goal: agency admins can edit zones, coefficients, pricing, sqm range, spread factor, and privacy text from the admin UI without code deployments.

Key design decisions:
- Firestore collection `estimationConfig`, one doc per `configId`, stores overridable fields only (excludes `id`, `agencyName`, `branding`, `formFields`).
- Merge strategy: deep-merge Firestore overrides on top of static base config (Firestore wins).
- LocalStorage fallback key: `hous4cast:estimationConfig:{configId}` written on every save.
- Static configs remain as seeds — never patched, only shadowed at runtime.
- See ADR-0013 for full schema and rationale.

## Epic J — Branding applied to estimate page

Goal: the seller-facing estimate page (`/estimate/:configId`) renders the agency palette, logo, and cover image configured in the admin — giving a fully branded experience when a QR is scanned.

Key design decisions (to be confirmed):
- `EstimatePage` loads branding from Firestore (`branding/{configId}`) on mount, same source already written by `AdminBrandingConfig`.
- CSS custom properties (or inline styles) applied to the page root to inject palette colours.
- Logo shown in header; cover image shown as hero or background above the form.
- Graceful fallback to default neutrals if no branding is configured.

## Epic K — Lead capture and agent notification

Goal: after form submission, the agent receives an immediate email notification. Implemented in three incremental steps to keep each deployment small and verifiable.

**Step 1 — Cloud Function scaffold (current):** deploy a no-op HTTP Cloud Function that logs the incoming payload and returns 200. Goal: confirm that the `functions/` directory, TypeScript build, Firebase deploy pipeline, and Function secret management all work correctly before any business logic is introduced.

**Step 2 — Email notification:** replace the no-op with a `sendLeadNotification` HTTP Function that calls Resend server-side and sends a formatted HTML email to the agency's `agentEmail`. The SPA calls the Function endpoint after form submit (non-blocking — estimate result is shown regardless of success/failure).

**Step 3 (optional) — Lead persistence in Firestore:** write the lead to `leads/{configId}/submissions` after successful email delivery. This step is intentionally deferred pending a GDPR and multi-agency data isolation analysis: with multiple agencies on the same Firebase project, Firestore Security Rules must ensure each agency's admin can only read their own leads — this requires Firebase Authentication (Epic U) to be implemented first.

Key design decisions:
- **Firebase plan**: requires **Blaze (pay-as-you-go)**. All usage stays within the free quota for typical volumes (<2M Function invocations/month, <125K Firestore writes/month). Set a billing budget alert in Google Cloud Console.
- **Security model (email)**: `RESEND_API_KEY` stored as a Firebase Function secret (`firebase functions:secrets:set RESEND_API_KEY`) — never in the client bundle or `.env` files.
- **Security model (Firestore, Step 3)**: `leads/{configId}/submissions` uses write-only Security Rules (`allow create: if true; allow read, update, delete: if false`). Read access for admin dashboard (Epic N) requires `request.auth != null` and `request.auth.uid` matching the agency's registered admin UID — requires Epic U first.
- **Why not client-side email?** All client-side providers (EmailJS, Brevo, SendGrid direct) expose the API key in the JS bundle. ❌ Ruled out.
- **Email provider: Resend** — free tier: 3,000 emails/month, 100/day. More than sufficient for a small Italian agency.
- **`name` field**: added to `EstimateInput` and the estimate form (optional, configurable per agency via `AgencyConfig`).
- **`agentEmail`**: added to `AgencyConfig` to route notifications per agency.
- **Non-blocking**: the SPA shows the estimate result before and regardless of the Function response. A non-blocking error message is shown only if the call fails.
- **`functions/` codebase position**: Firebase Functions live in `functions/` at the repo root, alongside `src/`. TypeScript, built with `tsc`, deployed via `firebase deploy --only functions`.

_Last updated: 2026-05-12_

## Epic L — Multi-agency support

Goal: a second fully-configured agency (e.g. `example-agency-milano`) is live and demonstrable, proving the multi-tenant model and exercising the config-driven engine with different parameters.

Key design decisions (to be confirmed):
- New config file `src/configs/example-agency-milano.ts` with different zones, property types, and pricing model.
- Registered in `registry.ts`; all existing UX (admin, QR, estimate page, branding) works out-of-the-box.
- E2e smoke tests covering the Milano agency flow.

## Epic M — Estimate PDF export

Goal: after receiving the estimate result, the seller can download a branded PDF containing the estimated range, property details, and agency identity.

Key design decisions (to be confirmed):
- PDF generated client-side via `@react-pdf/renderer` or `jsPDF` — to be decided in ADR.
- Branded with agency palette, logo, and cover image from Firestore branding config.
- Contains: estimate min/mid/max, input summary, disclaimer, agency name and contact.
- Download triggered by a "Download PDF" button in the EstimateResult section.

## Epic N — Admin leads dashboard

Goal: the admin can view, browse, and filter all submitted leads (from Epic K) directly in the admin panel, without accessing Firestore directly.

Key design decisions (to be confirmed):
- New `/admin/leads` sub-route listing leads from Firestore `leads` collection.
- Filterable by configId and date range.
- Each row shows: date, name, email, phone, address, estimate range.
- Export to CSV for the selected filter.

## Epic O — Property type as a configurable estimation factor

Goal: the property type field becomes a first-class estimation factor with its own multiplicative coefficient table (like `conditionFactors`, `floorFactors`, etc.), fully editable by the agency admin. When only one property type is configured, the field is hidden from the estimate form (no unnecessary choice for the seller). The default behaviour for existing configs (e.g. Gabetti with only `appartamento`) is unchanged — a default multiplier of `1.0` means no impact on the estimate.

Key design decisions (to be confirmed):
- New `propertyTypeFactors: FactorTable<PropertyType>` field added to `AgencyConfig` (optional; if absent the engine falls back to `1.0` for all types — backward compatible).
- `EstimationEngine._estimateWithFactors` applies `propertyTypeFactors[propertyType] ?? 1` as an additional multiplier.
- The legacy simple engine path (`pricePerSqm × sqm`) already uses `zone.pricePerSqm[propertyType]` so it is unaffected.
- `AdminEstimationConfig` exposes a new section to edit `propertyTypeFactors` and the list of `propertyTypes`, with the same key-value pattern used for other factor tables.
- `EstimateForm` hides the property type selector when `propertyTypes.length <= 1` (current behaviour, now also valid for Gabetti with single type).
- `EstimationConfigOverride` already includes `propertyTypes` (partial override support exists); `propertyTypeFactors` must be added to the override type.

_Last updated: 2026-05-04_

## Epic P — Fully admin-configurable estimation factor lists

Goal: every estimation factor field (condition, floor, buildEra, accessories, propertyType) becomes a fully open list definable by the agency admin — both options and coefficients — without any code changes or redeployment.

Key design decisions (to be confirmed in ADR):
- Replace union-key FactorTable with an open `FactorEntry[]` list: `{ value: string; label: Record<SupportedLocale, string>; coefficient: number }`.
- Accessories use the same structure with an `AccessoryEntry` variant where `coefficient` is an additive bonus in €.
- Engine resolves coefficients by `.find()` lookup, defaulting to `1`/`0` when not found (backward compatible).
- Admin editor: each factor section becomes an editable list (add/rename label/reorder/remove), same UX as zones.
- Estimate form: options rendered dynamically from config entries, no hardcoded i18n option maps.
- Static configs migrate to the new format; existing `i18n.ts` option maps become legacy seeds only.
- `EstimationConfigOverride` is updated to include the new entry-based fields.

_Last updated: 2026-05-07_

## Epic Q — Admin-configurable Sqm Bucket Prices and legacy factor tables as open lists

Goal: the five remaining "flat key-value" sections in AdminEstimationConfig (Sqm Bucket Prices, Condition Factors, Floor Factors, Era Factors, Accessories Bonuses) are migrated to the same open-list FactorEntry/AccessoryEntry model used by Epic P for condition/floor/era/accessory entries, with IT/EN labels and add/rename/reorder/remove support in the admin UI.

Key design decisions:
- `sqmBucketPrices` becomes a `SqmBucketEntry[]` open list with an `it`/`en` label and a `price` field (€/sqm).
- Legacy flat `conditionFactors`, `floorFactors`, `eraFactors` tables are superseded by `conditionEntries`, `floorEntries`, `eraEntries` (already done in Epic P); the flat-table UI is removed.
- `accessoriesBonuses` is superseded by `accessoryEntries` (already done in Epic P); flat-table UI is removed.
- Admin editor: Sqm Bucket Prices section becomes an open-list editor consistent with Epic P.

_Last updated: 2026-05-08_

## Epic R — Zone and property type reorder/remove in admin

Goal: Zones and Property Types in AdminEstimationConfig gain the same UX consistency as factor entries (Epic P): each row has ↑↓ reorder buttons and a ✕ remove button.

Key design decisions:
- Zones: add ↑↓ and ✕ per zone row; update `handleSave` to persist new order.
- Property Types: add ↑↓ and ✕ per property type row; update `handleSave` to persist new order.
- Backward compat: removing a zone removes it from the saved override; engine uses remaining zones.

_Last updated: 2026-05-08_

## Epic S — Dynamic agency creation in admin

Goal: an admin user can create a new agency directly from the admin panel (without code changes), set its name and sqm range, and immediately access a live estimate page for that agency.

Key design decisions:
- `agencyApi.ts` manages dynamic agencies via localStorage (source of truth) + Firestore fire-and-forget sync.
- `slugifyAgencyName` generates a unique `configId` from the agency name + timestamp.
- New agencies are scaffolded from `default-agency-template.ts` with a sensible default zone, property type, and pricing.
- `registry.ts` gains `registerDynamicAgency`, `unregisterDynamicAgency`, `initDynamicAgencies`, `isDynamicAgency` to integrate dynamic agencies with the existing config system.
- `AdminPage` gains an "Add Agency" button that opens an inline name input form; on confirm, the agency is created, auto-selected, and its estimation config editor opened.
- `AdminEstimationConfig` accepts `isDynamicAgency` and `onAgencyUpdated` props; when `isDynamicAgency` is true, the `agencyName` input is editable and saved via `saveAgency` on every config save.
- Firebase `setDoc` sync-throw bug fixed: wrapped in `try/catch` in both `estimationConfigApi` and `agencyApi` to prevent uncaught synchronous errors from invalid field values (e.g. `undefined`).

_Last updated: 2026-05-08_

## Epic T — Cookie consent and GDPR compliance

Goal: the estimate page (and any other public page) shows a GDPR-compliant cookie/privacy consent banner on first visit. The user can accept or decline. Consent is persisted in `localStorage`. No analytics or tracking scripts are loaded before explicit consent. Each agency can configure a link to its own privacy policy.

Key design decisions:
- **Implementation approach: custom banner** (no third-party CMP service).
  - The app currently has zero cookie-based tracking (Firebase uses IndexedDB/localStorage, not cookies). A full CMP like Cookiebot, Usercentrics, or CookieYes would be overkill and would add an external script dependency, a potential SPOF, and third-party branding on the free tier.
  - **Silktide Consent Manager** was evaluated but ruled out: script-tag only (no npm/TypeScript), "Powered by Silktide" branding on the free tier, and no native support for per-agency dynamic privacy policy URLs.
  - When Epic K (lead capture) is implemented and tracking is introduced, this decision should be revisited — tools like **iubenda** (Italian-focused, generates agency privacy policy, ~€27/year) or **CookieYes** (free tier, IAB TCF 2.2 compliant, auto cookie scan) become more relevant.
  - Decision record to be created as ADR-0016 before implementation.
- Minimal cookie banner rendered at the bottom of the public estimate page on first visit (or when consent is absent from `localStorage`).
- Two actions: "Accetta" / "Rifiuta" (localized IT/EN via `i18n`).
- Consent status stored in `localStorage` under `hous4cast:cookieConsent` (`'accepted'` | `'declined'` | absent).
- No third-party scripts (Firebase Analytics, etc.) are initialized before `'accepted'`.
- Privacy policy link is per-agency and already configurable via `AgencyConfig.privacy.link`; the banner links to it when present.
- Banner is not shown on admin routes (`/#/admin*`) — admins are not end-users.
- On decline: session continues normally (the app is cookie-free by default); banner is not shown again until `localStorage` is cleared.

_Last updated: 2026-05-09_

## Epic U — Admin authentication with Firebase Auth

Goal: protect the admin panel with Firebase Authentication (email+password and/or Google Sign-In), so that only authorised users can access branding, estimation config, and agency management features. Firestore Security Rules are updated to enforce server-side auth for all write operations on admin-managed collections.

Key design decisions:
- **Firebase Authentication** (Email/Password + Google) on the free Spark plan — no cost for the anticipated number of admin accounts.
- **Client-side route guard only** (`AuthGuard` component + `onAuthStateChanged`) — sufficient for this use case. The real security boundary is Firestore Security Rules (`allow write: if request.auth != null`), which are enforced server-side regardless of client behaviour.
- **No separate backend** — Firebase handles token issuance and validation; the SPA calls Firebase Auth SDK directly.
- **Session persistence**: `browserLocalPersistence` so the admin stays logged in across page reloads.
- **Scope**: authentication applies only to `/admin/*` routes; public estimate pages (`/estimate/*`) are unaffected and make no Auth SDK calls.
- **Lead writes remain public**: `leads/{configId}/submissions` keeps `allow create: if true` (sellers must submit without an account); the rule for `read/update/delete` remains `if false`.
- **Provider choice**: Email/Password is the minimum; Google Sign-In is a zero-cost convenience addition. Phone/SMS and enterprise SSO (SAML/OIDC) are out of scope for MVP (require Blaze plan or are unnecessary).
- Implementation: `useAuth` hook → `AuthGuard` component → `AdminLoginPage`; `AppRouter` wraps all admin routes in `AuthGuard`.

_Last updated: 2026-05-09_

## Epic V — GDPR Right to Erasure (Art. 17)

Goal: every agency estimate page exposes a footer link to a full, per-agency Privacy Policy page, configurable from the admin panel in IT and EN. The Privacy Policy page includes a mailto-based data erasure request mechanism pre-filled with the correct agency contact, satisfying GDPR Art. 17 without requiring a Cloud Function or server-side infrastructure. Admins can configure full policy text and an optional dedicated erasure email from the estimation config editor.

Key design decisions:
- **Erasure mechanism: mailto link** — no Cloud Function, no new Firestore collection; GDPR-compliant for small agencies processing requests manually within 30 days. Automated erasure request (written to Firestore) deferred to a future story once Epic K Cloud Functions are operational.
- **New config fields**: `privacy.fullText: Record<SupportedLocale, string>` and `privacy.erasureEmail?: string` added to `AgencyConfig` and `EstimationConfigOverride`; both optional and backward-compatible.
- **Footer link resolution**: external (`privacy.link`) takes precedence over the internal `/#/privacy/:configId` page — consistent with the cookie consent banner (Epic T).
- **Public route** `/#/privacy/:configId` — no auth guard, branded with agency palette, locale-aware.

_Last updated: 2026-05-09_

---

## Delivery Workflow
- All features are developed outside-in: acceptance tests first, then unit/component tests.
- Each increment is delivered as a complete, tested slice.
- Push only at increment completion, then wait for explicit approval before continuing.
- Releases are performed only from a clean working tree and on the `main` branch using release scripts.

## References
- [Task board](./task-board.md)
- [User stories](./user-stories.md)
- [Decision records (ADR)](./decisions/README.md)

---

_Last updated: 2026-05-09_
