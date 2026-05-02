import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppPreferencesProvider } from '../app/providers/AppPreferencesProvider'
import { AdminPage } from './AdminPage'

type FirestoreMockGlobal = typeof globalThis & {
  __firestoreStore?: Map<string, unknown>
}

const renderAdminPage = (locale: 'it' | 'en') => {
  window.history.replaceState(null, '', `/?lang=${locale}#/admin`)

  return render(
    <MemoryRouter>
      <AppPreferencesProvider>
        <AdminPage />
      </AppPreferencesProvider>
    </MemoryRouter>,
  )
}
describe('AdminPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', '/#/')
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
    const store = (globalThis as FirestoreMockGlobal).__firestoreStore
    if (store) store.clear()
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
    expect(screen.getByText('Zone: 10 - Tipologie: 1')).toBeInTheDocument()
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
    expect(screen.getByText('Zones: 10 - Property types: 1')).toBeInTheDocument()
  })

  it('starts with no config selected and no preview box visible', () => {
    renderAdminPage('en')

    expect(screen.queryByText('Selected configuration')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open estimate preview' })).not.toBeInTheDocument()
    // Select only agency config buttons (direct descendants of ul > li)
    const configList = screen.getByRole('list')
    const configButtons = Array.from(configList.querySelectorAll('button'))
    configButtons.forEach((btn) => expect(btn).toHaveAttribute('aria-pressed', 'false'))
  })

  it('renders configs sorted by agency name', () => {
    renderAdminPage('en')

    const cardButtons = screen.getAllByRole('button')
    const agencyNames = cardButtons.map((btn) => btn.querySelector('p')?.textContent)

    expect(agencyNames[0]).toBe('Example Agency Milano')
    expect(agencyNames[1]).toBe('Gabetti Busto Arsizio')
  })

  it('selects a config on click and shows preview link', async () => {
    const user = userEvent.setup()
    renderAdminPage('en')

    await user.click(screen.getByRole('button', { name: /gabetti busto arsizio/i }))

    expect(screen.getByText('Selected configuration')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open estimate preview' })).toHaveAttribute(
      'href',
      '/estimate/gabetti-busto-arsizio?dl=en',
    )
    expect(screen.getByRole('button', { name: /gabetti busto arsizio/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /example agency milano/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches selection and updates preview link', async () => {
    const user = userEvent.setup()
    renderAdminPage('en')

    await user.click(screen.getByRole('button', { name: /example agency milano/i }))
    await user.click(screen.getByRole('button', { name: /gabetti busto arsizio/i }))

    expect(screen.getByRole('link', { name: 'Open estimate preview' })).toHaveAttribute(
      'href',
      '/estimate/gabetti-busto-arsizio?dl=en',
    )
    expect(screen.getByRole('button', { name: /gabetti busto arsizio/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /example agency milano/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows QR code after selecting a config', async () => {
    const user = userEvent.setup()
    renderAdminPage('en')

    await user.click(screen.getByRole('button', { name: /gabetti busto arsizio/i }))

    expect(screen.getByTestId('qr-code')).toBeInTheDocument()
  })

  it('changes qr dl locale and updates preview link accordingly', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/?lang=en#/admin')

    render(
      <MemoryRouter>
        <AppPreferencesProvider>
          <AdminPage />
        </AppPreferencesProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /gabetti busto arsizio/i }))
    expect(screen.getByRole('link', { name: 'Open estimate preview' })).toHaveAttribute(
      'href',
      '/estimate/gabetti-busto-arsizio?dl=en',
    )

    await user.click(screen.getByRole('button', { name: 'IT', hidden: false }))
    expect(screen.getByRole('link', { name: 'Open estimate preview' })).toHaveAttribute(
      'href',
      '/estimate/gabetti-busto-arsizio?dl=it',
    )
  })

  it('copies selected qr link and shows success feedback', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(window.navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    renderAdminPage('en')

    await user.click(screen.getByRole('button', { name: /gabetti busto arsizio/i }))
    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining('/#/estimate/gabetti-busto-arsizio?dl=en'),
    )
    expect(screen.getByText('Link copied to clipboard.')).toBeInTheDocument()
  })
})
