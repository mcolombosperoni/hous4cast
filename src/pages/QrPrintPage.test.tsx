import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QrPrintPage } from './QrPrintPage'

const renderQrPrint = (configId: string, dl = 'en') =>
  render(
    <MemoryRouter initialEntries={[`/admin/qr/${configId}?dl=${dl}`]}>
      <Routes>
        <Route element={<QrPrintPage />} path="/admin/qr/:configId" />
      </Routes>
    </MemoryRouter>,
  )

describe('QrPrintPage', () => {
  it('renders agency name and QR for a valid config', () => {
    renderQrPrint('gabetti-busto-arsizio', 'it')

    expect(screen.getByRole('heading', { name: 'Gabetti Busto Arsizio' })).toBeInTheDocument()
    expect(document.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument()
  })

  it('shows fallback for unknown configId', () => {
    renderQrPrint('unknown-agency')

    expect(screen.getByText('Configuration not found.')).toBeInTheDocument()
    expect(document.querySelector('svg')).not.toBeInTheDocument()
  })

  it('includes dl param in the rendered qr url text', () => {
    renderQrPrint('gabetti-busto-arsizio', 'it')

    expect(screen.getByText(/dl=it/)).toBeInTheDocument()
  })

  it('defaults dl to en when param is missing', () => {
    render(
      <MemoryRouter initialEntries={['/admin/qr/gabetti-busto-arsizio']}>
        <Routes>
          <Route element={<QrPrintPage />} path="/admin/qr/:configId" />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/dl=en/)).toBeInTheDocument()
  })
})

