import { Link } from 'react-router-dom'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'

export const NotFoundPage = () => {
  const { locale } = useAppPreferences()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 p-4 sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {locale === 'it' ? 'Pagina non trovata' : 'Page not found'}
      </h1>
      <Link className="text-blue-600 underline dark:text-blue-400" to="/">
        {locale === 'it' ? 'Torna alla home' : 'Back to home'}
      </Link>
    </main>
  )
}

