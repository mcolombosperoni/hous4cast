import { Link } from 'react-router-dom'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'

export const HomePage = () => {
  const { locale } = useAppPreferences()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <header className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">hous4cast</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {locale === 'it'
            ? 'Pagine di stima basate su configurazione, condivise tramite QR code.'
            : 'Config-driven estimation pages delivered through QR codes.'}
        </p>
      </header>

      <section className="grid gap-4">
        <Link
          to="/admin"
          className="rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-sm transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {locale === 'it' ? 'Apri admin e seleziona una configurazione' : 'Open admin and select a configuration'}
        </Link>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {locale === 'it'
            ? 'Anteprima stima e generazione QR partono dalla pagina Admin, in base alla configurazione selezionata.'
            : 'Estimate preview and QR generation start from Admin, based on the selected configuration.'}
        </p>
      </section>
    </main>
  )
}

