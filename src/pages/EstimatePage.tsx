import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import { EstimateForm } from '../components/EstimateForm'
import { EstimateResult } from '../components/EstimateResult'
import { getConfig } from '../configs/registry'
import type { EstimateInput, EstimateResult as EstimateResultType } from '../configs/types'
import { EstimationEngine } from '../estimation/EstimationEngine'

export const EstimatePage = () => {
  const { configId } = useParams<{ configId: string }>()
  const { locale } = useAppPreferences()
  const [result, setResult] = useState<EstimateResultType | null>(null)

  const config = configId ? getConfig(configId) : undefined

  if (!config) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-800 dark:bg-red-950/30">
          <h1 className="text-xl font-semibold text-red-800 dark:text-red-300">
            {locale === 'it' ? 'Configurazione non trovata' : 'Configuration not found'}
          </h1>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {locale === 'it'
              ? `Nessuna agenzia corrisponde all'identificativo "${configId ?? ''}".`
              : `No agency matches the identifier "${configId ?? ''}".`}
          </p>
        </section>
      </main>
    )
  }

  const engine = new EstimationEngine(config)

  const handleSubmit = (input: EstimateInput) => {
    const estimate = engine.estimate(input)
    setResult(estimate)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {config.agencyName}
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {locale === 'it'
            ? 'Compila il modulo per ottenere una stima di valore del tuo immobile.'
            : 'Fill in the form to get an estimated value for your property.'}
        </p>

        <EstimateForm config={config} onSubmit={handleSubmit} />

        {result && <EstimateResult result={result} />}
      </section>
    </main>
  )
}

