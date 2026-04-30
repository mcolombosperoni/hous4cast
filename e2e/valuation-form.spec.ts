import { test, expect } from '@playwright/test'

// Acceptance test for US-07: Fill out valuation form and get instant estimate (fixed fields)
test.describe('Valuation form (US-07)', () => {
  test('User can fill the form and see the estimate result', async ({ page }) => {
    // Go to the estimate page for a known config
    await page.goto('/#/estimate/gabetti-busto-arsizio')

    // Wait for the form to be present
    await page.waitForSelector('form')
    // Check that the form fields are present
    await expect(page.getByTestId('zoneId')).toBeVisible()
    await expect(page.getByTestId('propertyType')).toBeVisible()
    await expect(page.getByTestId('sqm')).toBeVisible()
    await expect(page.getByTestId('privacy')).toBeVisible()

    // Fill the form
    await page.selectOption('[data-testid="zoneId"]', { index: 0 })
    await page.selectOption('[data-testid="propertyType"]', { index: 0 })
    await page.fill('[data-testid="sqm"]', '80')
    await page.check('[data-testid="privacy"]')

    // Submit
    await page.click('button[type="submit"]')

    // Expect the result to be shown inline
    await expect(page.getByText(/Stima di valore|Value estimate/i)).toBeVisible()
    // (Optional) Check that the result is a number range (accept any currency symbol)
    await expect(page.locator('[data-testid="estimate-result"]')).toHaveText(/[\p{Sc}]?\s?\d+[.,]?\d*\s*[-–]\s*[\p{Sc}]?\s?\d+[.,]?\d*/u)
  })

  test('Validation: required fields and privacy', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    // Reset only the fields that can be empty
    await page.fill('[data-testid="sqm"]', '')
    await page.uncheck('[data-testid="privacy"]')
    // Try to submit without filling anything
    await page.click('button[type="submit"]')
    // Wait for error messages to be visible for sqm and privacy
    await page.waitForSelector('[data-testid="error-sqm"]', { state: 'visible' })
    await page.waitForSelector('[data-testid="error-privacy"]', { state: 'visible' })
    // Should see validation errors (use data-testid for unique selection)
    await expect(page.getByTestId('error-sqm')).toBeVisible()
    await expect(page.getByTestId('error-privacy')).toBeVisible()
  })
})

