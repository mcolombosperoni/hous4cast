import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App shell', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    window.history.replaceState(null, '', '/#/')
  })

  it('renders home title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /hous4cast/i })).toBeInTheDocument()
  })

  it('switches locale from top bar and persists it', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Italiano' }))

    expect(window.localStorage.getItem('preferredLocale')).toBe('it')
    expect(window.location.search).toContain('lang=it')
    expect(screen.getByRole('group', { name: 'Selettore lingua' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italiano' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles theme from top bar and updates dark mode state', async () => {
    const user = userEvent.setup()

    render(<App />)

    const themeButton = screen.getByRole('button', { name: 'Switch to dark theme' })
    await user.click(themeButton)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem('preferredTheme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
  })
})

