import { test, expect } from '@playwright/test'

test.describe('Admin branding palette', () => {
  test('persist branding palette for agency', async ({ page }) => {
    // Mock Firestore response for branding config after reload
    await page.route('**/branding/example-agency-milano', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          paletteLight: {
            primary: '#123456',
            secondary: '#f59e42',
            text: '#222',
            background: '#fff',
          },
          paletteDark: {
            primary: '#60a5fa',
            secondary: '#fbbf24',
            text: '#f3f4f6',
            background: '#18181b',
          }
        })
      })
    })

    await page.goto('/#/admin')
    await page.getByRole('button', { name: /example agency milano/i }).click()
    const colorInput = page.locator('input[type=color]').first()
    await colorInput.waitFor({ state: 'visible' })
    await colorInput.click()
    await colorInput.fill('#123456')
    await colorInput.dispatchEvent('input')
    await colorInput.dispatchEvent('change')
    const saveBtn = page.getByRole('button', { name: /salva/i })
    await expect(saveBtn).toBeEnabled({ timeout: 5000 })
    await saveBtn.click()
    await expect(page.getByText(/salvato/i)).toBeVisible()
    await page.reload()
    await expect(page.locator('input[type=color]').first()).toHaveValue('#123456')
  })
})
