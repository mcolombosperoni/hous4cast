import { test, expect } from '@playwright/test'

// Acceptance test: Seller can get an instant estimate only after accepting privacy
// This covers the main user story for the estimate page from the seller's perspective

test.describe('Estimate Page - Seller Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Block Firestore to prevent remote overrides from leaking
    await page.route(/firestore\.googleapis\.com/, (route) => route.abort())
    // Clear any admin-saved overrides
    await page.goto('/')
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('hous4cast:estimationConfig:'))
        .forEach((k) => localStorage.removeItem(k))
    })
  })

  test('should require privacy consent and show estimate result', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await page.waitForSelector('[data-testid="estimate-form"]', { timeout: 10000 })

    // Fill all required fields except privacy
    await page.selectOption('[data-testid="zoneId"]', 'centro')
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')
    await page.selectOption('[data-testid="condition"]', 'ottimo')
    await page.selectOption('[data-testid="accessories"]', 'nulla')
    await page.selectOption('[data-testid="floor"]', 'primo')
    await page.selectOption('[data-testid="buildEra"]', '2016_oggi')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="phone"]', '333 1234567')

    // Try to submit without privacy consent
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="error-privacy"]', { state: 'visible' })
    await expect(page.getByTestId('error-privacy')).toBeVisible()
    await expect(page.getByTestId('error-privacy')).toHaveText(/accettare|accept/i)

    // Now accept privacy and submit
    await page.locator('label[for="privacy"]').click()
    await page.click('button[type="submit"]')
    // Should show the estimate result (check for result node and non-empty text)
    const result = page.locator('[data-testid="estimate-result"]')
    await result.waitFor({ state: 'visible' })
    await expect(result).toBeVisible()
    await expect(result).not.toHaveText('')
  })

  // Add more scenario-based tests here for other user stories (e.g. language switch, dark mode, etc.)
})
