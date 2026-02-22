import { test, expect } from '@playwright/test'

async function login(
  page: import('@playwright/test').Page,
  name: string,
  clearDb = true
) {
  await page.goto('/login')
  if (clearDb) {
    await page.evaluate(() => indexedDB.deleteDatabase('maya-math-db'))
    await page.reload()
  }
  await page.getByPlaceholder('Введи своё имя...').fill(name)
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/home/)
}

async function goToSettings(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Настройки' }).click()
  await expect(page).toHaveURL(/\/settings/)
}

test.describe('Settings page', () => {
  test('should display all settings sections', async ({ page }) => {
    await login(page, 'Тест')
    await goToSettings(page)
    await expect(page.getByText('Режим ввода ответов')).toBeVisible()
    await expect(page.getByText('Звук', { exact: true })).toBeVisible()
    await expect(page.getByText('Математика')).toBeVisible()
  })

  test('should default to choices input mode', async ({ page }) => {
    await login(page, 'Тест')
    await goToSettings(page)
    const choicesButton = page.getByRole('button', { name: /Варианты ответов/ })
    await expect(choicesButton).toHaveClass(/border-pink-400/)
  })

  test('should switch to keyboard input mode', async ({ page }) => {
    await login(page, 'Тест')
    await goToSettings(page)
    await page.getByRole('button', { name: /Клавиатура/ }).click()
    const keyboardButton = page.getByRole('button', { name: /Клавиатура/ })
    await expect(keyboardButton).toHaveClass(/border-pink-400/)
  })

  test('should toggle negative numbers', async ({ page }) => {
    await login(page, 'Тест')
    await goToSettings(page)
    const negativeSwitch = page
      .getByText('Отрицательные числа')
      .locator('..')
      .locator('..')
      .getByRole('switch')
    await negativeSwitch.click()
    await expect(negativeSwitch).toHaveAttribute('data-state', 'checked')
  })

  test('should persist settings after logout and re-login', async ({ page }) => {
    await login(page, 'ПерсТест')
    await goToSettings(page)
    await page.getByRole('button', { name: /Клавиатура/ }).click()
    const negativeSwitch = page
      .getByText('Отрицательные числа')
      .locator('..')
      .locator('..')
      .getByRole('switch')
    await negativeSwitch.click()
    await page.getByRole('button', { name: 'Назад' }).click()
    await page.getByRole('button', { name: 'Сменить' }).click()
    await login(page, 'ПерсТест', false)
    await goToSettings(page)
    const keyboardButton = page.getByRole('button', { name: /Клавиатура/ })
    await expect(keyboardButton).toHaveClass(/border-pink-400/)
    const negativeSwitchAfter = page
      .getByText('Отрицательные числа')
      .locator('..')
      .locator('..')
      .getByRole('switch')
    await expect(negativeSwitchAfter).toHaveAttribute('data-state', 'checked')
  })
})
