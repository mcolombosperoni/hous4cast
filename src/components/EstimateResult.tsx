import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import type { EstimateResult as EstimateResultType } from '../configs/types'

interface EstimateResultProps {
  result: EstimateResultType
}

const formatCurrency = (value: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value,
  )

export const EstimateResult = ({ result }: EstimateResultProps) => {
  const { locale } = useAppPreferences()
  const { low, mid, high, currency } = result

  const labels =
    locale === 'it'
      ? {
          title: 'Stima di valore',
          range: 'Fascia di mercato',
          central: 'Valore centrale stimato',
          disclaimer:
            'La stima è indicativa e basata sui valori medi di mercato della zona. Non costituisce perizia né valutazione ufficiale.',
        }
      : {
          title: 'Value estimate',
          range: 'Market range',
          central: 'Central estimated value',
          disclaimer:
            'This estimate is indicative and based on average market values for the area. It does not constitute an appraisal or official valuation.',
        }

  return (
    <section
      aria-label={labels.title}
      className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30"
    >
      <h2 className="mb-4 text-base font-semibold text-emerald-900 dark:text-emerald-300">
        {labels.title}
      </h2>

      {/* Central value */}
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        {labels.central}
      </p>
      <p className="mt-1 text-3xl font-bold text-emerald-800 dark:text-emerald-200">
        {formatCurrency(mid, currency, locale)}
      </p>

      {/* Range */}
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        {labels.range}
      </p>
      <p
        className="mt-1 text-base font-medium text-emerald-700 dark:text-emerald-300"
        data-testid="estimate-result"
      >
        {formatCurrency(low, currency, locale)} – {formatCurrency(high, currency, locale)}
      </p>

      {/* Disclaimer */}
      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {labels.disclaimer}
      </p>
    </section>
  )
}
