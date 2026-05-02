import type { AgencyConfig } from './types'

/**
 * Gabetti Busto Arsizio — full config migrated from the Tally reference form.
 *
 * Estimation model (Gabetti-style):
 *   price = baseBySqmBucket
 *         × zoneMultiplier      (per zone, relative to "centro" = 1.0)
 *         × conditionFactor     (ottimo=1 / buono=0.75 / da_ristrutturare=0.5)
 *         × floorFactor         (terra=0.98 … sopra_quinto=1.12)
 *         × eraFactor           (2016_oggi=1 … 1900_1940=0.55)
 *         + accessoriesBonus    (flat €)
 *
 * Base prices by sqm bucket are derived from the Tally conditional logic
 * (centro reference prices):
 *   fino_50   → 160 000
 *   51_70     → 224 000
 *   71_110    → 352 000
 *   111_149   → 476 800
 *   150_plus  → 544 000
 */
export const gabettiBustoArsizioConfig: AgencyConfig = {
  id: 'gabetti-busto-arsizio',
  agencyName: 'Gabetti Busto Arsizio',
  sqmRange: { min: 20, max: 1000 },
  spreadFactor: 0.05, // ±5% spread on top of mid (min = mid×0.9, see engine)
  propertyTypes: ['appartamento'],

  // ── 10 zones from the Tally form ──────────────────────────────────────────
  zones: [
    { zoneId: 'centro',          label: { it: 'Centro',          en: 'Centre'         }, pricePerSqm: { appartamento: 3200 }, zoneMultiplier: 1.00 },
    { zoneId: 'sant_edoardo',    label: { it: "Sant'Edoardo",    en: "Sant'Edoardo"   }, pricePerSqm: { appartamento: 3136 }, zoneMultiplier: 0.98 },
    { zoneId: 'frati_tribunale', label: { it: 'Frati Tribunale', en: 'Frati Tribunale'}, pricePerSqm: { appartamento: 3008 }, zoneMultiplier: 0.94 },
    { zoneId: 'ponzella',        label: { it: 'Ponzella',        en: 'Ponzella'       }, pricePerSqm: { appartamento: 2912 }, zoneMultiplier: 0.91 },
    { zoneId: 'cimitero',        label: { it: 'Cimitero',        en: 'Cimitero'       }, pricePerSqm: { appartamento: 2592 }, zoneMultiplier: 0.81 },
    { zoneId: 'sacconago',       label: { it: 'Sacconago',       en: 'Sacconago'      }, pricePerSqm: { appartamento: 2400 }, zoneMultiplier: 0.75 },
    { zoneId: 'borsano',         label: { it: 'Borsano',         en: 'Borsano'        }, pricePerSqm: { appartamento: 2400 }, zoneMultiplier: 0.75 },
    { zoneId: 'beata_giuliana',  label: { it: 'Beata Giuliana',  en: 'Beata Giuliana' }, pricePerSqm: { appartamento: 2400 }, zoneMultiplier: 0.75 },
    { zoneId: 'sant_anna',       label: { it: "Sant'Anna",       en: "Sant'Anna"      }, pricePerSqm: { appartamento: 2112 }, zoneMultiplier: 0.66 },
    { zoneId: 'ospedale',        label: { it: 'Ospedale',        en: 'Ospedale'       }, pricePerSqm: { appartamento: 2592 }, zoneMultiplier: 0.81 },
  ],

  // ── Sqm bucket base prices (centro reference, from Tally logic) ───────────
  sqmBucketPrices: {
    fino_50:  160000,
    '51_70':  224000,
    '71_110': 352000,
    '111_149':476800,
    '150_plus':544000,
  },

  // ── Condition factors ─────────────────────────────────────────────────────
  conditionFactors: {
    ottimo:           1.00,
    buono:            0.75,
    da_ristrutturare: 0.50,
  },

  // ── Floor factors ─────────────────────────────────────────────────────────
  floorFactors: {
    terra:        0.98,
    primo:        1.00,
    secondo:      1.02,
    terzo:        1.04,
    quarto:       1.06,
    quinto:       1.08,
    sopra_quinto: 1.12,
  },

  // ── Build era factors ─────────────────────────────────────────────────────
  eraFactors: {
    '1900_1940': 0.55,
    '1941_1967': 0.60,
    '1968_1980': 0.65,
    '1981_1995': 0.70,
    '1995_2005': 0.85,
    '2006_2015': 0.95,
    '2016_oggi': 1.00,
  },

  // ── Accessories flat bonuses (€) ──────────────────────────────────────────
  accessoriesBonuses: {
    nulla:          0,
    cantina:        3000,
    box_auto:       15000,
    cantina_box:    18000,
    cantina_due_box:33000,
  },

  branding: {
    palette: {
      primary: '#C8102E',
      secondary: '#F5A623',
      text: '#222222',
      background: '#FFFFFF',
    },
  },

  privacy: {
    text: {
      it: 'Dichiaro di aver letto l\'Informativa Privacy e acconsento al trattamento dei miei dati personali per ricevere la valutazione dell\'immobile.',
      en: 'I declare I have read the Privacy Policy and consent to the processing of my personal data to receive the property valuation.',
    },
    link: {
      it: 'https://gabetti.it/privacy',
      en: 'https://gabetti.it/en/privacy',
    },
  },
}
