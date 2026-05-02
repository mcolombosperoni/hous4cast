import { test, expect } from '@playwright/test'

test.describe('Admin branding palette', () => {
  test('persist branding palette for agency', async ({ page }) => {
    await page.goto('/?lang=en#/admin')

    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })


    await page.getByRole('button', { name: /example agency milano/i }).click()
    // Attendi che la preview sia montata e abbia almeno 'Caricamento...' o 'Preview Agenzia'
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="palette-preview"]')
      if (!el) return false
      return el.textContent?.includes('Caricamento...') || el.textContent?.includes('Preview Agenzia')
    }, null, { timeout: 10000 })
    const preview = page.locator('[data-testid="palette-preview"]')
    if (await preview.locator('text=Caricamento...').count() > 0) {
      await expect(preview.locator('text=Caricamento...')).toHaveCount(0, { timeout: 10000 })
    }

    const colorInput = page.locator('input[type=color]').first()
    await colorInput.waitFor({ state: 'visible' })
    await colorInput.fill('#123456')

    const saveBtn = page.getByRole('button', { name: /salva/i })
    await expect(saveBtn).toBeEnabled({ timeout: 5000 })
    await saveBtn.click()
    await expect(page.getByText(/salvato/i)).toBeVisible()

    await page.reload()
    await page.getByRole('button', { name: /example agency milano/i }).click()
    // Attendi che la preview sia montata e abbia almeno 'Caricamento...' o 'Preview Agenzia'
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="palette-preview"]')
      if (!el) return false
      return el.textContent?.includes('Caricamento...') || el.textContent?.includes('Preview Agenzia')
    }, null, { timeout: 10000 })
    const preview2 = page.locator('[data-testid="palette-preview"]')
    if (await preview2.locator('text=Caricamento...').count() > 0) {
      await expect(preview2.locator('text=Caricamento...')).toHaveCount(0, { timeout: 10000 })
    }
    await expect(page.locator('input[type=color]').first()).toHaveValue('#123456')
  })

  test('live preview updates as palette changes', async ({ page }) => {
    await page.goto('/?lang=en#/admin')
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /example agency milano/i }).click()
    // Attendi che la preview sia montata e abbia almeno 'Caricamento...' o 'Preview Agenzia'
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="palette-preview"]')
      if (!el) return false
      return el.textContent?.includes('Caricamento...') || el.textContent?.includes('Preview Agenzia')
    }, null, { timeout: 10000 })
    const preview = page.locator('[data-testid="palette-preview"]')
    if (await preview.locator('text=Caricamento...').count() > 0) {
      await expect(preview.locator('text=Caricamento...')).toHaveCount(0, { timeout: 10000 })
    }

    // Change the 'background' color (4th color picker) since that maps directly
    // to the preview div's background-color style property
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
