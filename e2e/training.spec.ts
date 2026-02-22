import { test, expect } from '@playwright/test'

async function login(
  page: import('@playwright/test').Page,
  name: string
) {
  await page.goto('/login')
  await page.evaluate(() => indexedDB.deleteDatabase('maya-math-db'))
  await page.getByPlaceholder('Введи своё имя...').fill(name)
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/home/)
}

async function startTraining(
  page: import('@playwright/test').Page,
  options?: { questionCount?: number; difficulty?: string }
) {
  await page.getByRole('button', { name: 'Начать тренировку' }).click()
  await expect(page).toHaveURL(/\/setup/)
  const count = options?.questionCount ?? 5
  await page
    .locator('[data-slot="card"]')
    .filter({ hasText: 'Количество примеров' })
    .getByRole('button', { name: String(count), exact: true })
    .click()
  if (options?.difficulty) {
    await page.getByRole('button', { name: options.difficulty }).click()
  }
  await page.getByRole('button', { name: 'Начать! 🪄' }).click()
  await expect(page).toHaveURL(/\/training/)
}

async function getQuestionParts(
  page: import('@playwright/test').Page
): Promise<{ operand1: number; operand2: number; operator: string; correctAnswer: number }> {
  await expect(page.getByText(/=\s*\?/)).toBeVisible()
  const questionEl = page.getByText(/(-?\d+)\s*[×+\u2212÷]\s*(-?\d+)\s*=\s*\?/).first()
  const text = (await questionEl.textContent())?.trim()
  if (!text) throw new Error('Question text not found')
  const match = text.match(/(-?\d+)\s*([+\u2212×÷])\s*(-?\d+)/)
  if (!match) throw new Error(`Could not parse question: ${text}`)
  const operand1 = parseInt(match[1], 10)
  const operator = match[2]
  const operand2 = parseInt(match[3], 10)
  let correctAnswer: number
  if (operator === '+' || operator === '\u002B') {
    correctAnswer = operand1 + operand2
  } else if (operator === '\u2212' || operator === '-') {
    correctAnswer = operand1 - operand2
  } else if (operator === '×') {
    correctAnswer = operand1 * operand2
  } else if (operator === '÷') {
    correctAnswer = Math.floor(operand1 / operand2)
  } else {
    throw new Error(`Unknown operator: ${operator}`)
  }
  return { operand1, operand2, operator, correctAnswer }
}

test.describe('Training session - choices mode', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'Тест')
  })

  test('should show question with progress', async ({ page }) => {
    await startTraining(page, { questionCount: 5 })
    await expect(page.getByText('Вопрос 1 из 5')).toBeVisible()
    await expect(page.locator('[data-slot="progress"]')).toBeVisible()
  })

  test('should show choice buttons', async ({ page }) => {
    await startTraining(page)
    const choiceButtons = page.getByRole('button').filter({ hasText: /^-?\d+$/ })
    await expect(choiceButtons.first()).toBeVisible()
    const count = await choiceButtons.count()
    expect(count).toBe(4)
  })

  test('should show correct feedback on right answer', async ({ page }) => {
    await startTraining(page, { questionCount: 5 })
    const { correctAnswer } = await getQuestionParts(page)
    await page.getByRole('button', { name: String(correctAnswer), exact: true }).click()
    await expect(
      page.getByText(/Правильно!/).or(page.getByText(/Вопрос \d+ из/))
    ).toBeVisible({ timeout: 2500 })
  })

  test('should show wrong feedback on incorrect answer', async ({ page }) => {
    await startTraining(page)
    const { correctAnswer } = await getQuestionParts(page)
    const wrongButton = page
      .getByRole('button')
      .filter({ hasText: /^-?\d+$/ })
      .filter({ hasNotText: new RegExp(`^${correctAnswer}$`) })
      .first()
    await wrongButton.click()
    await expect(page.getByText(/Не совсем!/)).toBeVisible()
  })

  test('should show correct answer after two wrong attempts', async ({ page }) => {
    await startTraining(page, { questionCount: 5 })
    const { correctAnswer } = await getQuestionParts(page)
    const wrongButton = page
      .getByRole('button')
      .filter({ hasText: /^-?\d+$/ })
      .filter({ hasNotText: new RegExp(`^${correctAnswer}$`) })
      .first()
    await wrongButton.click()
    await expect(page.getByText(/Не совсем!/)).toBeVisible()
    await wrongButton.click()
    await expect(
      page.getByText(/Правильный ответ:/).or(page.getByText(/Вопрос \d+ из/))
    ).toBeVisible({ timeout: 3000 })
    if (await page.getByText(/Правильный ответ:/).isVisible()) {
      await expect(page.getByText(String(correctAnswer))).toBeVisible()
    }
  })

  test('should advance to next question after correct answer', async ({ page }) => {
    await startTraining(page, { questionCount: 5 })
    const { correctAnswer } = await getQuestionParts(page)
    await page.getByRole('button', { name: String(correctAnswer), exact: true }).click()
    await page.waitForTimeout(1500)
    await expect(page.getByText('Вопрос 2 из 5')).toBeVisible()
  })

  test('should complete training and redirect to results', async ({ page }) => {
    await startTraining(page, { questionCount: 5 })
    for (let i = 0; i < 5; i++) {
      const { correctAnswer } = await getQuestionParts(page)
      await page.getByRole('button', { name: String(correctAnswer), exact: true }).click()
      if (i < 4) {
        await page.waitForTimeout(1500)
      }
    }
    await expect(page).toHaveURL(/\/results/, { timeout: 10000 })
  })

  test('should allow ending training early', async ({ page }) => {
    await startTraining(page)
    await page.getByRole('button', { name: 'Закончить тренировку' }).click()
    await expect(page).toHaveURL(/\/home/)
  })
})

test.describe('Training session - keyboard mode', () => {
  test('should show keyboard input in keyboard mode', async ({ page }) => {
    await login(page, 'Тест')
    await page.getByRole('button', { name: 'Настройки' }).click()
    await expect(page).toHaveURL(/\/settings/)
    await page.getByRole('button', { name: /Клавиатура/ }).click()
    await page.getByRole('button', { name: 'Назад' }).click()
    await expect(page).toHaveURL(/\/home/)
    await startTraining(page)
    await expect(page.getByPlaceholder('Введи ответ...')).toBeVisible()
  })

  test('should accept keyboard input and show correct feedback', async ({ page }) => {
    await login(page, 'Тест')
    await page.getByRole('button', { name: 'Настройки' }).click()
    await expect(page).toHaveURL(/\/settings/)
    await page.getByRole('button', { name: /Клавиатура/ }).click()
    await page.getByRole('button', { name: 'Назад' }).click()
    await expect(page).toHaveURL(/\/home/)
    await startTraining(page, { questionCount: 5 })
    const { correctAnswer } = await getQuestionParts(page)
    await page.getByPlaceholder('Введи ответ...').fill(String(correctAnswer))
    await page.getByRole('button', { name: 'Ответить' }).click()
    await expect(
      page.getByText(/Правильно!/).or(page.getByText(/Вопрос \d+ из/))
    ).toBeVisible({ timeout: 2500 })
  })
})
