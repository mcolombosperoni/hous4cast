import { db, storage } from '../app/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'


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

const localImageKey = (configId: string, type: BrandingImageType) =>
  `hous4cast:branding:${configId}:${type}`

/**
 * Uploads an image file to Firebase Storage and saves the download URL to Firestore.
 * Falls back to storing base64 in localStorage when Firebase is not configured.
 * Returns the URL (or base64 data URL) of the uploaded image.
 */
export async function uploadBrandingImage(
  configId: string,
  type: BrandingImageType,
  file: File,
): Promise<string> {
  // Always build a local preview URL for immediate use
  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(f)
    })

  if (!storage || !db) {
    // Fallback: store as base64 in localStorage
    const dataUrl = await toBase64(file)
    window.localStorage.setItem(localImageKey(configId, type), dataUrl)
    // Also update the branding doc in localStorage
    const existing = readLocalBranding(configId) ?? ({} as BrandingConfig)
    const field = type === 'logo' ? 'logoUrl' : 'coverImageUrl'
    writeLocalBranding(configId, { ...existing, [field]: dataUrl } as BrandingConfig)
    return dataUrl
  }

  // Upload to Firebase Storage
  const storageRef = ref(storage, `branding/${configId}/${type}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  // Persist URL to Firestore (merge with existing doc)
  const field = type === 'logo' ? 'logoUrl' : 'coverImageUrl'
  const firestoreRef = doc(db, 'branding', configId)
  const snap = await getDoc(firestoreRef)
  const existing = snap.exists() ? (snap.data() as BrandingConfig) : ({} as BrandingConfig)
  await setDoc(firestoreRef, { ...existing, [field]: url })

  // Update localStorage cache
  writeLocalBranding(configId, { ...existing, [field]: url } as BrandingConfig)
  window.localStorage.setItem(localImageKey(configId, type), url)

  return url
}

/**
 * Deletes a branding image from Firebase Storage and clears the URL from Firestore.
 */
export async function deleteBrandingImage(
  configId: string,
  type: BrandingImageType,
): Promise<void> {
  window.localStorage.removeItem(localImageKey(configId, type))
  const field = type === 'logo' ? 'logoUrl' : 'coverImageUrl'
  const existing = readLocalBranding(configId)
  if (existing) {
    const updated = { ...existing }
    delete updated[field as keyof BrandingConfig]
    writeLocalBranding(configId, updated as BrandingConfig)
  }

  if (!storage || !db) return

  try {
    const storageRef = ref(storage, `branding/${configId}/${type}`)
    await deleteObject(storageRef)
  } catch {
    // Ignore if file doesn't exist
  }

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



