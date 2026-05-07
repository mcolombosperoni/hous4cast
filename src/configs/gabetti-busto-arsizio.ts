import type { AgencyConfig } from './types'

/**
 * Gabetti Busto Arsizio — full config migrated from the Tally reference form.
 *
 * Estimation model (Gabetti-style):
 *   price = baseBySqmBucket
 *         × zoneMultiplier      (per zone, relative to "centro" = 1.0)
 *         × propertyTypeFactor  (default 1.0)
 *         × conditionFactor     (ottimo=1 / buono=0.75 / da_ristrutturare=0.5)
 *         × floorFactor         (terra=0.98 … sopra_quinto=1.12)
 *         × eraFactor           (2016_oggi=1 … 1900_1940=0.55)
 *         + accessoriesBonus    (flat €)
 *
 * From Epic P: factors are open lists (FactorEntry / AccessoryEntry) with
 * localized labels, fully editable by the admin.
 */
export const gabettiBustoArsizioConfig: AgencyConfig = {
  id: 'gabetti-busto-arsizio',
  agencyName: 'Gabetti Busto Arsizio',
  sqmRange: { min: 20, max: 1000 },
  spreadFactor: 0.05,
  propertyTypes: ['appartamento'],

  // ── 10 zones from the Tally form ──────────────────────────────────────────
  zones: [
    { zoneId: 'centro',          label: { it: 'Centro',          en: 'Centre'          }, pricePerSqm: { appartamento: 3200 }, zoneMultiplier: 1.00 },
    { zoneId: 'sant_edoardo',    label: { it: "Sant'Edoardo",    en: "Sant'Edoardo"    }, pricePerSqm: { appartamento: 3136 }, zoneMultiplier: 0.98 },
    { zoneId: 'frati_tribunale', label: { it: 'Frati Tribunale', en: 'Frati Tribunale' }, pricePerSqm: { appartamento: 3008 }, zoneMultiplier: 0.94 },
    { zoneId: 'ponzella',        label: { it: 'Ponzella',        en: 'Ponzella'        }, pricePerSqm: { appartamento: 2912 }, zoneMultiplier: 0.91 },
    { zoneId: 'cimitero',        label: { it: 'Cimitero',        en: 'Cimitero'        }, pricePerSqm: { appartamento: 2592 }, zoneMultiplier: 0.81 },
    { zoneId: 'sacconago',       label: { it: 'Sacconago',       en: 'Sacconago'       }, pricePerSqm: { appartamento: 2400 }, zoneMultiplier: 0.75 },
    { zoneId: 'borsano',         label: { it: 'Borsano',         en: 'Borsano'         }, pricePerSqm: { appartamento: 2400 }, zoneMultiplier: 0.75 },
    { zoneId: 'beata_giuliana',  label: { it: 'Beata Giuliana',  en: 'Beata Giuliana'  }, pricePerSqm: { appartamento: 2400 }, zoneMultiplier: 0.75 },
    { zoneId: 'sant_anna',       label: { it: "Sant'Anna",       en: "Sant'Anna"       }, pricePerSqm: { appartamento: 2112 }, zoneMultiplier: 0.66 },
    { zoneId: 'ospedale',        label: { it: 'Ospedale',        en: 'Ospedale'        }, pricePerSqm: { appartamento: 2592 }, zoneMultiplier: 0.81 },
  ],

  // ── Sqm bucket base prices (centro reference) ─────────────────────────────
  sqmBucketPrices: {
    fino_50:   160000,
    '51_70':   224000,
    '71_110':  352000,
    '111_149': 476800,
    '150_plus':544000,
  },

  // ── Condition entries (open list, Epic P) ─────────────────────────────────
  conditionEntries: [
    { value: 'ottimo',           label: { it: 'Ottimo',            en: 'Excellent'       }, coefficient: 1.00 },
    { value: 'buono',            label: { it: 'Buono',             en: 'Good'            }, coefficient: 0.75 },
    { value: 'da_ristrutturare', label: { it: 'Da ristrutturare',  en: 'Needs renovation'}, coefficient: 0.50 },
  ],

  // ── Floor entries (open list, Epic P) ─────────────────────────────────────
  floorEntries: [
    { value: 'terra',        label: { it: 'Piano terra',       en: 'Ground floor'    }, coefficient: 0.98 },
    { value: 'primo',        label: { it: '1° piano',          en: '1st floor'       }, coefficient: 1.00 },
    { value: 'secondo',      label: { it: '2° piano',          en: '2nd floor'       }, coefficient: 1.02 },
    { value: 'terzo',        label: { it: '3° piano',          en: '3rd floor'       }, coefficient: 1.04 },
    { value: 'quarto',       label: { it: '4° piano',          en: '4th floor'       }, coefficient: 1.06 },
    { value: 'quinto',       label: { it: '5° piano',          en: '5th floor'       }, coefficient: 1.08 },
    { value: 'sopra_quinto', label: { it: 'Sopra il 5° piano', en: 'Above 5th floor' }, coefficient: 1.12 },
  ],

  // ── Era entries (open list, Epic P) ──────────────────────────────────────
  eraEntries: [
    { value: '1900_1940', label: { it: '1900 – 1940',  en: '1900 – 1940'     }, coefficient: 0.55 },
    { value: '1941_1967', label: { it: '1941 – 1967',  en: '1941 – 1967'     }, coefficient: 0.60 },
    { value: '1968_1980', label: { it: '1968 – 1980',  en: '1968 – 1980'     }, coefficient: 0.65 },
    { value: '1981_1995', label: { it: '1981 – 1995',  en: '1981 – 1995'     }, coefficient: 0.70 },
    { value: '1995_2005', label: { it: '1995 – 2005',  en: '1995 – 2005'     }, coefficient: 0.85 },
    { value: '2006_2015', label: { it: '2006 – 2015',  en: '2006 – 2015'     }, coefficient: 0.95 },
    { value: '2016_oggi', label: { it: '2016 – oggi',  en: '2016 – present'  }, coefficient: 1.00 },
  ],

  // ── Accessory entries (open list, Epic P) ─────────────────────────────────
  accessoryEntries: [
    { value: 'nulla',           label: { it: 'Nulla',                 en: 'None'                    }, bonus:     0 },
    { value: 'cantina',         label: { it: 'Cantina',               en: 'Cellar'                  }, bonus:  3000 },
    { value: 'box_auto',        label: { it: '1 Box auto',            en: '1 Garage'                }, bonus: 15000 },
    { value: 'cantina_box',     label: { it: 'Cantina e un box',      en: 'Cellar and one garage'   }, bonus: 18000 },
    { value: 'cantina_due_box', label: { it: 'Cantina e due box',     en: 'Cellar and two garages'  }, bonus: 33000 },
  ],

  // ── Property type factors ─────────────────────────────────────────────────
  propertyTypeFactors: {
    appartamento: 1,
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
      it: "Dichiaro di aver letto l'Informativa Privacy e acconsento al trattamento dei miei dati personali per ricevere la valutazione dell'immobile.",
      en: 'I declare I have read the Privacy Policy and consent to the processing of my personal data to receive the property valuation.',
    },
    link: {
      it: 'https://gabetti.it/privacy',
      en: 'https://gabetti.it/en/privacy',
    },
  },
}
