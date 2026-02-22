import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Input } from '@/components/ui/input'
import FloatingElements from '@/components/effects/FloatingElements'
import PageTransition from '@/components/effects/PageTransition'
import AnimatedButton from '@/components/effects/AnimatedButton'
import CapybaraMascot from '@/components/Mascot/CapybaraMascot'
import SwimmingPenguins from '@/components/effects/SwimmingPenguins'

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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4">
      <FloatingElements />
      <SwimmingPenguins count={8} />
      <PageTransition>
        <div className="relative z-10 flex w-full max-w-md flex-col items-center">
          <div className="mb-4 flex justify-center">
            <CapybaraMascot mood="idle" size={140} />
          </div>
          <div className="w-full rounded-3xl border border-purple-100/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
            <h1 className="mb-2 text-center text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Школа Магии Математики
            </h1>
            <p className="mb-1 text-center text-purple-600">
              Как тебя зовут, юный маг?
            </p>
            <p className="mb-6 text-center text-2xl">🐹🪄✨</p>
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
                className="h-12 flex-1 rounded-2xl border-purple-200 bg-white/90 text-gray-700 placeholder:text-purple-300 focus:border-pink-400 focus:ring-pink-200"
                autoFocus
              />
              <AnimatedButton
                type="submit"
                variant="primary"
                disabled={!name.trim() || isLoading}
              >
                Войти
              </AnimatedButton>
            </form>

            {profiles.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm text-purple-600">Или выбери свой профиль:</p>
                <div className="flex flex-wrap gap-2">
                  {profiles.map((p) => (
                    <AnimatedButton
                      key={p}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogin(p)}
                      disabled={isLoading}
                    >
                      {p}
                    </AnimatedButton>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  )
}
