import { expect, test } from '@playwright/test'

test('locale preference persists across route changes and reload', async ({ page }) => {
  await page.goto('/?lang=en#/')

  await page.getByRole('button', { name: 'Italiano' }).click()
  await expect(
    page.getByText('Pagine di stima basate su configurazione, condivise tramite QR code.'),
  ).toBeVisible()

  await page.goto('/#/admin')
  await expect(page.getByRole('heading', { name: 'Amministrazione' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Amministrazione' })).toBeVisible()

  const storedLocale = await page.evaluate(() => window.localStorage.getItem('preferredLocale'))
  expect(storedLocale).toBe('it')
})

test('theme preference persists across route changes and reload', async ({ page }) => {
  await page.goto('/?lang=en#/')

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true)

  await page.goto('/#/estimate/gabetti-busto-arsizio')
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true)

  await page.reload()
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()

  const storedTheme = await page.evaluate(() => window.localStorage.getItem('preferredTheme'))
  expect(storedTheme).toBe('dark')
})

