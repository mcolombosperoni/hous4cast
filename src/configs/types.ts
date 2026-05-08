import type { SupportedLocale } from '../app/providers/AppPreferencesProvider'

/** @deprecated Use string — kept for EstimateInput typing convenience */
export type PropertyType = 'appartamento' | 'villa' | 'ufficio'

/** Surface area buckets (used by single-choice sqm field) */
export type SqmBucket = 'fino_50' | '51_70' | '71_110' | '111_149' | '150_plus'

/** @deprecated Use string — kept for EstimateInput typing convenience */
export type PropertyCondition = string
/** @deprecated Use string — kept for EstimateInput typing convenience */
export type PropertyAccessories = string
/** @deprecated Use string — kept for EstimateInput typing convenience */
export type PropertyFloor = string
/** @deprecated Use string — kept for EstimateInput typing convenience */
export type BuildEra = string

export interface ZoneRate {
  zoneId: string
  label: Record<SupportedLocale, string>
  /** Price per sqm by property type */
  pricePerSqm: Partial<Record<PropertyType, number>>
  /** Zone multiplier applied to base price (default 1) */
  zoneMultiplier?: number
}

/** Base price by sqm bucket (used when sqmBuckets is defined in config) */
export type SqmBucketPrices = Partial<Record<SqmBucket, number>>

/** Multiplicative factor table keyed by enum value */
export type FactorTable<T extends string> = Partial<Record<T, number>>

/** Additive bonus table keyed by enum value */
export type BonusTable<T extends string> = Partial<Record<T, number>>

/**
 * Open-list entry for a multiplicative estimation factor.
 * Replaces the fixed FactorTable approach — admin can add/rename/remove entries.
 */
export interface FactorEntry {
  value: string
  label: Record<SupportedLocale, string>
  coefficient: number
}

/**
 * Open-list entry for an additive accessories bonus.
 * `bonus` is in € and is added to the estimated price.
 */
export interface AccessoryEntry {
  value: string
  label: Record<SupportedLocale, string>
  bonus: number
}

/**
 * Open-list entry for an sqm bucket price.
 * `value` is the bucket key (e.g. "0-50"), `pricePerSqm` is the base price in €/sqm.
 * Replaces the legacy `SqmBucketPrices` flat table (Epic Q).
 */
export interface SqmBucketEntry {
  value: string
  label: Record<SupportedLocale, string>
  pricePerSqm: number
}

/**
 * Open-list entry for a property type (Epic R extension).
 * Replaces the plain string array — admin can set localized labels and a multiplicative factor.
 */
export interface PropertyTypeEntry {
  value: string
  label: Record<SupportedLocale, string>
  /** Multiplicative factor applied to the base estimate (default 1) */
  coefficient: number
}


export type FormFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'email'
  | 'tel'
  | 'textarea';

export interface FormFieldOption {
  value: string;
  label: Record<SupportedLocale, string>;
}

export interface FormField {
  name: string;
  type: FormFieldType;
  label: Record<SupportedLocale, string>;
  required?: boolean;
  options?: FormFieldOption[];
  placeholder?: Record<SupportedLocale, string>;
  min?: number;
  max?: number;
  infoText?: Record<SupportedLocale, string>;
  conditional?: {
    field: string;
    value: string | number | boolean;
  };
}

export interface AgencyConfig {
  id: string;
  agencyName: string;
  /** Allowed surface range in sqm */
  sqmRange: { min: number; max: number };
  zones: ZoneRate[];
  propertyTypes: PropertyType[];
  /** Spread percentage for low/high range (0–1), default 0.1 */
  spreadFactor?: number;

  /**
   * Gabetti-style estimation factors.
   * When present, the engine uses these instead of simple pricePerSqm × sqm.
   * Formula: baseBySqmBucket × zoneMultiplier × propertyTypeFactor
   *          × conditionFactor × floorFactor × eraFactor + accessoriesBonus
   */
  sqmBucketPrices?: SqmBucketPrices;

  /** Open-list factor entries (Epic P). Engine looks up coefficient by entry.value. */
  conditionEntries?: FactorEntry[];
  floorEntries?: FactorEntry[];
  eraEntries?: FactorEntry[];
  accessoryEntries?: AccessoryEntry[];

  /** Multiplicative factor per property type (default 1 when absent) */
  propertyTypeFactors?: FactorTable<PropertyType>;

  /** Open-list property type entries with localized labels and coefficient (Epic R) */
  propertyTypeEntries?: PropertyTypeEntry[];

  /** Form fields definition for dynamic form rendering */
  formFields?: FormField[];
  /** Branding: color palette, logo, cover image */
  branding?: {
    palette: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
    logoUrl?: string;
    coverImageUrl?: string;
  };
  /** Privacy: localized privacy policy text or link */
  privacy?: {
    text?: Record<SupportedLocale, string>;
    link?: Record<SupportedLocale, string>;
  };
}

/**
 * Fields an admin can override at runtime via Firestore/localStorage.
 * Excludes: id, agencyName (identity), branding (own Firestore path), formFields (structural).
 */
export type EstimationConfigOverride = Partial<
  Pick<
    AgencyConfig,
    | 'zones'
    | 'propertyTypes'
    | 'propertyTypeEntries'
    | 'sqmRange'
    | 'spreadFactor'
    | 'sqmBucketPrices'
    | 'conditionEntries'
    | 'floorEntries'
    | 'eraEntries'
    | 'accessoryEntries'
    | 'propertyTypeFactors'
    | 'privacy'
  > & {
    /** Legacy flat factor tables — kept for backward compatibility with saved overrides */
    conditionFactors: Record<string, number>
    floorFactors: Record<string, number>
    eraFactors: Record<string, number>
    accessoriesBonuses: Record<string, number>
  }
>

export interface EstimateInput {
  zoneId: string
  propertyType: PropertyType
  sqm: number
  /** Extended Gabetti fields */
  sqmBucket?: SqmBucket
  address?: string
  condition?: string
  accessories?: string
  floor?: string
  buildEra?: string
  email?: string
  phone?: string
}

export interface EstimateResult {
  low: number
  mid: number
  high: number
  currency: string
}
