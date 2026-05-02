import type { AgencyConfig, EstimateInput, EstimateResult } from '../configs/types'

export class EstimationEngineError extends Error {
  readonly code: 'ZONE_NOT_FOUND' | 'TYPE_NOT_SUPPORTED' | 'SQM_OUT_OF_RANGE' | 'SQM_BUCKET_REQUIRED'

  constructor(
    message: string,
    code: 'ZONE_NOT_FOUND' | 'TYPE_NOT_SUPPORTED' | 'SQM_OUT_OF_RANGE' | 'SQM_BUCKET_REQUIRED',
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

    // ── Gabetti-style factor-based estimation ────────────────────────────────
    if (this.config.sqmBucketPrices) {
      return this._estimateWithFactors(input, zone.zoneMultiplier ?? 1)
    }

    // ── Legacy simple estimation: pricePerSqm × sqm ─────────────────────────
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

  /**
   * Gabetti-style multi-factor estimation.
   *
   * Formula:
   *   base       = sqmBucketPrices[sqmBucket]
   *   mid        = base × zoneMultiplier × conditionFactor × floorFactor × eraFactor + accessoriesBonus
   *   min (low)  = mid × 0.9   (Gabetti uses -10% for minimum)
   *   max (high) = mid × (1 + spreadFactor)
   */
  private _estimateWithFactors(input: EstimateInput, zoneMultiplier: number): EstimateResult {
    const { sqmBucketPrices, conditionFactors, floorFactors, eraFactors, accessoriesBonuses } = this.config

    if (!input.sqmBucket) {
      throw new EstimationEngineError(
        'sqmBucket is required when the config uses sqmBucketPrices',
        'SQM_BUCKET_REQUIRED',
      )
    }

    const base = sqmBucketPrices![input.sqmBucket]
    if (base === undefined) {
      throw new EstimationEngineError(
        `sqmBucket "${input.sqmBucket}" has no base price in config "${this.config.id}"`,
        'SQM_BUCKET_REQUIRED',
      )
    }

    const conditionFactor  = (input.condition   && conditionFactors?.[input.condition])   ?? 1
    const floorFactor      = (input.floor       && floorFactors?.[input.floor])           ?? 1
    const eraFactor        = (input.buildEra    && eraFactors?.[input.buildEra])          ?? 1
    const accessoriesBonus = (input.accessories && accessoriesBonuses?.[input.accessories]) ?? 0

    const mid  = Math.round(base * zoneMultiplier * conditionFactor * floorFactor * eraFactor + accessoriesBonus)
    const low  = Math.round(mid * 0.9)
    const high = Math.round(mid * (1 + this.spread))

    return { low, mid, high, currency: 'EUR' }
  }
}
