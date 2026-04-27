import type { SupportedLocale } from '../app/providers/AppPreferencesProvider'

export type PropertyType = 'appartamento' | 'villa' | 'ufficio'

export interface ZoneRate {
  zoneId: string
  label: Record<SupportedLocale, string>
  /** Price per sqm by property type */
  pricePerSqm: Partial<Record<PropertyType, number>>
}

export interface AgencyConfig {
  id: string
  agencyName: string
  /** Allowed surface range in sqm */
  sqmRange: { min: number; max: number }
  zones: ZoneRate[]
  propertyTypes: PropertyType[]
  /** Spread percentage for low/high range (0–1), default 0.1 */
  spreadFactor?: number
}

export interface EstimateInput {
  zoneId: string
  propertyType: PropertyType
  sqm: number
}

export interface EstimateResult {
  low: number
  mid: number
  high: number
  currency: string
}

