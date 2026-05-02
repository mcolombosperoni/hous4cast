import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBrandingConfig, setBrandingConfig, uploadBrandingImage, deleteBrandingImage } from './brandingApi'

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
vi.mock('../app/cloudinaryApi', () => ({
  isCloudinaryConfigured: true,
  uploadToCloudinary: async (file: File, folder: string) => ({
    secure_url: `https://res.cloudinary.com/test/${folder}/${file.name}`,
    public_id: `${folder}/${file.name}`,
  }),
}))

describe('brandingApi', () => {
  let firestoreMock: { __store: Map<string, unknown> }

  beforeEach(async () => {
    firestoreMock = (await import('firebase/firestore')) as { __store: Map<string, unknown> }
    if (firestoreMock.__store) firestoreMock.__store.clear()
    window.localStorage.clear()
  })

  it('setBrandingConfig stores branding data', async () => {
    await setBrandingConfig('agency1', {
      paletteLight: { primary: '#fff', secondary: '#000', text: '#111', background: '#eee' },
      paletteDark: { primary: '#222', secondary: '#333', text: '#444', background: '#555' },
    })
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

    expect(url).toBe('https://res.cloudinary.com/test/branding/agency1/logo.png')

    const data = await getBrandingConfig('agency1')
    expect(data?.logoUrl).toBe('https://res.cloudinary.com/test/branding/agency1/logo.png')
  })

  it('uploadBrandingImage uploads coverImage and persists URL in branding config', async () => {
    const file = new File(['cover content'], 'cover.jpg', { type: 'image/jpeg' })
    const url = await uploadBrandingImage('agency1', 'coverImage', file)

    expect(url).toBe('https://res.cloudinary.com/test/branding/agency1/cover.jpg')

    const data = await getBrandingConfig('agency1')
    expect(data?.coverImageUrl).toBe('https://res.cloudinary.com/test/branding/agency1/cover.jpg')
  })

  it('deleteBrandingImage removes logo URL from branding config', async () => {
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    await uploadBrandingImage('agency1', 'logo', file)

    await deleteBrandingImage('agency1', 'logo')

    const data = await getBrandingConfig('agency1')
    expect(data?.logoUrl).toBeUndefined()
  })
})
