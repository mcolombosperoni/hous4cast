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

export async function getBrandingConfig(configId: string): Promise<BrandingConfig | null> {
  try {
    const ref = doc(db, 'branding', configId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return null
    }
    return snap.data() as BrandingConfig
  } catch (err) {
    console.error('[brandingApi] getBrandingConfig error:', err)
    throw err
  }
}

export async function setBrandingConfig(configId: string, config: BrandingConfig): Promise<void> {
  try {
    const ref = doc(db, 'branding', configId)
    await setDoc(ref, config)
  } catch (err) {
    console.error('[brandingApi] setBrandingConfig error:', err)
    throw err
  }
}


