import type { AgencyConfig } from '../types'

/**
 * Fictional test agency fixture — used exclusively in unit/component tests.
 * Uses no real agency data. Two zones and two property types to exercise
 * all label/count paths in AdminPage and related components.
 */
export const testAgencyFixture: AgencyConfig = {
  id: 'test-agency',
  agencyName: 'Test Agency',
  sqmRange: { min: 20, max: 500 },
  spreadFactor: 0.1,
  propertyTypes: ['appartamento', 'ufficio'],
  propertyTypeEntries: [
    { value: 'appartamento', label: { it: 'Appartamento', en: 'Apartment' }, coefficient: 1.0 },
    { value: 'ufficio',      label: { it: 'Ufficio',      en: 'Office'    }, coefficient: 0.9 },
  ],
  zones: [
    {
      zoneId: 'zona_centro',
      label: { it: 'Centro', en: 'Centre' },
      pricePerSqm: { appartamento: 3000 },
      zoneMultiplier: 1.0,
    },
    {
      zoneId: 'zona_periferia',
      label: { it: 'Periferia', en: 'Outskirts' },
      pricePerSqm: { appartamento: 2000 },
      zoneMultiplier: 0.7,
    },
  ],
  conditionEntries: [
    { value: 'ottimo',           label: { it: 'Ottimo',           en: 'Excellent'        }, coefficient: 1.00 },
    { value: 'buono',            label: { it: 'Buono',            en: 'Good'             }, coefficient: 0.80 },
    { value: 'da_ristrutturare', label: { it: 'Da ristrutturare', en: 'Needs renovation' }, coefficient: 0.60 },
  ],
  branding: {
    palette: {
      primary: '#1e293b',
      secondary: '#3b82f6',
      text: '#0f172a',
      background: '#f8fafc',
    },
  },
  privacy: {
    text: {
      it: 'Testo privacy di test.',
      en: 'Test privacy text.',
    },
  },
}

