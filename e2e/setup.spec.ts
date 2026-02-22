import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page, name: string) {
  await page.goto('/login')
  await page.evaluate(() => indexedDB.deleteDatabase('maya-math-db'))
  await page.getByPlaceholder('Введи своё имя...').fill(name)
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/home/)
}

async function goToSetup(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Начать тренировку' }).click()
  await expect(page).toHaveURL(/\/setup/)
}

test.describe('Training setup', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'Тест')
    await goToSetup(page)
  })

  test('should show all setup sections', async ({ page }) => {
    await expect(page.getByText('Операции')).toBeVisible()
    await expect(page.getByText('Сложность')).toBeVisible()
    await expect(page.getByText('Количество примеров')).toBeVisible()
  })

  test('should have multiplication selected by default', async ({ page }) => {
    const multiplicationLabel = page.locator('label').filter({ hasText: 'Умножение' })
    await expect(multiplicationLabel).toHaveClass(/border-pink-400/)
  })

  test('should allow selecting multiple operations', async ({ page }) => {
    await page.locator('label').filter({ hasText: 'Сложение' }).click()
    const additionLabel = page.locator('label').filter({ hasText: 'Сложение' })
    const multiplicationLabel = page.locator('label').filter({ hasText: 'Умножение' })
    await expect(additionLabel).toHaveClass(/border-pink-400/)
    await expect(multiplicationLabel).toHaveClass(/border-pink-400/)
  })

  test('should not allow deselecting last operation', async ({ page }) => {
    await page.locator('label').filter({ hasText: 'Умножение' }).click()
    const multiplicationLabel = page.locator('label').filter({ hasText: 'Умножение' })
    await expect(multiplicationLabel).toHaveClass(/border-pink-400/)
  })

  test('should show specific number selector for single multiplication', async ({ page }) => {
    await expect(page.getByText('Тренировать конкретное число')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Все' })).toBeVisible()
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible()
  })

  test('should hide specific number selector for mixed operations', async ({ page }) => {
    await page.locator('label').filter({ hasText: 'Сложение' }).click()
    await expect(page.getByText('Тренировать конкретное число')).not.toBeVisible()
  })

  test('should show specific number selector for single division', async ({ page }) => {
    await page.locator('label').filter({ hasText: 'Деление' }).click()
    await page.locator('label').filter({ hasText: 'Умножение' }).click()
    await expect(page.getByText('Тренировать конкретное число')).toBeVisible()
  })

  test('should change difficulty', async ({ page }) => {
    const hardButton = page.getByRole('button').filter({ hasText: 'Тяжёлый' }).first()
    await hardButton.click()
    await expect(hardButton).toHaveClass(/border-pink-400/)
  })

  test('should change question count', async ({ page }) => {
    await page.getByRole('button', { name: '20', exact: true }).click()
    await expect(page.getByRole('button', { name: '20', exact: true })).toHaveClass(/border-pink-400/)
  })

  test('should start training session', async ({ page }) => {
    await page.getByRole('button', { name: 'Начать! 🪄' }).click()
    await expect(page).toHaveURL(/\/training/)
  })
})
