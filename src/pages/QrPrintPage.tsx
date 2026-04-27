import { QRCodeSVG } from 'qrcode.react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { SupportedLocale } from '../app/providers/AppPreferencesProvider'
import { getConfig } from '../configs/registry'

const buildQrUrl = (configId: string, dl: SupportedLocale, baseUrl: string): string => {
  const params = new URLSearchParams({ dl })
  return `${baseUrl}/#/estimate/${configId}?${params.toString()}`
}

export const QrPrintPage = () => {
  const { configId } = useParams<{ configId: string }>()
  const [searchParams] = useSearchParams()
  const dl = (searchParams.get('dl') ?? 'en') as SupportedLocale
  const config = configId ? getConfig(configId) : undefined
  const publicBase = (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ?? window.location.origin
  const qrUrl = config ? buildQrUrl(config.id, dl, publicBase) : ''

  if (!config) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-slate-500">Configuration not found.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-8 print:p-4">
      <h1 className="text-2xl font-semibold text-slate-900 print:text-xl">{config.agencyName}</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm print:border-none print:shadow-none">
        <QRCodeSVG size={240} value={qrUrl} />
      </div>

      <p className="max-w-xs break-all text-center text-xs text-slate-400 print:text-[10px]">{qrUrl}</p>

      <button
        className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 print:hidden"
        onClick={() => window.print()}
        type="button"
      >
        Print
      </button>
    </main>
  )
}

