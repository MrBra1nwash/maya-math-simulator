import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOperationSymbol } from '@/engine/difficulty'
import { checkNewAchievements } from '@/engine/achievements'
import FloatingElements from '@/components/effects/FloatingElements'
import PageTransition from '@/components/effects/PageTransition'
import AnimatedButton from '@/components/effects/AnimatedButton'
import ConfettiOverlay from '@/components/effects/ConfettiOverlay'
import CapybaraMascot from '@/components/Mascot/CapybaraMascot'
import PenguinFriends from '@/components/Mascot/PenguinFriends'
import AchievementPopup from '@/components/AchievementPopup'
import type { SessionResult } from '@/types'

export default function ResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, updateProgress } = useAppStore()
  const state = location.state as { result: SessionResult; starsEarned: number } | null
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [achievementsChecked, setAchievementsChecked] = useState(false)

  useEffect(() => {
    if (!profile || !state || achievementsChecked) return
    const unlocked = checkNewAchievements(profile, state.result)
    if (unlocked.length > 0) {
      setNewAchievements(unlocked)
      updateProgress({
        achievements: [...profile.progress.achievements, ...unlocked],
      })
    }
    setAchievementsChecked(true)
  }, [profile, state, achievementsChecked, updateProgress])

  const handleAchievementsDone = useCallback(() => {
    setNewAchievements([])
  }, [])

  if (!state) {
    navigate('/home')
    return null
  }

  const { result, starsEarned } = state
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100)

  const getGrade = () => {
    if (percentage === 100) return { emoji: '🏆', text: 'Идеально!', color: 'text-amber-500' }
    if (percentage >= 80) return { emoji: '🌟', text: 'Отлично!', color: 'text-emerald-500' }
    if (percentage >= 60) return { emoji: '👍', text: 'Хорошо!', color: 'text-blue-500' }
    if (percentage >= 40) return { emoji: '💪', text: 'Можно лучше!', color: 'text-orange-500' }
    return { emoji: '📚', text: 'Нужно больше практики!', color: 'text-red-500' }
  }

  const grade = getGrade()

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m} мин ${s} сек`
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4">
      <FloatingElements />
      <ConfettiOverlay active={percentage >= 80} />
      <AchievementPopup achievementIds={newAchievements} onDone={handleAchievementsDone} />
      <PageTransition>
        <div className="relative z-10 w-full max-w-lg space-y-4 py-6">
          <Card className="border border-purple-100/50 bg-white/80 shadow-xl backdrop-blur-sm rounded-3xl">
            <CardHeader className="pb-2 text-center">
              <div className="text-7xl">{grade.emoji}</div>
              <CardTitle
                className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent`}
              >
                {grade.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-2xl bg-purple-50/80 p-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="text-2xl font-bold text-purple-600"
                  >
                    {result.correctAnswers}/{result.totalQuestions}
                  </motion.div>
                  <div className="text-xs text-purple-600">Правильных</div>
                </div>
                <div className="rounded-2xl bg-purple-50/80 p-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="text-2xl font-bold text-amber-500"
                  >
                    +{starsEarned} ⭐
                  </motion.div>
                  <div className="text-xs text-purple-600">Звёзд заработано</div>
                </div>
                <div className="rounded-2xl bg-purple-50/80 p-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    className="text-2xl font-bold text-blue-500"
                  >
                    {percentage}%
                  </motion.div>
                  <div className="text-xs text-purple-600">Точность</div>
                </div>
                {result.timeSpent && (
                  <div className="rounded-2xl bg-purple-50/80 p-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                      className="text-lg font-bold text-purple-600"
                    >
                      {formatTime(result.timeSpent)}
                    </motion.div>
                    <div className="text-xs text-purple-600">Время</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {result.mistakes.length > 0 && (
            <Card className="border border-red-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-purple-600">
                  Ошибки ({result.mistakes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.mistakes.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-red-50/80 p-2 text-sm"
                    >
                      <span className="text-purple-700">
                        {m.question.operand1} {getOperationSymbol(m.question.operation)}{' '}
                        {m.question.operand2}
                      </span>
                      <div className="flex gap-3">
                        <span className="text-red-400 line-through">{m.userAnswer}</span>
                        <span className="font-bold text-emerald-500">
                          {m.question.correctAnswer}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center py-2">
            <CapybaraMascot
              mood={percentage === 100 ? 'dancing' : percentage >= 60 ? 'excited' : 'happy'}
              size={100}
            />
          </div>
          <PenguinFriends count={3} size={50} celebrating={percentage >= 60} />
          <p className="text-center text-sm text-purple-500">
            Пингвины благодарят тебя за помощь!
          </p>

          <div className="flex gap-3">
            <AnimatedButton
              onClick={() => navigate('/setup')}
              variant="primary"
              className="h-12 flex-1"
            >
              Ещё раз 🪄
            </AnimatedButton>
            <AnimatedButton
              onClick={() => navigate('/home')}
              variant="outline"
              className="h-12 flex-1"
            >
              Домой
            </AnimatedButton>
          </div>
        </div>
      </PageTransition>
    </div>
  )
}
