import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import FloatingElements from '@/components/effects/FloatingElements'
import PageTransition from '@/components/effects/PageTransition'
import AnimatedButton from '@/components/effects/AnimatedButton'

export default function SettingsPage() {
  const { profile, updateSettings } = useAppStore()
  const navigate = useNavigate()

  if (!profile) {
    navigate('/login')
    return null
  }

  const { settings } = profile

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4">
      <FloatingElements />
      <PageTransition>
        <div className="relative z-10 w-full max-w-lg space-y-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-purple-600">Настройки</h1>
            <AnimatedButton variant="ghost" size="sm" onClick={() => navigate('/home')}>
              Назад
            </AnimatedButton>
          </div>

          <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-purple-600">
                Режим ввода ответов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => updateSettings({ inputMode: 'choices' })}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  settings.inputMode === 'choices'
                    ? 'border-pink-400 bg-pink-50 shadow-md'
                    : 'border-purple-100 bg-white/60 hover:border-purple-300'
                }`}
              >
                <div className="font-medium text-purple-700">Варианты ответов</div>
                <div className="text-xs text-purple-600">
                  Выбирать из предложенных вариантов
                </div>
              </button>
              <button
                onClick={() => updateSettings({ inputMode: 'keyboard' })}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  settings.inputMode === 'keyboard'
                    ? 'border-pink-400 bg-pink-50 shadow-md'
                    : 'border-purple-100 bg-white/60 hover:border-purple-300'
                }`}
              >
                <div className="font-medium text-purple-700">Клавиатура</div>
                <div className="text-xs text-purple-600">Вводить ответ вручную</div>
              </button>
            </CardContent>
          </Card>

          <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-purple-600">Звук</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-purple-600">Звуковые эффекты</Label>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-purple-600">Фоновая музыка</Label>
                <Switch
                  checked={settings.musicEnabled}
                  onCheckedChange={(checked) => updateSettings({ musicEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100/50 bg-white/80 shadow-lg backdrop-blur-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-purple-600">Математика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-purple-600">Отрицательные числа</Label>
                  <p className="text-xs text-purple-600">
                    Разрешить отрицательные результаты во всех операциях
                  </p>
                </div>
                <Switch
                  checked={settings.negativeNumbers}
                  onCheckedChange={(checked) =>
                    updateSettings({ negativeNumbers: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  )
}
