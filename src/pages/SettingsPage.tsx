import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const { profile, updateSettings } = useAppStore()
  const navigate = useNavigate()

  if (!profile) {
    navigate('/login')
    return null
  }

  const { settings } = profile

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="w-full max-w-lg space-y-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-300">Настройки</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            className="text-indigo-400 hover:text-white"
          >
            Назад
          </Button>
        </div>

        <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-base text-amber-300">Режим ввода ответов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => updateSettings({ inputMode: 'choices' })}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                settings.inputMode === 'choices'
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-indigo-700 hover:border-indigo-500'
              }`}
            >
              <div className="font-medium">Варианты ответов</div>
              <div className="text-xs text-indigo-400">Выбирать из предложенных вариантов</div>
            </button>
            <button
              onClick={() => updateSettings({ inputMode: 'keyboard' })}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                settings.inputMode === 'keyboard'
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-indigo-700 hover:border-indigo-500'
              }`}
            >
              <div className="font-medium">Клавиатура</div>
              <div className="text-xs text-indigo-400">Вводить ответ вручную</div>
            </button>
          </CardContent>
        </Card>

        <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-base text-amber-300">Звук</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-indigo-200">Звуковые эффекты</Label>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-indigo-200">Фоновая музыка</Label>
              <Switch
                checked={settings.musicEnabled}
                onCheckedChange={(checked) => updateSettings({ musicEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-400/30 bg-indigo-950/80 text-white">
          <CardHeader>
            <CardTitle className="text-base text-amber-300">Математика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-indigo-200">Отрицательные числа</Label>
                <p className="text-xs text-indigo-500">
                  Разрешить отрицательные результаты во всех операциях
                </p>
              </div>
              <Switch
                checked={settings.negativeNumbers}
                onCheckedChange={(checked) => updateSettings({ negativeNumbers: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
