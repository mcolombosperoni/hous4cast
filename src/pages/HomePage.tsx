import { Link } from 'react-router-dom'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import { i18n } from '../app/i18n'

export const HomePage = () => {
  const { locale } = useAppPreferences()
  const deployedVersion = import.meta.env.VITE_APP_VERSION ?? '0.0.0'
  const labels = i18n[locale].home

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <header className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{labels.title}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {labels.subtitle}
        </p>
      </header>

      <section className="grid gap-4">
        <Link
          to="/admin"
          className="rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-sm transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {labels.adminCta}
        </Link>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {labels.adminHint}
        </p>
      </section>

      <footer className="mt-auto pt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        {labels.version}: v{deployedVersion}
      </footer>
    </main>
  )
}
