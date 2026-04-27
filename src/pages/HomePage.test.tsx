import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppPreferencesProvider } from '../app/providers/AppPreferencesProvider'
import { HomePage } from './HomePage'

const renderHomePage = (locale: 'it' | 'en') => {
  window.history.replaceState(null, '', `/?lang=${locale}#/`)

  return render(
    <MemoryRouter>
      <AppPreferencesProvider>
        <HomePage />
      </AppPreferencesProvider>
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', '/#/')
  })

  it('routes users to admin for configuration preview flow in italian', () => {
    renderHomePage('it')

    expect(screen.getByRole('link', { name: 'Apri admin e seleziona una configurazione' })).toHaveAttribute(
      'href',
      '/admin',
    )
    expect(
      screen.getByText(
        'Anteprima stima e generazione QR partono dalla pagina Admin, in base alla configurazione selezionata.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Apri pagina stima')).not.toBeInTheDocument()
    expect(screen.getByText(/Versione:\s*v\d+\.\d+\.\d+/)).toBeInTheDocument()
  })

  it('routes users to admin for configuration preview flow in english', () => {
    renderHomePage('en')

    expect(screen.getByRole('link', { name: 'Open admin and select a configuration' })).toHaveAttribute(
      'href',
      '/admin',
    )
    expect(
      screen.getByText(
        'Estimate preview and QR generation start from Admin, based on the selected configuration.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/Version:\s*v\d+\.\d+\.\d+/)).toBeInTheDocument()
  })
})

