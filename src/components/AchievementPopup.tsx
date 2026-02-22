import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAchievementDef } from '@/engine/achievements'

interface AchievementPopupProps {
  achievementIds: string[]
  onDone: () => void
}

export default function AchievementPopup({ achievementIds, onDone }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (achievementIds.length === 0) {
      onDone()
      return
    }

    const timer = setTimeout(() => {
      if (currentIndex < achievementIds.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        onDone()
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentIndex, achievementIds.length, onDone])

  if (achievementIds.length === 0) return null

  const achievement = getAchievementDef(achievementIds[currentIndex])
  if (!achievement) return null

  return (
    <AnimatePresence>
      <motion.div
        key={achievement.id}
        initial={{ y: -100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.8 }}
        className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-3 rounded-xl border border-amber-400/50 bg-indigo-950/95 px-6 py-4 shadow-2xl backdrop-blur-sm">
          <motion.span
            className="text-4xl"
            animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6 }}
          >
            {achievement.icon}
          </motion.span>
          <div>
            <div className="text-xs font-medium text-amber-400">Новое достижение!</div>
            <div className="font-bold text-white">{achievement.name}</div>
            <div className="text-xs text-purple-300">{achievement.description}</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
