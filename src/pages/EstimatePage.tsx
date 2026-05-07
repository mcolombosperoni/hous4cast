import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import { useBranding } from '../app/hooks/useBranding'
import { EstimateForm } from '../components/EstimateForm'
import { EstimateResult } from '../components/EstimateResult'
import { BrandingWrapper } from '../components/BrandingWrapper'
import { BrandingHeader } from '../components/BrandingHeader'
import { CoverHero } from '../components/CoverHero'
import { getConfigWithOverrides, getConfigWithLocalOverrides } from '../configs/registry'
import type { AgencyConfig, EstimateInput, EstimateResult as EstimateResultType } from '../configs/types'
import { EstimationEngine } from '../estimation/EstimationEngine'

export const EstimatePage = () => {
  const { configId } = useParams<{ configId: string }>()
  const { locale } = useAppPreferences()
  const [result, setResult] = useState<EstimateResultType | null>(null)
  // Initialise synchronously from localStorage to avoid a loading flash and race conditions in e2e.
  const [config, setConfig] = useState<AgencyConfig | null | undefined>(() => {
    if (!configId) return null
    const c = getConfigWithLocalOverrides(configId)
    return c !== undefined ? c : undefined
  })
  const { branding } = useBranding(configId)

  useEffect(() => {
    if (!configId) return
    let cancelled = false
    getConfigWithOverrides(configId)
      .then((c) => { if (!cancelled) setConfig(c ?? null) })
      .catch(() => { /* keep the synchronous value already set */ })
    return () => { cancelled = true }
  }, [configId])

  if (!configId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-800 dark:bg-red-950/30">
          <h1 className="text-xl font-semibold text-red-800 dark:text-red-300">
            {locale === 'it' ? 'Configurazione non trovata' : 'Configuration not found'}
          </h1>
        </section>
      </main>
    )
  }

  // Show loading only while config is unavailable (branding can arrive later — undefined treated as null)
  if (config === undefined) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
        <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="estimate-page-loading">
            {locale === 'it' ? 'Caricamento...' : 'Loading...'}
          </p>
        </section>
      </main>
    )
  }

  if (!config) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-800 dark:bg-red-950/30">
          <h1 className="text-xl font-semibold text-red-800 dark:text-red-300">
            {locale === 'it' ? 'Configurazione non trovata' : 'Configuration not found'}
          </h1>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {locale === 'it'
              ? `Nessuna agenzia corrisponde all'identificativo "${configId}".`
              : `No agency matches the identifier "${configId}".`}
          </p>
        </section>
      </main>
    )
  }

  const engine = new EstimationEngine(config)
  const handleSubmit = (input: EstimateInput) => setResult(engine.estimate(input))
  // Treat undefined branding as null (still loading — render form immediately, branding updates later)
  const resolvedBranding = branding ?? null

  return (
    <BrandingWrapper branding={resolvedBranding}>
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
        <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <CoverHero coverImageUrl={resolvedBranding?.coverImageUrl} agencyName={config.agencyName} />
          <BrandingHeader agencyName={config.agencyName} logoUrl={resolvedBranding?.logoUrl} />
          {!result && (
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            {locale === 'it'
              ? 'Compila il modulo per ottenere una stima di valore del tuo immobile.'
              : 'Fill in the form to get an estimated value for your property.'}
          </p>
          )}
          <EstimateForm config={config} onSubmit={handleSubmit} />
          {result && <EstimateResult result={result} />}
        </section>
      </main>
    </BrandingWrapper>
  )
}

