import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppPreferencesProvider } from '../app/providers/AppPreferencesProvider'
import { AdminEstimationConfig } from './AdminEstimationConfig'
import * as api from '../app/estimationConfigApi'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../app/estimationConfigApi', () => ({
  loadEstimationConfig: vi.fn().mockResolvedValue(null),
  saveEstimationConfig: vi.fn().mockResolvedValue(undefined),
  clearEstimationConfig: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../app/agencyApi', () => ({
  saveAgency: vi.fn().mockResolvedValue(undefined),
}))

const renderEditor = (configId = 'gabetti-busto-arsizio') =>
  render(
    <MemoryRouter>
      <AppPreferencesProvider>
        <AdminEstimationConfig configId={configId} />
      </AppPreferencesProvider>
    </MemoryRouter>,
  )

describe('AdminEstimationConfig component (T54)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.loadEstimationConfig).mockResolvedValue(null)
    vi.mocked(api.saveEstimationConfig).mockResolvedValue(undefined)
    vi.mocked(api.clearEstimationConfig).mockResolvedValue(undefined)
  })

  it('renders spread factor input with static base value after load', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('spread-factor-input')).toHaveValue('0.05')
  })

  it('renders zone multiplier inputs from static base', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('zone-multiplier-centro')).toBeInTheDocument()
  })

  it('sets spread-factor-input value from saved override', async () => {
    vi.mocked(api.loadEstimationConfig).mockResolvedValue({ spreadFactor: 0.2 })
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('spread-factor-input')).toHaveValue('0.2')
  })

  it('save button is disabled while loading', () => {
    renderEditor()
    expect(screen.getByTestId('estimation-config-save')).toBeDisabled()
  })

  it('save button is enabled after load completes', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
  })

  it('calls saveEstimationConfig on save and shows success', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() => expect(api.saveEstimationConfig).toHaveBeenCalledWith(
      'gabetti-busto-arsizio',
      expect.objectContaining({ spreadFactor: 0.05 }),
    ))
    expect(screen.getByTestId('estimation-config-save-status')).toHaveTextContent(/saved/i)
  })

  it('shows validation error for spread factor > 1 and does not save', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    const input = screen.getByTestId('spread-factor-input')
    // Clear the uncontrolled input then type an invalid value
    await user.clear(input)
    await user.type(input, '1.5')
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() => expect(screen.getByTestId('estimation-config-spread-error')).toBeInTheDocument())
    expect(api.saveEstimationConfig).not.toHaveBeenCalled()
  })

  it('calls clearEstimationConfig on reset', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-reset')).not.toBeDisabled())
    await user.click(screen.getByTestId('estimation-config-reset'))
    await waitFor(() => expect(api.clearEstimationConfig).toHaveBeenCalledWith('gabetti-busto-arsizio'))
  })

  it('renders privacy text fields', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('privacy-text-it')).toBeInTheDocument()
    expect(screen.getByTestId('privacy-text-en')).toBeInTheDocument()
  })

  it('can add a new zone row', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('zone-add-btn')).toBeInTheDocument())
    const before = screen.getAllByTestId(/^zone-id-row-/).length
    await user.click(screen.getByTestId('zone-add-btn'))
    expect(screen.getAllByTestId(/^zone-id-row-/).length).toBe(before + 1)
  })

  it('renders condition entries open-list with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    const list = screen.getByTestId('condition-entries-list')
    expect(list).toBeInTheDocument()
    // Should contain 3 rows (ottimo, buono, da_ristrutturare)
    const rows = list.querySelectorAll('[data-testid="factor-entry-row"]')
    expect(rows.length).toBe(3)
  })

  it('renders floor entries open-list with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    const list = screen.getByTestId('floor-entries-list')
    expect(list).toBeInTheDocument()
    const rows = list.querySelectorAll('[data-testid="factor-entry-row"]')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('renders era entries open-list with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    const list = screen.getByTestId('era-entries-list')
    expect(list).toBeInTheDocument()
  })

  it('renders sqm bucket entries open-list', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    const list = screen.getByTestId('sqm-bucket-entries-list')
    expect(list).toBeInTheDocument()
    const rows = list.querySelectorAll('[data-testid="factor-entry-row"]')
    expect(rows.length).toBe(5)
  })

  it('edited condition entry coefficient is included in save payload', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    // Find the first coefficient input inside condition-entries-list
    const list = screen.getByTestId('condition-entries-list')
    const coeffInputs = list.querySelectorAll('[data-testid="factor-entry-coefficient"]')
    const firstCoeff = coeffInputs[0] as HTMLInputElement
    await user.clear(firstCoeff)
    await user.type(firstCoeff, '0.9')
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() =>
      expect(api.saveEstimationConfig).toHaveBeenCalledWith(
        'gabetti-busto-arsizio',
        expect.objectContaining({
          conditionEntries: expect.arrayContaining([
            expect.objectContaining({ coefficient: 0.9 }),
          ]),
        }),
      )
    )
  })

  it('edited accessory entry bonus is included in save payload', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    const list = screen.getByTestId('accessory-entries-list')
    // box_auto is at index 2 (nulla=0, cantina=1, box_auto=2)
    const bonusInputs = list.querySelectorAll('[data-testid="accessory-entry-bonus"]')
    const boxAutoBonus = bonusInputs[2] as HTMLInputElement
    await user.clear(boxAutoBonus)
    await user.type(boxAutoBonus, '20000')
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() =>
      expect(api.saveEstimationConfig).toHaveBeenCalledWith(
        'gabetti-busto-arsizio',
        expect.objectContaining({
          accessoryEntries: expect.arrayContaining([
            expect.objectContaining({ bonus: 20000 }),
          ]),
        }),
      )
    )
  })

  it('override values pre-populate condition entries on load', async () => {
    vi.mocked(api.loadEstimationConfig).mockResolvedValue({
      conditionEntries: [
        { value: 'ottimo', label: { it: 'Ottimo', en: 'Excellent' }, coefficient: 0.8 },
        { value: 'buono', label: { it: 'Buono', en: 'Good' }, coefficient: 0.6 },
        { value: 'da_ristrutturare', label: { it: 'Da ristrutturare', en: 'Needs renovation' }, coefficient: 0.4 },
      ],
    })
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    const list = screen.getByTestId('condition-entries-list')
    const coeffInputs = list.querySelectorAll('[data-testid="factor-entry-coefficient"]')
    expect((coeffInputs[0] as HTMLInputElement).value).toBe('0.8')
    expect((coeffInputs[1] as HTMLInputElement).value).toBe('0.6')
  })

  it('renders propertyTypeFactors inputs with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('property-type-factor-appartamento')).toHaveValue(1)
  })

  it('edited propertyTypeFactor is included in save payload', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    const input = screen.getByTestId('property-type-factor-appartamento')
    await user.clear(input)
    await user.type(input, '0.7')
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() =>
      expect(api.saveEstimationConfig).toHaveBeenCalledWith(
        'gabetti-busto-arsizio',
        expect.objectContaining({
          propertyTypeFactors: expect.objectContaining({ appartamento: 0.7 }),
        }),
      )
    )
  })

  it('can add a second property type via add input and button', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    await user.clear(screen.getByTestId('property-type-add-input'))
    await user.type(screen.getByTestId('property-type-add-input'), 'villa')
    await user.click(screen.getByTestId('property-type-add-btn'))
    expect(screen.getByTestId('property-type-id-villa')).toBeInTheDocument()
    expect(screen.getByTestId('property-type-factor-villa')).toHaveValue(1)
  })

  it('save payload includes new propertyTypes and propertyTypeFactors after adding type', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    await user.clear(screen.getByTestId('property-type-add-input'))
    await user.type(screen.getByTestId('property-type-add-input'), 'villa')
    await user.click(screen.getByTestId('property-type-add-btn'))
    // Set villa factor
    const factorInput = screen.getByTestId('property-type-factor-villa')
    await user.clear(factorInput)
    await user.type(factorInput, '0.5')
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() =>
      expect(api.saveEstimationConfig).toHaveBeenCalledWith(
        'gabetti-busto-arsizio',
        expect.objectContaining({
          propertyTypes: expect.arrayContaining(['appartamento', 'villa']),
          propertyTypeFactors: expect.objectContaining({ villa: 0.5 }),
        }),
      )
    )
  })

  it('can remove an added property type (button hidden when only one type)', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    // Remove button hidden when only one type
    expect(screen.queryByTestId('property-type-remove-0')).not.toBeInTheDocument()
    // Add villa
    await user.clear(screen.getByTestId('property-type-add-input'))
    await user.type(screen.getByTestId('property-type-add-input'), 'villa')
    await user.click(screen.getByTestId('property-type-add-btn'))
    expect(screen.getByTestId('property-type-remove-1')).toBeInTheDocument()
    // Remove villa
    await user.click(screen.getByTestId('property-type-remove-1'))
    expect(screen.queryByTestId('property-type-id-villa')).not.toBeInTheDocument()
  })

  it('can add a new sqm bucket entry and save it', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('sqm-bucket-entries-list')).toBeInTheDocument())
    const listBefore = screen.getByTestId('sqm-bucket-entries-list')
    const countBefore = listBefore.querySelectorAll('[data-testid="factor-entry-row"]').length
    await user.click(screen.getByTestId('sqm-bucket-entries-add-btn'))
    const listAfter = screen.getByTestId('sqm-bucket-entries-list')
    expect(listAfter.querySelectorAll('[data-testid="factor-entry-row"]').length).toBe(countBefore + 1)
  })

  it('sqmBucketEntries is included in save payload', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() =>
      expect(api.saveEstimationConfig).toHaveBeenCalledWith(
        'gabetti-busto-arsizio',
        expect.objectContaining({
          sqmBucketEntries: expect.arrayContaining([
            expect.objectContaining({ value: 'fino_50' }),
          ]),
        }),
      )
    )
  })

  it('override propertyTypeFactors pre-populate inputs on load', async () => {
    vi.mocked(api.loadEstimationConfig).mockResolvedValue({
      propertyTypes: ['appartamento', 'villa'],
      propertyTypeFactors: { appartamento: 0.9, villa: 0.5 },
    })
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('property-type-factor-appartamento')).toHaveValue(0.9)
    expect(screen.getByTestId('property-type-factor-villa')).toHaveValue(0.5)
  })
})


