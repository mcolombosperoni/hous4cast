import type { SupportedLocale } from '../app/providers/AppPreferencesProvider'

export type PropertyType = 'appartamento' | 'villa' | 'ufficio'

/** Surface area buckets (used by single-choice sqm field) */
export type SqmBucket = 'fino_50' | '51_70' | '71_110' | '111_149' | '150_plus'

/** Internal condition of the property */
export type PropertyCondition = 'ottimo' | 'buono' | 'da_ristrutturare'

/** Accessories / parking */
export type PropertyAccessories = 'cantina' | 'box_auto' | 'cantina_box' | 'cantina_due_box' | 'nulla'

/** Floor of the property */
export type PropertyFloor = 'terra' | 'primo' | 'secondo' | 'terzo' | 'quarto' | 'quinto' | 'sopra_quinto'

/** Construction era */
export type BuildEra = '1900_1940' | '1941_1967' | '1968_1980' | '1981_1995' | '1995_2005' | '2006_2015' | '2016_oggi'

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
   * Calculation: baseBySqmBucket × zoneMultiplier × conditionFactor × floorFactor × erаFactor + accessoriesBonus
   */
  sqmBucketPrices?: SqmBucketPrices;
  conditionFactors?: FactorTable<PropertyCondition>;
  floorFactors?: FactorTable<PropertyFloor>;
  eraFactors?: FactorTable<BuildEra>;
  accessoriesBonuses?: BonusTable<PropertyAccessories>;

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

export interface EstimateInput {
  zoneId: string
  propertyType: PropertyType
  sqm: number
  /** Extended Gabetti fields */
  sqmBucket?: SqmBucket
  address?: string
  condition?: PropertyCondition
  accessories?: PropertyAccessories
  floor?: PropertyFloor
  buildEra?: BuildEra
  email?: string
  phone?: string
}

export interface EstimateResult {
  low: number
  mid: number
  high: number
  currency: string
}
