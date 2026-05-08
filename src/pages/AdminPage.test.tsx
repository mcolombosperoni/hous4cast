import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppPreferencesProvider } from '../app/providers/AppPreferencesProvider'
import { AdminPage } from './AdminPage'
import { testAgencyFixture } from '../configs/__tests__/test-agency-fixture'

// Mock the registry so tests are independent of real agency data
vi.mock('../configs/registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../configs/registry')>()
  return {
    ...actual,
    getAllConfigs: vi.fn(() => [testAgencyFixture]),
    getConfig: vi.fn((id: string) => (id === testAgencyFixture.id ? testAgencyFixture : undefined)),
    getConfigWithLocalOverrides: vi.fn((id: string) =>
      id === testAgencyFixture.id ? testAgencyFixture : undefined,
    ),
    initDynamicAgencies: vi.fn(),
    isDynamicAgency: vi.fn(() => false),
    registerDynamicAgency: vi.fn(),
  }
})

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
    expect(screen.getByText('Test Agency')).toBeInTheDocument()
    expect(screen.getByText('ID: test-agency')).toBeInTheDocument()
    expect(screen.getByText('Zone: 2 - Tipologie: 2')).toBeInTheDocument()
  })

  it('renders english copy and config metadata', () => {
    renderAdminPage('en')

    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByText('Available agency configurations')).toBeInTheDocument()
    expect(screen.getByText('Test Agency')).toBeInTheDocument()
    expect(screen.getByText('ID: test-agency')).toBeInTheDocument()
    expect(screen.getByText('Zones: 2 - Property types: 2')).toBeInTheDocument()
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

    expect(agencyNames[0]).toBe('Test Agency')
  })

  it('selects a config on click and shows preview link', async () => {
    const user = userEvent.setup()
    renderAdminPage('en')

    await user.click(screen.getByRole('button', { name: /test agency/i }))

    expect(screen.getByText('Selected configuration')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open estimate preview' })).toHaveAttribute(
      'href',
      '/estimate/test-agency?dl=en',
    )
    expect(screen.getByRole('button', { name: /test agency/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches selection and updates preview link', async () => {
    const user = userEvent.setup()
    renderAdminPage('en')

    await user.click(screen.getByRole('button', { name: /test agency/i }))

    expect(screen.getByRole('link', { name: 'Open estimate preview' })).toHaveAttribute(
      'href',
      '/estimate/test-agency?dl=en',
    )
    expect(screen.getByRole('button', { name: /test agency/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
