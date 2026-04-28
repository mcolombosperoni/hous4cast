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
  formFields: [
    {
      name: 'zoneId',
      type: 'select',
      label: { it: 'Zona', en: 'Zone' },
      required: true,
      options: [
        { value: 'centro', label: { it: 'Centro storico', en: 'Historic centre' } },
        { value: 'semicentro', label: { it: 'Semicentro', en: 'Semi-central' } },
        { value: 'periferia', label: { it: 'Periferia', en: 'Outskirts' } },
      ],
    },
    {
      name: 'propertyType',
      type: 'select',
      label: { it: 'Tipo immobile', en: 'Property type' },
      required: true,
      options: [
        { value: 'appartamento', label: { it: 'Appartamento', en: 'Apartment' } },
        { value: 'villa', label: { it: 'Villa', en: 'Villa' } },
        { value: 'ufficio', label: { it: 'Ufficio', en: 'Office' } },
      ],
    },
    {
      name: 'sqm',
      type: 'number',
      label: { it: 'Superficie (m²)', en: 'Surface area (sqm)' },
      required: true,
      min: 20,
      max: 1000,
      placeholder: { it: 'Inserisci la superficie', en: 'Enter surface area' },
    },
    {
      name: 'privacy',
      type: 'checkbox',
      label: {
        it: 'Ho letto e accetto l’informativa privacy',
        en: 'I have read and accept the privacy policy',
      },
      required: true,
      infoText: {
        it: 'Necessario per inviare la richiesta',
        en: 'Required to submit the request',
      },
    },
  ],
}

