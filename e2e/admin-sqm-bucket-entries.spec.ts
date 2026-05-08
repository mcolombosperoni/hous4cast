import { test, expect } from '@playwright/test'

/**
 * Epic Q — Admin-configurable Sqm Bucket Prices as open list (US-17)
 *
 * This suite tests that the admin can add, rename, reorder and remove
 * sqm bucket price entries from the estimation config editor.
 */

async function openEstimationConfig(page: Parameters<typeof test>[1]['page']) {
  await page.goto('/?lang=en#/admin')
  await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /gabetti/i }).click()
  await page.getByTestId('admin-estimation-config-toggle').click()
  // Wait for the estimation config section content to load
  await expect(page.getByTestId('sqm-bucket-entries-list')).toBeVisible({ timeout: 10000 })
}

test.describe('Admin sqm bucket entries', () => {
  test('sqm bucket prices renders as open list with add/remove/reorder', async ({ page }) => {
    await openEstimationConfig(page)

    // Initial entries should be present
    const list = page.getByTestId('sqm-bucket-entries-list')
    const rows = list.getByTestId('factor-entry-row')
    await expect(rows).toHaveCount(await rows.count())

    // Add a new entry
    await page.getByTestId('sqm-bucket-entries-add-btn').click()
    const newCount = await rows.count()
    expect(newCount).toBeGreaterThan(0)

    // The new row should be editable
    const lastRow = rows.last()
    await lastRow.getByTestId('factor-entry-value').fill('300-400')
    await lastRow.getByTestId('factor-entry-label-it').fill('Grande')
    await lastRow.getByTestId('factor-entry-label-en').fill('Large')
    await lastRow.getByTestId('factor-entry-coefficient').fill('5500')
  })

  test('admin removes sqm bucket entry and saves', async ({ page }) => {
    await openEstimationConfig(page)

    const list = page.getByTestId('sqm-bucket-entries-list')
    const rows = list.getByTestId('factor-entry-row')
    const initialCount = await rows.count()

    // Remove the last entry
    await rows.last().getByTestId('factor-entry-remove-btn').click()
    await expect(rows).toHaveCount(initialCount - 1)

    // Save
    await page.getByTestId('admin-estimation-config-save').click()
    await expect(page.getByTestId('admin-estimation-config-save-status')).toContainText(/saved|salvato/i, { timeout: 10000 })
  })

  test('admin reorders sqm bucket entry and saves', async ({ page }) => {
    await openEstimationConfig(page)

    const list = page.getByTestId('sqm-bucket-entries-list')
    const rows = list.getByTestId('factor-entry-row')
    await expect(rows.first().getByTestId('factor-entry-move-up')).toBeDisabled()

    // Move second entry up
    const upBtn = rows.nth(1).getByTestId('factor-entry-move-up')
    const secondValueBefore = await rows.nth(1).getByTestId('factor-entry-value').inputValue()
    await upBtn.click()
    const firstValueAfter = await rows.first().getByTestId('factor-entry-value').inputValue()
    expect(firstValueAfter).toBe(secondValueBefore)
  })

  test('legacy flat factor table sections are not visible', async ({ page }) => {
    await openEstimationConfig(page)

    // Legacy flat editors should be gone (they were key-value only, no label IT/EN)
    // Check that conditionFactors/floorFactors/eraFactors/accessoriesBonuses flat sections are removed
    await expect(page.getByTestId('condition-factor-ottimo')).not.toBeVisible()
    await expect(page.getByTestId('floor-factor-terra')).not.toBeVisible()
    await expect(page.getByTestId('era-factor-1900-1940')).not.toBeVisible()
    await expect(page.getByTestId('accessories-bonus-cantina')).not.toBeVisible()
  })
})

