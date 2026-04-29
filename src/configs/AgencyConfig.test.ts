import { gabettiBustoArsizioConfig } from './gabetti-busto-arsizio'
import { AgencyConfig } from './types'

describe('AgencyConfig branding and privacy', () => {
  it('should include branding palette, logo, and cover image', () => {
    expect(gabettiBustoArsizioConfig.branding).toBeDefined()
    expect(gabettiBustoArsizioConfig.branding?.palette.primary).toMatch(/^#([0-9A-Fa-f]{3}){1,2}$/)
    expect(gabettiBustoArsizioConfig.branding?.logoUrl).toBeTruthy()
    expect(gabettiBustoArsizioConfig.branding?.coverImageUrl).toBeTruthy()
  })

  it('should include privacy text and link for EN/IT', () => {
    expect(gabettiBustoArsizioConfig.privacy).toBeDefined()
    expect(gabettiBustoArsizioConfig.privacy?.text?.it).toContain('privacy')
    expect(gabettiBustoArsizioConfig.privacy?.text?.en).toContain('privacy')
    expect(gabettiBustoArsizioConfig.privacy?.link?.it).toMatch(/^https?:\/\//)
    expect(gabettiBustoArsizioConfig.privacy?.link?.en).toMatch(/^https?:\/\//)
  })
})

