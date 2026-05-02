# ADR-0013 — Firestore schema and merge strategy for admin-editable estimation config

## Status
Accepted

## Date
2026-05-02

## Context
Agency admins need to update pricing zones, coefficients, sqm buckets, spread factor, and privacy copy without code deployments. The estimation model is already fully config-driven (`AgencyConfig` in `src/configs/types.ts`); the engine and form consume it at runtime with no hard-coded values. The missing piece is a persistence layer and an admin UI to edit those values.

## Decision

### Firestore schema
- **Collection:** `estimationConfig`
- **Document ID:** `configId` (e.g. `gabetti-busto-arsizio`)
- **Fields stored:** all overridable fields from `AgencyConfig`:
  - `zones`, `propertyTypes`, `sqmRange`, `spreadFactor`
  - `sqmBucketPrices`, `conditionFactors`, `floorFactors`, `eraFactors`, `accessoriesBonuses`
  - `privacy`
- **Fields excluded from this path:** `id`, `agencyName` (identity), `branding` (has its own Firestore path under `branding/{configId}`), `formFields` (structural — excluded to avoid breaking the form on bad admin input; can be enabled in a future ADR).

### TypeScript type
A new utility type `EstimationConfigOverride = Partial<Omit<AgencyConfig, 'id' | 'agencyName' | 'branding' | 'formFields'>>` is added to `types.ts`.

### API
New file `src/app/estimationConfigApi.ts`:
- `saveEstimationConfig(configId, override: EstimationConfigOverride): Promise<void>` — writes to Firestore and localStorage.
- `loadEstimationConfig(configId): Promise<EstimationConfigOverride | null>` — reads Firestore first, falls back to localStorage, returns null if neither has data.

### Merge strategy
- `getConfigWithOverrides(configId): Promise<AgencyConfig>` in `registry.ts` (async, alongside existing sync `getConfig()`).
- Merge = field-level `Object.assign`: Firestore fields win over static base fields. Nested objects (e.g. `zones` array) are replaced wholesale — no deep array diffing.
- The static base config is never mutated; it remains the seed and the fallback.

### LocalStorage fallback
- Key: `hous4cast:estimationConfig:{configId}`
- Written on every successful call to `saveEstimationConfig`.
- Read by `loadEstimationConfig` when Firestore is unavailable (no Firebase config, network error, or quota exceeded).

## Consequences
- Agency admins can add/remove zones, change multipliers, and update pricing without any code change or deploy.
- The static TypeScript configs in `src/configs/` remain as authoritative seeds and documentation of the schema.
- `formFields` is intentionally excluded — structural changes to the form still require a code change, preventing accidental breakage.
- A future ADR may add `formFields` editing once a safe schema validation layer is in place.
- `EstimatePage` must switch from sync `getConfig()` to async `getConfigWithOverrides()`, adding a loading state.

