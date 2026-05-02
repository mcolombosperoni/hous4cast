import '@testing-library/jest-dom/vitest'

// Global Firestore mock to prevent real backend calls and metadata errors in CI
declare const vi: typeof import('vitest')['vi']

type FirestoreMockGlobal = typeof globalThis & {
  __firestoreStore?: Map<string, unknown>
  __storageStore?: Map<string, string>
}


vi.mock('./app/firebase', () => ({ db: {}, storage: {} }))
vi.mock('firebase/firestore', () => {
  const globalStore = globalThis as FirestoreMockGlobal
  // Use a global store to allow reset between tests
  const store = globalStore.__firestoreStore ?? new Map<string, unknown>()
  globalStore.__firestoreStore = store
  return {
    doc: (_db: unknown, _coll: string, id: string) => id,
    getDoc: async (id: string) => ({ exists: () => store.has(id), data: () => store.get(id) }),
    setDoc: async (id: string, data: unknown) => { store.set(id, data) },
    __store: store,
  }
})

vi.mock('firebase/storage', () => {
  const globalStore = globalThis as FirestoreMockGlobal
  const store = globalStore.__storageStore ?? new Map<string, string>()
  globalStore.__storageStore = store
  return {
    ref: (_storage: unknown, path: string) => path,
    uploadBytes: async (path: string) => { store.set(path as string, 'uploaded') },    getDownloadURL: async (path: string) => `https://storage.example.com/${path}`,
    deleteObject: async (path: string) => { store.delete(path as string) },
    __store: store,
  }
})

