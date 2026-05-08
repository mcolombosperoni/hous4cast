import type { AgencyConfig } from './types'

/**
 * Default template used when creating a new agency from the admin UI ("Add Agency").
 * All fields contain sensible placeholder values that the admin can override.
 * This config is NOT registered in the static registry.
 */
export const defaultAgencyTemplate: Omit<AgencyConfig, 'id' | 'agencyName'> = {
  sqmRange: { min: 20, max: 500 },
  spreadFactor: 0.1,
  propertyTypes: ['appartamento'],
  propertyTypeEntries: [
    { value: 'appartamento', label: { it: 'Appartamento', en: 'Apartment' }, coefficient: 1.0 },
  ],
  zones: [
    {
      zoneId: 'zona_1',
      label: { it: 'Zona 1', en: 'Zone 1' },
      pricePerSqm: { appartamento: 3000 },
      zoneMultiplier: 1.0,
    },
  ],
  // Open-list factor entries — start empty so the admin can add entries as needed
  conditionEntries: [],
  floorEntries: [],
  eraEntries: [],
  accessoryEntries: [],
  // sqmBucketEntries: start as empty array so the admin can add bucket entries;
  // if left empty, the estimation form will use the numeric sqmRange input instead.
  sqmBucketEntries: [],
  privacy: {
    text: {
      it: 'Inserire qui il testo della privacy policy...',
      en: 'Enter the privacy policy text here...',
    },
  },
  branding: {
    palette: {
      primary: '#1e293b',
      secondary: '#3b82f6',
      text: '#0f172a',
      background: '#f8fafc',
    },
  },
}

