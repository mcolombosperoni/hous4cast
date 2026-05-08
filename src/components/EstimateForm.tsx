import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import type { AgencyConfig, EstimateInput, PropertyType } from '../configs/types'
import { i18n } from '../app/i18n'

/** Fallback hardcoded labels for property types not covered by config entries */
const propertyTypeLabelFallback: Record<string, Record<'it' | 'en', string>> = {
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

const FormField = ({ label, error, errorTestId, children }: { label: string; error?: string; errorTestId?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className={labelClass}>{label}</label>
    {children}
    {error && <p className={errorClass} data-testid={errorTestId}>{error}</p>}
  </div>
)

export const EstimateForm = ({ config, onSubmit }: EstimateFormProps) => {
  const { locale } = useAppPreferences()
  const { sqmRange, zones, propertyTypes, propertyTypeEntries, sqmBucketPrices } = config
  // Bucket mode: active when sqmBucketEntries has entries (open-list, new agencies)
  // OR when legacy sqmBucketPrices is defined (Gabetti static config)
  const sqmBucketEntries = config.sqmBucketEntries && config.sqmBucketEntries.length > 0
    ? config.sqmBucketEntries
    : undefined
  const usesBuckets = Boolean(sqmBucketEntries ?? sqmBucketPrices)

  // An open-list field is "active" only when the entries array has at least one item.
  // undefined = static config (use hardcoded fallback), [] = dynamic but empty (hide field), [..] = show options
  const hasConditionOptions = config.conditionEntries === undefined || config.conditionEntries.length > 0
  const hasFloorOptions = config.floorEntries === undefined || config.floorEntries.length > 0
  const hasEraOptions = config.eraEntries === undefined || config.eraEntries.length > 0
  const hasAccessoryOptions = config.accessoryEntries === undefined || config.accessoryEntries.length > 0

  /** Resolve the display label for a property type value */
  const getPropertyTypeLabel = (value: string): string => {
    const entry = propertyTypeEntries?.find((e) => e.value === value)
    if (entry) return entry.label[locale]
    return propertyTypeLabelFallback[value]?.[locale] ?? value
  }

  const labels = i18n[locale].estimate

  // Build schema dynamically based on whether the config uses buckets.
  // All fields shown in the form are required so validation errors appear
  // simultaneously on first submit attempt.
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
    condition: usesBuckets && hasConditionOptions ? z.string().min(1, labels.required) : z.string().optional(),
    accessories: usesBuckets && hasAccessoryOptions ? z.string().min(1, labels.required) : z.string().optional(),
    floor: usesBuckets && hasFloorOptions ? z.string().min(1, labels.required) : z.string().optional(),
    buildEra: usesBuckets && hasEraOptions ? z.string().min(1, labels.required) : z.string().optional(),
    email: z.string().email(labels.emailInvalid).min(1, labels.required),
    phone: z.string().min(1, labels.required),
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

  const { handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    // Re-validate all fields on change only after the first failed submit,
    // so errors are cleared as soon as the user fixes them.
    reValidateMode: 'onChange',
    defaultValues,
  })

  type FormData = z.infer<typeof schema>

  const submit = (data: FormData) => {
    onSubmit({
      zoneId: data.zoneId as string,
      propertyType: (data.propertyType ?? '') as PropertyType,
      sqm: usesBuckets ? sqmRange.min : Number(data.sqm),
      sqmBucket: usesBuckets ? data.sqmBucket as string : undefined,
      address: data.address || undefined,
      condition: data.condition || undefined,
      accessories: data.accessories || undefined,
      floor: data.floor || undefined,
      buildEra: data.buildEra || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    })
  }

  // Scroll to the first visible field error after a failed submit attempt.
  const onInvalid = () => {
    requestAnimationFrame(() => {
      const firstError = document.querySelector('[data-field-error]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit, onInvalid)} data-testid="estimate-form">

      {/* Property type — first field, only if multiple types configured */}
      {propertyTypes.length > 1 && (
        <div data-field-error={errors.propertyType ? 'true' : undefined}>
          <FormField label={labels.type} error={errors.propertyType?.message as string}>
            <Controller name="propertyType" control={control} render={({ field }) => (
              <select data-testid="propertyType" className={selectClass} {...field}>
                {propertyTypes.map((pt) => (
                  <option key={pt} value={pt}>{getPropertyTypeLabel(pt)}</option>
                ))}
              </select>
            )} />
          </FormField>
        </div>
      )}

      {/* Zone */}
      <div data-field-error={errors.zoneId ? 'true' : undefined}>
        <FormField label={labels.zone} error={errors.zoneId?.message as string} errorTestId="error-zoneId">
          <Controller name="zoneId" control={control} render={({ field }) => (
            <select data-testid="zoneId" className={selectClass} {...field}>
              {zones.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>{z.label[locale]}</option>
              ))}
            </select>
          )} />
        </FormField>
      </div>

      {/* Surface — bucket mode (open-list or legacy Gabetti) or numeric input */}
      {usesBuckets ? (
        <div data-field-error={errors.sqmBucket ? 'true' : undefined}>
          <FormField label={labels.sqmBucket} error={errors.sqmBucket?.message as string} errorTestId="error-sqmBucket">
            <Controller name="sqmBucket" control={control} render={({ field }) => (
              <select data-testid="sqmBucket" className={selectClass} {...field}>
                <option value="">—</option>
                {sqmBucketEntries
                  ? sqmBucketEntries.map((e) => (
                      <option key={e.value} value={e.value}>{e.label[locale] ?? e.label['it']}</option>
                    ))
                  : (Object.entries(labels.sqmBucketOptions) as [string, string][]).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))
                }
              </select>
            )} />
          </FormField>
        </div>
      ) : (
        <div data-field-error={errors.sqm ? 'true' : undefined}>
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
        </div>
      )}

      {/* Address */}
      <FormField label={labels.address} error={errors.address?.message as string}>
        <Controller name="address" control={control} render={({ field }) => (
          <input type="text" className={inputClass} data-testid="address" placeholder="" {...field} />
        )} />
      </FormField>

      {/* Condition */}
      {hasConditionOptions && (
      <div data-field-error={errors.condition ? 'true' : undefined}>
        <FormField label={labels.condition} error={errors.condition?.message as string}>
          <Controller name="condition" control={control} render={({ field }) => (
            <select name="condition" data-testid="condition" className={selectClass} {...field}>
              <option value="">—</option>
              {config.conditionEntries && config.conditionEntries.length > 0
                ? config.conditionEntries.map((e) => (
                    <option key={e.value} value={e.value}>{e.label[locale] ?? e.label['it']}</option>
                  ))
                : (Object.entries(labels.conditionOptions) as [string, string][]).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))
              }
            </select>
          )} />
        </FormField>
      </div>
      )}

      {/* Accessories */}
      {hasAccessoryOptions && (
      <div data-field-error={errors.accessories ? 'true' : undefined}>
        <FormField label={labels.accessories} error={errors.accessories?.message as string}>
          <Controller name="accessories" control={control} render={({ field }) => (
            <select name="accessories" data-testid="accessories" className={selectClass} {...field}>
              <option value="">—</option>
              {config.accessoryEntries && config.accessoryEntries.length > 0
                ? config.accessoryEntries.map((e) => (
                    <option key={e.value} value={e.value}>{e.label[locale] ?? e.label['it']}</option>
                  ))
                : (Object.entries(labels.accessoriesOptions) as [string, string][]).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))
              }
            </select>
          )} />
        </FormField>
      </div>
      )}

      {/* Floor */}
      {hasFloorOptions && (
      <div data-field-error={errors.floor ? 'true' : undefined}>
        <FormField label={labels.floor} error={errors.floor?.message as string}>
          <Controller name="floor" control={control} render={({ field }) => (
            <select name="floor" data-testid="floor" className={selectClass} {...field}>
              <option value="">—</option>
              {config.floorEntries && config.floorEntries.length > 0
                ? config.floorEntries.map((e) => (
                    <option key={e.value} value={e.value}>{e.label[locale] ?? e.label['it']}</option>
                  ))
                : (Object.entries(labels.floorOptions) as [string, string][]).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))
              }
            </select>
          )} />
        </FormField>
      </div>
      )}

      {/* Build era */}
      {hasEraOptions && (
      <div data-field-error={errors.buildEra ? 'true' : undefined}>
        <FormField label={labels.buildEra} error={errors.buildEra?.message as string}>
          <Controller name="buildEra" control={control} render={({ field }) => (
            <select name="buildEra" data-testid="buildEra" className={selectClass} {...field}>
              <option value="">—</option>
              {config.eraEntries && config.eraEntries.length > 0
                ? config.eraEntries.map((e) => (
                    <option key={e.value} value={e.value}>{e.label[locale] ?? e.label['it']}</option>
                  ))
                : (Object.entries(labels.eraOptions) as [string, string][]).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))
              }
            </select>
          )} />
        </FormField>
      </div>
      )}

      {/* Email */}
      <div data-field-error={errors.email ? 'true' : undefined}>
        <FormField label={labels.email} error={errors.email?.message as string}>
          <Controller name="email" control={control} render={({ field }) => (
            <input type="email" className={inputClass} data-testid="email" autoComplete="email" {...field} />
          )} />
        </FormField>
      </div>

      {/* Phone */}
      <div data-field-error={errors.phone ? 'true' : undefined}>
        <FormField label={labels.phone} error={errors.phone?.message as string}>
          <Controller name="phone" control={control} render={({ field }) => (
            <input type="tel" className={inputClass} data-testid="phone" autoComplete="tel" {...field} />
          )} />
        </FormField>
      </div>

      {/* Privacy */}
      <div className="flex flex-col gap-1" data-field-error={errors.privacy ? 'true' : undefined}>
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
