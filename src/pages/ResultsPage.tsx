import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOperationSymbol } from '@/engine/difficulty'
import { checkNewAchievements } from '@/engine/achievements'
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
    if (percentage === 100) return { emoji: '🏆', text: 'Идеально!', color: 'text-amber-300' }
    if (percentage >= 80) return { emoji: '🌟', text: 'Отлично!', color: 'text-emerald-400' }
    if (percentage >= 60) return { emoji: '👍', text: 'Хорошо!', color: 'text-blue-400' }
    if (percentage >= 40) return { emoji: '💪', text: 'Можно лучше!', color: 'text-orange-400' }
    return { emoji: '📚', text: 'Нужно больше практики!', color: 'text-red-400' }
  }

  const grade = getGrade()

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m} мин ${s} сек`
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 p-4">
      <AchievementPopup achievementIds={newAchievements} onDone={handleAchievementsDone} />
      <div className="w-full max-w-lg space-y-4 py-6">
        <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
          <CardHeader className="text-center pb-2">
            <div className="text-6xl">{grade.emoji}</div>
            <CardTitle className={`text-2xl ${grade.color}`}>{grade.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-indigo-900/50 p-3">
                <div className="text-2xl font-bold text-emerald-400">
                  {result.correctAnswers}/{result.totalQuestions}
                </div>
                <div className="text-xs text-indigo-400">Правильных</div>
              </div>
              <div className="rounded-lg bg-indigo-900/50 p-3">
                <div className="text-2xl font-bold text-amber-300">
                  +{starsEarned} ⭐
                </div>
                <div className="text-xs text-indigo-400">Звёзд заработано</div>
              </div>
              <div className="rounded-lg bg-indigo-900/50 p-3">
                <div className="text-2xl font-bold text-blue-400">{percentage}%</div>
                <div className="text-xs text-indigo-400">Точность</div>
              </div>
              {result.timeSpent && (
                <div className="rounded-lg bg-indigo-900/50 p-3">
                  <div className="text-lg font-bold text-purple-400">
                    {formatTime(result.timeSpent)}
                  </div>
                  <div className="text-xs text-indigo-400">Время</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {result.mistakes.length > 0 && (
          <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-300">
                Ошибки ({result.mistakes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.mistakes.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-red-500/10 p-2 text-sm"
                  >
                    <span>
                      {m.question.operand1} {getOperationSymbol(m.question.operation)}{' '}
                      {m.question.operand2}
                    </span>
                    <div className="flex gap-3">
                      <span className="text-red-400 line-through">{m.userAnswer}</span>
                      <span className="font-bold text-emerald-400">
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
          <CapybaraMascot mood={percentage === 100 ? 'dancing' : percentage >= 60 ? 'excited' : 'happy'} size={100} />
        </div>
        <PenguinFriends count={3} size={50} celebrating={percentage >= 60} />
        <p className="text-center text-sm text-indigo-400">
          Пингвины благодарят тебя за помощь!
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/setup')}
            className="h-12 flex-1 bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400"
          >
            Ещё раз 🪄
          </Button>
          <Button
            onClick={() => navigate('/home')}
            variant="outline"
            className="h-12 flex-1 border-indigo-600 text-indigo-200 hover:bg-indigo-800 hover:text-white"
          >
            Домой
          </Button>
        </div>
      </div>
    </div>
  )
}
