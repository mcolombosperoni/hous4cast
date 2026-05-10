import { describe, expect, it } from 'vitest'
import { gabettiBustoArsizioConfig } from '../configs/gabetti-busto-arsizio'
import { EstimationEngine, EstimationEngineError } from './EstimationEngine'

// ── Legacy simple-engine tests (using a minimal config without sqmBucketPrices) ──
const legacyConfig = {
  ...gabettiBustoArsizioConfig,
  id: 'legacy-test',
  sqmBucketPrices: undefined,
  sqmBucketEntries: undefined,
  conditionEntries: undefined,
  floorEntries: undefined,
  eraEntries: undefined,
  accessoryEntries: undefined,
  zones: [
    { zoneId: 'centro',    label: { it: 'Centro',  en: 'Centre' },   pricePerSqm: { appartamento: 2800 } },
    { zoneId: 'semicentro',label: { it: 'Semi',    en: 'Semi' },     pricePerSqm: { appartamento: 2000, villa: 2400 } },
    { zoneId: 'periferia', label: { it: 'Periferia',en: 'Outskirts'},pricePerSqm: { appartamento: 1400, villa: 1700, ufficio: 1100 } },
  ],
  spreadFactor: 0.1,
}
const legacyEngine = new EstimationEngine(legacyConfig)

describe('EstimationEngine — legacy simple mode', () => {
  it('calculates mid estimate correctly for centro/appartamento', () => {
    const result = legacyEngine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 100 })
    expect(result.mid).toBe(280_000) // 2800 * 100
    expect(result.currency).toBe('EUR')
  })

  it('returns low and high within spread range (±10%)', () => {
    const result = legacyEngine.estimate({ zoneId: 'semicentro', propertyType: 'villa', sqm: 200 })
    expect(result.low).toBe(Math.round(result.mid * 0.9))
    expect(result.high).toBe(Math.round(result.mid * 1.1))
  })

  it('throws ZONE_NOT_FOUND for unknown zone', () => {
    try {
      legacyEngine.estimate({ zoneId: 'unknown-zone', propertyType: 'appartamento', sqm: 80 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('ZONE_NOT_FOUND')
    }
  })

  it('throws TYPE_NOT_SUPPORTED for unsupported property type in zone', () => {
    try {
      legacyEngine.estimate({ zoneId: 'centro', propertyType: 'villa', sqm: 100 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('TYPE_NOT_SUPPORTED')
    }
  })

  it('throws SQM_OUT_OF_RANGE for sqm below min', () => {
    try {
      legacyEngine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 5 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('SQM_OUT_OF_RANGE')
    }
  })

  it('throws SQM_OUT_OF_RANGE for sqm above max', () => {
    try {
      legacyEngine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 9999 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('SQM_OUT_OF_RANGE')
    }
  })

  it('handles boundary sqm values (min and max)', () => {
    expect(() =>
      legacyEngine.estimate({ zoneId: 'periferia', propertyType: 'ufficio', sqm: legacyConfig.sqmRange.min }),
    ).not.toThrow()
    expect(() =>
      legacyEngine.estimate({ zoneId: 'periferia', propertyType: 'ufficio', sqm: legacyConfig.sqmRange.max }),
    ).not.toThrow()
  })
})

// ── Gabetti factor-based engine tests ─────────────────────────────────────────
const engine = new EstimationEngine(gabettiBustoArsizioConfig)

/** Mirror of the engine's internal rounding: ceil to nearest thousand */
const ceilK = (v: number) => Math.ceil(v / 1000) * 1000

describe('EstimationEngine — Gabetti factor-based mode', () => {
  it('calculates base price for centro, 71–110 sqm bucket, all factors at default', () => {
    // base 352000 × zone 1.0 × condition 1.0 × floor 1.0 × era 1.0 + 0 bonus = 352000
    // spread = 0.05 → low = ceil(352000 × 0.95) / high = ceil(352000 × 1.05)
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(352_000)
    expect(result.low).toBe(ceilK(352_000 * 0.95))
    expect(result.high).toBe(ceilK(352_000 * 1.05))
  })

  it('applies zone multiplier correctly (sant_edoardo = 0.98)', () => {
    const result = engine.estimate({
      zoneId: 'sant_edoardo', propertyType: 'appartamento', sqm: 60,
      sqmBucket: '51_70', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(ceilK(224_000 * 0.98))
  })

  it('applies condition factor (buono = 0.75)', () => {
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'buono', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(ceilK(160_000 * 0.75))
  })

  it('applies floor factor (secondo = 1.02)', () => {
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'secondo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(ceilK(160_000 * 1.02))
  })

  it('applies era factor (1968–1980 = 0.65)', () => {
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'primo', buildEra: '1968_1980', accessories: 'nulla',
    })
    expect(result.mid).toBe(ceilK(160_000 * 0.65))
  })

  it('applies accessories bonus (box_auto = +15000)', () => {
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'box_auto',
    })
    expect(result.mid).toBe(160_000 + 15_000)
  })

  it('combines all factors: ponzella / 71–110 / buono / secondo / 1981–1995 / cantina_box', () => {
    // 352000 × 0.91 × 0.75 × 1.02 × 0.70 + 18000
    // spread = 0.05 → low = ceilK(mid × 0.95), high = ceilK(mid × 1.05)
    const expected = ceilK(352_000 * 0.91 * 0.75 * 1.02 * 0.70 + 18_000)
    const result = engine.estimate({
      zoneId: 'ponzella', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'buono', floor: 'secondo', buildEra: '1981_1995', accessories: 'cantina_box',
    })
    expect(result.mid).toBe(expected)
    expect(result.low).toBe(ceilK(expected * 0.95))
    expect(result.high).toBe(ceilK(expected * 1.05))
  })

  it('falls back to pricePerSqm × sqm when sqmBucket is not provided', () => {
    // Gabetti centro: pricePerSqm.appartamento = 3200, sqm = 90 → mid = 288000
    const result = engine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 90 })
    expect(result.mid).toBe(Math.round(3200 * 90 * 1.0)) // zoneMultiplier 1.0
    expect(result.low).toBeGreaterThan(0)
  })

  it('throws ZONE_NOT_FOUND for unknown zone in factor mode', () => {
    try {
      engine.estimate({ zoneId: 'fantasyland', propertyType: 'appartamento', sqm: 90, sqmBucket: '71_110' })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('ZONE_NOT_FOUND')
    }
  })
})

// ── Property type factor tests ─────────────────────────────────────────────
describe('EstimationEngine — propertyTypeFactors', () => {
  it('applies propertyTypeFactor when defined (0.5 halves the result)', () => {
    const eng = new EstimationEngine({ ...gabettiBustoArsizioConfig, propertyTypeFactors: { appartamento: 0.5 } })
    const result = eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(176_000)
  })

  it('defaults to factor 1 when propertyTypeFactors is absent (backward compatible)', () => {
    const eng = new EstimationEngine({ ...gabettiBustoArsizioConfig, propertyTypeFactors: undefined })
    const result = eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(352_000)
  })

  it('defaults to factor 1 when property type is not in propertyTypeFactors map', () => {
    const eng = new EstimationEngine({
      ...gabettiBustoArsizioConfig,
      propertyTypes: ['appartamento', 'villa'] as const,
      propertyTypeFactors: { appartamento: 1 },
    })
    expect(eng.estimate({
      zoneId: 'centro', propertyType: 'villa', sqm: 90,
      sqmBucket: '71_110', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    }).mid).toBe(352_000)
  })

  it('propertyTypeFactor combines with all FactorEntries', () => {
    const eng = new EstimationEngine({ ...gabettiBustoArsizioConfig, propertyTypeFactors: { appartamento: 0.8 } })
    const expected = ceilK(352_000 * 0.91 * 0.8 * 0.75 * 1.02 * 0.70 + 18_000)
    expect(eng.estimate({
      zoneId: 'ponzella', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'buono', floor: 'secondo', buildEra: '1981_1995', accessories: 'cantina_box',
    }).mid).toBe(expected)
  })
})

// ── Open-list FactorEntry engine tests (Epic P) ────────────────────────────
describe('EstimationEngine — FactorEntry open-list lookup', () => {
  const eng = new EstimationEngine(gabettiBustoArsizioConfig)

  it('resolves conditionFactor from conditionEntries (buono = 0.75)', () => {
    expect(eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'buono', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    }).mid).toBe(ceilK(160_000 * 0.75))
  })

  it('resolves floorFactor from floorEntries (secondo = 1.02)', () => {
    expect(eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'secondo', buildEra: '2016_oggi', accessories: 'nulla',
    }).mid).toBe(ceilK(160_000 * 1.02))
  })

  it('resolves eraFactor from eraEntries (1968_1980 = 0.65)', () => {
    expect(eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'primo', buildEra: '1968_1980', accessories: 'nulla',
    }).mid).toBe(ceilK(160_000 * 0.65))
  })

  it('resolves accessoryBonus from accessoryEntries (box_auto = +15000)', () => {
    expect(eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'box_auto',
    }).mid).toBe(160_000 + 15_000)
  })

  it('defaults conditionFactor to 1 when entry value not found', () => {
    expect(eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'unknown_condition', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    }).mid).toBe(352_000)
  })

  it('defaults accessoryBonus to 0 when entry value not found', () => {
    expect(eng.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'unknown_acc',
    }).mid).toBe(352_000)
  })

  it('defaults all factors to 1/0 when *Entries arrays are absent (backward compat)', () => {
    const engNoEntries = new EstimationEngine({
      ...gabettiBustoArsizioConfig,
      conditionEntries: undefined,
      floorEntries: undefined,
      eraEntries: undefined,
      accessoryEntries: undefined,
    })
    expect(engNoEntries.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'buono', floor: 'secondo', buildEra: '1981_1995', accessories: 'box_auto',
    }).mid).toBe(352_000)
  })

  it('combines all FactorEntries: ponzella / 71–110 / buono / secondo / 1981–1995 / cantina_box', () => {
    // spread for gabetti = 0.05 → low = ceilK(mid × 0.95)
    const expected = ceilK(352_000 * 0.91 * 0.75 * 1.02 * 0.70 + 18_000)
    const result = eng.estimate({
      zoneId: 'ponzella', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'buono', floor: 'secondo', buildEra: '1981_1995', accessories: 'cantina_box',
    })
    expect(result.mid).toBe(expected)
    expect(result.low).toBe(ceilK(expected * 0.95))
    expect(result.high).toBe(ceilK(expected * 1.05))
  })
})

// ── sqmBucketEntries engine tests (Epic Q) ────────────────────────────────────
import type { AgencyConfig } from '../configs/types'

describe('EstimationEngine — sqmBucketEntries (open-list, Epic Q)', () => {
  const configWithEntries: AgencyConfig = {
    ...gabettiBustoArsizioConfig,
    sqmBucketPrices: undefined,
    sqmBucketEntries: [
      { value: 'small', label: { it: 'Piccolo', en: 'Small' }, pricePerSqm: 100000 },
      { value: 'large', label: { it: 'Grande', en: 'Large' }, pricePerSqm: 200000 },
    ],
    conditionEntries: undefined,
    floorEntries: undefined,
    eraEntries: undefined,
    accessoryEntries: undefined,
  }
  const engEntries = new EstimationEngine(configWithEntries)

  it('resolves base price from sqmBucketEntries when present', () => {
    const result = engEntries.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: 'small',
    })
    expect(result.mid).toBe(100000)
  })

  it('resolves correct price for second bucket value', () => {
    const result = engEntries.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: 'large',
    })
    expect(result.mid).toBe(200000)
  })

  it('falls back to pricePerSqm × sqm when bucket value not in sqmBucketEntries', () => {
    // 'unknown' bucket not in entries → fallback: pricePerSqm[appartamento]=3200 × 90 sqm × zoneMultiplier 1.0
    const result = engEntries.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 90, sqmBucket: 'unknown' })
    expect(result.mid).toBe(ceilK(3200 * 90))
    expect(result.low).toBeGreaterThan(0)
  })

  it('falls back to sqmBucketPrices when sqmBucketEntries is absent', () => {
    const engLegacy = new EstimationEngine({
      ...configWithEntries,
      sqmBucketEntries: undefined,
      sqmBucketPrices: { fino_50: 160000 },
    })
    const result = engLegacy.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40, sqmBucket: 'fino_50',
    })
    expect(result.mid).toBe(160000)
  })

  it('prefers sqmBucketEntries over sqmBucketPrices when both are present', () => {
    const engBoth = new EstimationEngine({
      ...configWithEntries,
      sqmBucketEntries: [{ value: 'fino_50', label: { it: 'Fino 50', en: 'Up to 50' }, pricePerSqm: 999 }],
      sqmBucketPrices: { fino_50: 160000 },
    })
    const result = engBoth.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40, sqmBucket: 'fino_50',
    })
    // 999 rounds up to nearest thousand → 1000
    expect(result.mid).toBe(ceilK(999))
  })
})

