import { expect, test } from '@playwright/test'

test('lang from search overrides dl from hash query', async ({ page }) => {
  await page.goto('/?lang=en#/estimate/gabetti-busto-arsizio?dl=it')

  await expect(page).toHaveURL(/\?lang=en#\/estimate\/gabetti-busto-arsizio\?dl=it/)
  await expect(page.getByText('Fill in the form to get an estimated value for your property.')).toBeVisible()
})

test('lang from hash query overrides dl from search', async ({ page }) => {
  await page.goto('/?dl=en#/estimate/gabetti-busto-arsizio?lang=it')

  await expect(page).toHaveURL(/\?dl=en&lang=it#\/estimate\/gabetti-busto-arsizio\?lang=it/)
  await expect(page.getByText('Compila il modulo per ottenere una stima di valore del tuo immobile.')).toBeVisible()
})


