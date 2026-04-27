import { useState } from 'react'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import type { AgencyConfig, EstimateInput, PropertyType } from '../configs/types'

const propertyTypeLabel: Record<PropertyType, Record<'it' | 'en', string>> = {
  appartamento: { it: 'Appartamento', en: 'Apartment' },
  villa: { it: 'Villa', en: 'Villa' },
  ufficio: { it: 'Ufficio', en: 'Office' },
}

interface EstimateFormProps {
  config: AgencyConfig
  onSubmit: (input: EstimateInput) => void
}

export const EstimateForm = ({ config, onSubmit }: EstimateFormProps) => {
  const { locale } = useAppPreferences()
  const { sqmRange, zones, propertyTypes } = config

  const [zoneId, setZoneId] = useState(zones[0]?.zoneId ?? '')
  const [propertyType, setPropertyType] = useState<PropertyType>(propertyTypes[0] ?? 'appartamento')
  const [sqm, setSqm] = useState<string>('')
  const [sqmError, setSqmError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedSqm = parseFloat(sqm)

    if (isNaN(parsedSqm) || parsedSqm < sqmRange.min || parsedSqm > sqmRange.max) {
      setSqmError(
        locale === 'it'
          ? `Inserisci un valore tra ${sqmRange.min} e ${sqmRange.max} m²`
          : `Enter a value between ${sqmRange.min} and ${sqmRange.max} sqm`,
      )
      return
    }

    setSqmError(null)
    onSubmit({ zoneId, propertyType, sqm: parsedSqm })
  }

  const labels =
    locale === 'it'
      ? {
          zone: 'Zona',
          type: 'Tipo immobile',
          sqm: 'Superficie (m²)',
          submit: 'Calcola stima',
        }
      : {
          zone: 'Zone',
          type: 'Property type',
          sqm: 'Surface area (sqm)',
          submit: 'Get estimate',
        }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Zone */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="zone">
          {labels.zone}
        </label>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          id="zone"
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
        >
          {zones.map((z) => (
            <option key={z.zoneId} value={z.zoneId}>
              {z.label[locale]}
            </option>
          ))}
        </select>
      </div>

      {/* Property type */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="type">
          {labels.type}
        </label>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          id="type"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType)}
        >
          {propertyTypes.map((pt) => (
            <option key={pt} value={pt}>
              {propertyTypeLabel[pt][locale]}
            </option>
          ))}
        </select>
      </div>

      {/* Surface */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="sqm">
          {labels.sqm}
        </label>
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          id="sqm"
          inputMode="decimal"
          max={sqmRange.max}
          min={sqmRange.min}
          placeholder={`${sqmRange.min}–${sqmRange.max}`}
          type="number"
          value={sqm}
          onChange={(e) => setSqm(e.target.value)}
        />
        {sqmError && <p className="text-xs text-red-500 dark:text-red-400">{sqmError}</p>}
      </div>

      <button
        className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        type="submit"
      >
        {labels.submit}
      </button>
    </form>
  )
}

