import { expect, test } from '@playwright/test'

test('admin flow supports config selection and preview link with dl', async ({ page }) => {
  await page.goto('/?lang=en#/admin')

  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
  await expect(page.getByText('Selected configuration')).toHaveCount(0)

  const gabettiCard = page.getByRole('button', { name: /gabetti busto arsizio/i })
  await gabettiCard.click()

  await expect(page.getByText('Selected configuration')).toBeVisible()

  const previewLink = page.getByRole('link', { name: 'Open estimate preview' })
  await expect(previewLink).toHaveAttribute('href', '#/estimate/gabetti-busto-arsizio?dl=en')

  const dlSection = page.locator('section').filter({ hasText: 'QR default locale (dl)' })
  await dlSection.getByRole('button', { name: 'IT' }).click()
  await expect(previewLink).toHaveAttribute('href', '#/estimate/gabetti-busto-arsizio?dl=it')
})

test('admin print qr link opens printable page for selected config', async ({ page, context }) => {
  await page.goto('/?lang=en#/admin')

  await page.getByRole('button', { name: /example agency milano/i }).click()

  const popupPromise = context.waitForEvent('page')
  await page.getByRole('link', { name: 'Print QR' }).click()
  const printPage = await popupPromise

  await printPage.waitForLoadState('domcontentloaded')
  await expect(printPage.getByRole('heading', { name: 'Example Agency Milano' })).toBeVisible()
  await expect(printPage.getByRole('button', { name: 'Print' })).toBeVisible()
  await expect(printPage).toHaveURL(/\/admin\/qr\/example-agency-milano\?dl=en/)
  await expect(printPage.locator('svg')).toBeVisible()
})

test('estimate page shows fallback when configId is invalid', async ({ page }) => {
  await page.goto('/?lang=en#/estimate/unknown-agency')

  await expect(page.getByRole('heading', { name: 'Configuration not found' })).toBeVisible()
  await expect(page.getByText('No agency matches the identifier "unknown-agency".')).toBeVisible()
})

test('print qr page shows fallback and no qr when configId is invalid', async ({ page }) => {
  await page.goto('/#/admin/qr/unknown-agency?dl=en')

  await expect(page.getByText('Configuration not found.')).toBeVisible()
  await expect(page.locator('svg')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Print' })).toHaveCount(0)
})


