import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page, name: string) {
  await page.goto('/login')
  await page.getByPlaceholder('Введи своё имя...').fill(name)
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/home/)
}

test.describe('Login page', () => {
  test('should show login form with title', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Школа Магии Математики')).toBeVisible()
    await expect(page.getByPlaceholder('Введи своё имя...')).toBeVisible()
    const enterButton = page.getByRole('button', { name: 'Войти' })
    await expect(enterButton).toBeVisible()
    await expect(enterButton).toBeDisabled()
  })

  test('should enable button when name is entered', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Введи своё имя...').fill('Тест')
    await expect(page.getByRole('button', { name: 'Войти' })).toBeEnabled()
  })

  test('should login and redirect to home', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Введи своё имя...').fill('Майя')
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page).toHaveURL(/\/home/)
    await expect(page.getByRole('heading', { name: 'Привет, Майя!' })).toBeVisible()
  })

  test('should show existing profiles after first login', async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => indexedDB.deleteDatabase('maya-math-db'))
    await page.reload()
    await page.getByPlaceholder('Введи своё имя...').fill('Майя')
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page).toHaveURL(/\/home/)
    await page.getByRole('button', { name: 'Сменить' }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('button', { name: 'Майя' })).toBeVisible()
  })

  test('should login by clicking existing profile', async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => indexedDB.deleteDatabase('maya-math-db'))
    await page.reload()
    await page.getByPlaceholder('Введи своё имя...').fill('Алиса')
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page).toHaveURL(/\/home/)
    await page.getByRole('button', { name: 'Сменить' }).click()
    await expect(page).toHaveURL(/\/login/)
    await page.getByRole('button', { name: 'Алиса' }).click()
    await expect(page).toHaveURL(/\/home/)
    await expect(page.getByRole('heading', { name: 'Привет, Алиса!' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/\/login/)
  })

  test.describe('when authenticated', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'Тест')
    })

    test('should navigate from home to setup', async ({ page }) => {
      await page.getByRole('button', { name: 'Начать тренировку' }).click()
      await expect(page).toHaveURL(/\/setup/)
    })

    test('should navigate from home to stats', async ({ page }) => {
      await page.getByRole('button', { name: 'Статистика' }).click()
      await expect(page).toHaveURL(/\/stats/)
    })

    test('should navigate from home to settings', async ({ page }) => {
      await page.getByRole('button', { name: 'Настройки' }).click()
      await expect(page).toHaveURL(/\/settings/)
    })

    test('should navigate back from setup', async ({ page }) => {
      await page.getByRole('button', { name: 'Начать тренировку' }).click()
      await expect(page).toHaveURL(/\/setup/)
      await page.getByRole('button', { name: 'Назад' }).click()
      await expect(page).toHaveURL(/\/home/)
    })

    test('should navigate back from stats', async ({ page }) => {
      await page.getByRole('button', { name: 'Статистика' }).click()
      await expect(page).toHaveURL(/\/stats/)
      await page.getByRole('button', { name: 'Назад' }).click()
      await expect(page).toHaveURL(/\/home/)
    })

    test('should navigate back from settings', async ({ page }) => {
      await page.getByRole('button', { name: 'Настройки' }).click()
      await expect(page).toHaveURL(/\/settings/)
      await page.getByRole('button', { name: 'Назад' }).click()
      await expect(page).toHaveURL(/\/home/)
    })
  })
})
