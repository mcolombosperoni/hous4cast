import { useEffect, useRef, type ReactNode } from 'react'
import type { BrandingConfig } from '../app/brandingApi'
import { applyBrandingVars } from '../app/brandingUtils'

interface Props {
  branding: BrandingConfig | null | undefined
  children: ReactNode
}

/**
 * Wraps the estimate page content and injects the agency palette as CSS
 * custom properties (--brand-primary, --brand-secondary, --brand-text, --brand-bg)
 * based on the current colour scheme (light/dark).
 * Falls back to neutral defaults when branding is null or undefined.
 */
export const BrandingWrapper = ({ branding, children }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const applyPalette = () => {
      if (!branding) {
        applyBrandingVars(el, undefined)
        return
      }
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyBrandingVars(el, isDark ? branding.paletteDark : branding.paletteLight)
    }

    applyPalette()

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', applyPalette)
    return () => mq.removeEventListener('change', applyPalette)
  }, [branding])

  return (
    <div ref={wrapperRef} data-testid="estimate-brand-wrapper">
      {children}
    </div>
  )
}

