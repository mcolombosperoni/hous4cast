import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { uploadToCloudinary, isCloudinaryConfigured } from './cloudinaryApi'


export type BrandingPalette = {
  primary: string
  secondary: string
  text: string
  background: string
}

export type BrandingConfig = {
  paletteLight: BrandingPalette
  paletteDark: BrandingPalette
  logoUrl?: string
  coverImageUrl?: string
}

export type BrandingImageType = 'logo' | 'coverImage'

const localStorageKey = (configId: string) => `hous4cast:branding:${configId}`

const readLocalBranding = (configId: string): BrandingConfig | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(localStorageKey(configId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as BrandingConfig
  } catch {
    return null
  }
}

const writeLocalBranding = (configId: string, config: BrandingConfig): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(localStorageKey(configId), JSON.stringify(config))
}

export async function getBrandingConfig(configId: string): Promise<BrandingConfig | null> {
  try {
    if (!db) return readLocalBranding(configId)
    const ref = doc(db, 'branding', configId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return readLocalBranding(configId)
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
    if (!db) return
    const ref = doc(db, 'branding', configId)
    await setDoc(ref, config)
  } catch (err) {
    console.error('[brandingApi] setBrandingConfig error:', err)
  }
}

const localImageKey = (configId: string, type: BrandingImageType) =>
  `hous4cast:branding:${configId}:${type}`

/**
 * Uploads an image file to Cloudinary and saves the CDN URL to Firestore.
 * Falls back to base64 in localStorage when Cloudinary is not configured.
 * Returns the public URL of the uploaded image.
 */
export async function uploadBrandingImage(
  configId: string,
  type: BrandingImageType,
  file: File,
): Promise<string> {
  const field = type === 'logo' ? 'logoUrl' : 'coverImageUrl'

  if (!isCloudinaryConfigured) {
    // Fallback: store as base64 data URL in localStorage
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    window.localStorage.setItem(localImageKey(configId, type), dataUrl)
    const existing = readLocalBranding(configId) ?? ({} as BrandingConfig)
    writeLocalBranding(configId, { ...existing, [field]: dataUrl } as BrandingConfig)
    return dataUrl
  }

  // Upload to Cloudinary
  const result = await uploadToCloudinary(file, `branding/${configId}`)
  const url = result.secure_url

  // Persist URL to Firestore
  const firestoreRef = doc(db!, 'branding', configId)
  const snap = await getDoc(firestoreRef)
  const existing = snap.exists() ? (snap.data() as BrandingConfig) : ({} as BrandingConfig)
  await setDoc(firestoreRef, { ...existing, [field]: url })

  // Update localStorage cache
  writeLocalBranding(configId, { ...existing, [field]: url } as BrandingConfig)
  window.localStorage.setItem(localImageKey(configId, type), url)

  return url
}

/**
 * Clears a branding image URL from Firestore and localStorage.
 * Note: Cloudinary free tier does not support deletion via API — the asset
 * remains on Cloudinary CDN but is no longer referenced by the app.
 */
export async function deleteBrandingImage(
  configId: string,
  type: BrandingImageType,
): Promise<void> {
  const field = type === 'logo' ? 'logoUrl' : 'coverImageUrl'
  window.localStorage.removeItem(localImageKey(configId, type))
  const existing = readLocalBranding(configId)
  if (existing) {
    const updated = { ...existing }
    delete updated[field as keyof BrandingConfig]
    writeLocalBranding(configId, updated as BrandingConfig)
  }

  if (!db) return

  try {
    const firestoreRef = doc(db, 'branding', configId)
    const snap = await getDoc(firestoreRef)
    if (snap.exists()) {
      const data = { ...(snap.data() as BrandingConfig) }
      delete data[field as keyof BrandingConfig]
      await setDoc(firestoreRef, data)
    }
  } catch (err) {
    console.error('[brandingApi] deleteBrandingImage error:', err)
  }
}

