import { useNavigate, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import CapybaraMascot from '@/components/Mascot/CapybaraMascot'
import { getLevelName, getStarsForNextLevel } from '@/engine/achievements'

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
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="w-full max-w-lg space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-300">
              Привет, {profile.name}!
            </h1>
            <p className="text-indigo-300">{levelName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="text-indigo-400 hover:text-white"
          >
            Сменить
          </Button>
        </div>

        <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
          <CardContent className="space-y-3 py-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-400">Уровень {profile.progress.level}</span>
              <span className="text-indigo-400">{profile.progress.totalStars}/{starsForNext} ⭐</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
          <CardContent className="flex items-center justify-around py-6">
            <div className="text-center">
              <div className="text-3xl">⭐</div>
              <div className="text-2xl font-bold text-amber-300">
                {profile.progress.totalStars}
              </div>
              <div className="text-xs text-indigo-400">Звёзды</div>
            </div>
            <div className="text-center">
              <div className="text-3xl">🔥</div>
              <div className="text-2xl font-bold text-orange-400">
                {profile.progress.bestStreak}
              </div>
              <div className="text-xs text-indigo-400">Лучшая серия</div>
            </div>
            <div className="text-center">
              <div className="text-3xl">📚</div>
              <div className="text-2xl font-bold text-emerald-400">
                {profile.history.length}
              </div>
              <div className="text-xs text-indigo-400">Тренировок</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center py-2">
          <CapybaraMascot mood="idle" size={140} />
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/setup')}
            className="h-14 w-full bg-amber-500 text-lg font-bold text-indigo-950 hover:bg-amber-400"
          >
            Начать тренировку
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/stats')}
              variant="outline"
              className="h-12 flex-1 border-indigo-600 text-indigo-200 hover:bg-indigo-800 hover:text-white"
            >
              Статистика
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              className="h-12 flex-1 border-indigo-600 text-indigo-200 hover:bg-indigo-800 hover:text-white"
            >
              Настройки
            </Button>
          </div>
        </div>

        {profile.progress.achievements.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-indigo-400">Достижения</h3>
            <div className="flex flex-wrap gap-2">
              {profile.progress.achievements.map((a) => (
                <Badge key={a} variant="secondary" className="bg-indigo-800 text-amber-300">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
