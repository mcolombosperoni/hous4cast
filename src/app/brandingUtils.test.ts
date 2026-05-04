import { describe, it, expect } from 'vitest'
import { applyBrandingVars } from './brandingUtils'
import type { BrandingPalette } from './brandingApi'

const PALETTE: BrandingPalette = {
  primary: '#FF0099',
  secondary: '#00AAFF',
  text: '#111111',
  background: '#FAFAFA',
}

describe('applyBrandingVars', () => {
  it('sets all CSS custom properties on the element', () => {
    const el = document.createElement('div')
    applyBrandingVars(el, PALETTE)
    expect(el.style.getPropertyValue('--brand-primary')).toBe('#FF0099')
    expect(el.style.getPropertyValue('--brand-secondary')).toBe('#00AAFF')
    expect(el.style.getPropertyValue('--brand-text')).toBe('#111111')
    expect(el.style.getPropertyValue('--brand-bg')).toBe('#FAFAFA')
  })

  it('removes all CSS custom properties when palette is undefined', () => {
    const el = document.createElement('div')
    applyBrandingVars(el, PALETTE)
    applyBrandingVars(el, undefined)
    expect(el.style.getPropertyValue('--brand-primary')).toBe('')
    expect(el.style.getPropertyValue('--brand-secondary')).toBe('')
    expect(el.style.getPropertyValue('--brand-text')).toBe('')
    expect(el.style.getPropertyValue('--brand-bg')).toBe('')
  })

  it('overwrites previously set properties with new palette values', () => {
    const el = document.createElement('div')
    applyBrandingVars(el, PALETTE)
    applyBrandingVars(el, { ...PALETTE, primary: '#000000' })
    expect(el.style.getPropertyValue('--brand-primary')).toBe('#000000')
    expect(el.style.getPropertyValue('--brand-secondary')).toBe('#00AAFF')
  })
})

