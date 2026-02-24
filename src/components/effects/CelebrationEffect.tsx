import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface CelebrationEffectProps {
  active: boolean
  streak?: number
}

const CELEBRATIONS = [
  { emojis: ['⭐', '✨', '🌟', '💫'], phrase: 'Правильно!' },
  { emojis: ['🎉', '🎊', '🥳', '🎈'], phrase: 'Супер!' },
  { emojis: ['🔥', '💥', '⚡', '✨'], phrase: 'Огонь!' },
  { emojis: ['🦄', '🌈', '💖', '✨'], phrase: 'Волшебно!' },
  { emojis: ['🚀', '💫', '🌟', '⭐'], phrase: 'Ракета!' },
  { emojis: ['🏆', '👑', '🥇', '💎'], phrase: 'Чемпион!' },
  { emojis: ['🎯', '💯', '🎪', '🎭'], phrase: 'В точку!' },
  { emojis: ['🐹', '🪄', '✨', '💜'], phrase: 'Магия!' },
]

const STREAK_CELEBRATIONS = [
  { emojis: ['🔥', '🔥', '🔥', '💥', '⚡', '🌟'], phrase: 'Серия! 🔥' },
  { emojis: ['👑', '💎', '🏆', '⭐', '✨', '🌟'], phrase: 'Невероятно!' },
  { emojis: ['🚀', '🌈', '💫', '⭐', '🦄', '✨'], phrase: 'Космос!' },
]

interface Particle {
  id: number
  emoji: string
  startX: number
  startY: number
  endX: number
  endY: number
  size: number
  delay: number
  duration: number
  rotation: number
}

function pickCelebration(isStreak: boolean) {
  if (isStreak) {
    return STREAK_CELEBRATIONS[Math.floor(Math.random() * STREAK_CELEBRATIONS.length)]
  }
  return CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]
}

function buildParticles(emojis: string[], count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + (Math.random() - 0.5) * 40
    const distance = 80 + Math.random() * 160
    const rad = (angle * Math.PI) / 180
    return {
      id: i,
      emoji: emojis[i % emojis.length],
      startX: (Math.random() - 0.5) * 20,
      startY: (Math.random() - 0.5) * 20,
      endX: Math.cos(rad) * distance,
      endY: Math.sin(rad) * distance - 50,
      size: 24 + Math.random() * 24,
      delay: Math.random() * 0.3,
      duration: 0.9 + Math.random() * 0.5,
      rotation: (Math.random() - 0.5) * 360,
    }
  })
}

function buildData(isStreak: boolean) {
  const c = pickCelebration(isStreak)
  return { celebration: c, particles: buildParticles(c.emojis, isStreak ? 18 : 12) }
}

export default function CelebrationEffect({ active, streak = 0 }: CelebrationEffectProps) {
  const isStreak = streak > 0 && streak % 5 === 0
  const [prev, setPrev] = useState(false)
  const [data, setData] = useState(() => buildData(isStreak))
  const [triggerKey, setTriggerKey] = useState(0)

  if (active && !prev) {
    setData(buildData(isStreak))
    setTriggerKey((k) => k + 1)
  }
  if (active !== prev) {
    setPrev(active)
  }

  const { celebration, particles } = data

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          {particles.map((p) => (
            <motion.div
              key={`${triggerKey}-${p.id}`}
              className="absolute select-none"
              style={{ fontSize: p.size }}
              initial={{ opacity: 0, x: p.startX, y: p.startY, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: [p.startX, p.endX],
                y: [p.startY, p.endY],
                scale: [0, 1.3, 1, 0.5],
                rotate: [0, p.rotation],
              }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            >
              {p.emoji}
            </motion.div>
          ))}

          <motion.div
            key={`phrase-${triggerKey}`}
            className="absolute text-4xl font-extrabold drop-shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D, #7C5CFC, #4ECDC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.4, 1.2, 0.8], y: [20, -20, -50, -80] }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          >
            {celebration.phrase}
          </motion.div>

          {isStreak && (
            <motion.div
              key={`streak-ring-${triggerKey}`}
              className="absolute h-40 w-40 rounded-full border-4 border-pink-400"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0.3, 3, 3.5] }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
