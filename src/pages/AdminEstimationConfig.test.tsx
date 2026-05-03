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
})


