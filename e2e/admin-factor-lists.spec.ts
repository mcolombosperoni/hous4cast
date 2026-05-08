/**
 * E2E acceptance tests — Epic P: Admin open-list factor editing (US-16)
 *
 * Tests follow outside-in approach: describe user journeys before
 * implementing the admin editor. Tests start as "red" and turn green
 * once Commits 4–7 are in place.
 *
 * Actor: agency admin
 * Stories covered: US-16
 */
import { test, expect } from '@playwright/test'

// Helper: navigate to admin and select Gabetti config
async function openAdmin(page: Parameters<typeof test>[1]['page']) {
  await page.goto('/#/admin')
  await page.getByTestId('config-card-gabetti-busto-arsizio').click()
}

// Shared beforeEach: block Firestore and clear estimation config overrides
async function cleanupBeforeEach(page: Parameters<typeof test>[1]['page']) {
  await page.route(/firestore\.googleapis\.com/, (route) => route.abort())
  await page.goto('/')
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('hous4cast:estimationConfig:'))
      .forEach((k) => localStorage.removeItem(k))
  })
}

// ---------------------------------------------------------------------------
// T78: Admin adds a new conditionEntry → appears in estimate form
// ---------------------------------------------------------------------------
test.describe('T78 — admin adds new condition entry', () => {
  test.beforeEach(async ({ page }) => { await cleanupBeforeEach(page) })
  test('new entry appears in estimate form select', async ({ page }) => {
    await openAdmin(page)

    // Navigate to estimation config section
    await page.getByTestId('admin-estimation-config-toggle').click()
    await page.getByTestId('estimation-config-loaded').waitFor()

    // Add a new condition entry
    await page.getByTestId('condition-entries-add-btn').click()
    const rows = page.getByTestId('condition-entries-list').getByTestId('factor-entry-row')
    const newRow = rows.last()
    await newRow.getByTestId('factor-entry-value').fill('ristrutturato')
    await newRow.getByTestId('factor-entry-label-it').fill('Ristrutturato')
    await newRow.getByTestId('factor-entry-label-en').fill('Renovated')
    await newRow.getByTestId('factor-entry-coefficient').fill('0.85')

    // Save
    await page.getByTestId('estimation-config-save').click()
    await page.getByTestId('estimation-config-saved-msg').waitFor()

    // Navigate to estimate page and check option appears
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await expect(page.locator('select[name="condition"] option[value="ristrutturato"]')).toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// T79: Admin renames a factor label → updated label shown in form
// ---------------------------------------------------------------------------
test.describe('T79 — admin renames factor label', () => {
  test.beforeEach(async ({ page }) => { await cleanupBeforeEach(page) })
  test('renamed label is shown in estimate form', async ({ page }) => {
    await openAdmin(page)
    await page.getByTestId('admin-estimation-config-toggle').click()
    await page.getByTestId('estimation-config-loaded').waitFor()

    // Find the "ottimo" row and rename its Italian label
    const ottimRow = page.getByTestId('factor-entry-row-ottimo')
    await ottimRow.getByTestId('factor-entry-label-it').fill('Eccellente')
    await ottimRow.getByTestId('factor-entry-label-en').fill('Excellent')

    await page.getByTestId('estimation-config-save').click()
    await page.getByTestId('estimation-config-saved-msg').waitFor()

    // Estimate form should now show 'Eccellente' as the option text
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await expect(page.locator('select[name="condition"] option[value="ottimo"]')).toHaveText('Eccellente')
  })
})

// ---------------------------------------------------------------------------
// T80: Admin removes a factor entry → option absent in form
// ---------------------------------------------------------------------------
test.describe('T80 — admin removes a factor entry', () => {
  test.beforeEach(async ({ page }) => { await cleanupBeforeEach(page) })
  test('removed entry does not appear in estimate form select', async ({ page }) => {
    await openAdmin(page)
    await page.getByTestId('admin-estimation-config-toggle').click()
    await page.getByTestId('estimation-config-loaded').waitFor()

    // Remove the "da_ristrutturare" entry
    await page.getByTestId('factor-entry-row-da_ristrutturare').getByTestId('factor-entry-remove-btn').click()

    await page.getByTestId('estimation-config-save').click()
    await page.getByTestId('estimation-config-saved-msg').waitFor()

    // Estimate form must not have the removed option
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    await expect(page.locator('select[name="condition"] option[value="da_ristrutturare"]')).not.toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// T81: Admin reorders entries → order reflected in form select
// ---------------------------------------------------------------------------
test.describe('T81 — admin reorders factor entries', () => {
  test.beforeEach(async ({ page }) => { await cleanupBeforeEach(page) })
  test('reordered entries shown in new order in estimate form', async ({ page }) => {
    await openAdmin(page)
    await page.getByTestId('admin-estimation-config-toggle').click()
    await page.getByTestId('estimation-config-loaded').waitFor()

    // Move "da_ristrutturare" (index 2) up twice so it becomes first
    await page.getByTestId('factor-entry-row-da_ristrutturare').getByTestId('factor-entry-move-up').click()
    await page.getByTestId('factor-entry-row-da_ristrutturare').getByTestId('factor-entry-move-up').click()

    await page.getByTestId('estimation-config-save').click()
    await page.getByTestId('estimation-config-saved-msg').waitFor()

    // Estimate form options order should start with da_ristrutturare
    await page.goto('/#/estimate/gabetti-busto-arsizio')
    const options = await page.locator('select[name="condition"] option').evaluateAll(
      (els: Element[]) => els.map((el) => el.getAttribute('value')),
    )
    // first real option (skip empty placeholder if any)
    const first = options.find((v) => v && v !== '')
    expect(first).toBe('da_ristrutturare')
  })
})

// ---------------------------------------------------------------------------
// T82: Form labels come from config entries, not i18n.ts hardcoded values
// ---------------------------------------------------------------------------
test.describe('T82 — form labels sourced from config entries', () => {
  test.beforeEach(async ({ page }) => { await cleanupBeforeEach(page) })
  test('changing label in admin updates form option text (not from hardcoded i18n)', async ({ page }) => {
    await openAdmin(page)
    await page.getByTestId('admin-estimation-config-toggle').click()
    await page.getByTestId('estimation-config-loaded').waitFor()

    // Change Italian label of "buono" to a distinctive unique string
    const buonoRow = page.getByTestId('factor-entry-row-buono')
    await buonoRow.getByTestId('factor-entry-label-it').fill('BuonoModificato')

    await page.getByTestId('estimation-config-save').click()
    await page.getByTestId('estimation-config-saved-msg').waitFor()

    // Estimate form (IT locale) should show the custom label, not 'Buono'
    await page.goto('/#/estimate/gabetti-busto-arsizio?lang=it')
    await expect(page.locator('select[name="condition"] option[value="buono"]')).toHaveText('BuonoModificato')
  })
})
