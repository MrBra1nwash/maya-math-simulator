import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { generateChoices } from '@/engine/choicesGenerator'
import { validateAnswer } from '@/engine/validator'
import { getOperationSymbol } from '@/engine/difficulty'
import LottieMascot from '@/components/Mascot/LottieMascot'
import { useSounds } from '@/sounds/useSounds'
import FloatingElements from '@/components/effects/FloatingElements'
import PageTransition from '@/components/effects/PageTransition'
import AnimatedButton from '@/components/effects/AnimatedButton'
import CelebrationEffect from '@/components/effects/CelebrationEffect'
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
  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<number | null>(null)
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
      const allowNegative = profile?.settings.negativeNumbers ?? false
      setChoices(generateChoices(currentQuestion.correctAnswer, currentQuestion.difficulty, allowNegative))
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
      const timerMode = currentSession.config.timerEnabled
      if (!timerMode) setAnswerState('correct')
      setMascotMood('happy')
      const newStreak = sessionStreak + 1
      setSessionStreak(newStreak)
      if (newStreak > 0 && newStreak % 5 === 0) {
        sounds.playStreak()
      } else {
        sounds.playCorrect()
      }

      const delay = timerMode ? 300 : 1500
      setTimeout(() => {
        answerQuestion(userAnswer, true, false)
        if (currentSession.currentIndex + 1 >= currentSession.config.questionCount) {
          finishSession()
        }
      }, delay)
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
      setPendingWrongAnswer(userAnswer)
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

  const handleNextAfterWrong = useCallback(() => {
    if (!currentSession || pendingWrongAnswer === null) return
    answerQuestion(pendingWrongAnswer, false, true)
    setPendingWrongAnswer(null)
    if (currentSession.currentIndex + 1 >= currentSession.config.questionCount) {
      finishSession()
    }
  }, [currentSession, pendingWrongAnswer, answerQuestion, finishSession])

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
    <div className="relative min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      <FloatingElements count={8} />
      <CelebrationEffect active={answerState === 'correct'} streak={sessionStreak} />
      <PageTransition>
        <div className="relative z-10 flex min-h-screen flex-col items-center p-4">
          <div className="w-full max-w-lg space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-purple-700">
                <span>
                  Вопрос {currentSession.currentIndex + 1} из{' '}
                  {currentSession.config.questionCount}
                </span>
                <div className="flex gap-3">
                  {sessionStreak > 0 && <span className="font-bold text-pink-600">🔥 {sessionStreak}</span>}
                  {currentSession.config.timerEnabled && (
                    <span>⏱ {formatTimer(timer)}</span>
                  )}
                </div>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              <LottieMascot src="/lottie/bear-happy.json" size={80} />
              <LottieMascot src="/lottie/hearts.json" size={80} />
              <LottieMascot src="/lottie/teddy.json" size={80} />
            </div>

            <motion.div
              className="overflow-hidden rounded-3xl border border-purple-100/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm"
              animate={
                answerState === 'wrong_first' || answerState === 'wrong_final'
                  ? { x: [0, -10, 10, -10, 10, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.4 }}
            >
              <div className="text-center">
                <div className="mb-2 text-lg font-medium text-purple-600">
                  {getOperationSymbol(currentQuestion.operation) === '+' && 'Сложение'}
                  {getOperationSymbol(currentQuestion.operation) === '−' && 'Вычитание'}
                  {getOperationSymbol(currentQuestion.operation) === '×' && 'Умножение'}
                  {getOperationSymbol(currentQuestion.operation) === '÷' && 'Деление'}
                </div>
                <div className="text-4xl font-extrabold text-gray-800">
                  {currentQuestion.operand1} {getOperationSymbol(currentQuestion.operation)}{' '}
                  {currentQuestion.operand2} = ?
                </div>
              </div>
            </motion.div>

            {answerState === 'wrong_first' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center text-amber-600">
                Не совсем! Попробуй ещё раз 💪
              </div>
            )}

            {answerState === 'wrong_final' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3 rounded-3xl border border-purple-200 bg-white/90 p-6 text-center shadow-lg backdrop-blur-sm"
              >
                <p className="text-purple-600">
                  Ничего страшного, это был сложный пример!
                </p>
                <p className="text-purple-700">
                  Правильный ответ: <span className="text-3xl font-extrabold text-pink-500">{currentQuestion.correctAnswer}</span>
                </p>
                <p className="text-sm text-purple-500">
                  Постарайся запомнить, в следующий раз у тебя всё получится! 💪✨
                </p>
                <AnimatedButton
                  variant="primary"
                  className="mt-2 w-full"
                  onClick={handleNextAfterWrong}
                >
                  Я запомню! 🚀
                </AnimatedButton>
              </motion.div>
            )}

            {inputMode === 'keyboard' ? (
              <form onSubmit={handleKeyboardSubmit} className="space-y-3">
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Введи ответ..."
                  className="h-14 rounded-2xl border-2 border-purple-200 bg-white/80 text-center text-2xl text-gray-800 placeholder:text-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  autoFocus
                  disabled={answerState === 'correct' || answerState === 'wrong_final'}
                />
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  className="h-12 w-full text-lg font-bold"
                  disabled={!inputValue.trim() || answerState === 'correct' || answerState === 'wrong_final'}
                >
                  Ответить
                </AnimatedButton>
              </form>
            ) : (
              <div className={`grid gap-3 ${choices.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {choices.map((value) => {
                  let extraClass = ''

                  if (selectedChoice === value) {
                    if (answerState === 'correct') {
                      extraClass = 'border-green-400 bg-green-100 text-green-700'
                    } else if (answerState === 'wrong_first' || answerState === 'wrong_final') {
                      extraClass = 'border-red-400 bg-red-100 text-red-500'
                    }
                  }

                  if (answerState === 'wrong_final' && value === currentQuestion.correctAnswer) {
                    extraClass = 'border-green-400 bg-green-100 text-green-700'
                  }

                  return (
                    <AnimatedButton
                      key={value}
                      variant="outline"
                      size="lg"
                      onClick={() => handleChoiceClick(value)}
                      disabled={answerState === 'correct' || answerState === 'wrong_final'}
                      className={`h-16 text-2xl ${extraClass}`}
                    >
                      {value}
                    </AnimatedButton>
                  )
                })}
              </div>
            )}

            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={() => {
                isEndingRef.current = true
                endSession()
                navigate('/home')
              }}
              className="w-full"
            >
              Закончить тренировку
            </AnimatedButton>
          </div>
        </div>
      </PageTransition>
    </div>
  )
}
