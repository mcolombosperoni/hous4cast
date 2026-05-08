import { db } from './firebase'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import type { AgencyConfig } from '../configs/types'
import { defaultAgencyTemplate } from '../configs/default-agency-template'

/** localStorage key for a single dynamic agency */
const agencyLocalKey = (id: string) => `hous4cast:agency:${id}`

/** localStorage key for the ordered list of dynamic agency IDs */
const AGENCY_IDS_KEY = 'hous4cast:agencyIds'

function readAgencyIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(AGENCY_IDS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function writeAgencyIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AGENCY_IDS_KEY, JSON.stringify(ids))
}

function readLocalAgency(id: string): AgencyConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(agencyLocalKey(id))
    if (!raw) return null
    return JSON.parse(raw) as AgencyConfig
  } catch {
    return null
  }
}

function writeLocalAgency(config: AgencyConfig): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(agencyLocalKey(config.id), JSON.stringify(config))
}

/**
 * Generates a URL-safe ID from an agency name, appending a timestamp suffix
 * to ensure uniqueness even if two agencies share the same name.
 */
export function slugifyAgencyName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'agency'
  return `${base}-${Date.now()}`
}

/**
 * Creates a new dynamic agency config from the default template.
 * Saves to localStorage immediately (Firestore as background sync).
 */
export async function createAgency(name: string): Promise<AgencyConfig> {
  const id = slugifyAgencyName(name)
  const config: AgencyConfig = {
    ...defaultAgencyTemplate,
    id,
    agencyName: name,
  }
  await saveAgency(config)
  return config
}

/**
 * Saves a dynamic agency config.
 * Writes to localStorage immediately and to Firestore in the background.
 */
export async function saveAgency(config: AgencyConfig): Promise<void> {
  writeLocalAgency(config)
  // Update the agency IDs index
  const ids = readAgencyIds()
  if (!ids.includes(config.id)) {
    writeAgencyIds([...ids, config.id])
  }
  // Fire-and-forget Firestore sync
  if (db) {
    try {
      const ref = doc(db, 'agencies', config.id)
      setDoc(ref, config).catch((err) => {
        console.error('[agencyApi] saveAgency error:', err)
      })
    } catch (err) {
      console.error('[agencyApi] saveAgency sync error:', err)
    }
  }
}

/**
 * Loads a dynamic agency config.
 * Reads localStorage first; falls back to Firestore when not in localStorage.
 */
export async function loadAgency(id: string): Promise<AgencyConfig | null> {
  const local = readLocalAgency(id)
  if (local) return local
  try {
    if (!db) return null
    const ref = doc(db, 'agencies', id)
    const snapPromise = getDoc(ref)
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
    const result = await Promise.race([snapPromise, timeout])
    if (!result) return null
    const snap = result
    if (!snap.exists()) return null
    const data = snap.data() as AgencyConfig
    writeLocalAgency(data)
    return data
  } catch {
    return null
  }
}

/**
 * Loads all dynamic agencies stored in localStorage.
 * Returns configs in the order they were created.
 */
export function loadAllLocalAgencies(): AgencyConfig[] {
  const ids = readAgencyIds()
  const configs: AgencyConfig[] = []
  for (const id of ids) {
    const config = readLocalAgency(id)
    if (config) configs.push(config)
  }
  return configs
}

/**
 * Deletes a dynamic agency from localStorage (and Firestore in background).
 */
export async function deleteAgency(id: string): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(agencyLocalKey(id))
    const ids = readAgencyIds().filter((i) => i !== id)
    writeAgencyIds(ids)
  }
  if (db) {
    const ref = doc(db, 'agencies', id)
    deleteDoc(ref).catch((err) => {
      console.error('[agencyApi] deleteAgency error:', err)
    })
  }
}

