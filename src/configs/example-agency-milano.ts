import type { AgencyConfig } from './types'

export const exampleAgencyMilanoConfig: AgencyConfig = {
  id: 'example-agency-milano',
  agencyName: 'Example Agency Milano',
  sqmRange: { min: 25, max: 850 },
  spreadFactor: 0.12,
  propertyTypes: ['appartamento', 'villa'],
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

