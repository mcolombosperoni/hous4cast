import type { SupportedLocale } from '../app/providers/AppPreferencesProvider'

export type PropertyType = 'appartamento' | 'villa' | 'ufficio'

export interface ZoneRate {
  zoneId: string
  label: Record<SupportedLocale, string>
  /** Price per sqm by property type */
  pricePerSqm: Partial<Record<PropertyType, number>>
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
  /** Form fields definition for dynamic form rendering */
  formFields?: FormField[];
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

