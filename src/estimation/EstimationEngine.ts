import type { AgencyConfig, EstimateInput, EstimateResult } from '../configs/types'

export class EstimationEngineError extends Error {
  readonly code: 'ZONE_NOT_FOUND' | 'TYPE_NOT_SUPPORTED' | 'SQM_OUT_OF_RANGE'

  constructor(
    message: string,
    code: 'ZONE_NOT_FOUND' | 'TYPE_NOT_SUPPORTED' | 'SQM_OUT_OF_RANGE',
  ) {
    super(message)
    this.name = 'EstimationEngineError'
    this.code = code
  }
}

export class EstimationEngine {
  private readonly config: AgencyConfig
  private readonly spread: number

  constructor(config: AgencyConfig) {
    this.config = config
    this.spread = config.spreadFactor ?? 0.1
  }

  estimate(input: EstimateInput): EstimateResult {
    const { sqmRange, zones } = this.config

    if (input.sqm < sqmRange.min || input.sqm > sqmRange.max) {
      throw new EstimationEngineError(
        `Surface ${input.sqm} sqm is outside allowed range [${sqmRange.min}, ${sqmRange.max}]`,
        'SQM_OUT_OF_RANGE',
      )
    }

    const zone = zones.find((z) => z.zoneId === input.zoneId)
    if (!zone) {
      throw new EstimationEngineError(
        `Zone "${input.zoneId}" not found in config "${this.config.id}"`,
        'ZONE_NOT_FOUND',
      )
    }

    const pricePerSqm = zone.pricePerSqm[input.propertyType]
    if (pricePerSqm === undefined) {
      throw new EstimationEngineError(
        `Property type "${input.propertyType}" is not supported in zone "${input.zoneId}"`,
        'TYPE_NOT_SUPPORTED',
      )
    }

    const mid = Math.round(pricePerSqm * input.sqm)
    const low = Math.round(mid * (1 - this.spread))
    const high = Math.round(mid * (1 + this.spread))

    return { low, mid, high, currency: 'EUR' }
  }
}

