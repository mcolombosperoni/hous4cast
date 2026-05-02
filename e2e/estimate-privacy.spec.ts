import { test, expect } from '@playwright/test'

// Acceptance test: Seller can get an instant estimate only after accepting privacy
// This covers the main user story for the estimate page from the seller's perspective

test.describe('Estimate Page - Seller Journey', () => {
  test('should require privacy consent and show estimate result', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')

    // Fill all fields except privacy (Gabetti config uses sqmBucket, not sqm/propertyType)
    await page.selectOption('[data-testid="zoneId"]', 'centro')
    await page.selectOption('[data-testid="sqmBucket"]', '71_110')

    // Try to submit without privacy consent
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="error-privacy"]', { state: 'visible' })
    await expect(page.getByTestId('error-privacy')).toBeVisible()
    await expect(page.getByTestId('error-privacy')).toHaveText(/accettare|accept/i)

    // Now accept privacy and submit
    await page.check('[data-testid="privacy"]')
    await page.click('button[type="submit"]')
    // Should show the estimate result (check for result node and non-empty text)
    const result = page.locator('[data-testid="estimate-result"]')
    await result.waitFor({ state: 'visible' })
    await expect(result).toBeVisible()
    await expect(result).not.toHaveText('')
  })

  // Add more scenario-based tests here for other user stories (e.g. language switch, dark mode, etc.)
})
