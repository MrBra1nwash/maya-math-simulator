import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { generateQuestions } from '@/engine/generator'
import FloatingElements from '@/components/effects/FloatingElements'
import PageTransition from '@/components/effects/PageTransition'
import AnimatedButton from '@/components/effects/AnimatedButton'
import type { OperationType, DifficultyLevel } from '@/types'

const OPERATIONS: { id: OperationType; label: string; icon: string }[] = [
  { id: 'addition', label: 'Сложение', icon: '➕' },
  { id: 'subtraction', label: 'Вычитание', icon: '➖' },
  { id: 'multiplication', label: 'Умножение', icon: '✖️' },
  { id: 'division', label: 'Деление', icon: '➗' },
]

const DIFFICULTIES: { id: DifficultyLevel; label: string; icon: string }[] = [
  { id: 'easy', label: 'Лёгкий', icon: '🌟' },
  { id: 'medium', label: 'Средний', icon: '⚡' },
  { id: 'hard', label: 'Тяжёлый', icon: '🔥' },
  { id: 'very_hard', label: 'Очень тяжёлый', icon: '💀' },
]

const QUESTION_COUNTS = [5, 10, 15, 20]
const SPECIFIC_NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export default function SetupPage() {
  const navigate = useNavigate()
  const { startSession } = useAppStore()

  const [selectedOps, setSelectedOps] = useState<OperationType[]>(['multiplication'])
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy')
  const [questionCount, setQuestionCount] = useState(10)
  const [specificNumber, setSpecificNumber] = useState<number | null>(null)
  const [timerEnabled, setTimerEnabled] = useState(false)

  const isSingleMultOrDiv =
    selectedOps.length === 1 &&
    (selectedOps[0] === 'multiplication' || selectedOps[0] === 'division')

  const toggleOp = (op: OperationType) => {
    setSelectedOps((prev) => {
      if (prev.includes(op)) {
        if (prev.length === 1) return prev
        const next = prev.filter((o) => o !== op)
        if (!next.includes('multiplication') && !next.includes('division')) {
          setSpecificNumber(null)
        }
        return next
      }
      return [...prev, op]
    })
  }

  const { profile } = useAppStore()
  const allowNegative = profile?.settings.negativeNumbers ?? false

  const handleStart = () => {
    const config = {
      operations: selectedOps,
      difficulty,
      questionCount,
      specificNumber: isSingleMultOrDiv ? specificNumber : null,
      timerEnabled,
    }

    const questions = generateQuestions(config, allowNegative)
    startSession(config, questions)
    navigate('/training')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4">
      <FloatingElements />
      <PageTransition>
        <div className="relative z-10 w-full max-w-lg space-y-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-purple-600">Настройка тренировки</h1>
            <AnimatedButton variant="ghost" size="sm" onClick={() => navigate('/home')}>
              Назад
            </AnimatedButton>
          </div>

          <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-purple-600">Операции</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {OPERATIONS.map((op) => (
                <label
                  key={op.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                    selectedOps.includes(op.id)
                      ? 'border-pink-400 bg-pink-50 shadow-md'
                      : 'border-purple-100 bg-white/60 hover:border-purple-300'
                  }`}
                >
                  <Checkbox
                    checked={selectedOps.includes(op.id)}
                    onCheckedChange={() => toggleOp(op.id)}
                  />
                  <span className="mr-1">{op.icon}</span>
                  <span className="text-sm text-purple-700">{op.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-purple-600">Сложность</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    difficulty === d.id
                      ? 'border-pink-400 bg-pink-50 shadow-md'
                      : 'border-purple-100 bg-white/60 hover:border-purple-300'
                  }`}
                >
                  <span className="mr-1">{d.icon}</span>
                  <span className="text-purple-700">{d.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-purple-600">
                Количество примеров
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                    questionCount === count
                      ? 'border-pink-400 bg-pink-50 shadow-md text-purple-700'
                      : 'border-purple-100 bg-white/60 hover:border-purple-300 text-purple-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </CardContent>
          </Card>

          {isSingleMultOrDiv && (
            <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-purple-600">
                  Тренировать конкретное число
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSpecificNumber(null)}
                    className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                      specificNumber === null
                        ? 'border-pink-400 bg-pink-50 shadow-md text-purple-700'
                        : 'border-purple-100 bg-white/60 hover:border-purple-300 text-purple-700'
                    }`}
                  >
                    Все
                  </button>
                  {SPECIFIC_NUMBERS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setSpecificNumber(n)}
                      className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                        specificNumber === n
                          ? 'border-pink-400 bg-pink-50 shadow-md text-purple-700'
                          : 'border-purple-100 bg-white/60 hover:border-purple-300 text-purple-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
            <CardContent className="flex items-center justify-between py-4">
              <Label className="text-sm text-purple-600">Включить таймер</Label>
              <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
            </CardContent>
          </Card>

          <AnimatedButton
            onClick={handleStart}
            variant="primary"
            size="lg"
            pulse
            className="w-full"
          >
            Начать! 🪄
          </AnimatedButton>
        </div>
      </PageTransition>
    </div>
  )
}
