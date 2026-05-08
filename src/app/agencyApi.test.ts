import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Firebase
vi.mock('../firebase', () => ({ db: null }))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
  setDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
}))

import { slugifyAgencyName, createAgency, saveAgency, loadAgency, loadAllLocalAgencies, deleteAgency } from './agencyApi'
import type { AgencyConfig } from '../configs/types'

const mockConfig: AgencyConfig = {
  id: 'test-agency-123',
  agencyName: 'Test Agency',
  sqmRange: { min: 20, max: 500 },
  spreadFactor: 0.1,
  propertyTypes: ['appartamento'],
  propertyTypeEntries: [
    { value: 'appartamento', label: { it: 'Appartamento', en: 'Apartment' }, coefficient: 1.0 },
  ],
  zones: [
    { zoneId: 'zona_1', label: { it: 'Zona 1', en: 'Zone 1' }, pricePerSqm: { appartamento: 3000 }, zoneMultiplier: 1 },
  ],
}

describe('agencyApi', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('slugifyAgencyName', () => {
    it('converts a name to a lowercase slug with timestamp', () => {
      const slug = slugifyAgencyName('My Agency Name')
      expect(slug).toMatch(/^my-agency-name-\d+$/)
    })

    it('removes accent characters', () => {
      const slug = slugifyAgencyName('Agenzia Città')
      expect(slug).toMatch(/^agenzia-citta-\d+$/)
    })

    it('handles empty string gracefully', () => {
      const slug = slugifyAgencyName('')
      expect(slug).toMatch(/^agency-\d+$/)
    })
  })

  describe('saveAgency / loadAllLocalAgencies', () => {
    it('saves an agency to localStorage and returns it via loadAllLocalAgencies', async () => {
      await saveAgency(mockConfig)
      const all = loadAllLocalAgencies()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe('test-agency-123')
      expect(all[0].agencyName).toBe('Test Agency')
    })

    it('saves multiple agencies in order', async () => {
      const a: AgencyConfig = { ...mockConfig, id: 'a', agencyName: 'A' }
      const b: AgencyConfig = { ...mockConfig, id: 'b', agencyName: 'B' }
      await saveAgency(a)
      await saveAgency(b)
      const all = loadAllLocalAgencies()
      expect(all.map((c) => c.id)).toEqual(['a', 'b'])
    })
  })

  describe('loadAgency', () => {
    it('returns null when no agency is stored', async () => {
      const result = await loadAgency('nonexistent')
      expect(result).toBeNull()
    })

    it('returns the saved agency from localStorage', async () => {
      await saveAgency(mockConfig)
      const result = await loadAgency('test-agency-123')
      expect(result?.agencyName).toBe('Test Agency')
    })
  })

  describe('createAgency', () => {
    it('creates an agency with a unique ID based on name', async () => {
      const config = await createAgency('My New Agency')
      expect(config.id).toMatch(/^my-new-agency-\d+$/)
      expect(config.agencyName).toBe('My New Agency')
    })

    it('persists the created agency in localStorage', async () => {
      const config = await createAgency('Persisted Agency')
      const all = loadAllLocalAgencies()
      expect(all.some((c) => c.id === config.id)).toBe(true)
    })

    it('created agency has default zone and property type entries', async () => {
      const config = await createAgency('Template Test')
      expect(config.zones.length).toBeGreaterThan(0)
      expect(config.propertyTypeEntries?.length).toBeGreaterThan(0)
    })
  })

  describe('deleteAgency', () => {
    it('removes the agency from localStorage', async () => {
      await saveAgency(mockConfig)
      await deleteAgency('test-agency-123')
      const all = loadAllLocalAgencies()
      expect(all.find((c) => c.id === 'test-agency-123')).toBeUndefined()
    })

    it('removes the agency from the ID index', async () => {
      await saveAgency(mockConfig)
      await deleteAgency('test-agency-123')
      const raw = localStorage.getItem('hous4cast:agencyIds')
      const ids = raw ? JSON.parse(raw) : []
      expect(ids).not.toContain('test-agency-123')
    })
  })
})


