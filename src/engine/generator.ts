import type { Question, DifficultyLevel, OperationType, SessionConfig } from '@/types'
import {
  getAdditionRange,
  getSubtractionRange,
  getMultiplicationRange,
  getDivisionRange,
} from './difficulty'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let questionCounter = 0

function makeId(): string {
  questionCounter++
  return `q-${Date.now()}-${questionCounter}`
}

function generateAddition(difficulty: DifficultyLevel, allowNegative: boolean): Question {
  const range = getAdditionRange(difficulty)
  let a: number, b: number

  if (allowNegative) {
    a = randomInt(-range.max, range.max)
    b = randomInt(-range.max, range.max)
  } else {
    a = randomInt(range.min, range.max)
    b = randomInt(range.min, range.max)
  }

  return {
    id: makeId(),
    operand1: a,
    operand2: b,
    operation: 'addition',
    correctAnswer: a + b,
    difficulty,
  }
}

function generateSubtraction(difficulty: DifficultyLevel, allowNegative: boolean): Question {
  const range = getSubtractionRange(difficulty)

  if (allowNegative) {
    const a = randomInt(-range.max, range.max)
    const b = randomInt(-range.max, range.max)
    return {
      id: makeId(),
      operand1: a,
      operand2: b,
      operation: 'subtraction',
      correctAnswer: a - b,
      difficulty,
    }
  }

  const a = randomInt(range.min, range.max)
  const b = randomInt(range.min, a)

  return {
    id: makeId(),
    operand1: a,
    operand2: b,
    operation: 'subtraction',
    correctAnswer: a - b,
    difficulty,
  }
}

function generateMultiplication(
  difficulty: DifficultyLevel,
  specificNumber: number | null,
  allowNegative: boolean,
): Question {
  const range = getMultiplicationRange(difficulty)

  let a: number, b: number

  if (specificNumber !== null) {
    a = specificNumber
    b = randomInt(range.factorMin, range.factorMax)
  } else {
    a = randomInt(range.tableMin, range.tableMax)
    b = randomInt(range.factorMin, range.factorMax)
  }

  if (Math.random() > 0.5) {
    ;[a, b] = [b, a]
  }

  if (allowNegative && Math.random() > 0.5) {
    a = -a
  }

  return {
    id: makeId(),
    operand1: a,
    operand2: b,
    operation: 'multiplication',
    correctAnswer: a * b,
    difficulty,
  }
}

function generateDivision(
  difficulty: DifficultyLevel,
  specificNumber: number | null,
  allowNegative: boolean,
): Question {
  const range = getDivisionRange(difficulty)

  let divisor: number, quotient: number

  if (specificNumber !== null) {
    divisor = specificNumber
    quotient = randomInt(range.factorMin, range.factorMax)
  } else {
    divisor = randomInt(range.tableMin, range.tableMax)
    quotient = randomInt(range.factorMin, range.factorMax)
  }

  let dividend = divisor * quotient

  if (allowNegative && Math.random() > 0.5) {
    dividend = -dividend
  }

  return {
    id: makeId(),
    operand1: dividend,
    operand2: divisor,
    operation: 'division',
    correctAnswer: dividend / divisor,
    difficulty,
  }
}

function generateSingleQuestion(
  operation: OperationType,
  difficulty: DifficultyLevel,
  specificNumber: number | null,
  allowNegative: boolean,
): Question {
  switch (operation) {
    case 'addition':
      return generateAddition(difficulty, allowNegative)
    case 'subtraction':
      return generateSubtraction(difficulty, allowNegative)
    case 'multiplication':
      return generateMultiplication(difficulty, specificNumber, allowNegative)
    case 'division':
      return generateDivision(difficulty, specificNumber, allowNegative)
  }
}

export function generateQuestions(config: SessionConfig, allowNegative: boolean): Question[] {
  const questions: Question[] = []

  for (let i = 0; i < config.questionCount; i++) {
    const operation = config.operations[randomInt(0, config.operations.length - 1)]
    const question = generateSingleQuestion(
      operation,
      config.difficulty,
      config.specificNumber,
      allowNegative,
    )
    questions.push(question)
  }

  return questions
}
