import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import FloatingElements from '@/components/effects/FloatingElements'
import PageTransition from '@/components/effects/PageTransition'
import AnimatedButton from '@/components/effects/AnimatedButton'
import CapybaraMascot from '@/components/Mascot/CapybaraMascot'
import SwimmingPenguins from '@/components/effects/SwimmingPenguins'
import { getLevelName, getStarsForNextLevel, getAchievementDef } from '@/engine/achievements'

export default function HomePage() {
  const { profile, logout } = useAppStore()
  const navigate = useNavigate()

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  const levelName = getLevelName(profile.progress.level)
  const starsForNext = getStarsForNextLevel(profile.progress.level)
  const prevLevelStars = getStarsForNextLevel(profile.progress.level - 1)
  const levelProgress = Math.min(
    ((profile.progress.totalStars - prevLevelStars) / (starsForNext - prevLevelStars)) * 100,
    100
  )

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4">
      <FloatingElements />
      <SwimmingPenguins count={8} />
      <PageTransition>
        <div className="relative z-10 w-full max-w-lg space-y-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Привет, {profile.name}!
              </h1>
              <p className="text-purple-600">{levelName}</p>
            </div>
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Сменить
            </AnimatedButton>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-purple-100/50">
            <CardContent className="space-y-3 py-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-600">Уровень {profile.progress.level}</span>
                <span className="text-purple-600">{profile.progress.totalStars}/{starsForNext} ⭐</span>
              </div>
              <Progress
                value={levelProgress}
                className="h-2 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-pink-400 [&_[data-slot=progress-indicator]]:to-purple-500"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-purple-100/50">
            <CardContent className="flex items-center justify-around py-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl">⭐</div>
                <div className="text-2xl font-bold text-amber-500">
                  {profile.progress.totalStars}
                </div>
                <div className="text-xs font-medium text-purple-600">Звёзды</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl">🔥</div>
                <div className="text-2xl font-bold text-orange-500">
                  {profile.progress.bestStreak}
                </div>
                <div className="text-xs font-medium text-purple-600">Лучшая серия</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl">📚</div>
                <div className="text-2xl font-bold text-cyan-500">
                  {profile.history.length}
                </div>
                <div className="text-xs font-medium text-purple-600">Тренировок</div>
              </motion.div>
            </CardContent>
          </Card>

          <div className="flex justify-center py-2">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CapybaraMascot mood="idle" size={140} />
            </motion.div>
          </div>

          <div className="space-y-3">
            <AnimatedButton
              variant="primary"
              size="lg"
              pulse
              className="h-16 w-full"
              onClick={() => navigate('/setup')}
            >
              Начать тренировку
            </AnimatedButton>

            <div className="flex gap-3">
              <AnimatedButton
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/stats')}
              >
                Статистика
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/settings')}
              >
                Настройки
              </AnimatedButton>
            </div>
          </div>

          {profile.progress.achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-purple-700">Достижения</h3>
              <div className="flex flex-wrap gap-2">
                {profile.progress.achievements.map((a) => {
                  const def = getAchievementDef(a)
                  return (
                    <Badge key={a} variant="secondary" className="bg-purple-100/80 text-purple-600 border-purple-200/50">
                      {def ? `${def.icon} ${def.name}` : a}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  )
}
