import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import os from 'os'

/**
 * Creates a minimal valid 1x1 red PNG at a temporary path for upload testing.
 */
function createTempPng(suffix = ''): string {
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADklEQVQI12P4z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg=='
  const buf = Buffer.from(base64, 'base64')
  const tmpPath = path.join(os.tmpdir(), `test-img-${Date.now()}${suffix}.png`)
  fs.writeFileSync(tmpPath, buf)
  return tmpPath
}

function safeUnlink(p: string) {
  try { fs.unlinkSync(p) } catch { /* ignore if already gone */ }
}

test.describe('Admin branding images', () => {
  test('logo upload shows preview image in accordion and in palette preview', async ({ page }) => {
    await page.goto('/?lang=en#/admin')
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })

    // Select an agency
    await page.getByRole('button', { name: /example agency milano/i }).click()
    // Wait for branding UI to be fully loaded (color pickers visible = loading done)
    await expect(page.locator('input[type=color]').first()).toBeVisible({ timeout: 10000 })

    // Open Logo section
    await page.getByRole('button', { name: /logo/i }).click()

    const tmpPng = createTempPng('-logo')
    await page.locator('[data-testid="logo-upload-input"]').setInputFiles(tmpPng)
    safeUnlink(tmpPng)

    // Preview image should appear in accordion
    await expect(page.locator('[data-testid="logo-preview"]')).toBeVisible({ timeout: 10000 })

    // Logo should also be present in the palette preview panel
    await expect(page.locator('[data-testid="preview-logo"]')).toBeAttached({ timeout: 10000 })

    // Remove button should be visible
    await expect(page.locator('[data-testid="logo-delete-btn"]')).toBeVisible()
  })

  test('cover image upload shows preview in accordion and in palette preview', async ({ page }) => {
    await page.goto('/?lang=en#/admin')
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })

    // Select an agency
    await page.getByRole('button', { name: /example agency milano/i }).click()
    await expect(page.locator('input[type=color]').first()).toBeVisible({ timeout: 10000 })

    // Open Immagine section
    await page.getByRole('button', { name: /immagine/i }).click()

    const tmpPng = createTempPng('-cover')
    await page.locator('[data-testid="cover-upload-input"]').setInputFiles(tmpPng)
    safeUnlink(tmpPng)

    // Preview image should appear in accordion
    await expect(page.locator('[data-testid="cover-preview"]')).toBeVisible({ timeout: 10000 })

    // Cover should also be present in the palette preview panel
    await expect(page.locator('[data-testid="preview-cover"]')).toBeAttached({ timeout: 10000 })

    // Remove button should be visible
    await expect(page.locator('[data-testid="cover-delete-btn"]')).toBeVisible()
  })

  test('logo remove button clears the preview', async ({ page }) => {
    await page.goto('/?lang=en#/admin')
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: /example agency milano/i }).click()
    await expect(page.locator('input[type=color]').first()).toBeVisible({ timeout: 10000 })

    // Upload logo
    await page.getByRole('button', { name: /logo/i }).click()
    const tmpPng = createTempPng('-del')
    await page.locator('[data-testid="logo-upload-input"]').setInputFiles(tmpPng)
    safeUnlink(tmpPng)
    await expect(page.locator('[data-testid="logo-preview"]')).toBeVisible({ timeout: 10000 })

    // Click remove
    await page.locator('[data-testid="logo-delete-btn"]').click()

    // Preview should disappear
    await expect(page.locator('[data-testid="logo-preview"]')).toHaveCount(0, { timeout: 5000 })
    await expect(page.locator('[data-testid="preview-logo"]')).toHaveCount(0, { timeout: 5000 })
  })
})
