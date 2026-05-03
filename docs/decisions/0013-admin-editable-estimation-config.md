# ADR-0013 — Admin-editable estimation config (Firestore + localStorage)

## Status
Accepted

## Context
Agency admins need to update estimation parameters (zones, pricing, coefficients, spread factor, privacy text) without requiring a code deployment. The static configs in `src/configs/` serve as a seed/default, but runtime overrides must be possible.

## Decision

### Firestore schema
Collection: `estimationConfig`
One document per agency, keyed by `configId` (e.g. `gabetti-busto-arsizio`).

Document fields mirror `EstimationConfigOverride` — a `Partial<Pick<AgencyConfig, ...>>` excluding identity fields (`id`, `agencyName`), branding (managed by `AdminBrandingConfig`), and structural fields (`formFields`).

Overridable fields:
- `zones` (array — replaces wholesale)
- `propertyTypes`
- `sqmRange`
- `spreadFactor`
- `sqmBucketPrices`
- `conditionFactors`
- `floorFactors`
- `eraFactors`
- `accessoriesBonuses`
- `privacy`

### Merge strategy
Field-level merge: `{ ...staticBase, ...firestoreOverride }`.
Individual fields (e.g. `zones`, `conditionFactors`) are replaced wholesale when present in the override.
Fields not present in the override retain their static base value.

### LocalStorage fallback
Key: `hous4cast:estimationConfig:{configId}`
Written on every successful save (before the Firestore call returns).
Read when Firestore is unavailable or returns no document.
Cleared by the reset action.

### API layer
`src/app/estimationConfigApi.ts` exposes three async functions:
- `loadEstimationConfig(configId)` — Firestore → localStorage fallback → null
- `saveEstimationConfig(configId, override)` — localStorage first, then Firestore
- `clearEstimationConfig(configId)` — removes both

### Registry
`getConfigWithOverrides(configId)` (async) merges the loaded override on top of the static base.
The existing sync `getConfig()` is kept for admin pre-load and unit tests.

### EstimatePage
Switches to `getConfigWithOverrides()` with a loading state (shows spinner while async).

## Consequences
- Admins can update pricing/zones without deploys.
- Page load has one async hop (Firestore or localStorage) before rendering.
- Static configs remain untouched; they seed the editor UI defaults.
- If both Firestore and localStorage are empty, the static base is used unchanged.

