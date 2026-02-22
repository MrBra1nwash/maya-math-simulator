import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ACHIEVEMENTS } from '@/engine/achievements'
import { cn } from '@/lib/utils'
import { getOperationSymbol } from '@/engine/difficulty'
import type {
  SessionResult,
  Question,
  OperationType,
  DifficultyLevel,
} from '@/types'

const OPERATION_ICONS: Record<OperationType, string> = {
  addition: '➕',
  subtraction: '➖',
  multiplication: '✖️',
  division: '➗',
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Лёгкий',
  medium: 'Средний',
  hard: 'Тяжёлый',
  very_hard: 'Очень тяжёлый',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} дн. назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function questionKey(q: Question): string {
  return `${q.operation}:${q.operand1}:${q.operand2}`
}

function formatQuestion(q: Question): string {
  return `${q.operand1} ${getOperationSymbol(q.operation)} ${q.operand2}`
}

function getMostTrainedOperation(history: SessionResult[]): OperationType | null {
  const counts: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
  }
  for (const s of history) {
    for (const op of s.config.operations) {
      counts[op] += 1
    }
  }
  const max = Math.max(...Object.values(counts))
  if (max === 0) return null
  return (Object.entries(counts).find(([, v]) => v === max)?.[0] as OperationType) ?? null
}

function getWeakSpots(history: SessionResult[]): { question: Question; count: number }[] {
  const map = new Map<string, { question: Question; count: number }>()
  for (const session of history) {
    for (const m of session.mistakes) {
      const key = questionKey(m.question)
      const existing = map.get(key)
      if (existing) {
        existing.count += 1
      } else {
        map.set(key, { question: m.question, count: 1 })
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

export default function StatsPage() {
  const { profile } = useAppStore()
  const navigate = useNavigate()

  if (!profile) {
    navigate('/login')
    return null
  }

  const history = profile.history
  const recentHistory = [...history].reverse().slice(0, 20)
  const chartData = [...history]
    .reverse()
    .slice(0, 10)
    .map((s, i) => ({
      name: `#${history.length - i}`,
      accuracy: Math.round((s.correctAnswers / s.totalQuestions) * 100),
    }))
    .reverse()
  const avgAccuracy =
    history.length > 0
      ? Math.round(
          (history.reduce((sum, s) => sum + s.correctAnswers / s.totalQuestions, 0) /
            history.length) *
            100
        )
      : null
  const mostTrained = getMostTrainedOperation(history)
  const weakSpots = getWeakSpots(history)
  const unlockedIds = new Set(profile.progress.achievements)

  const cardClass =
    'border-amber-400/30 bg-indigo-950/80 text-white'
  const tabsClass =
    'border-amber-400/30 bg-indigo-950/80 text-white [&_[data-state=active]]:bg-amber-500/20 [&_[data-state=active]]:text-amber-300'

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="w-full max-w-lg space-y-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-300">Статистика</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            className="text-indigo-400 hover:text-white"
          >
            Назад
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={cn(tabsClass, 'mb-4')}>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
            <TabsTrigger value="weak">Слабые места</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-base text-amber-300">Общая статистика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {history.length === 0 ? (
                    <p className="py-4 text-center text-indigo-400">Пока нет данных</p>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Всего тренировок</span>
                        <span className="font-bold text-white">{history.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Звёзды</span>
                        <span className="font-bold text-amber-300">
                          ⭐ {profile.progress.totalStars}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Уровень</span>
                        <span className="font-bold text-emerald-400">
                          {profile.progress.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Лучшая серия</span>
                        <span className="font-bold text-orange-400">
                          🔥 {profile.progress.bestStreak}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Средняя точность</span>
                        <span className="font-bold text-white">{avgAccuracy}%</span>
                      </div>
                      {mostTrained && (
                        <div className="flex justify-between">
                          <span className="text-indigo-300">Чаще всего тренировал</span>
                          <span className="font-bold text-white">
                            {OPERATION_ICONS[mostTrained]}{' '}
                            {mostTrained === 'addition'
                              ? 'Сложение'
                              : mostTrained === 'subtraction'
                                ? 'Вычитание'
                                : mostTrained === 'multiplication'
                                  ? 'Умножение'
                                  : 'Деление'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-base text-amber-300">
                    Точность за последние 10 тренировок
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <p className="py-8 text-center text-indigo-400">Пока нет данных</p>
                  ) : (
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(129, 140, 248, 0.3)" />
                          <XAxis
                            dataKey="name"
                            stroke="#a5b4fc"
                            tick={{ fill: '#a5b4fc', fontSize: 12 }}
                          />
                          <YAxis
                            stroke="#a5b4fc"
                            tick={{ fill: '#a5b4fc', fontSize: 12 }}
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgb(30 27 75 / 0.95)',
                              border: '1px solid rgba(251, 191, 36, 0.3)',
                              borderRadius: '8px',
                              color: 'white',
                            }}
                            formatter={(value) => [`${value != null ? value : 0}%`, 'Точность']}
                          />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#fbbf24"
                            strokeWidth={2}
                            dot={{ fill: '#fbbf24', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-base text-amber-300">Последние тренировки</CardTitle>
              </CardHeader>
              <CardContent>
                {recentHistory.length === 0 ? (
                  <p className="py-8 text-center text-indigo-400">Пока нет данных</p>
                ) : (
                  <ul className="space-y-3">
                    {recentHistory.map((s) => {
                      const acc = Math.round((s.correctAnswers / s.totalQuestions) * 100)
                      return (
                        <li
                          key={s.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/20 bg-indigo-900/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-indigo-400">{formatDate(s.date)}</span>
                            <div className="flex gap-1">
                              {s.config.operations.map((op) => (
                                <span key={op} title={op}>
                                  {OPERATION_ICONS[op]}
                                </span>
                              ))}
                            </div>
                            <Badge
                              variant="outline"
                              className="border-amber-400/40 bg-amber-500/10 text-amber-300"
                            >
                              {DIFFICULTY_LABELS[s.config.difficulty]}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-white">
                              {s.correctAnswers}/{s.totalQuestions}
                            </span>
                            <span className="ml-1 text-indigo-400">({acc}%)</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weak">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-base text-amber-300">Топ-10 сложных примеров</CardTitle>
              </CardHeader>
              <CardContent>
                {weakSpots.length === 0 ? (
                  <p className="py-8 text-center text-indigo-400">Пока нет данных</p>
                ) : (
                  <ul className="space-y-3">
                    {weakSpots.map(({ question, count }) => (
                      <li
                        key={questionKey(question)}
                        className="flex items-center justify-between rounded-lg border border-amber-400/20 bg-indigo-900/50 px-3 py-2"
                      >
                        <span className="font-mono text-lg font-bold text-white">
                          {formatQuestion(question)}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-rose-400/40 bg-rose-500/20 text-rose-300"
                        >
                          Ошибок: {count}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-base text-amber-300">Достижения</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {ACHIEVEMENTS.map((a) => {
                    const unlocked = unlockedIds.has(a.id)
                    return (
                      <li
                        key={a.id}
                        className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
                          unlocked
                            ? 'border-amber-400/30 bg-amber-500/10'
                            : 'border-indigo-800/50 bg-indigo-950/50 opacity-60'
                        }`}
                      >
                        <span className="text-2xl">{a.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white">{a.name}</div>
                          <div className="text-sm text-indigo-300">{a.description}</div>
                        </div>
                        {unlocked && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-amber-400/40 bg-amber-500/20 text-amber-300"
                          >
                            ✓
                          </Badge>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

