import { test, expect } from '@playwright/test'

test('home page is reachable', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /hous4cast/i })).toBeVisible()
})

