import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import type { SupportedLocale } from '../app/providers/AppPreferencesProvider'
import { getAllConfigs } from '../configs/registry'
import { AdminBrandingConfig } from './AdminBrandingConfig'
import { AdminEstimationConfig } from './AdminEstimationConfig'
import { i18n } from '../app/i18n'

const buildQrUrl = (configId: string, dl: SupportedLocale, baseUrl: string): string => {
  const params = new URLSearchParams({ dl })
  return `${baseUrl}/#/estimate/${configId}?${params.toString()}`
}

export const AdminPage = () => {
  const { locale } = useAppPreferences()
  const configs = getAllConfigs().toSorted((a, b) => a.agencyName.localeCompare(b.agencyName))
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [qrLocale, setQrLocale] = useState<SupportedLocale>(locale)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [estConfigOpen, setEstConfigOpen] = useState(false)
  const selectedConfig = configs.find((config) => config.id === selectedConfigId) ?? null
  const publicBase = (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ?? window.location.origin
  const qrUrl = selectedConfig ? buildQrUrl(selectedConfig.id, qrLocale, publicBase) : ''
  const labels = i18n[locale].admin

  const handleSelectConfig = (configId: string) => {
    setSelectedConfigId(configId)
    setCopyStatus('idle')
  }

  const handleCopyQrUrl = async () => {
    if (!qrUrl || !navigator.clipboard?.writeText) {
      setCopyStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopyStatus('success')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {labels.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {labels.intro}
        </p>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
          {labels.available}
        </h2>

        {configs.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {labels.none}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {configs.map((config) => (
              <li key={config.id}>
                <button
                  aria-pressed={selectedConfigId !== null && selectedConfigId === config.id ? 'true' : 'false'}
                  className={`w-full rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    selectedConfigId === config.id
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-500'
                  }`}
                  onClick={() => handleSelectConfig(config.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{config.agencyName}</p>
                    {selectedConfigId === config.id && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {labels.selected}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID: {config.id}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {labels.zones(config.zones.length)} - {labels.types(config.propertyTypes.length)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedConfig && (
          <section className="mt-6 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              {labels.selectedConfig}
            </p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{selectedConfig.agencyName}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID: {selectedConfig.id}</p>

            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                {labels.defaultLocale}
              </p>
              <div className="flex gap-2">
                {(['it', 'en'] as const).map((value) => (
                  <button
                    aria-pressed={qrLocale === value}
                    className={`rounded px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      qrLocale === value
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                    key={value}
                    onClick={() => {
                      setQrLocale(value)
                      setCopyStatus('idle')
                    }}
                    type="button"
                  >
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-start">
              <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-slate-100" data-testid="qr-code">
                <QRCodeSVG size={120} value={qrUrl} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="break-all text-xs text-slate-500 dark:text-slate-400">{qrUrl}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    to={`/estimate/${selectedConfig.id}?dl=${qrLocale}`}
                  >
                    {labels.openPreview}
                  </Link>
                  <Link
                    className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    target="_blank"
                    rel="noopener noreferrer"
                    to={`/admin/qr/${selectedConfig.id}?dl=${qrLocale}`}
                  >
                    {labels.printQr}
                  </Link>
                  <button
                    className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={handleCopyQrUrl}
                    type="button"
                  >
                    {labels.copyLink}
                  </button>
                </div>
                {copyStatus === 'success' && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {labels.copySuccess}
                  </p>
                )}
                {copyStatus === 'error' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {labels.copyError}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">{labels.branding}</h2>
        <AdminBrandingConfig configId={selectedConfig?.id ?? undefined} />
      </section>

      {/* Estimation Config editor — visible only when an agency is selected */}
      <section
        className="mt-8 rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        data-testid="estimation-config-section"
        style={{ display: selectedConfig ? undefined : 'none' }}
      >
        <button
          type="button"
          className="flex w-full items-center justify-between text-left font-semibold text-slate-900 dark:text-slate-100"
          onClick={() => setEstConfigOpen((o) => !o)}
          data-testid="estimation-config-toggle"
        >
          <span>Estimation Config</span>
          <span>{estConfigOpen ? '▲' : '▼'}</span>
        </button>
        {estConfigOpen && selectedConfig && (
          <div className="mt-4">
            <AdminEstimationConfig key={selectedConfig.id} configId={selectedConfig.id} />
          </div>
        )}
      </section>
    </main>
  )
}

