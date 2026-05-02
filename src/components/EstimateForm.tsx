import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import type { AgencyConfig, EstimateInput, PropertyType, SqmBucket, PropertyCondition, PropertyAccessories, PropertyFloor, BuildEra } from '../configs/types'
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

const selectClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
const inputClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 w-full'
const errorClass = 'text-xs text-red-500 dark:text-red-400'
const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300'

const FormField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className={labelClass}>{label}</label>
    {children}
    {error && <p className={errorClass}>{error}</p>}
  </div>
)

export const EstimateForm = ({ config, onSubmit }: EstimateFormProps) => {
  const { locale } = useAppPreferences()
  const { sqmRange, zones, propertyTypes, sqmBucketPrices } = config
  const usesBuckets = Boolean(sqmBucketPrices)

  const labels = i18n[locale].estimate

  // Build schema dynamically based on whether the config uses buckets
  const schema = z.object({
    zoneId: z.string().min(1, labels.required),
    propertyType: z.string().min(1, labels.required),
    sqm: usesBuckets
      ? z.string().optional()
      : z.preprocess(
          (val) => (val === '' ? undefined : Number(val)),
          z.number({ message: labels.valueRequired })
            .min(sqmRange.min, { message: labels.min(sqmRange.min) })
            .max(sqmRange.max, { message: labels.max(sqmRange.max) }),
        ),
    sqmBucket: usesBuckets ? z.string().min(1, labels.required) : z.string().optional(),
    address: z.string().optional(),
    condition: z.string().optional(),
    accessories: z.string().optional(),
    floor: z.string().optional(),
    buildEra: z.string().optional(),
    email: z.union([z.string().email(labels.emailInvalid), z.literal('')]).optional(),
    phone: z.string().optional(),
    privacy: z.boolean().refine((val) => val, { message: labels.privacyRequired }),
  })

  const defaultValues = {
    zoneId: zones[0]?.zoneId ?? '',
    propertyType: propertyTypes[0] ?? 'appartamento',
    sqm: '',
    sqmBucket: '',
    address: '',
    condition: '',
    accessories: '',
    floor: '',
    buildEra: '',
    email: '',
    phone: '',
    privacy: false,
  }

  const { handleSubmit, control, formState: { errors }, trigger } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues,
  })

  const submit = async (data: typeof defaultValues) => {
    const valid = await trigger()
    if (!valid) return
    onSubmit({
      zoneId: data.zoneId,
      propertyType: data.propertyType as PropertyType,
      sqm: usesBuckets ? sqmRange.min : Number(data.sqm),
      sqmBucket: usesBuckets ? data.sqmBucket as SqmBucket : undefined,
      address: data.address || undefined,
      condition: data.condition ? data.condition as PropertyCondition : undefined,
      accessories: data.accessories ? data.accessories as PropertyAccessories : undefined,
      floor: data.floor ? data.floor as PropertyFloor : undefined,
      buildEra: data.buildEra ? data.buildEra as BuildEra : undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)}>

      {/* Zone */}
      <FormField label={labels.zone} error={errors.zoneId?.message as string}>
        <Controller name="zoneId" control={control} render={({ field }) => (
          <select data-testid="zoneId" className={selectClass} {...field}>
            {zones.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>{z.label[locale]}</option>
            ))}
          </select>
        )} />
      </FormField>

      {/* Property type (only if multiple types) */}
      {propertyTypes.length > 1 && (
        <FormField label={labels.type} error={errors.propertyType?.message as string}>
          <Controller name="propertyType" control={control} render={({ field }) => (
            <select data-testid="propertyType" className={selectClass} {...field}>
              {propertyTypes.map((pt) => (
                <option key={pt} value={pt}>{propertyTypeLabel[pt][locale]}</option>
              ))}
            </select>
          )} />
        </FormField>
      )}

      {/* Surface — bucket mode (Gabetti) or numeric input */}
      {usesBuckets ? (
        <FormField label={labels.sqmBucket} error={errors.sqmBucket?.message as string}>
          <Controller name="sqmBucket" control={control} render={({ field }) => (
            <select data-testid="sqmBucket" className={selectClass} {...field}>
              <option value="">—</option>
              {(Object.entries(labels.sqmBucketOptions) as [SqmBucket, string][]).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          )} />
        </FormField>
      ) : (
        <FormField label={labels.sqm} error={errors.sqm?.message as string}>
          <Controller name="sqm" control={control} render={({ field }) => (
            <input
              id="sqm" type="number" min={sqmRange.min} max={sqmRange.max}
              placeholder={`${sqmRange.min}–${sqmRange.max}`}
              className={inputClass}
              value={typeof field.value === 'number' || typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              data-testid="sqm"
            />
          )} />
        </FormField>
      )}

      {/* Address */}
      <FormField label={labels.address} error={errors.address?.message as string}>
        <Controller name="address" control={control} render={({ field }) => (
          <input type="text" className={inputClass} data-testid="address" placeholder="" {...field} />
        )} />
      </FormField>

      {/* Condition */}
      <FormField label={labels.condition} error={errors.condition?.message as string}>
        <Controller name="condition" control={control} render={({ field }) => (
          <select data-testid="condition" className={selectClass} {...field}>
            <option value="">—</option>
            {(Object.entries(labels.conditionOptions) as [PropertyCondition, string][]).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
        )} />
      </FormField>

      {/* Accessories */}
      <FormField label={labels.accessories} error={errors.accessories?.message as string}>
        <Controller name="accessories" control={control} render={({ field }) => (
          <select data-testid="accessories" className={selectClass} {...field}>
            <option value="">—</option>
            {(Object.entries(labels.accessoriesOptions) as [PropertyAccessories, string][]).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
        )} />
      </FormField>

      {/* Floor */}
      <FormField label={labels.floor} error={errors.floor?.message as string}>
        <Controller name="floor" control={control} render={({ field }) => (
          <select data-testid="floor" className={selectClass} {...field}>
            <option value="">—</option>
            {(Object.entries(labels.floorOptions) as [PropertyFloor, string][]).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
        )} />
      </FormField>

      {/* Build era */}
      <FormField label={labels.buildEra} error={errors.buildEra?.message as string}>
        <Controller name="buildEra" control={control} render={({ field }) => (
          <select data-testid="buildEra" className={selectClass} {...field}>
            <option value="">—</option>
            {(Object.entries(labels.eraOptions) as [BuildEra, string][]).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
        )} />
      </FormField>

      {/* Email */}
      <FormField label={labels.email} error={errors.email?.message as string}>
        <Controller name="email" control={control} render={({ field }) => (
          <input type="email" className={inputClass} data-testid="email" autoComplete="email" {...field} />
        )} />
      </FormField>

      {/* Phone */}
      <FormField label={labels.phone} error={errors.phone?.message as string}>
        <Controller name="phone" control={control} render={({ field }) => (
          <input type="tel" className={inputClass} data-testid="phone" autoComplete="tel" {...field} />
        )} />
      </FormField>

      {/* Privacy */}
      <div className="flex flex-col gap-1">
        <Controller name="privacy" control={control} render={({ field }) => (
          <label className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2" htmlFor="privacy">
            <input
              id="privacy" data-testid="privacy" type="checkbox"
              checked={field.value} onChange={(e) => field.onChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800"
            />
            <span>{config.privacy?.text?.[locale] ?? labels.privacy}</span>
          </label>
        )} />
        {errors.privacy && <p className={`${errorClass} ml-6`} data-testid="error-privacy">{errors.privacy.message as string}</p>}
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
