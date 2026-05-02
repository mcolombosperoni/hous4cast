import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import type { AgencyConfig, EstimateInput, PropertyType } from '../configs/types'
import { i18n } from '../app/i18n'

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
   const labels = i18n[locale].estimate
   const schema = z.object({
     zoneId: z.string().min(1, labels.required),
     propertyType: z.string().min(1, labels.required),
     sqm: z
       .preprocess((val) => (val === '' ? undefined : Number(val)), z
         .number({ message: labels.valueRequired })
         .min(sqmRange.min, { message: labels.min(sqmRange.min) })
         .max(sqmRange.max, { message: labels.max(sqmRange.max) })
       ),
     privacy: z.boolean().refine((val) => val === true, {
       message: labels.privacyRequired,
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
      setFocus,
      trigger,
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

  const submit = async (data: FormData) => {
    // Trigger validation manually to get all errors
    const valid = await trigger()
    if (!valid) {
      // Focus the first field with error
      if (errors.zoneId) setFocus('zoneId')
      else if (errors.propertyType) setFocus('propertyType')
      else if (errors.sqm) setFocus('sqm')
      else if (errors.privacy) setFocus('privacy')
      return
    }
    onSubmit({
      zoneId: data.zoneId,
      propertyType: data.propertyType as PropertyType,
      sqm: Number(data.sqm),
    })
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
