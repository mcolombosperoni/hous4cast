import { test, expect } from '@playwright/test'

/** Open the Agency Branding accordion after selecting an agency */
async function openBrandingSection(page: Parameters<typeof test>[1]['page']) {
  await page.getByTestId('admin-branding-config-toggle').click()
}

/** Block all Firestore network calls so the branding UI uses localStorage only */
async function blockFirestore(page: Parameters<typeof test>[1]['page']) {
  await page.route('**/firestore.googleapis.com/**', route => route.fulfill({ status: 200, body: '{}' }))
  await page.route('**firestore**', route => route.fulfill({ status: 200, body: '{}' }))
}

test.describe('Admin branding palette', () => {
  test.beforeEach(async ({ page }) => {
    await blockFirestore(page)
  })

  test('persist branding palette for agency', async ({ page }) => {
    await page.goto('/?lang=en#/admin')

    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })


    await page.getByTestId('config-card-gabetti-busto-arsizio').click()
    await openBrandingSection(page)
    // Wait for branding UI to finish loading (color pickers visible = no longer loading)
    await expect(page.locator('input[type=color]').first()).toBeVisible({ timeout: 15000 })

    const preview = page.locator('[data-testid="palette-preview"]')
    await expect(preview.locator('text=Caricamento...')).toHaveCount(0, { timeout: 15000 })

    const colorInput = page.locator('input[type=color]').first()
    await colorInput.fill('#123456')

    const saveBtn = page.getByRole('button', { name: /salva/i })
    await expect(saveBtn).toBeEnabled({ timeout: 5000 })
    await saveBtn.click()
    await expect(page.getByText(/salvato/i)).toBeVisible()

    await page.reload()
    await blockFirestore(page)
    await page.getByTestId('config-card-gabetti-busto-arsizio').click()
    await openBrandingSection(page)
    await expect(page.locator('input[type=color]').first()).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="palette-preview"]').locator('text=Caricamento...')).toHaveCount(0, { timeout: 15000 })
    await expect(page.locator('input[type=color]').first()).toHaveValue('#123456')
  })

  test('live preview updates as palette changes', async ({ page }) => {
    await page.goto('/?lang=en#/admin')
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    await page.getByTestId('config-card-gabetti-busto-arsizio').click()
    await openBrandingSection(page)
    // Wait for color pickers to appear (loading done)
    await expect(page.locator('input[type=color]').first()).toBeVisible({ timeout: 15000 })

    const preview = page.locator('[data-testid="palette-preview"]')
    await expect(preview.locator('text=Caricamento...')).toHaveCount(0, { timeout: 15000 })

    // Change the 'background' color (4th color picker)
    const backgroundInput = page.locator('input[type=color]').nth(3)
    await backgroundInput.waitFor({ state: 'visible' })
    const initialBg = await preview.evaluate((el) => getComputedStyle(el).backgroundColor)
    await backgroundInput.fill('#ff0000')
    await expect(async () => {
      const bg = await preview.evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(bg).not.toBe(initialBg)
    }).toPass()
  })
})
