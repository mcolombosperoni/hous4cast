import { describe, expect, it } from 'vitest'
import { gabettiBustoArsizioConfig } from '../configs/gabetti-busto-arsizio'
import { EstimationEngine, EstimationEngineError } from './EstimationEngine'

// ── Legacy simple-engine tests (using a minimal config without sqmBucketPrices) ──
const legacyConfig = {
  ...gabettiBustoArsizioConfig,
  id: 'legacy-test',
  sqmBucketPrices: undefined,
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

describe('EstimationEngine — Gabetti factor-based mode', () => {
  it('calculates base price for centro, 71–110 sqm bucket, all factors at default', () => {
    // base 352000 × zone 1.0 × condition 1.0 × floor 1.0 × era 1.0 + 0 bonus = 352000
    // low = 352000 × 0.9 = 316800 / high = 352000 × 1.05 = 369600
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(352_000)
    expect(result.low).toBe(Math.round(352_000 * 0.9))
    expect(result.high).toBe(Math.round(352_000 * 1.05))
  })

  it('applies zone multiplier correctly (sant_edoardo = 0.98)', () => {
    const result = engine.estimate({
      zoneId: 'sant_edoardo', propertyType: 'appartamento', sqm: 60,
      sqmBucket: '51_70', condition: 'ottimo', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(Math.round(224_000 * 0.98))
  })

  it('applies condition factor (buono = 0.75)', () => {
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'buono', floor: 'primo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(Math.round(160_000 * 0.75))
  })

  it('applies floor factor (secondo = 1.02)', () => {
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'secondo', buildEra: '2016_oggi', accessories: 'nulla',
    })
    expect(result.mid).toBe(Math.round(160_000 * 1.02))
  })

  it('applies era factor (1968–1980 = 0.65)', () => {
    const result = engine.estimate({
      zoneId: 'centro', propertyType: 'appartamento', sqm: 40,
      sqmBucket: 'fino_50', condition: 'ottimo', floor: 'primo', buildEra: '1968_1980', accessories: 'nulla',
    })
    expect(result.mid).toBe(Math.round(160_000 * 0.65))
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
    const expected = Math.round(352_000 * 0.91 * 0.75 * 1.02 * 0.70 + 18_000)
    const result = engine.estimate({
      zoneId: 'ponzella', propertyType: 'appartamento', sqm: 90,
      sqmBucket: '71_110', condition: 'buono', floor: 'secondo', buildEra: '1981_1995', accessories: 'cantina_box',
    })
    expect(result.mid).toBe(expected)
    expect(result.low).toBe(Math.round(expected * 0.9))
    expect(result.high).toBe(Math.round(expected * 1.05))
  })

  it('throws SQM_BUCKET_REQUIRED when sqmBucket is missing in factor mode', () => {
    try {
      engine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 90 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('SQM_BUCKET_REQUIRED')
    }
  })

  it('throws ZONE_NOT_FOUND for unknown zone in factor mode', () => {
    try {
      engine.estimate({ zoneId: 'fantasyland', propertyType: 'appartamento', sqm: 90, sqmBucket: '71_110' })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('ZONE_NOT_FOUND')
    }
  })
})
