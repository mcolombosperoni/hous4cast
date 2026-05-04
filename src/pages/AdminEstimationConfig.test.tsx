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
    const before = screen.getAllByTestId(/^zone-id-/).length
    await user.click(screen.getByTestId('zone-add-btn'))
    expect(screen.getAllByTestId(/^zone-id-/).length).toBe(before + 1)
  })

  it('renders condition factor inputs with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('condition-factor-ottimo')).toHaveValue(1)
    expect(screen.getByTestId('condition-factor-buono')).toHaveValue(0.75)
    expect(screen.getByTestId('condition-factor-da_ristrutturare')).toHaveValue(0.5)
  })

  it('renders floor factor inputs with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('floor-factor-primo')).toHaveValue(1)
    expect(screen.getByTestId('floor-factor-terra')).toHaveValue(0.98)
  })

  it('renders era factor inputs with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('era-factor-2016_oggi')).toHaveValue(1)
    expect(screen.getByTestId('era-factor-1900_1940')).toHaveValue(0.55)
  })

  it('renders accessories bonus inputs with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('accessories-bonus-nulla')).toHaveValue(0)
    expect(screen.getByTestId('accessories-bonus-box_auto')).toHaveValue(15000)
  })

  it('renders sqm bucket price inputs with base values', async () => {
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('sqm-bucket-71_110')).toHaveValue(352000)
    expect(screen.getByTestId('sqm-bucket-fino_50')).toHaveValue(160000)
  })

  it('edited condition factor is included in save payload', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    const input = screen.getByTestId('condition-factor-ottimo')
    await user.clear(input)
    await user.type(input, '0.9')
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() =>
      expect(api.saveEstimationConfig).toHaveBeenCalledWith(
        'gabetti-busto-arsizio',
        expect.objectContaining({
          conditionFactors: expect.objectContaining({ ottimo: 0.9 }),
        }),
      )
    )
  })

  it('edited accessories bonus is included in save payload', async () => {
    const user = userEvent.setup()
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-save')).not.toBeDisabled())
    const input = screen.getByTestId('accessories-bonus-box_auto')
    await user.clear(input)
    await user.type(input, '20000')
    await user.click(screen.getByTestId('estimation-config-save'))
    await waitFor(() =>
      expect(api.saveEstimationConfig).toHaveBeenCalledWith(
        'gabetti-busto-arsizio',
        expect.objectContaining({
          accessoriesBonuses: expect.objectContaining({ box_auto: 20000 }),
        }),
      )
    )
  })

  it('override values pre-populate factor inputs on load', async () => {
    vi.mocked(api.loadEstimationConfig).mockResolvedValue({
      conditionFactors: { ottimo: 0.8, buono: 0.6, da_ristrutturare: 0.4 },
    })
    renderEditor()
    await waitFor(() => expect(screen.getByTestId('estimation-config-loaded')).toBeInTheDocument())
    expect(screen.getByTestId('condition-factor-ottimo')).toHaveValue(0.8)
    expect(screen.getByTestId('condition-factor-buono')).toHaveValue(0.6)
  })
})


