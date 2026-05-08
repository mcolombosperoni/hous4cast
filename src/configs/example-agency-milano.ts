import type { AgencyConfig } from './types'

export const exampleAgencyMilanoConfig: AgencyConfig = {
  id: 'example-agency-milano',
  agencyName: 'Example Agency Milano',
  sqmRange: { min: 25, max: 850 },
  spreadFactor: 0.12,
  propertyTypes: ['appartamento', 'villa'],
  propertyTypeEntries: [
    { value: 'appartamento', label: { it: 'Appartamento', en: 'Apartment' }, coefficient: 1.0 },
    { value: 'villa', label: { it: 'Villa', en: 'Villa' }, coefficient: 1.0 },
  ],
  zones: [
    {
      zoneId: 'centro',
      label: { it: 'Centro', en: 'City center' },
      pricePerSqm: {
        appartamento: 5400,
        villa: 6900,
      },
    },
    {
      zoneId: 'navigli',
      label: { it: 'Navigli', en: 'Navigli district' },
      pricePerSqm: {
        appartamento: 4700,
        villa: 6100,
      },
    },
  ],
}

