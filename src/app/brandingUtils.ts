import type { BrandingPalette } from './brandingApi'

/**
 * CSS custom property names used to inject the agency palette at runtime.
 * These are set on the branding wrapper element and consumed by child components.
 */
const BRAND_VARS: Record<keyof BrandingPalette, string> = {
  primary: '--brand-primary',
  secondary: '--brand-secondary',
  text: '--brand-text',
  background: '--brand-bg',
}

/**
 * Sets agency palette CSS custom properties on the given element.
 * When palette is undefined, all brand custom properties are removed.
 */
export function applyBrandingVars(el: HTMLElement, palette: BrandingPalette | undefined): void {
  for (const [key, varName] of Object.entries(BRAND_VARS) as [keyof BrandingPalette, string][]) {
    if (palette) {
      el.style.setProperty(varName, palette[key])
    } else {
      el.style.removeProperty(varName)
    }
  }
}

