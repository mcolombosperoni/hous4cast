import { test, expect } from '@playwright/test'

test('privacy checkbox is required to submit estimate', async ({ page }) => {
  await page.goto('/#/estimate/gabetti-busto-arsizio')

  // Compila tutti i campi tranne privacy
  await page.getByLabel('Zona').selectOption('centro')
  await page.getByLabel('Tipo immobile').selectOption('appartamento')
  await page.getByLabel('Superficie (m²)').fill('100')

  // Prova a inviare senza privacy
  await page.getByRole('button', { name: /calcola stima/i }).click()
  await expect(page.getByText('Ho letto e accetto l’informativa privacy')).toBeVisible()
  await expect(page.getByText('Devi accettare per continuare')).toBeVisible()

  // Ora seleziona privacy e invia
  await page.getByLabel('Ho letto e accetto l’informativa privacy').check()
  await page.getByRole('button', { name: /calcola stima/i }).click()
  // Dovrebbe apparire la stima (controllo presenza testo risultato)
  await expect(page.getByText(/stima di valore/i)).toBeVisible()
})

