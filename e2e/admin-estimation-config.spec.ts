import { test, expect, Page } from '@playwright/test'

/**
 * Acceptance tests for US-09: Admin-editable estimation config (Epic I)
 */

/** Open admin, select Gabetti, open the Estimation Config accordion. */
async function openEstimationConfig(page: Page) {
  await page.goto('/#/admin')
  await page.click('button:has-text("Gabetti Busto Arsizio")')
  await expect(page.getByTestId('estimation-config-section')).toBeVisible()
  await page.click('[data-testid="estimation-config-toggle"]')
  // Wait for async load to complete
  await page.waitForSelector('[data-testid="estimation-config-loaded"]', { timeout: 8000 })
}

/** Click Save and wait for success status. */
async function saveConfig(page: Page) {
  await page.waitForSelector('[data-testid="estimation-config-save"]:not([disabled])', { timeout: 8000 })
  await page.click('[data-testid="estimation-config-save"]')
  await page.waitForSelector('[data-testid="estimation-config-save-status"]', { timeout: 8000 })
}

test.describe.serial('Admin estimation config editor (US-09)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any previously saved overrides in localStorage
    await page.goto('/#/admin')
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('hous4cast:estimationConfig:'))
        .forEach((k) => localStorage.removeItem(k))
    })
  })

  // T48 — core acceptance scenario
  test('Estimation Config section appears after selecting an agency', async ({ page }) => {
    await page.goto('/#/admin')
    await expect(page.getByTestId('estimation-config-section')).not.toBeVisible()
    await page.click('button:has-text("Gabetti Busto Arsizio")')
    await expect(page.getByTestId('estimation-config-section')).toBeVisible()
    // Toggle opens the editor
    await page.click('[data-testid="estimation-config-toggle"]')
    await page.waitForSelector('[data-testid="estimation-config-loaded"]', { timeout: 8000 })
    await expect(page.getByTestId('spread-factor-input')).toBeVisible()
  })

  test('Admin edits spread factor → saved to localStorage → estimate page still renders', async ({ page }) => {
    await openEstimationConfig(page)
    await page.fill('[data-testid="spread-factor-input"]', '0.20')
    await saveConfig(page)
    await expect(page.getByTestId('estimation-config-save-status')).toHaveText(/saved/i)

    // Verify localStorage was updated
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(stored).not.toBeNull()
    const parsedStored = JSON.parse(stored!)
    expect(parsedStored.spreadFactor).toBe(0.2)
    // Sanity: all zone multipliers should be valid numbers (not null/NaN)
    const badZone = parsedStored.zones?.find(
      (z: { zoneMultiplier: number | null }) => z.zoneMultiplier === null || isNaN(z.zoneMultiplier)
    )
    expect(badZone).toBeUndefined()
    // Sanity: conditionFactors ottimo should be valid
    expect(parsedStored.conditionFactors?.ottimo).toBe(1)
    // Sanity: sqmBucketPrices 71_110 should be valid
    expect(parsedStored.sqmBucketPrices?.['71_110']).toBe(352000)
    // Sanity: floorFactors primo should be valid
    expect(parsedStored.floorFactors?.primo).toBe(1)
    // Sanity: eraFactors 2016_oggi should be valid
    expect(parsedStored.eraFactors?.['2016_oggi']).toBe(1)
    // Log the full stored JSON for debugging
    console.log('STORED JSON:', JSON.stringify(parsedStored, null, 2).slice(0, 500))

    // Navigate to estimate page — must still load and render the form
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form button[type="submit"]', { timeout: 8000 })
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
    await expect(page.locator('[data-testid="estimate-result"]')).toHaveText(/\d/)
  })

  // T48 — zone multiplier affects result
  test('Admin edits zone multiplier → estimate result changes', async ({ page }) => {
    // Get baseline (default multiplier = 1.0)
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')
    await page.selectOption('[data-testid="zoneId"]', 'centro')
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.selectOption('[data-testid="condition"]', 'ottimo')
    await page.selectOption('[data-testid="accessories"]', 'nulla')
    await page.selectOption('[data-testid="floor"]', 'primo')
    await page.selectOption('[data-testid="buildEra"]', '2016_oggi')
    await page.check('[data-testid="privacy"]')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="estimate-result"]')).toBeVisible()
    const baselineText = await page.locator('[data-testid="estimate-result"]').innerText()

    // Admin: set centro multiplier to 0.5 (half the default)
    await openEstimationConfig(page)
    await page.fill('[data-testid="zone-multiplier-centro"]', '0.5')
    await saveConfig(page)

    // Verify the multiplier was stored
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    const parsed = JSON.parse(stored!)
    const centroZone = (parsed.zones as Array<{ zoneId: string; zoneMultiplier: number }>)
      .find((z) => z.zoneId === 'centro')
    expect(centroZone?.zoneMultiplier).toBe(0.5)

    // Check estimate is now lower
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')
    await page.selectOption('[data-testid="zoneId"]', 'centro')
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.selectOption('[data-testid="condition"]', 'ottimo')
    await page.selectOption('[data-testid="accessories"]', 'nulla')
    await page.selectOption('[data-testid="floor"]', 'primo')
    await page.selectOption('[data-testid="buildEra"]', '2016_oggi')
    await page.check('[data-testid="privacy"]')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="estimate-result"]')).toBeVisible()
    const modifiedText = await page.locator('[data-testid="estimate-result"]').innerText()

    const extractFirst = (s: string) => parseInt(s.replace(/[^\d]/g, '').slice(0, 9))
    expect(extractFirst(modifiedText)).toBeLessThan(extractFirst(baselineText))
  })

  // T56 — localStorage fallback
  test('Saved override persists in localStorage after page navigation', async ({ page }) => {
    await openEstimationConfig(page)
    await page.fill('[data-testid="spread-factor-input"]', '0.15')
    await saveConfig(page)

    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(JSON.parse(stored!).spreadFactor).toBe(0.15)

    // Navigate away and back — localStorage persists across SPA routes
    await page.goto('/#/admin')
    const storedAfter = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(JSON.parse(storedAfter!).spreadFactor).toBe(0.15)

    // Re-open editor — input should reflect the saved value
    await openEstimationConfig(page)
    await expect(page.locator('[data-testid="spread-factor-input"]')).toHaveValue('0.15')
  })

  // T56 — reset
  test('Reset to defaults clears override and restores static base values', async ({ page }) => {
    await openEstimationConfig(page)
    await page.fill('[data-testid="spread-factor-input"]', '0.30')
    await saveConfig(page)

    // Reset
    await page.click('[data-testid="estimation-config-reset"]')
    // Static base for Gabetti is 0.05
    await expect(page.locator('[data-testid="spread-factor-input"]')).toHaveValue('0.05')
    // localStorage should be cleared
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(stored).toBeNull()
  })

  test('Validation: spread factor > 1 shows error and does not save', async ({ page }) => {
    await openEstimationConfig(page)
    await page.fill('[data-testid="spread-factor-input"]', '1.5')
    await page.waitForSelector('[data-testid="estimation-config-save"]:not([disabled])', { timeout: 8000 })
    await page.click('[data-testid="estimation-config-save"]')
    await expect(page.getByTestId('estimation-config-spread-error')).toBeVisible()
    // No override should have been saved
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(stored).toBeNull()
  })

  test('Admin edits privacy text (IT) → saves → persists in localStorage', async ({ page }) => {
    await openEstimationConfig(page)
    await page.fill('[data-testid="privacy-text-it"]', 'Testo privacy personalizzato.')
    await saveConfig(page)

    const stored = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(JSON.parse(stored!).privacy?.text?.it).toBe('Testo privacy personalizzato.')

    // Navigate away and re-check
    await page.goto('/#/admin')
    const storedAfter = await page.evaluate(() =>
      window.localStorage.getItem('hous4cast:estimationConfig:gabetti-busto-arsizio')
    )
    expect(JSON.parse(storedAfter!).privacy?.text?.it).toBe('Testo privacy personalizzato.')
  })

  test('Estimation config section not visible when no agency is selected', async ({ page }) => {
    await page.goto('/#/admin')
    await expect(page.getByTestId('estimation-config-section')).not.toBeVisible()
  })
})










