import { describe, expect, it } from 'vitest'
import { gabettiBustoArsizioConfig } from '../configs/gabetti-busto-arsizio'
import { EstimationEngine, EstimationEngineError } from './EstimationEngine'

const engine = new EstimationEngine(gabettiBustoArsizioConfig)

describe('EstimationEngine', () => {
  it('calculates mid estimate correctly for centro/appartamento', () => {
    const result = engine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 100 })
    expect(result.mid).toBe(280_000) // 2800 * 100
    expect(result.currency).toBe('EUR')
  })

  it('returns low and high within spread range (±10%)', () => {
    const result = engine.estimate({ zoneId: 'semicentro', propertyType: 'villa', sqm: 200 })
    expect(result.low).toBe(Math.round(result.mid * 0.9))
    expect(result.high).toBe(Math.round(result.mid * 1.1))
  })

  it('throws ZONE_NOT_FOUND for unknown zone', () => {
    expect(() =>
      engine.estimate({ zoneId: 'unknown-zone', propertyType: 'appartamento', sqm: 80 }),
    ).toThrow(EstimationEngineError)

    try {
      engine.estimate({ zoneId: 'unknown-zone', propertyType: 'appartamento', sqm: 80 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('ZONE_NOT_FOUND')
    }
  })

  it('throws TYPE_NOT_SUPPORTED for unsupported property type in zone', () => {
    // Create a config with a zone missing a property type
    const limitedEngine = new EstimationEngine({
      ...gabettiBustoArsizioConfig,
      zones: [
        {
          zoneId: 'test-zone',
          label: { it: 'Test', en: 'Test' },
          pricePerSqm: { appartamento: 1000 },
        },
      ],
    })

    expect(() =>
      limitedEngine.estimate({ zoneId: 'test-zone', propertyType: 'villa', sqm: 100 }),
    ).toThrow(EstimationEngineError)

    try {
      limitedEngine.estimate({ zoneId: 'test-zone', propertyType: 'villa', sqm: 100 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('TYPE_NOT_SUPPORTED')
    }
  })

  it('throws SQM_OUT_OF_RANGE for sqm below min', () => {
    expect(() =>
      engine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 5 }),
    ).toThrow(EstimationEngineError)

    try {
      engine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 5 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('SQM_OUT_OF_RANGE')
    }
  })

  it('throws SQM_OUT_OF_RANGE for sqm above max', () => {
    expect(() =>
      engine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 9999 }),
    ).toThrow(EstimationEngineError)

    try {
      engine.estimate({ zoneId: 'centro', propertyType: 'appartamento', sqm: 9999 })
    } catch (err) {
      expect((err as EstimationEngineError).code).toBe('SQM_OUT_OF_RANGE')
    }
  })

  it('handles boundary sqm values (min and max)', () => {
    const { min, max } = gabettiBustoArsizioConfig.sqmRange
    expect(() =>
      engine.estimate({ zoneId: 'periferia', propertyType: 'ufficio', sqm: min }),
    ).not.toThrow()
    expect(() =>
      engine.estimate({ zoneId: 'periferia', propertyType: 'ufficio', sqm: max }),
    ).not.toThrow()
  })
})

