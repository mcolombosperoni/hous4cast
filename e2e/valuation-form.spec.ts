import { test, expect } from '@playwright/test'

// Acceptance test for US-07: Fill out valuation form and get instant estimate
test.describe('Valuation form (US-07)', () => {
  test('User can fill the form and see the estimate result', async ({ page }) => {
    // Go to the estimate page for the Gabetti config
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('form')

    // Core fields must be present
    await expect(page.getByTestId('zoneId')).toBeVisible()
    // Gabetti uses bucket-based surface (not numeric sqm)
    await expect(page.getByTestId('sqmBucket')).toBeVisible()
    await expect(page.getByTestId('privacy')).toBeVisible()

    // Fill the form with minimum required fields
    await page.selectOption('[data-testid="zoneId"]', { index: 0 })
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.check('[data-testid="privacy"]')

    // Submit
    await page.click('button[type="submit"]')

    // Expect the result to be shown inline
    await expect(page.getByText(/Stima di valore|Value estimate/i)).toBeVisible()
    await expect(page.locator('[data-testid="estimate-result"]')).toHaveText(/[\p{Sc}]?\s?\d+[.,]?\d*\s*[-–]\s*[\p{Sc}]?\s?\d+[.,]?\d*/u)
  })

  test('Validation: privacy is required', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('form')
    // Try to submit without accepting privacy
    await page.click('button[type="submit"]')
    // Should show privacy validation error
    await expect(page.getByTestId('error-privacy')).toBeVisible()
  })
})

// Acceptance test for US-08: Extended valuation form with all Gabetti fields
test.describe('Extended valuation form — Gabetti (US-08)', () => {

  test('User can fill all Gabetti extended fields and see the estimate result', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('form')

    // New extended fields should be visible
    await expect(page.getByTestId('zoneId')).toBeVisible()
    await expect(page.getByTestId('sqmBucket')).toBeVisible()
    await expect(page.getByTestId('address')).toBeVisible()
    await expect(page.getByTestId('condition')).toBeVisible()
    await expect(page.getByTestId('accessories')).toBeVisible()
    await expect(page.getByTestId('floor')).toBeVisible()
    await expect(page.getByTestId('buildEra')).toBeVisible()
    await expect(page.getByTestId('email')).toBeVisible()
    await expect(page.getByTestId('phone')).toBeVisible()
    await expect(page.getByTestId('privacy')).toBeVisible()

    // The property type selector should NOT be visible (only 1 type: appartamento)
    await expect(page.getByTestId('propertyType')).not.toBeVisible()

    // Fill all extended fields
    await page.selectOption('[data-testid="zoneId"]', 'centro')
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.fill('[data-testid="address"]', 'Via Roma 1')
    await page.selectOption('[data-testid="condition"]', 'ottimo')
    await page.selectOption('[data-testid="accessories"]', 'box_auto')
    await page.selectOption('[data-testid="floor"]', 'secondo')
    await page.selectOption('[data-testid="buildEra"]', '2016_oggi')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="phone"]', '+39 333 1234567')
    await page.check('[data-testid="privacy"]')

    // Submit
    await page.click('button[type="submit"]')

    // Result should be shown inline
    await expect(page.getByText(/Stima di valore|Value estimate/i)).toBeVisible()
    await expect(page.locator('[data-testid="estimate-result"]')).toBeVisible()
    // Result should contain currency-formatted numbers
    await expect(page.locator('[data-testid="estimate-result"]')).toHaveText(/[\p{Sc}]?\s?\d+/u)
  })

  test('Gabetti result reflects zone multiplier (semi-central zone yields lower value than centre)', async ({ page }) => {
    // Centro
    await page.goto('/#/estimate/gabetti-busto-arsizio')
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
    const centroText = await page.locator('[data-testid="estimate-result"]').innerText()

    // Sant'Anna (zone multiplier 0.66 — much lower)
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('form')
    await page.selectOption('[data-testid="zoneId"]', 'sant_anna')
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.selectOption('[data-testid="condition"]', 'ottimo')
    await page.selectOption('[data-testid="accessories"]', 'nulla')
    await page.selectOption('[data-testid="floor"]', 'primo')
    await page.selectOption('[data-testid="buildEra"]', '2016_oggi')
    await page.check('[data-testid="privacy"]')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="estimate-result"]')).toBeVisible()
    const periferiaText = await page.locator('[data-testid="estimate-result"]').innerText()

    // Extract first numeric value from each result and compare
    const extractFirst = (s: string) => parseInt(s.replace(/\D+/g, '').slice(0, 9))
    expect(extractFirst(periferiaText)).toBeLessThan(extractFirst(centroText))
  })

  test('Validation: sqmBucket and privacy are required in Gabetti form', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('form')

    // Submit without selecting sqmBucket or accepting privacy
    await page.click('button[type="submit"]')

    // Should show privacy validation error
    await expect(page.getByTestId('error-privacy')).toBeVisible()
  })

  test('Locale switch works on extended form (EN labels visible)', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio?lang=en')
    await page.waitForSelector('form')

    // Check EN label is present for surface area
    await expect(page.getByText('Surface area', { exact: true })).toBeVisible()
    await expect(page.getByText('Internal condition', { exact: true })).toBeVisible()
    await expect(page.getByText('Accessories', { exact: true })).toBeVisible()
    await expect(page.getByText('Floor', { exact: true })).toBeVisible()
    await expect(page.getByText('Construction era', { exact: true })).toBeVisible()
  })
})
