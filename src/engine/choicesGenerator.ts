import type { DifficultyLevel } from '@/types'
import { getChoiceCount } from './difficulty'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateDistractor(correctAnswer: number, existing: Set<number>): number {
  const strategies = [
    () => correctAnswer + 1,
    () => correctAnswer - 1,
    () => correctAnswer + 2,
    () => correctAnswer - 2,
    () => correctAnswer + 10,
    () => correctAnswer - 10,
    () => correctAnswer * 2,
    () => Math.floor(correctAnswer / 2),
    () => correctAnswer + Math.floor(Math.random() * 5) + 1,
    () => correctAnswer - Math.floor(Math.random() * 5) - 1,
    () => correctAnswer + Math.floor(Math.random() * 10) + 3,
    () => correctAnswer - Math.floor(Math.random() * 10) - 3,
  ]

  const shuffledStrategies = shuffleArray(strategies)

  for (const strategy of shuffledStrategies) {
    const value = strategy()
    if (!existing.has(value) && value !== correctAnswer) {
      return value
    }
  }

  let offset = 1
  while (existing.has(correctAnswer + offset) || correctAnswer + offset === correctAnswer) {
    offset++
  }
  return correctAnswer + offset
}

export function generateChoices(correctAnswer: number, difficulty: DifficultyLevel): number[] {
  const count = getChoiceCount(difficulty)
  const used = new Set<number>([correctAnswer])
  const choices = [correctAnswer]

  while (choices.length < count) {
    const distractor = generateDistractor(correctAnswer, used)
    used.add(distractor)
    choices.push(distractor)
  }

  return shuffleArray(choices)
}
