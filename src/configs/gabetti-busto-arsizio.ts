import type { AgencyConfig } from './types'

export const gabettiBustoArsizioConfig: AgencyConfig = {
  id: 'gabetti-busto-arsizio',
  agencyName: 'Gabetti Busto Arsizio',
  sqmRange: { min: 20, max: 1000 },
  spreadFactor: 0.1,
  propertyTypes: ['appartamento', 'villa', 'ufficio'],
  zones: [
    {
      zoneId: 'centro',
      label: { it: 'Centro storico', en: 'Historic centre' },
      pricePerSqm: {
        appartamento: 2800,
        villa: 3200,
        ufficio: 2400,
      },
    },
    {
      zoneId: 'semicentro',
      label: { it: 'Semicentro', en: 'Semi-central' },
      pricePerSqm: {
        appartamento: 2000,
        villa: 2400,
        ufficio: 1700,
      },
    },
    {
      zoneId: 'periferia',
      label: { it: 'Periferia', en: 'Outskirts' },
      pricePerSqm: {
        appartamento: 1400,
        villa: 1700,
        ufficio: 1100,
      },
    },
  ],
}

