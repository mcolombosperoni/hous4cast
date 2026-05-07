import { test, expect, Page } from '@playwright/test'

/**
 * Acceptance tests for US-15: Property type as a configurable estimation factor (Epic O)
 */

/** Open admin, select Gabetti, open the Estimation Config accordion. */
async function openEstimationConfig(page: Page) {
  await page.goto('/#/admin')
  await page.click('button:has-text("Gabetti Busto Arsizio")')
  await expect(page.getByTestId('estimation-config-section')).toBeVisible()
  await page.click('[data-testid="estimation-config-toggle"]')
  await page.waitForSelector('[data-testid="estimation-config-loaded"]', { timeout: 8000 })
}

async function saveConfig(page: Page) {
  await page.waitForSelector('[data-testid="estimation-config-save"]:not([disabled])', { timeout: 8000 })
  await page.click('[data-testid="estimation-config-save"]')
  await page.waitForSelector('[data-testid="estimation-config-save-status"]', { timeout: 8000 })
}

test.describe.serial('Property type factors (US-15)', () => {
  test.beforeEach(async ({ page }) => {
    // Block Firestore to prevent stale overrides
    await page.route(/firestore\.googleapis\.com/, (route) => route.abort())
    await page.goto('/#/admin')
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('hous4cast:estimationConfig:'))
        .forEach((k) => localStorage.removeItem(k))
    })
  })

  // T70 — core acceptance scenario: form hides selector when single type
  test('Estimate form hides property type selector when only one type is configured', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')
    // Gabetti has only 'appartamento' — selector must be hidden
    await expect(page.locator('[data-testid="propertyType"]')).not.toBeVisible()
  })

  // T70 — admin edits propertyTypeFactors → estimate changes
  test('Admin edits property type factor → estimate reflects new factor', async ({ page }) => {
    // Get baseline estimate (appartamento, factor = 1.0 default)
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
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
    const baselineText = await page.locator('[data-testid="estimate-result"]').innerText()

    // Admin: set appartamento factor to 0.5
    await openEstimationConfig(page)
    await expect(page.locator('[data-testid="property-type-factor-appartamento"]')).toBeVisible()
    await page.fill('[data-testid="property-type-factor-appartamento"]', '0.5')
    await saveConfig(page)

    // Verify localStorage was updated
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(JSON.parse(stored!).propertyTypeFactors?.appartamento).toBe(0.5)

    // Navigate to estimate page and resubmit
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
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
    const modifiedText = await page.locator('[data-testid="estimate-result"]').innerText()

    const extractFirst = (s: string) => parseInt(s.replace(/[^\d]/g, '').slice(0, 9))
    expect(extractFirst(modifiedText)).toBeLessThan(extractFirst(baselineText))
  })

  // T70 — admin adds a second property type → form shows selector → estimate differs by factor
  test('Admin adds a second property type → selector appears → different factor yields different estimate', async ({ page }) => {
    // Admin: add 'villa' with factor 0.5
    await openEstimationConfig(page)

    // Add villa as a second property type
    await page.selectOption('[data-testid="property-type-add-select"]', 'villa')
    await page.click('[data-testid="property-type-add-btn"]')
    // Set villa factor to 0.5
    await page.fill('[data-testid="property-type-factor-villa"]', '0.5')
    await saveConfig(page)

    // Verify localStorage: propertyTypes includes villa, factor saved
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    const parsed = JSON.parse(stored!)
    expect(parsed.propertyTypes).toContain('villa')
    expect(parsed.propertyTypeFactors?.villa).toBe(0.5)

    // Navigate to estimate page — property type selector should now be visible
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')
    await expect(page.locator('[data-testid="propertyType"]')).toBeVisible()

    // Submit with appartamento (factor 1.0)
    await page.selectOption('[data-testid="propertyType"]', 'appartamento')
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
    const appartamentoText = await page.locator('[data-testid="estimate-result"]').innerText()

    // Reload and submit with villa (factor 0.5)
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')
    await page.selectOption('[data-testid="propertyType"]', 'villa')
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
    const villaText = await page.locator('[data-testid="estimate-result"]').innerText()

    const extractFirst = (s: string) => parseInt(s.replace(/[^\d]/g, '').slice(0, 9))
    expect(extractFirst(villaText)).toBeLessThan(extractFirst(appartamentoText))
  })

  // T70 — reset clears propertyTypes override and reverts to single type (selector hidden)
  test('Reset restores single property type and hides selector on estimate page', async ({ page }) => {
    // Admin: add villa, save
    await openEstimationConfig(page)
    await page.selectOption('[data-testid="property-type-add-select"]', 'villa')
    await page.click('[data-testid="property-type-add-btn"]')
    await saveConfig(page)

    // Reset
    await page.click('[data-testid="estimation-config-reset"]')
    await expect(page.locator('[data-testid="estimation-config-save-status"]')).not.toBeVisible()
    // localStorage cleared
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(stored).toBeNull()

    // Estimate page: selector hidden again
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')
    await expect(page.locator('[data-testid="propertyType"]')).not.toBeVisible()
  })
})

