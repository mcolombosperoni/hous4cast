import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBrandingConfig, setBrandingConfig } from './brandingApi'

vi.mock('../app/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => {
  const store = new Map<string, unknown>()
  return {
    doc: (_db: unknown, _coll: string, id: string) => id,
    getDoc: async (id: string) => ({ exists: () => store.has(id), data: () => store.get(id) }),
    setDoc: async (id: string, data: unknown) => { store.set(id, data) },
    __store: store,
  }
})

describe('brandingApi', () => {
  let firestoreMock: { __store: Map<string, unknown> }
  beforeEach(async () => {
    // reset mock store
    firestoreMock = (await import('firebase/firestore')) as { __store: Map<string, unknown> }
    if (firestoreMock.__store) firestoreMock.__store.clear()
  })

  it('setBrandingConfig salva i dati', async () => {
    await setBrandingConfig('agency1', { paletteLight: { primary: '#fff', secondary: '#000', text: '#111', background: '#eee' }, paletteDark: { primary: '#222', secondary: '#333', text: '#444', background: '#555' } })
    const data = await getBrandingConfig('agency1')
    expect(data?.paletteLight.primary).toBe('#fff')
    expect(data?.paletteDark.background).toBe('#555')
  })

  it('getBrandingConfig ritorna null se non esiste', async () => {
    const data = await getBrandingConfig('notfound')
    expect(data).toBeNull()
  })
})
