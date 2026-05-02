import { Link } from 'react-router-dom'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import { i18n } from '../app/i18n'

export const NotFoundPage = () => {
  const { locale } = useAppPreferences()
  const labels = i18n[locale].notFound

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 p-4 sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {labels.title}
      </h1>
      <Link className="text-blue-600 underline dark:text-blue-400" to="/">
        {labels.back}
      </Link>
    </main>
  )
}
