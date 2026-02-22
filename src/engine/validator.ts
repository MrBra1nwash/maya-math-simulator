import type { Question } from '@/types'

export function validateAnswer(question: Question, userAnswer: number): boolean {
  return userAnswer === question.correctAnswer
}

export function formatQuestion(question: Question): string {
  const symbols: Record<string, string> = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷',
  }

  const symbol = symbols[question.operation]
  return `${question.operand1} ${symbol} ${question.operand2} = ?`
}
