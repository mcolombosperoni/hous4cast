import '@testing-library/jest-dom/vitest'

// Global Firestore mock to prevent real backend calls and metadata errors in CI
declare const vi: typeof import('vitest')['vi']

vi.mock('./app/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => {
  const store = new Map<string, unknown>()
  return {
    doc: (_db: unknown, _coll: string, id: string) => id,
    getDoc: async (id: string) => ({ exists: () => store.has(id), data: () => store.get(id) }),
    setDoc: async (id: string, data: unknown) => { store.set(id, data) },
    __store: store,
  }
})
