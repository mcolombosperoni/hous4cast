import { exampleAgencyMilanoConfig } from './example-agency-milano'
import { gabettiBustoArsizioConfig } from './gabetti-busto-arsizio'
import type { AgencyConfig } from './types'
import { loadEstimationConfig } from '../app/estimationConfigApi'

const registry: Record<string, AgencyConfig> = {
  [exampleAgencyMilanoConfig.id]: exampleAgencyMilanoConfig,
  [gabettiBustoArsizioConfig.id]: gabettiBustoArsizioConfig,
}

export const getConfig = (id: string): AgencyConfig | undefined => registry[id]

export const getAllConfigs = (): AgencyConfig[] => Object.values(registry)

/**
 * Returns the agency config with any admin-saved overrides applied on top (field-level merge).
 * Firestore wins over static base. Falls back to localStorage if Firestore is unavailable.
 * Falls back to static base if no override exists.
 */
export async function getConfigWithOverrides(id: string): Promise<AgencyConfig | undefined> {
  const base = registry[id]
  if (!base) return undefined
  try {
    const override = await loadEstimationConfig(id)
    if (!override || Object.keys(override).length === 0) return base
    // Deep-merge: only override keys that are explicitly set (skip undefined)
    const merged = { ...base }
    for (const [k, v] of Object.entries(override)) {
      if (v !== undefined) (merged as Record<string, unknown>)[k] = v
    }
    return merged as AgencyConfig
  } catch {
    return base
  }
}


