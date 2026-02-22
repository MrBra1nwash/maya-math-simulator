import type { DifficultyLevel, OperationType } from '@/types'

export interface DifficultyRange {
  min: number
  max: number
}

export interface MultiplicationRange {
  tableMin: number
  tableMax: number
  factorMin: number
  factorMax: number
}

const ADDITION_RANGES: Record<DifficultyLevel, DifficultyRange> = {
  easy: { min: 0, max: 10 },
  medium: { min: 0, max: 50 },
  hard: { min: 0, max: 100 },
  very_hard: { min: 0, max: 1000 },
}

const MULTIPLICATION_RANGES: Record<DifficultyLevel, MultiplicationRange> = {
  easy: { tableMin: 2, tableMax: 5, factorMin: 1, factorMax: 10 },
  medium: { tableMin: 2, tableMax: 9, factorMin: 1, factorMax: 10 },
  hard: { tableMin: 2, tableMax: 12, factorMin: 1, factorMax: 10 },
  very_hard: { tableMin: 2, tableMax: 9, factorMin: 13, factorMax: 25 },
}

export function getAdditionRange(difficulty: DifficultyLevel): DifficultyRange {
  return ADDITION_RANGES[difficulty]
}

export function getSubtractionRange(difficulty: DifficultyLevel): DifficultyRange {
  return ADDITION_RANGES[difficulty]
}

export function getMultiplicationRange(difficulty: DifficultyLevel): MultiplicationRange {
  return MULTIPLICATION_RANGES[difficulty]
}

export function getDivisionRange(difficulty: DifficultyLevel): MultiplicationRange {
  return MULTIPLICATION_RANGES[difficulty]
}

export function getChoiceCount(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case 'easy':
    case 'medium':
      return 4
    case 'hard':
    case 'very_hard':
      return 6
  }
}

export function getOperationSymbol(operation: OperationType): string {
  switch (operation) {
    case 'addition':
      return '+'
    case 'subtraction':
      return '−'
    case 'multiplication':
      return '×'
    case 'division':
      return '÷'
  }
}
