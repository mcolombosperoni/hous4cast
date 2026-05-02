import { test, expect } from '@playwright/test'

test.describe('Admin branding palette', () => {
  test('persist branding palette for agency', async ({ page }) => {
    await page.goto('/?lang=en#/admin')

    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: /example agency milano/i }).click()

    const colorInput = page.locator('input[type=color]').first()
    await colorInput.waitFor({ state: 'visible' })
    await colorInput.fill('#123456')

    const saveBtn = page.getByRole('button', { name: /salva/i })
    await expect(saveBtn).toBeEnabled({ timeout: 5000 })
    await saveBtn.click()
    await expect(page.getByText(/salvato/i)).toBeVisible()

    await page.reload()
    await page.getByRole('button', { name: /example agency milano/i }).click()

    await expect(page.locator('input[type=color]').first()).toHaveValue('#123456')
  })
})
