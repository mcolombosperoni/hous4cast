import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useBranding } from './useBranding'
import * as brandingApi from '../brandingApi'
import type { BrandingConfig } from '../brandingApi'

vi.mock('../brandingApi', () => ({
  getBrandingConfig: vi.fn(),
}))

const FIXTURE: BrandingConfig = {
  paletteLight: { primary: '#FF0099', secondary: '#00AAFF', text: '#111111', background: '#FAFAFA' },
  paletteDark: { primary: '#FF66CC', secondary: '#33BBFF', text: '#EEEEEE', background: '#111111' },
  logoUrl: 'https://example.com/logo.png',
  coverImageUrl: 'https://example.com/cover.jpg',
}

describe('useBranding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns undefined (loading) initially', () => {
    vi.mocked(brandingApi.getBrandingConfig).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useBranding('gabetti-busto-arsizio'))
    expect(result.current.branding).toBeUndefined()
  })

  it('resolves to BrandingConfig after load', async () => {
    vi.mocked(brandingApi.getBrandingConfig).mockResolvedValue(FIXTURE)
    const { result } = renderHook(() => useBranding('gabetti-busto-arsizio'))
    await waitFor(() => expect(result.current.branding).not.toBeUndefined())
    expect(result.current.branding).toEqual(FIXTURE)
  })

  it('resolves to null when getBrandingConfig returns null', async () => {
    vi.mocked(brandingApi.getBrandingConfig).mockResolvedValue(null)
    const { result } = renderHook(() => useBranding('gabetti-busto-arsizio'))
    await waitFor(() => expect(result.current.branding).not.toBeUndefined())
    expect(result.current.branding).toBeNull()
  })

  it('resolves to null when getBrandingConfig throws', async () => {
    vi.mocked(brandingApi.getBrandingConfig).mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useBranding('gabetti-busto-arsizio'))
    await waitFor(() => expect(result.current.branding).not.toBeUndefined())
    expect(result.current.branding).toBeNull()
  })

  it('returns null immediately when configId is undefined', async () => {
    const { result } = renderHook(() => useBranding(undefined))
    await waitFor(() => expect(result.current.branding).not.toBeUndefined())
    expect(result.current.branding).toBeNull()
  })
})

