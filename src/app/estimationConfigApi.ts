import { db } from './firebase'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import type { EstimationConfigOverride } from '../configs/types'

const localKey = (configId: string) => `hous4cast:estimationConfig:${configId}`

const readLocal = (configId: string): EstimationConfigOverride | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(localKey(configId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as EstimationConfigOverride
  } catch {
    return null
  }
}

const writeLocal = (configId: string, override: EstimationConfigOverride): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(localKey(configId), JSON.stringify(override))
}

/**
 * Loads admin-saved estimation config overrides.
 * Reads localStorage first. If not found, tries Firestore and caches result in localStorage.
 */
export async function loadEstimationConfig(
  configId: string,
): Promise<EstimationConfigOverride | null> {
  // localStorage is the source of truth for the current session
  const local = readLocal(configId)
  if (local) return local

  try {
    if (!db) return null
    const ref = doc(db, 'estimationConfig', configId)
    // Timeout after 5s to avoid blocking the UI on slow/offline Firestore
    const snapPromise = getDoc(ref)
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
    const result = await Promise.race([snapPromise, timeoutPromise])
    if (!result) return null
    const snap = result
    if (!snap.exists()) return null
    const data = snap.data() as EstimationConfigOverride
    // Treat empty Firestore documents as "no override"
    if (!data || Object.keys(data).length === 0) return null
    writeLocal(configId, data)
    return data
  } catch (err) {
    console.error('[estimationConfigApi] loadEstimationConfig error:', err)
    return null
  }
}

/**
 * Persists estimation config overrides for the agency.
 * Writes to localStorage immediately and to Firestore when available.
 */
export async function saveEstimationConfig(
  configId: string,
  override: EstimationConfigOverride,
): Promise<void> {
  writeLocal(configId, override)
  // Fire-and-forget: Firestore sync runs in background, localStorage is the source of truth
  if (db) {
    const ref = doc(db, 'estimationConfig', configId)
    setDoc(ref, override).catch((err) => {
      console.error('[estimationConfigApi] saveEstimationConfig error:', err)
    })
  }
}

/**
 * Removes all saved overrides for the agency (localStorage + Firestore).
 * After this, the static base config is used.
 */
export async function clearEstimationConfig(configId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(localKey(configId))
  }
  // Fire-and-forget Firestore deletion
  if (db) {
    const ref = doc(db, 'estimationConfig', configId)
    deleteDoc(ref).catch((err) => {
      console.error('[estimationConfigApi] clearEstimationConfig error:', err)
    })
  }
}


