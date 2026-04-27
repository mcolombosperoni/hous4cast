import { render, screen } from '@testing-library/react'
import { AppPreferencesProvider } from '../app/providers/AppPreferencesProvider'
import { AdminPage } from './AdminPage'

const renderAdminPage = (locale: 'it' | 'en') => {
  window.history.replaceState(null, '', `/?lang=${locale}#/admin`)

  return render(
    <AppPreferencesProvider>
      <AdminPage />
    </AppPreferencesProvider>,
  )
}

describe('AdminPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', '/#/')
  })

  it('renders italian copy and config metadata', () => {
    renderAdminPage('it')

    expect(screen.getByRole('heading', { name: 'Amministrazione' })).toBeInTheDocument()
    expect(screen.getByText('Configurazioni disponibili')).toBeInTheDocument()
    expect(screen.getByText('Example Agency Milano')).toBeInTheDocument()
    expect(screen.getByText('ID: example-agency-milano')).toBeInTheDocument()
    expect(screen.getByText('Zone: 2 - Tipologie: 2')).toBeInTheDocument()
    expect(screen.getByText('Gabetti Busto Arsizio')).toBeInTheDocument()
    expect(screen.getByText('ID: gabetti-busto-arsizio')).toBeInTheDocument()
    expect(screen.getByText('Zone: 3 - Tipologie: 3')).toBeInTheDocument()
  })

  it('renders english copy and config metadata', () => {
    renderAdminPage('en')

    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByText('Available agency configurations')).toBeInTheDocument()
    expect(screen.getByText('Example Agency Milano')).toBeInTheDocument()
    expect(screen.getByText('ID: example-agency-milano')).toBeInTheDocument()
    expect(screen.getByText('Zones: 2 - Property types: 2')).toBeInTheDocument()
    expect(screen.getByText('Gabetti Busto Arsizio')).toBeInTheDocument()
    expect(screen.getByText('ID: gabetti-busto-arsizio')).toBeInTheDocument()
    expect(screen.getByText('Zones: 3 - Property types: 3')).toBeInTheDocument()
  })

  it('renders configs sorted by agency name', () => {
    renderAdminPage('en')

    const agencyNames = screen
      .getAllByRole('listitem')
      .map((item) => item.querySelector('p')?.textContent)
      .filter((value): value is string => Boolean(value))

    expect(agencyNames).toEqual(['Example Agency Milano', 'Gabetti Busto Arsizio'])
  })
})

