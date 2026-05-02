import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBrandingConfig, setBrandingConfig, uploadBrandingImage, deleteBrandingImage } from './brandingApi'

vi.mock('../app/firebase', () => ({ db: {}, storage: {} }))
vi.mock('firebase/firestore', () => {
  const store = new Map<string, unknown>()
  return {
    doc: (_db: unknown, _coll: string, id: string) => id,
    getDoc: async (id: string) => ({ exists: () => store.has(id), data: () => store.get(id) }),
    setDoc: async (id: string, data: unknown) => { store.set(id, data) },
    __store: store,
  }
})
vi.mock('firebase/storage', () => {
  const store = new Map<string, string>()
  return {
    ref: (_storage: unknown, path: string) => path,
    uploadBytes: async (path: string) => { store.set(path, 'uploaded') },
    getDownloadURL: async (path: string) => `https://storage.example.com/${path}`,
    deleteObject: async (path: string) => { store.delete(path) },
    __store: store,
  }
})

describe('brandingApi', () => {
  let firestoreMock: { __store: Map<string, unknown> }
  let storageMock: { __store: Map<string, string> }

  beforeEach(async () => {
    firestoreMock = (await import('firebase/firestore')) as { __store: Map<string, unknown> }
    if (firestoreMock.__store) firestoreMock.__store.clear()
    storageMock = (await import('firebase/storage')) as { __store: Map<string, string> }
    if (storageMock.__store) storageMock.__store.clear()
    window.localStorage.clear()
  })

  it('setBrandingConfig stores branding data', async () => {
    await setBrandingConfig('agency1', { paletteLight: { primary: '#fff', secondary: '#000', text: '#111', background: '#eee' }, paletteDark: { primary: '#222', secondary: '#333', text: '#444', background: '#555' } })
    const data = await getBrandingConfig('agency1')
    expect(data?.paletteLight.primary).toBe('#fff')
    expect(data?.paletteDark.background).toBe('#555')
  })

  it('getBrandingConfig returns null when missing', async () => {
    const data = await getBrandingConfig('notfound')
    expect(data).toBeNull()
  })

  it('uploadBrandingImage uploads logo and persists URL in branding config', async () => {
    const file = new File(['logo content'], 'logo.png', { type: 'image/png' })
    const url = await uploadBrandingImage('agency1', 'logo', file)

    expect(url).toBe('https://storage.example.com/branding/agency1/logo')

    const data = await getBrandingConfig('agency1')
    expect(data?.logoUrl).toBe('https://storage.example.com/branding/agency1/logo')
  })

  it('uploadBrandingImage uploads coverImage and persists URL in branding config', async () => {
    const file = new File(['cover content'], 'cover.jpg', { type: 'image/jpeg' })
    const url = await uploadBrandingImage('agency1', 'coverImage', file)

    expect(url).toBe('https://storage.example.com/branding/agency1/coverImage')

    const data = await getBrandingConfig('agency1')
    expect(data?.coverImageUrl).toBe('https://storage.example.com/branding/agency1/coverImage')
  })

  it('deleteBrandingImage removes logo URL from branding config', async () => {
    // First upload
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    await uploadBrandingImage('agency1', 'logo', file)

    // Then delete
    await deleteBrandingImage('agency1', 'logo')

    const data = await getBrandingConfig('agency1')
    expect(data?.logoUrl).toBeUndefined()
  })
})
