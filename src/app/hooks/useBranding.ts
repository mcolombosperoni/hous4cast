import { useReducer, useEffect } from 'react'
import { getBrandingConfig } from '../brandingApi'
import type { BrandingConfig } from '../brandingApi'

type BrandingState = { branding: BrandingConfig | null | undefined }
type BrandingAction = { type: 'SET'; branding: BrandingConfig | null }

function reducer(_: BrandingState, action: BrandingAction): BrandingState {
  return { branding: action.branding }
}

/**
 * Loads the agency branding config for the given configId.
 * Returns undefined while loading, null if not configured, or the BrandingConfig.
 */
export function useBranding(configId: string | undefined): BrandingState {
  const [state, dispatch] = useReducer(reducer, { branding: undefined })

  useEffect(() => {
    if (!configId) {
      dispatch({ type: 'SET', branding: null })
      return
    }
    let cancelled = false
    getBrandingConfig(configId)
      .then((b) => { if (!cancelled) dispatch({ type: 'SET', branding: b }) })
      .catch(() => { if (!cancelled) dispatch({ type: 'SET', branding: null }) })
    return () => { cancelled = true }
  }, [configId])

  return state
}
