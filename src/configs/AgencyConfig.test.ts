import { gabettiBustoArsizioConfig } from './gabetti-busto-arsizio'

describe('AgencyConfig branding and privacy', () => {
  it('should include branding palette with valid primary color', () => {
    expect(gabettiBustoArsizioConfig.branding).toBeDefined()
    expect(gabettiBustoArsizioConfig.branding?.palette.primary).toMatch(/^#([0-9A-Fa-f]{3}){1,2}$/)
    // logoUrl and coverImageUrl are optional; the Gabetti config may omit them
  })

  it('should include privacy text and link for EN/IT', () => {
    expect(gabettiBustoArsizioConfig.privacy).toBeDefined()
    // IT text may use 'Privacy' (capital) or 'privacy' – test case-insensitively
    expect(gabettiBustoArsizioConfig.privacy?.text?.it.toLowerCase()).toContain('privacy')
    expect(gabettiBustoArsizioConfig.privacy?.text?.en.toLowerCase()).toContain('privacy')
    expect(gabettiBustoArsizioConfig.privacy?.link?.it).toMatch(/^https?:\/\//)
    expect(gabettiBustoArsizioConfig.privacy?.link?.en).toMatch(/^https?:\/\//)
  })
})
