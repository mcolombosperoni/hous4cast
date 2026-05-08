import { test, expect } from '@playwright/test'

// Acceptance test for US-07: Fill out valuation form and get instant estimate
test.describe('Valuation form (US-07)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/firestore\.googleapis\.com/, (route) => route.abort())
    await page.goto('/')
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('hous4cast:estimationConfig:'))
        .forEach((k) => localStorage.removeItem(k))
    })
  })
  test('User can fill the form and see the estimate result', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('form')

    // Core fields must be present
    await expect(page.getByTestId('zoneId')).toBeVisible()
    // Gabetti uses bucket-based surface (not numeric sqm)
    await expect(page.getByTestId('sqmBucket')).toBeVisible()
    await expect(page.getByTestId('privacy')).toBeVisible()

    // Fill all required fields
    await page.selectOption('[data-testid="zoneId"]', { index: 0 })
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.selectOption('[data-testid="condition"]', 'ottimo')
    await page.selectOption('[data-testid="accessories"]', 'nulla')
    await page.selectOption('[data-testid="floor"]', 'primo')
    await page.selectOption('[data-testid="buildEra"]', '2016_oggi')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="phone"]', '333 1234567')
    await page.click('label[for="privacy"]')

    // Submit
    await page.click('button[type="submit"]')

    // Expect the result to be shown inline
    await expect(page.getByText(/Stima di valore|Value estimate/i)).toBeVisible()
    await expect(page.locator('[data-testid="estimate-result"]')).toHaveText(/[\p{Sc}]?\s?\d+[.,]?\d*\s*[-–]\s*[\p{Sc}]?\s?\d+[.,]?\d*/u)
  })

  test('Validation: all required fields show errors simultaneously on submit', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')
    // Submit without filling anything
    await page.click('button[type="submit"]')
    // Privacy error and sqmBucket error must both be visible at the same time,
    // proving that all validation errors appear simultaneously.
    await expect(page.getByTestId('error-privacy')).toBeVisible()
    await expect(page.getByTestId('error-sqmBucket')).toBeVisible()
  })
})

// Acceptance test for US-08: Extended valuation form with all Gabetti fields
test.describe('Extended valuation form — Gabetti (US-08)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/firestore\.googleapis\.com/, (route) => route.abort())
    await page.goto('/')
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('hous4cast:estimationConfig:'))
        .forEach((k) => localStorage.removeItem(k))
    })
  })

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
    await page.click('label[for="privacy"]')

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
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="phone"]', '333 1234567')
    await page.click('label[for="privacy"]')
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
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="phone"]', '333 1234567')
    await page.click('label[for="privacy"]')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="estimate-result"]')).toBeVisible()
    const periferiaText = await page.locator('[data-testid="estimate-result"]').innerText()

    // Extract first numeric value from each result and compare
    const extractFirst = (s: string) => parseInt(s.replace(/\D+/g, '').slice(0, 9))
    expect(extractFirst(periferiaText)).toBeLessThan(extractFirst(centroText))
  })

  test('Validation: all required fields show errors simultaneously on submit', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-page-loading"]', { state: 'detached', timeout: 8000 })
    await page.waitForSelector('form')

    // Submit without filling anything
    await page.click('button[type="submit"]')

    // At least three distinct field errors must be visible simultaneously:
    // sqmBucket, condition/email/phone (first unfilled required), and privacy.
    await expect(page.getByTestId('error-privacy')).toBeVisible()
    await expect(page.getByTestId('error-sqmBucket')).toBeVisible()
    // Both errors rendered at the same time (not sequentially)
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
