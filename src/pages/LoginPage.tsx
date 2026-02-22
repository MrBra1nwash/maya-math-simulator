import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CapybaraMascot from '@/components/Mascot/CapybaraMascot'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [profiles, setProfiles] = useState<string[]>([])
  const { login, isLoading, getAvailableProfiles } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    getAvailableProfiles().then(setProfiles)
  }, [getAvailableProfiles])

  const handleLogin = async (loginName: string) => {
    if (!loginName.trim()) return
    await login(loginName.trim())
    navigate('/home')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 p-4">
      <Card className="w-full max-w-md border-amber-400/30 bg-indigo-950/80 text-white shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-2">
            <CapybaraMascot mood="idle" size={100} />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-300">
            Школа Магии Математики
          </CardTitle>
          <p className="text-indigo-300">Как тебя зовут, юный маг?</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin(name)
            }}
            className="flex gap-2"
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введи своё имя..."
              className="border-indigo-600 bg-indigo-900/50 text-white placeholder:text-indigo-400"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="bg-amber-500 text-indigo-950 hover:bg-amber-400"
            >
              Войти
            </Button>
          </form>

          {profiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-indigo-400">Или выбери свой профиль:</p>
              <div className="flex flex-wrap gap-2">
                {profiles.map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    onClick={() => handleLogin(p)}
                    disabled={isLoading}
                    className="border-indigo-600 text-indigo-200 hover:bg-indigo-800 hover:text-white"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
