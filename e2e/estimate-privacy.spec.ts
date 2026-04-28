import { test, expect } from '@playwright/test'

// Acceptance test: Seller can get an instant estimate only after accepting privacy
// This covers the main user story for the estimate page from the seller's perspective

test.describe('Estimate Page - Seller Journey', () => {
  test('should require privacy consent and show estimate result', async ({ page }) => {
    await page.goto('/#/estimate/gabetti-busto-arsizio')

    // Fill all fields except privacy
    await page.getByLabel('Zona').selectOption('centro')
    await page.getByLabel('Tipo immobile').selectOption('appartamento')
    await page.getByLabel('Superficie (m²)').fill('100')

    // Try to submit without privacy consent
    await page.getByRole('button', { name: /calcola stima/i }).click()
    await expect(page.getByText('Ho letto e accetto l’informativa privacy')).toBeVisible()
    await expect(page.getByText('Devi accettare per continuare')).toBeVisible()

    // Now accept privacy and submit
    await page.getByLabel('Ho letto e accetto l’informativa privacy').check()
    await page.getByRole('button', { name: /calcola stima/i }).click()
    // Should show the estimate result (check for result text)
    await expect(page.getByText(/stima di valore/i)).toBeVisible()
  })

  // Add more scenario-based tests here for other user stories (e.g. language switch, dark mode, etc.)
})
