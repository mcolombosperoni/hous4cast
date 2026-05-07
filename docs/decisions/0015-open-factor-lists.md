# ADR-0015 — Open-list FactorEntry model replaces union-keyed factor tables

**Date:** 2026-05-07
**Status:** Accepted

---

## Context

Estimation factor fields (internal condition, floor, construction era, accessories) were modelled as `FactorTable<EnumType>` — i.e. `Partial<Record<'ottimo'|'buono'|..., number>>`. This had two problems:

1. **Hard-coded options at compile time.** Adding or renaming a factor value required a code change and redeployment.
2. **No localized labels in the config.** The labels shown to the seller were stored separately in `i18n.ts` and were not editable by the agency admin.

The goal of Epic P is to let agency admins define the full list of options (with IT/EN labels) and their coefficients from the admin UI, without any code deployment.

---

## Decision

Replace `FactorTable<T>` (union-keyed Record) with open entry arrays:

```ts
interface FactorEntry {
  value: string                          // technical key, e.g. "ottimo"
  label: Record<SupportedLocale, string> // localized display label
  coefficient: number                    // multiplicative factor
}

interface AccessoryEntry {
  value: string
  label: Record<SupportedLocale, string>
  bonus: number                          // additive bonus in €
}
```

`AgencyConfig` gains four new optional fields:
- `conditionEntries?: FactorEntry[]`
- `floorEntries?: FactorEntry[]`
- `eraEntries?: FactorEntry[]`
- `accessoryEntries?: AccessoryEntry[]`

The old `conditionFactors`, `floorFactors`, `eraFactors`, `accessoriesBonuses` fields are **removed** from `AgencyConfig`. The union types `PropertyCondition`, `PropertyFloor`, `BuildEra`, `PropertyAccessories` are kept as type aliases for `string` (to avoid breaking `EstimateInput`).

`EstimationConfigOverride` includes the same four entry fields, replacing the old factor tables.

---

## Engine behaviour

`EstimationEngine._estimateWithFactors` resolves coefficients with:
```ts
const conditionFactor = config.conditionEntries?.find(e => e.value === input.condition)?.coefficient ?? 1
const accessoriesBonus = config.accessoryEntries?.find(e => e.value === input.accessories)?.bonus ?? 0
```

If entries are absent (backward compat), defaults to `1` / `0`.

---

## Form behaviour

`EstimateForm` renders options from `config.conditionEntries`, `config.floorEntries`, etc.:
```tsx
{config.conditionEntries?.map(e => (
  <option key={e.value} value={e.value}>{e.label[locale]}</option>
))}
```

The hardcoded option maps in `i18n.ts` (`conditionOptions`, `floorOptions`, `eraOptions`, `accessoriesOptions`) are **removed**. Field labels (e.g. "Stato interno") remain in `i18n.ts`.

---

## Admin editor

Each entry list gets an add/edit/remove/reorder UI, identical in pattern to the zones editor. New entries have an editable `value` field; existing entries have the value read-only (it is the lookup key).

---

## Persist / merge strategy

`EstimationConfigOverride.*Entries` are stored in Firestore and localStorage (same `estimationConfigApi` mechanism). On merge, the override list **fully replaces** the base list (same strategy as `zones`).

---

## Migration

`gabetti-busto-arsizio.ts` is migrated: the old `*Factors` / `*Bonuses` fields are replaced with fully populated `*Entries` arrays, with labels seeded from the former `i18n.ts` option maps.

---

## Consequences

- Agencies can now add/rename/remove factor options without code changes.
- The `i18n.ts` option maps become seed data embedded in the static config — they are no longer the runtime source of truth.
- TypeScript union types (`PropertyCondition`, etc.) become `string` aliases — some type-safety is traded for runtime flexibility.
- The engine is backward compatible: configs without entries default to coefficient 1/bonus 0.

