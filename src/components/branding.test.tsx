import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrandingWrapper } from './BrandingWrapper'
import { BrandingHeader } from './BrandingHeader'
import { CoverHero } from './CoverHero'
import type { BrandingConfig } from '../app/brandingApi'

const FIXTURE: BrandingConfig = {
  paletteLight: { primary: '#FF0099', secondary: '#00AAFF', text: '#111111', background: '#FAFAFA' },
  paletteDark: { primary: '#FF66CC', secondary: '#33BBFF', text: '#EEEEEE', background: '#111111' },
  logoUrl: 'https://example.com/logo.png',
  coverImageUrl: 'https://example.com/cover.jpg',
}

// ── BrandingWrapper ───────────────────────────────────────────────────────────

describe('BrandingWrapper', () => {
  it('renders children', () => {
    render(<BrandingWrapper branding={null}><span>child</span></BrandingWrapper>)
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('renders the wrapper with correct data-testid', () => {
    render(<BrandingWrapper branding={null}><span>child</span></BrandingWrapper>)
    expect(screen.getByTestId('estimate-brand-wrapper')).toBeInTheDocument()
  })

  it('applies CSS custom properties when branding is provided (light mode)', () => {
    // jsdom uses light mode by default
    render(<BrandingWrapper branding={FIXTURE}><span>child</span></BrandingWrapper>)
    const wrapper = screen.getByTestId('estimate-brand-wrapper') as HTMLElement
    expect(wrapper.style.getPropertyValue('--brand-primary')).toBe('#FF0099')
    expect(wrapper.style.getPropertyValue('--brand-bg')).toBe('#FAFAFA')
  })

  it('does not set CSS vars when branding is null', () => {
    render(<BrandingWrapper branding={null}><span>child</span></BrandingWrapper>)
    const wrapper = screen.getByTestId('estimate-brand-wrapper') as HTMLElement
    expect(wrapper.style.getPropertyValue('--brand-primary')).toBe('')
  })
})

// ── BrandingHeader ────────────────────────────────────────────────────────────

describe('BrandingHeader', () => {
  it('renders img with estimate-logo testid when logoUrl is provided', () => {
    render(<BrandingHeader agencyName="Test Agency" logoUrl="https://example.com/logo.png" />)
    const img = screen.getByTestId('estimate-logo')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png')
    expect(img).toHaveAttribute('alt', 'Test Agency')
  })

  it('renders agency name text when no logoUrl is provided', () => {
    render(<BrandingHeader agencyName="Test Agency" />)
    expect(screen.queryByTestId('estimate-logo')).not.toBeInTheDocument()
    expect(screen.getByText('Test Agency')).toBeInTheDocument()
  })
})

// ── CoverHero ────────────────────────────────────────────────────────────

describe('CoverHero', () => {
  it('renders estimate-cover img when coverImageUrl is provided', () => {
    render(<CoverHero coverImageUrl="https://example.com/cover.jpg" agencyName="Agency" />)
    const img = screen.getByTestId('estimate-cover')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })

  it('renders nothing when coverImageUrl is absent', () => {
    const { container } = render(<CoverHero agencyName="Agency" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when coverImageUrl is undefined', () => {
    render(<CoverHero coverImageUrl={undefined} agencyName="Agency" />)
    expect(screen.queryByTestId('estimate-cover')).not.toBeInTheDocument()
  })
})

// suppress matchMedia not implemented warning in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

