import { test, expect, Page } from '@playwright/test'
import type { BrandingConfig } from '../src/app/brandingApi'

/**
 * Acceptance tests for US-10: Branded estimate page (Epic J)
 */

const FIXTURE_BRANDING: BrandingConfig = {
  paletteLight: {
    primary: '#FF0099',
    secondary: '#00AAFF',
    text: '#111111',
    background: '#FAFAFA',
  },
  paletteDark: {
    primary: '#FF66CC',
    secondary: '#33BBFF',
    text: '#EEEEEE',
    background: '#111111',
  },
  logoUrl: 'https://placehold.co/120x40/FF0099/white?text=LOGO',
  coverImageUrl: 'https://placehold.co/800x200/00AAFF/white?text=COVER',
}

/**
 * Block Firestore requests so localStorage is used as the only branding source.
 * This prevents real Firestore data from overriding test fixtures.
 */
async function blockFirestore(page: Page) {
  await page.route('**/firestore.googleapis.com/**', (route) => route.abort())
  await page.route('**/:rpc/Listen**', (route) => route.abort())
}

/** Seed branding into localStorage and navigate to the estimate page. */
async function loadWithBranding(page: Page, branding: BrandingConfig | null) {
  // Write localStorage before any navigation so it is picked up on first load
  await page.goto('about:blank')
  await page.goto('/#/admin')
  await page.evaluate(
    ({ key, value }: { key: string; value: string | null }) => {
      if (value === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, value)
      }
    },
    {
      key: 'hous4cast:branding:gabetti-busto-arsizio',
      value: branding ? JSON.stringify(branding) : null,
    },
  )
  await page.goto('/#/estimate/gabetti-busto-arsizio')
  await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
}

test.describe('Branded estimate page (US-10)', () => {
  test.beforeEach(async ({ page }) => {
    await blockFirestore(page)
    // Clear any saved branding
    await page.goto('/#/admin')
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('hous4cast:branding:'))
        .forEach((k) => localStorage.removeItem(k))
    })
  })

  // T58 — palette applied via CSS custom properties
  test('Estimate page applies agency palette as CSS custom properties', async ({ page }) => {
    await loadWithBranding(page, FIXTURE_BRANDING)

    const primary = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="estimate-brand-wrapper"]') as HTMLElement | null
      return el ? getComputedStyle(el).getPropertyValue('--brand-primary').trim() : null
    })
    expect(primary).toBe('#FF0099')
  })

  // T58 — logo
  test('Estimate page shows agency logo when configured', async ({ page }) => {
    await loadWithBranding(page, FIXTURE_BRANDING)
    const logo = page.getByTestId('estimate-logo')
    await expect(logo).toBeVisible()
    const src = await logo.getAttribute('src')
    expect(src).toBe(FIXTURE_BRANDING.logoUrl)
  })

  // T58 — cover image
  test('Estimate page shows cover image hero when configured', async ({ page }) => {
    await loadWithBranding(page, FIXTURE_BRANDING)
    const cover = page.getByTestId('estimate-cover')
    await expect(cover).toBeVisible()
    const src = await cover.getAttribute('src')
    expect(src).toBe(FIXTURE_BRANDING.coverImageUrl)
  })

  // T58 — no branding fallback
  test('Estimate page renders correctly with no branding configured', async ({ page }) => {
    await loadWithBranding(page, null)
    // Page still renders the form
    await expect(page.locator('form')).toBeVisible()
    // Logo and cover are not shown
    await expect(page.getByTestId('estimate-logo')).not.toBeVisible()
    await expect(page.getByTestId('estimate-cover')).not.toBeVisible()
  })

  // T58 — form still works with branding applied
  test('Estimate form submits and returns result with branding applied', async ({ page }) => {
    await loadWithBranding(page, FIXTURE_BRANDING)
    await page.waitForSelector('form')
    await page.selectOption('[data-testid="zoneId"]', 'centro')
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.selectOption('[data-testid="condition"]', 'ottimo')
    await page.selectOption('[data-testid="accessories"]', 'nulla')
    await page.selectOption('[data-testid="floor"]', 'primo')
    await page.selectOption('[data-testid="buildEra"]', '2016_oggi')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="phone"]', '333 1234567')
    await page.check('[data-testid="privacy"]')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="estimate-result"]')).toBeVisible({ timeout: 8000 })
  })

  // T58 — branding partial (logo only, no cover)
  test('Estimate page shows logo but no cover when only logo is configured', async ({ page }) => {
    const partialBranding: BrandingConfig = {
      ...FIXTURE_BRANDING,
      coverImageUrl: undefined,
    }
    await loadWithBranding(page, partialBranding)
    await expect(page.getByTestId('estimate-logo')).toBeVisible()
    await expect(page.getByTestId('estimate-cover')).not.toBeVisible()
  })
})

