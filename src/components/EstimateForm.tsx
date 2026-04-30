import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

   // Schema e valori di default statici (campi fissi)
   const schema = z.object({
     zoneId: z.string().min(1, locale === 'it' ? 'Campo obbligatorio' : 'Required field'),
     propertyType: z.string().min(1, locale === 'it' ? 'Campo obbligatorio' : 'Required field'),
     sqm: z
       .preprocess((val) => (val === '' ? undefined : Number(val)), z
         .number({ message: locale === 'it' ? 'Valore richiesto' : 'Value required' })
         .min(sqmRange.min, { message: locale === 'it' ? `Minimo ${sqmRange.min}` : `Minimum ${sqmRange.min}` })
         .max(sqmRange.max, { message: locale === 'it' ? `Massimo ${sqmRange.max}` : `Maximum ${sqmRange.max}` })
       ),
     privacy: z.boolean().refine((val) => val === true, {
       message: locale === 'it' ? 'Devi accettare per continuare' : 'You must accept to continue',
     }),
   })
   const defaultValues = {
     zoneId: zones[0]?.zoneId ?? '',
     propertyType: propertyTypes[0] ?? 'appartamento',
     sqm: '',
     privacy: false,
   }

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues,
  })

  type FormData = {
    zoneId: string;
    propertyType: string;
    sqm: number | string;
    privacy: boolean;
  };

  const submit = (data: FormData) => {
    onSubmit({
      zoneId: data.zoneId,
      propertyType: data.propertyType as PropertyType,
      sqm: Number(data.sqm),
    })
  }

  const labels =
    locale === 'it'
      ? {
          zone: 'Zona',
          type: 'Tipo immobile',
          sqm: 'Superficie (m)',
          privacy: 'Ho letto e accetto l’informativa privacy',
          submit: 'Calcola stima',
        }
      : {
          zone: 'Zone',
          type: 'Property type',
          sqm: 'Surface area (sqm)',
          privacy: 'I have read and accept the privacy policy',
          submit: 'Get estimate',
        }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)}>
      {/* Zone */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="zoneId">
          {labels.zone}
        </label>
        <Controller
          name="zoneId"
          control={control}
          render={({ field }) => (
            <select
              id="zoneId"
              data-testid="zoneId"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              {...field}
            >
              {zones.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>
                  {z.label[locale]}
                </option>
              ))}
            </select>
          )}
        />
         {errors.zoneId && (
           <p className="text-xs text-red-500 dark:text-red-400" data-testid="error-zoneId">{errors.zoneId.message as string}</p>
         )}
      </div>

      {/* Property type */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="propertyType">
          {labels.type}
        </label>
        <Controller
          name="propertyType"
          control={control}
          render={({ field }) => (
            <select
              id="propertyType"
              data-testid="propertyType"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              {...field}
            >
              {propertyTypes.map((pt) => (
                <option key={pt} value={pt}>
                  {propertyTypeLabel[pt][locale]}
                </option>
              ))}
            </select>
          )}
        />
         {errors.propertyType && (
           <p className="text-xs text-red-500 dark:text-red-400" data-testid="error-propertyType">{errors.propertyType.message as string}</p>
         )}
      </div>

      {/* Surface */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="sqm">
          {labels.sqm}
        </label>
        <Controller
          name="sqm"
          control={control}
          render={({ field }) => (
            <input
              id="sqm"
              type="number"
              min={sqmRange.min}
              max={sqmRange.max}
              placeholder={`${sqmRange.min}–${sqmRange.max}`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              value={typeof field.value === 'number' || typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              data-testid="sqm"
            />
          )}
        />
         {errors.sqm && (
           <p className="text-xs text-red-500 dark:text-red-400" data-testid="error-sqm">{errors.sqm.message as string}</p>
         )}
      </div>

      {/* Privacy */}
      <div className="flex items-center gap-2">
        <Controller
          name="privacy"
          control={control}
          render={({ field }) => (
            <label className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2" htmlFor="privacy">
              <input
                id="privacy"
                data-testid="privacy"
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              {labels.privacy}
            </label>
          )}
        />
         {errors.privacy && (
           <p className="text-xs text-red-500 dark:text-red-400 ml-2" data-testid="error-privacy">{errors.privacy.message as string}</p>
         )}
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
