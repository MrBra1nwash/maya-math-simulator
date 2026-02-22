import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { generateChoices } from '@/engine/choicesGenerator'
import { validateAnswer } from '@/engine/validator'
import { getOperationSymbol } from '@/engine/difficulty'
import CapybaraMascot from '@/components/Mascot/CapybaraMascot'
import { useSounds } from '@/sounds/useSounds'
import type { SessionResult, MistakeRecord } from '@/types'

type AnswerState = 'answering' | 'correct' | 'wrong_first' | 'wrong_final'

export default function TrainingPage() {
  const navigate = useNavigate()
  const {
    currentSession,
    profile,
    answerQuestion,
    endSession,
    addSessionResult,
    updateProgress,
    setMascotMood,
  } = useAppStore()

  const [inputValue, setInputValue] = useState('')
  const [answerState, setAnswerState] = useState<AnswerState>('answering')
  const [choices, setChoices] = useState<number[]>([])
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [sessionStreak, setSessionStreak] = useState(0)
  const [timer, setTimer] = useState(0)
  const isEndingRef = useRef(false)

  const inputMode = profile?.settings.inputMode ?? 'choices'
  const sounds = useSounds({ enabled: profile?.settings.soundEnabled ?? true })

  useEffect(() => {
    if (!currentSession && !isEndingRef.current) {
      navigate('/setup')
    }
  }, [currentSession, navigate])

  const currentQuestion = currentSession?.questions[currentSession.currentIndex]

  useEffect(() => {
    if (currentQuestion) {
      setChoices(generateChoices(currentQuestion.correctAnswer, currentQuestion.difficulty))
      setInputValue('')
      setSelectedChoice(null)
      setAnswerState('answering')
      setMascotMood('thinking')
    }
  }, [currentQuestion, setMascotMood])

  useEffect(() => {
    if (!currentSession?.config.timerEnabled) return
    const interval = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [currentSession?.config.timerEnabled])

  const finishSession = useCallback(async () => {
    if (!currentSession || !profile) return

    const mistakes: MistakeRecord[] = currentSession.answers
      .filter((a) => !a.correct)
      .map((a) => ({
        question: a.question,
        userAnswer: a.userAnswer ?? 0,
        wasRetried: a.wasRetried,
      }))

    const correctCount = currentSession.answers.filter((a) => a.correct).length
    const correctFirstTry = currentSession.answers.filter((a) => a.correct && !a.wasRetried).length

    const result: SessionResult = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      config: currentSession.config,
      totalQuestions: currentSession.config.questionCount,
      correctAnswers: correctCount,
      correctOnFirstTry: correctFirstTry,
      timeSpent: currentSession.config.timerEnabled ? (Date.now() - currentSession.startTime) : null,
      mistakes,
    }

    const starsEarned = correctCount + Math.floor(sessionStreak / 3)
    const newTotalStars = profile.progress.totalStars + starsEarned
    const newLevel = Math.floor(newTotalStars / 50) + 1
    const newBestStreak = Math.max(profile.progress.bestStreak, sessionStreak)

    await addSessionResult(result)
    await updateProgress({
      totalStars: newTotalStars,
      level: newLevel,
      currentStreak: 0,
      bestStreak: newBestStreak,
    })

    sounds.playComplete()
    isEndingRef.current = true
    endSession()
    navigate('/results', { state: { result, starsEarned } })
  }, [currentSession, profile, sessionStreak, addSessionResult, updateProgress, endSession, navigate])

  const processAnswer = useCallback((userAnswer: number) => {
    if (!currentQuestion || !currentSession) return

    const isCorrect = validateAnswer(currentQuestion, userAnswer)

    if (isCorrect) {
      setAnswerState('correct')
      setMascotMood('happy')
      const newStreak = sessionStreak + 1
      setSessionStreak(newStreak)
      if (newStreak > 0 && newStreak % 5 === 0) {
        sounds.playStreak()
      } else {
        sounds.playCorrect()
      }
      answerQuestion(userAnswer, true, false)

      setTimeout(() => {
        if (currentSession.currentIndex + 1 >= currentSession.config.questionCount) {
          finishSession()
        } else {
          setAnswerState('answering')
        }
      }, 1000)
    } else if (answerState === 'answering') {
      setAnswerState('wrong_first')
      setMascotMood('sad')
      sounds.playWrong()
      setInputValue('')
      setSelectedChoice(null)
    } else {
      setAnswerState('wrong_final')
      setMascotMood('sad')
      sounds.playWrong()
      setSessionStreak(0)
      answerQuestion(userAnswer, false, true)

      setTimeout(() => {
        if (currentSession.currentIndex + 1 >= currentSession.config.questionCount) {
          finishSession()
        } else {
          setAnswerState('answering')
        }
      }, 2000)
    }
  }, [currentQuestion, currentSession, answerState, answerQuestion, setMascotMood, finishSession])

  const handleKeyboardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(inputValue)
    if (inputValue.trim() === '' || isNaN(num)) return
    processAnswer(num)
  }

  const handleChoiceClick = (value: number) => {
    if (answerState === 'correct' || answerState === 'wrong_final') return
    setSelectedChoice(value)
    processAnswer(value)
  }

  if (!currentSession || !currentQuestion) return null

  const progressPercent = (currentSession.currentIndex / currentSession.config.questionCount) * 100
  const mascotMood = answerState === 'correct' ? 'happy' as const
    : answerState === 'wrong_first' || answerState === 'wrong_final' ? 'sad' as const
    : 'thinking' as const

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="w-full max-w-lg space-y-4 py-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-indigo-300">
            <span>
              Вопрос {currentSession.currentIndex + 1} из{' '}
              {currentSession.config.questionCount}
            </span>
            <div className="flex gap-3">
              {sessionStreak > 0 && <span className="text-orange-400">🔥 {sessionStreak}</span>}
              {currentSession.config.timerEnabled && (
                <span>⏱ {formatTimer(timer)}</span>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        <div className="flex justify-center py-2">
          <CapybaraMascot mood={mascotMood} size={100} />
        </div>

        <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="mb-2 text-lg text-indigo-400">
                {getOperationSymbol(currentQuestion.operation) === '+' && 'Сложение'}
                {getOperationSymbol(currentQuestion.operation) === '−' && 'Вычитание'}
                {getOperationSymbol(currentQuestion.operation) === '×' && 'Умножение'}
                {getOperationSymbol(currentQuestion.operation) === '÷' && 'Деление'}
              </div>
              <div className="text-4xl font-bold tracking-wider text-white md:text-5xl">
                {currentQuestion.operand1} {getOperationSymbol(currentQuestion.operation)}{' '}
                {currentQuestion.operand2} = ?
              </div>
            </div>
          </CardContent>
        </Card>

        {answerState === 'wrong_first' && (
          <div className="rounded-lg bg-orange-500/20 p-3 text-center text-orange-300">
            Не совсем! Попробуй ещё раз 💪
          </div>
        )}

        {answerState === 'wrong_final' && (
          <div className="rounded-lg bg-red-500/20 p-3 text-center text-red-300">
            Правильный ответ: <span className="text-xl font-bold">{currentQuestion.correctAnswer}</span>
          </div>
        )}

        {answerState === 'correct' && (
          <div className="rounded-lg bg-emerald-500/20 p-3 text-center text-emerald-300">
            Правильно! ⭐
          </div>
        )}

        {inputMode === 'keyboard' ? (
          <form onSubmit={handleKeyboardSubmit} className="space-y-3">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введи ответ..."
              className="h-14 border-indigo-600 bg-indigo-900/50 text-center text-2xl text-white placeholder:text-indigo-500"
              autoFocus
              disabled={answerState === 'correct' || answerState === 'wrong_final'}
            />
            <Button
              type="submit"
              className="h-12 w-full bg-amber-500 text-lg font-bold text-indigo-950 hover:bg-amber-400"
              disabled={!inputValue.trim() || answerState === 'correct' || answerState === 'wrong_final'}
            >
              Ответить
            </Button>
          </form>
        ) : (
          <div className={`grid gap-3 ${choices.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {choices.map((value) => {
              let variant: 'default' | 'outline' = 'outline'
              let extraClass = 'border-indigo-600 text-indigo-200 hover:bg-indigo-800 hover:text-white'

              if (selectedChoice === value) {
                if (answerState === 'correct') {
                  extraClass = 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                } else if (answerState === 'wrong_first' || answerState === 'wrong_final') {
                  extraClass = 'border-red-400 bg-red-500/20 text-red-300'
                }
              }

              if (answerState === 'wrong_final' && value === currentQuestion.correctAnswer) {
                extraClass = 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
              }

              return (
                <Button
                  key={value}
                  variant={variant}
                  onClick={() => handleChoiceClick(value)}
                  disabled={answerState === 'correct' || answerState === 'wrong_final'}
                  className={`h-14 text-xl font-bold ${extraClass}`}
                >
                  {value}
                </Button>
              )
            })}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            isEndingRef.current = true
            endSession()
            navigate('/home')
          }}
          className="w-full text-indigo-500 hover:text-indigo-300"
        >
          Закончить тренировку
        </Button>
      </div>
    </div>
  )
}
