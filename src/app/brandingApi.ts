import { db } from '../app/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'


export type BrandingPalette = {
  primary: string
  secondary: string
  text: string
  background: string
}

export type BrandingConfig = {
  paletteLight: BrandingPalette
  paletteDark: BrandingPalette
}

const localStorageKey = (configId: string) => `hous4cast:branding:${configId}`

const readLocalBranding = (configId: string): BrandingConfig | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(localStorageKey(configId))
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as BrandingConfig
  } catch {
    return null
  }
}

const writeLocalBranding = (configId: string, config: BrandingConfig): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(localStorageKey(configId), JSON.stringify(config))
}

export async function getBrandingConfig(configId: string): Promise<BrandingConfig | null> {
  try {
    if (!db) {
      return readLocalBranding(configId)
    }

    const ref = doc(db, 'branding', configId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return readLocalBranding(configId)
    }

    const data = snap.data() as BrandingConfig
    writeLocalBranding(configId, data)
    return data
  } catch (err) {
    console.error('[brandingApi] getBrandingConfig error:', err)
    return readLocalBranding(configId)
  }
}

export async function setBrandingConfig(configId: string, config: BrandingConfig): Promise<void> {
  writeLocalBranding(configId, config)

  try {
    if (!db) {
      return
    }

    const ref = doc(db, 'branding', configId)
    await setDoc(ref, config)
  } catch (err) {
    console.error('[brandingApi] setBrandingConfig error:', err)
  }
}


