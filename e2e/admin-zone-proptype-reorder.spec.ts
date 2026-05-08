import { test, expect } from '@playwright/test'

/**
 * Epic R — Zone and property type reorder/remove in admin (US-18)
 *
 * Tests that the admin can reorder and remove zones and property types
 * from the estimation config editor, using the same UX as factor entries.
 */

async function openEstimationConfig(page: Parameters<typeof test>[1]['page']) {
  await page.goto('/?lang=en#/admin')
  await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
  // Clear any stored overrides to start from a clean state
  await page.evaluate(() => {
    Object.keys(localStorage).filter(k => k.startsWith('estimationConfig')).forEach(k => localStorage.removeItem(k))
  })
  await page.getByRole('button', { name: /gabetti/i }).click()
  await page.getByTestId('admin-estimation-config-toggle').click()
  // Wait for estimation config loaded
  await expect(page.getByTestId('estimation-config-loaded')).toBeVisible({ timeout: 10000 })
  // Wait for zones section
  await expect(page.getByTestId('zone-id-centro')).toBeVisible({ timeout: 10000 })
}

test.describe('Admin zone reorder and remove', () => {
  test('first zone has move-up disabled', async ({ page }) => {
    await openEstimationConfig(page)
    const firstZoneMoveUp = page.getByTestId('zone-move-up-0')
    await expect(firstZoneMoveUp).toBeDisabled()
  })

  test('admin moves second zone up and order changes', async ({ page }) => {
    await openEstimationConfig(page)

    // Get the second zone id before reorder
    const secondZoneId = await page.getByTestId('zone-id-row-1').innerText()

    // Click move up on second zone
    await page.getByTestId('zone-move-up-1').click()

    // The first row should now be what was previously second
    const firstZoneIdAfter = await page.getByTestId('zone-id-row-0').innerText()
    expect(firstZoneIdAfter.trim()).toContain(secondZoneId.trim())
  })

  test('admin removes a zone and it disappears from the list', async ({ page }) => {
    await openEstimationConfig(page)

    // Count zones before
    const zoneRows = page.locator('[data-testid^="zone-id-row-"]')
    const initialCount = await zoneRows.count()

    // Remove the last zone
    await page.getByTestId(`zone-remove-${initialCount - 1}`).click()
    await expect(zoneRows).toHaveCount(initialCount - 1)
  })
})

test.describe('Admin property type reorder and remove', () => {
  test('first property type has move-up disabled', async ({ page }) => {
    // Need a config with at least 2 property types — add one if needed
    await openEstimationConfig(page)

    // Add property type if there's only one
    const propertyTypeRows = page.locator('[data-testid^="property-type-row-"]')
    const count = await propertyTypeRows.count()
    if (count < 2) {
      await page.getByTestId('property-type-add-input').fill('villa')
      await page.getByTestId('property-type-add-btn').click()
    }

    await expect(page.getByTestId('property-type-move-up-0')).toBeDisabled()
  })

  test('admin moves second property type up and order changes', async ({ page }) => {
    await openEstimationConfig(page)

    // Ensure at least 2 property types
    const propertyTypeRows = page.locator('[data-testid^="property-type-row-"]')
    const count = await propertyTypeRows.count()
    if (count < 2) {
      await page.getByTestId('property-type-add-input').fill('villa')
      await page.getByTestId('property-type-add-btn').click()
    }

    const secondValue = await page.getByTestId('property-type-row-1').innerText()
    await page.getByTestId('property-type-move-up-1').click()
    const firstValueAfter = await page.getByTestId('property-type-row-0').innerText()
    expect(firstValueAfter.trim()).toContain(secondValue.trim())
  })

  test('admin removes a property type', async ({ page }) => {
    await openEstimationConfig(page)

    const propertyTypeRows = page.locator('[data-testid^="property-type-row-"]')
    const count = await propertyTypeRows.count()
    if (count < 2) {
      await page.getByTestId('property-type-add-input').fill('villa')
      await page.getByTestId('property-type-add-btn').click()
    }

    const countBefore = await propertyTypeRows.count()
    await page.getByTestId(`property-type-remove-${countBefore - 1}`).click()
    await expect(propertyTypeRows).toHaveCount(countBefore - 1)
  })
})

test.describe('Admin property type IT/EN labels', () => {
  test('property type rows show IT and EN label inputs', async ({ page }) => {
    await openEstimationConfig(page)
    // First property type (appartamento) should have label inputs pre-filled
    await expect(page.getByTestId('property-type-label-it-0')).toBeVisible()
    await expect(page.getByTestId('property-type-label-en-0')).toBeVisible()
    const itValue = await page.getByTestId('property-type-label-it-0').inputValue()
    const enValue = await page.getByTestId('property-type-label-en-0').inputValue()
    expect(itValue.length).toBeGreaterThan(0)
    expect(enValue.length).toBeGreaterThan(0)
  })

  test('admin edits property type IT label and it persists after save', async ({ page }) => {
    await openEstimationConfig(page)
    const labelItInput = page.getByTestId('property-type-label-it-0')
    await labelItInput.fill('Appartamento Custom IT')
    await page.getByTestId('estimation-config-save').click()
    await expect(page.getByTestId('estimation-config-saved-msg')).toBeVisible({ timeout: 5000 })
    // Reload admin and check the value persisted
    await page.reload()
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /gabetti/i }).click()
    await page.getByTestId('admin-estimation-config-toggle').click()
    await expect(page.getByTestId('estimation-config-loaded')).toBeVisible({ timeout: 10000 })
    const savedValue = await page.getByTestId('property-type-label-it-0').inputValue()
    expect(savedValue).toBe('Appartamento Custom IT')
  })

  test('localized property type label appears in estimate form select', async ({ page }) => {
    await openEstimationConfig(page)
    // Add a second property type so the selector appears in the estimate form
    await page.getByTestId('property-type-add-input').fill('villa')
    await page.getByTestId('property-type-add-btn').click()
    // Edit the villa IT label
    const villaRow = page.locator('[data-testid^="property-type-row-"]').last()
    const villaLabelIt = villaRow.locator('[data-testid*="property-type-label-it"]')
    await villaLabelIt.fill('Villa Custom')
    await page.getByTestId('estimation-config-save').click()
    await expect(page.getByTestId('estimation-config-saved-msg')).toBeVisible({ timeout: 5000 })
    // Navigate to estimate page in IT locale and check label appears
    await page.goto('/?lang=it#/estimate/gabetti-busto-arsizio')
    await expect(page.getByTestId('propertyType')).toBeVisible({ timeout: 10000 })
    const options = await page.getByTestId('propertyType').locator('option').allTextContents()
    expect(options.some(o => o.includes('Villa Custom'))).toBe(true)
  })
})
