import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadEstimationConfig, saveEstimationConfig, clearEstimationConfig } from './estimationConfigApi'
import { getConfigWithOverrides } from '../configs/registry'
import type { EstimationConfigOverride } from '../configs/types'

vi.mock('./firebase', () => ({ db: null }))

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

const ID = 'gabetti-busto-arsizio'

beforeEach(() => localStorageMock.clear())

describe('estimationConfigApi (localStorage fallback)', () => {
  it('returns null when no override is saved', async () => {
    expect(await loadEstimationConfig(ID)).toBeNull()
  })

  it('save → load returns the saved override', async () => {
    await saveEstimationConfig(ID, { spreadFactor: 0.2 })
    expect(await loadEstimationConfig(ID)).toEqual({ spreadFactor: 0.2 })
  })

  it('save → clear → load returns null', async () => {
    await saveEstimationConfig(ID, { spreadFactor: 0.2 })
    await clearEstimationConfig(ID)
    expect(await loadEstimationConfig(ID)).toBeNull()
  })

  it('saves and loads complex override with zones', async () => {
    const override: EstimationConfigOverride = {
      spreadFactor: 0.15,
      zones: [{ zoneId: 'centro', label: { it: 'Centro', en: 'Centre' }, pricePerSqm: { appartamento: 3200 }, zoneMultiplier: 0.5 }],
    }
    await saveEstimationConfig(ID, override)
    const loaded = await loadEstimationConfig(ID)
    expect(loaded?.spreadFactor).toBe(0.15)
    expect(loaded?.zones?.[0].zoneMultiplier).toBe(0.5)
  })

  it('returns null if localStorage contains invalid JSON', async () => {
    localStorageMock.setItem(`hous4cast:estimationConfig:${ID}`, 'not-json')
    expect(await loadEstimationConfig(ID)).toBeNull()
  })
})

describe('getConfigWithOverrides', () => {
  it('returns undefined for unknown id', async () => {
    expect(await getConfigWithOverrides('unknown')).toBeUndefined()
  })

  it('returns static base when no override saved', async () => {
    const config = await getConfigWithOverrides(ID)
    expect(config?.spreadFactor).toBe(0.05)
    expect(config?.id).toBe(ID)
  })

  it('merges override on top of static base — override wins', async () => {
    await saveEstimationConfig(ID, { spreadFactor: 0.25 })
    const config = await getConfigWithOverrides(ID)
    expect(config?.spreadFactor).toBe(0.25)
    expect(config?.agencyName).toBe('Gabetti Busto Arsizio')
  })

  it('zone array override replaces wholesale', async () => {
    const newZones = [{ zoneId: 'new_zone', label: { it: 'Nuova', en: 'New' }, pricePerSqm: { appartamento: 1000 }, zoneMultiplier: 0.8 }]
    await saveEstimationConfig(ID, { zones: newZones })
    const config = await getConfigWithOverrides(ID)
    expect(config?.zones).toHaveLength(1)
    expect(config?.zones[0].zoneId).toBe('new_zone')
  })

  it('empty override returns static base unchanged', async () => {
    await saveEstimationConfig(ID, {})
    const config = await getConfigWithOverrides(ID)
    expect(config?.spreadFactor).toBe(0.05)
    expect(config?.zones.length).toBeGreaterThan(1)
  })
})

