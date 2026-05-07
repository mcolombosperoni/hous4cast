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
- Epic J: Branding applied to estimate page _(in progress)_
- Epic K: Lead capture and agent notification _(planned)_
- Epic L: Multi-agency support _(planned)_
- Epic M: Estimate PDF export _(planned)_
- Epic N: Admin leads dashboard _(planned)_
- Epic O: Property type as a configurable estimation factor ✅
- Epic P: Fully admin-configurable estimation factor lists _(planned)_

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

Goal: after form submission, the seller's contact details (name, email, phone, address) are saved to Firestore and the agent receives a notification email.

Key design decisions (to be confirmed):
- Firestore collection `leads`, one doc per submission, fields: configId, timestamp, name, email, phone, address, estimateResult.
- Email notification via Firebase Callable Function + Resend (or SendGrid) — to be decided in ADR.
- `name` field added to the estimate form (optional or required — to be decided per config).
- Submission is fire-and-forget from the client; errors shown as non-blocking toast.

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

- All features are developed outside-in: acceptance tests first, then unit/component tests.
- Each increment is delivered as a complete, tested slice.
- Push only at increment completion, then wait for explicit approval before continuing.
- Releases are performed only from a clean working tree and on the `main` branch using release scripts.

## References
- [Task board](./task-board.md)
- [User stories](./user-stories.md)
- [Decision records (ADR)](./decisions/README.md)

---

_Last updated: 2026-05-02_
