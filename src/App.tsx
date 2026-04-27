import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import {
  AppPreferencesProvider,
  type SupportedLocale,
  useAppPreferences,
} from './app/providers/AppPreferencesProvider'
import { AdminPage } from './pages/AdminPage'
import { EstimatePage } from './pages/EstimatePage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

const localeLabel: Record<SupportedLocale, string> = {
  it: 'IT',
  en: 'EN',
}

const themeToggleLabel: Record<SupportedLocale, { toDark: string; toLight: string }> = {
  it: { toDark: 'Scuro', toLight: 'Chiaro' },
  en: { toDark: 'Dark', toLight: 'Light' },
}

const TopBar = () => {
  const { locale, setLocale, theme, toggleTheme } = useAppPreferences()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 p-3 sm:p-4">
        <Link className="font-semibold text-slate-900 dark:text-slate-100" to="/">
          hous4cast
        </Link>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-300 p-1 dark:border-slate-700">
            {(['it', 'en'] as const).map((value) => (
              <button
                key={value}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  locale === value
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
                onClick={() => setLocale(value)}
                type="button"
              >
                {localeLabel[value]}
              </button>
            ))}
          </div>
          <button
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'light' ? themeToggleLabel[locale].toDark : themeToggleLabel[locale].toLight}
          </button>
        </div>
      </div>
    </header>
  )
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<EstimatePage />} path="/estimate/:configId" />
      <Route element={<AdminPage />} path="/admin" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}

function App() {
  return (
    <AppPreferencesProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <TopBar />
          <AppRoutes />
        </div>
      </HashRouter>
    </AppPreferencesProvider>
  )
}

export default App
