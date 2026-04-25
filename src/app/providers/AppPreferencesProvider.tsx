import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export type SupportedLocale = 'it' | 'en'
export type ThemeMode = 'light' | 'dark'

const DEFAULT_LOCALE: SupportedLocale = 'en'
const DEFAULT_THEME: ThemeMode = 'light'
const STORAGE_LOCALE_KEY = 'preferredLocale'
const STORAGE_THEME_KEY = 'preferredTheme'

export type AppPreferencesContextValue = {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  theme: ThemeMode
  toggleTheme: () => void
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | undefined>(undefined)

const normalizeNavigatorLocale = (value: string | undefined): SupportedLocale | null => {
  if (!value) {
    return null
  }

  const normalized = value.toLowerCase()
  if (normalized.startsWith('it')) {
    return 'it'
  }
  if (normalized.startsWith('en')) {
    return 'en'
  }
  return null
}

const resolveInitialLocale = (): SupportedLocale => {
  const params = new URLSearchParams(window.location.search)
  const langParam = params.get('lang')
  if (langParam === 'it' || langParam === 'en') {
    return langParam
  }

  const defaultLocaleParam = params.get('dl')
  if (defaultLocaleParam === 'it' || defaultLocaleParam === 'en') {
    return defaultLocaleParam
  }

  const stored = window.localStorage.getItem(STORAGE_LOCALE_KEY)
  if (stored === 'it' || stored === 'en') {
    return stored
  }

  return normalizeNavigatorLocale(window.navigator.language) ?? DEFAULT_LOCALE
}

const resolveInitialTheme = (): ThemeMode => {
  const stored = window.localStorage.getItem(STORAGE_THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return DEFAULT_THEME
}

export const AppPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => resolveInitialLocale())
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme())

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('lang', locale)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
    window.localStorage.setItem(STORAGE_LOCALE_KEY, locale)
  }, [locale])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_THEME_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      theme,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    }),
    [locale, theme],
  )

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>
}

export const useAppPreferences = (): AppPreferencesContextValue => {
  const context = useContext(AppPreferencesContext)
  if (!context) {
    throw new Error('useAppPreferences must be used inside AppPreferencesProvider')
  }
  return context
}

