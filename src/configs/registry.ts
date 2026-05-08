import { exampleAgencyMilanoConfig } from './example-agency-milano'
import { gabettiBustoArsizioConfig } from './gabetti-busto-arsizio'
import type { AgencyConfig, EstimationConfigOverride } from './types'
import { loadEstimationConfig } from '../app/estimationConfigApi'
import { loadAllLocalAgencies } from '../app/agencyApi'

const staticRegistry: Record<string, AgencyConfig> = {
  [exampleAgencyMilanoConfig.id]: exampleAgencyMilanoConfig,
  [gabettiBustoArsizioConfig.id]: gabettiBustoArsizioConfig,
}

/** Runtime-registered dynamic agencies (loaded from localStorage/Firestore on init) */
let dynamicRegistry: Record<string, AgencyConfig> = {}

/** Register a single dynamic agency into the runtime registry */
export function registerDynamicAgency(config: AgencyConfig): void {
  dynamicRegistry[config.id] = config
}

/** Remove a dynamic agency from the runtime registry */
export function unregisterDynamicAgency(id: string): void {
  delete dynamicRegistry[id]
}

/**
 * Initialize dynamic agencies from localStorage.
 * Call once on app startup. Safe to call multiple times (idempotent per session).
 */
export function initDynamicAgencies(): void {
  const agencies = loadAllLocalAgencies()
  dynamicRegistry = {}
  for (const config of agencies) {
    dynamicRegistry[config.id] = config
  }
}

export const getConfig = (id: string): AgencyConfig | undefined =>
  staticRegistry[id] ?? dynamicRegistry[id]

export const getAllConfigs = (): AgencyConfig[] =>
  [...Object.values(staticRegistry), ...Object.values(dynamicRegistry)]

/** Returns true if the given ID belongs to a dynamic (admin-created) agency */
export const isDynamicAgency = (id: string): boolean =>
  id in dynamicRegistry && !(id in staticRegistry)

/** Apply an EstimationConfigOverride on top of a base AgencyConfig (field-level merge). */
function applyOverride(base: AgencyConfig, override: EstimationConfigOverride): AgencyConfig {
  const merged = { ...base }
  for (const [k, v] of Object.entries(override)) {
    if (v !== undefined) (merged as Record<string, unknown>)[k] = v
  }
  // If override has legacy flat factor/bonus tables but no open-list entries,
  // apply them on top of the entries arrays so the engine picks them up.
  if (override.conditionFactors && !override.conditionEntries && merged.conditionEntries) {
    merged.conditionEntries = merged.conditionEntries.map((e) => {
      const ov = (override.conditionFactors as Record<string, number>)[e.value]
      return ov !== undefined ? { ...e, coefficient: ov } : e
    })
  }
  if (override.floorFactors && !override.floorEntries && merged.floorEntries) {
    merged.floorEntries = merged.floorEntries.map((e) => {
      const ov = (override.floorFactors as Record<string, number>)[e.value]
      return ov !== undefined ? { ...e, coefficient: ov } : e
    })
  }
  if (override.eraFactors && !override.eraEntries && merged.eraEntries) {
    merged.eraEntries = merged.eraEntries.map((e) => {
      const ov = (override.eraFactors as Record<string, number>)[e.value]
      return ov !== undefined ? { ...e, coefficient: ov } : e
    })
  }
  if (override.accessoriesBonuses && !override.accessoryEntries && merged.accessoryEntries) {
    merged.accessoryEntries = merged.accessoryEntries.map((e) => {
      const ov = (override.accessoriesBonuses as Record<string, number>)[e.value]
      return ov !== undefined ? { ...e, bonus: ov } : e
    })
  }
  // If override has legacy sqmBucketPrices but no open-list sqmBucketEntries,
  // apply them on top of the entries so the engine picks them up.
  if (override.sqmBucketPrices && !override.sqmBucketEntries && merged.sqmBucketEntries) {
    merged.sqmBucketEntries = merged.sqmBucketEntries.map((e) => {
      const ov = (override.sqmBucketPrices as Record<string, number>)[e.value]
      return ov !== undefined ? { ...e, pricePerSqm: ov } : e
    })
  }
  return merged as AgencyConfig
}

/** Read localStorage override synchronously and apply on top of base (no Firestore). */
export function getConfigWithLocalOverrides(id: string): AgencyConfig | undefined {
  const base = getConfig(id)
  if (!base) return undefined
  try {
    const raw = typeof window !== 'undefined'
      ? window.localStorage.getItem(`hous4cast:estimationConfig:${id}`)
      : null
    if (!raw) return base
    const override = JSON.parse(raw) as EstimationConfigOverride
    if (!override || Object.keys(override).length === 0) return base
    return applyOverride(base, override)
  } catch {
    return base
  }
}

/**
 * Returns the agency config with any admin-saved overrides applied on top (field-level merge).
 * Firestore wins over static base. Falls back to localStorage if Firestore is unavailable.
 * Falls back to static base if no override exists.
 */
export async function getConfigWithOverrides(id: string): Promise<AgencyConfig | undefined> {
  const base = getConfig(id)
  if (!base) return undefined
  try {
    const override = await loadEstimationConfig(id)
    if (!override || Object.keys(override).length === 0) return base
    return applyOverride(base, override)
  } catch {
    return base
  }
}


