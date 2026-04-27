import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AppPreferencesProvider,
  useAppPreferences,
} from './AppPreferencesProvider'

const Probe = () => {
  const { locale, setLocale, theme, toggleTheme } = useAppPreferences()

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setLocale('it')} type="button">
        set-it
      </button>
      <button onClick={toggleTheme} type="button">
        toggle-theme
      </button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <AppPreferencesProvider>
      <Probe />
    </AppPreferencesProvider>,
  )

describe('AppPreferencesProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    window.history.replaceState(null, '', '/#/')
    vi.restoreAllMocks()
  })

  it('gives priority to lang over dl, storage and browser locale', () => {
    window.localStorage.setItem('preferredLocale', 'it')
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('it-IT')
    window.history.replaceState(null, '', '/?lang=en&dl=it#/estimate/gabetti-busto-arsizio')

    renderProvider()

    expect(screen.getByTestId('locale')).toHaveTextContent('en')
  })

  it('uses dl when lang is missing', () => {
    window.history.replaceState(null, '', '/?dl=it#/estimate/gabetti-busto-arsizio')

    renderProvider()

    expect(screen.getByTestId('locale')).toHaveTextContent('it')
  })

  it('uses dl from hash query when search params are missing', () => {
    window.history.replaceState(null, '', '/#/estimate/gabetti-busto-arsizio?dl=it')

    renderProvider()

    expect(screen.getByTestId('locale')).toHaveTextContent('it')
  })

  it('uses lang from hash query when search params are missing', () => {
    window.history.replaceState(null, '', '/#/admin?lang=it')

    renderProvider()

    expect(screen.getByTestId('locale')).toHaveTextContent('it')
  })

  it('uses stored locale when URL parameters are missing', () => {
    window.localStorage.setItem('preferredLocale', 'it')

    renderProvider()

    expect(screen.getByTestId('locale')).toHaveTextContent('it')
  })

  it('uses normalized browser locale when URL and storage are missing', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('it-IT')

    renderProvider()

    expect(screen.getByTestId('locale')).toHaveTextContent('it')
  })

  it('falls back to en when browser locale is unsupported', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR')

    renderProvider()

    expect(screen.getByTestId('locale')).toHaveTextContent('en')
  })

  it('persists locale and keeps existing query params + hash when locale changes', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/?dl=it&foo=bar#/admin')

    renderProvider()

    expect(window.location.search).toBe('?dl=it&foo=bar&lang=it')
    await user.click(screen.getByRole('button', { name: 'set-it' }))
    expect(window.localStorage.getItem('preferredLocale')).toBe('it')
    expect(window.location.search).toBe('?dl=it&foo=bar&lang=it')
    expect(window.location.hash).toBe('#/admin')
  })

  it('resolves theme from storage and toggles dark class', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('preferredTheme', 'dark')

    renderProvider()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'toggle-theme' }))

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(window.localStorage.getItem('preferredTheme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('defaults theme to light when storage value is invalid', () => {
    window.localStorage.setItem('preferredTheme', 'system')

    renderProvider()

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

