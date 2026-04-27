import { gabettiBustoArsizioConfig } from './gabetti-busto-arsizio'
import type { AgencyConfig } from './types'

const registry: Record<string, AgencyConfig> = {
  [gabettiBustoArsizioConfig.id]: gabettiBustoArsizioConfig,
}

export const getConfig = (id: string): AgencyConfig | undefined => registry[id]

export const getAllConfigs = (): AgencyConfig[] => Object.values(registry)

