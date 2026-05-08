import { test, expect } from '@playwright/test'

/**
 * Epic S — Dynamic agency creation from admin (US-19)
 *
 * Covers the full "Add Agency" flow: create a new agency from the admin UI,
 * configure it, and verify persistence and estimate page availability.
 */

async function goToAdmin(page: Parameters<typeof test>[1]['page']) {
  await page.goto('/?lang=en#/admin')
  await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
}

async function clearDynamicAgencies(page: Parameters<typeof test>[1]['page']) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('hous4cast:agency') || k === 'hous4cast:agencyIds')
      .forEach(k => localStorage.removeItem(k))
  })
}

test.describe('Add Agency — admin UI', () => {
  test.beforeEach(async ({ page }) => {
    await goToAdmin(page)
    await clearDynamicAgencies(page)
    await page.reload()
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
  })

  test('"Add Agency" button is visible on the admin page', async ({ page }) => {
    await expect(page.getByTestId('add-agency-btn')).toBeVisible()
  })

  test('clicking "Add Agency" opens a name input form', async ({ page }) => {
    await page.getByTestId('add-agency-btn').click()
    await expect(page.getByTestId('new-agency-name-input')).toBeVisible()
    await expect(page.getByTestId('new-agency-confirm-btn')).toBeVisible()
    await expect(page.getByTestId('new-agency-cancel-btn')).toBeVisible()
  })

  test('submitting empty name shows a validation error', async ({ page }) => {
    await page.getByTestId('add-agency-btn').click()
    await page.getByTestId('new-agency-confirm-btn').click()
    await expect(page.getByTestId('new-agency-name-error')).toBeVisible()
  })

  test('creating an agency with a valid name adds a card to the list', async ({ page }) => {
    const name = 'Test Agency E2E'
    await page.getByTestId('add-agency-btn').click()
    await page.getByTestId('new-agency-name-input').fill(name)
    await page.getByTestId('new-agency-confirm-btn').click()
    // The new agency card should appear — look for the button containing the agency name
    await expect(page.locator('[data-testid^="config-card-"]').filter({ hasText: name })).toBeVisible({ timeout: 5000 })
  })

  test('new agency card is auto-selected and estimation config auto-opens', async ({ page }) => {
    await page.getByTestId('add-agency-btn').click()
    await page.getByTestId('new-agency-name-input').fill('Auto Select Agency')
    await page.getByTestId('new-agency-confirm-btn').click()
    // Estimation config section should be open (showing the editor)
    await expect(page.getByTestId('estimation-config-loaded')).toBeVisible({ timeout: 10000 })
  })

  test('dynamic agency persists after page reload', async ({ page }) => {
    const name = 'Persistent Agency'
    await page.getByTestId('add-agency-btn').click()
    await page.getByTestId('new-agency-name-input').fill(name)
    await page.getByTestId('new-agency-confirm-btn').click()
    await expect(page.locator('[data-testid^="config-card-"]').filter({ hasText: name })).toBeVisible({ timeout: 5000 })
    // Reload and check it still appears
    await page.reload()
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid^="config-card-"]').filter({ hasText: name })).toBeVisible({ timeout: 5000 })
  })

  test('cancel button closes the add-agency form without creating an agency', async ({ page }) => {
    const initialCards = await page.locator('[data-testid^="config-card-"]').count()
    await page.getByTestId('add-agency-btn').click()
    await page.getByTestId('new-agency-name-input').fill('Cancelled Agency')
    await page.getByTestId('new-agency-cancel-btn').click()
    await expect(page.getByTestId('new-agency-name-input')).not.toBeVisible()
    expect(await page.locator('[data-testid^="config-card-"]').count()).toBe(initialCards)
  })
})

test.describe('Dynamic agency — sqmRange and agencyName editing', () => {
  test.beforeEach(async ({ page }) => {
    await goToAdmin(page)
    await clearDynamicAgencies(page)
    await page.reload()
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    // Create a dynamic agency
    await page.getByTestId('add-agency-btn').click()
    await page.getByTestId('new-agency-name-input').fill('Editable Agency')
    await page.getByTestId('new-agency-confirm-btn').click()
    await expect(page.getByTestId('estimation-config-loaded')).toBeVisible({ timeout: 10000 })
  })

  test('dynamic agency estimation config shows agencyName input', async ({ page }) => {
    await expect(page.getByTestId('agency-name-input')).toBeVisible()
    const value = await page.getByTestId('agency-name-input').inputValue()
    expect(value).toBe('Editable Agency')
  })

  test('dynamic agency shows sqmRange min/max inputs', async ({ page }) => {
    await expect(page.getByTestId('sqm-range-min')).toBeVisible()
    await expect(page.getByTestId('sqm-range-max')).toBeVisible()
  })

  test('editing agencyName and saving persists the new name', async ({ page }) => {
    await expect(page.getByTestId('estimation-config-save')).not.toBeDisabled({ timeout: 5000 })
    const input = page.getByTestId('agency-name-input')
    await input.fill('Renamed Agency')
    // Verify the input was updated
    await expect(input).toHaveValue('Renamed Agency')
    await page.getByTestId('estimation-config-save').click()
    await expect(page.getByTestId('estimation-config-save-status')).toBeVisible({ timeout: 8000 })
    // Verify the new name was persisted in localStorage
    const savedAgencyName = await page.evaluate(() => {
      const ids = JSON.parse(localStorage.getItem('hous4cast:agencyIds') || '[]') as string[]
      if (!ids.length) return 'NO IDS'
      const cfg = JSON.parse(localStorage.getItem(`hous4cast:agency:${ids[0]}`) || 'null') as { agencyName?: string } | null
      return cfg?.agencyName ?? 'NO AGENCY NAME'
    })
    expect(savedAgencyName).toBe('Renamed Agency')
    // Reload and verify the card shows the new name
    await page.reload()
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    await page.locator('[data-testid^="config-card-"]').last().click()
    await page.getByTestId('admin-estimation-config-toggle').click()
    await expect(page.getByTestId('estimation-config-loaded')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('agency-name-input')).toHaveValue('Renamed Agency')
  })

  test('editing sqmRange and saving persists the values', async ({ page }) => {
    await expect(page.getByTestId('estimation-config-save')).not.toBeDisabled({ timeout: 5000 })
    await page.getByTestId('sqm-range-min').fill('30')
    await page.getByTestId('sqm-range-max').fill('600')
    await page.getByTestId('estimation-config-save').click()
    await expect(page.getByTestId('estimation-config-save-status')).toBeVisible({ timeout: 8000 })
    // Reload and re-open estimation config for the same agency
    await page.reload()
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    await page.locator('[data-testid^="config-card-"]').filter({ hasText: 'Editable Agency' }).click()
    await page.getByTestId('admin-estimation-config-toggle').click()
    await expect(page.getByTestId('estimation-config-loaded')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('sqm-range-min')).toHaveValue('30')
    await expect(page.getByTestId('sqm-range-max')).toHaveValue('600')
  })
})

test.describe('Dynamic agency — estimate page', () => {
  test('estimate page is accessible for a newly created dynamic agency', async ({ page }) => {
    await goToAdmin(page)
    await clearDynamicAgencies(page)
    await page.reload()
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible({ timeout: 10000 })
    // Create agency
    await page.getByTestId('add-agency-btn').click()
    await page.getByTestId('new-agency-name-input').fill('Estimate Test Agency')
    await page.getByTestId('new-agency-confirm-btn').click()
    await expect(page.getByTestId('estimation-config-loaded')).toBeVisible({ timeout: 10000 })
    // Get the agency ID to navigate to estimate page
    const idEl = page.locator('[data-testid^="config-card-"]').last().locator('p', { hasText: 'ID:' })
    const idText = await idEl.textContent()
    const agencyId = idText?.replace('ID:', '').trim()
    // Navigate to estimate page
    await page.goto(`/?lang=en#/estimate/${agencyId}`)
    await expect(page.getByTestId('estimate-form')).toBeVisible({ timeout: 10000 })
  })
})













