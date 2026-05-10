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

/** Round a value up to the nearest thousand (e.g. 105,816 → 106,000). */
function ceilToThousand(value: number): number {
  return Math.ceil(value / 1000) * 1000
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
    // Use factor path only when bucket entries are non-empty OR legacy sqmBucketPrices is defined.
    const hasBucketEntries = (this.config.sqmBucketEntries?.length ?? 0) > 0
    const hasLegacyBuckets = Boolean(this.config.sqmBucketPrices)
    if (hasBucketEntries || hasLegacyBuckets) {
      return this._estimateWithFactors(input, zone.zoneMultiplier ?? 1)
    }

    // ── Simple estimation: pricePerSqm × sqm ────────────────────────────────
    // Still applies property type and factor entries as multipliers (neutral = 1).
    const pricePerSqm = zone.pricePerSqm[input.propertyType]
    if (pricePerSqm === undefined) {
      throw new EstimationEngineError(
        `Property type "${input.propertyType}" is not supported in zone "${input.zoneId}"`,
        'TYPE_NOT_SUPPORTED',
      )
    }

    // Apply open-list factors even in simple mode (neutral = 1 / 0 when absent or not selected)
    const { conditionEntries, floorEntries, eraEntries, accessoryEntries, propertyTypeFactors } = this.config
    const propertyTypeFactor = propertyTypeFactors?.[input.propertyType] ?? 1
    const conditionFactor  = (input.condition  && conditionEntries?.find((e) => e.value === input.condition)?.coefficient)  ?? 1
    const floorFactor      = (input.floor      && floorEntries?.find((e) => e.value === input.floor)?.coefficient)          ?? 1
    const eraFactor        = (input.buildEra   && eraEntries?.find((e) => e.value === input.buildEra)?.coefficient)         ?? 1
    const accessoriesBonus = (input.accessories && accessoryEntries?.find((e) => e.value === input.accessories)?.bonus)     ?? 0

    const mid = ceilToThousand(pricePerSqm * input.sqm * propertyTypeFactor * conditionFactor * floorFactor * eraFactor + accessoriesBonus)
    const low = ceilToThousand(mid * (1 - this.spread))
    const high = ceilToThousand(mid * (1 + this.spread))

    return { low, mid, high, currency: 'EUR' }
  }

  /**
   * Gabetti-style multi-factor estimation.
   *
   * Formula:
   *   base       = sqmBucketEntries[sqmBucket].pricePerSqm  (or sqmBucketPrices[sqmBucket] legacy)
   *                Falls back to zone.pricePerSqm × sqm when sqmBucket is absent.
   *   mid        = base × zoneMultiplier × propertyTypeFactor
   *                     × conditionFactor × floorFactor × eraFactor
   *                     + accessoriesBonus
   *   low        = mid × (1 − spreadFactor)
   *   high       = mid × (1 + spreadFactor)
   *
   * Factors default to 1 (multipliers) or 0 (bonuses) when entries are absent
   * or the submitted value does not match any configured entry.
   */
  private _estimateWithFactors(input: EstimateInput, zoneMultiplier: number): EstimateResult {
    const { sqmBucketEntries, sqmBucketPrices, conditionEntries, floorEntries, eraEntries, accessoryEntries, propertyTypeFactors } = this.config

    // Resolve base price from bucket if available; otherwise fall back to pricePerSqm × sqm
    let base: number | undefined
    if (input.sqmBucket) {
      if (sqmBucketEntries && sqmBucketEntries.length > 0) {
        base = sqmBucketEntries.find((e) => e.value === input.sqmBucket)?.pricePerSqm
      } else if (sqmBucketPrices) {
        base = sqmBucketPrices[input.sqmBucket]
      }
    }

    // Fallback: no bucket submitted or bucket not found → use pricePerSqm × sqm
    if (base === undefined) {
      const pricePerSqm = this.config.zones.find((z) => z.zoneId === input.zoneId)?.pricePerSqm[input.propertyType]
      base = (pricePerSqm ?? 0) * input.sqm
    }

    const propertyTypeFactor = propertyTypeFactors?.[input.propertyType] ?? 1
    const conditionFactor  = (input.condition  && conditionEntries?.find((e) => e.value === input.condition)?.coefficient)  ?? 1
    const floorFactor      = (input.floor      && floorEntries?.find((e) => e.value === input.floor)?.coefficient)          ?? 1
    const eraFactor        = (input.buildEra   && eraEntries?.find((e) => e.value === input.buildEra)?.coefficient)         ?? 1
    const accessoriesBonus = (input.accessories && accessoryEntries?.find((e) => e.value === input.accessories)?.bonus)     ?? 0

    const mid  = ceilToThousand(base * zoneMultiplier * propertyTypeFactor * conditionFactor * floorFactor * eraFactor + accessoriesBonus)
    const low  = ceilToThousand(mid * (1 - this.spread))
    const high = ceilToThousand(mid * (1 + this.spread))

    return { low, mid, high, currency: 'EUR' }
  }
}
