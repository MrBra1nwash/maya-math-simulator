import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface SparkleEffectProps {
  active: boolean
  color?: string
}

export default function SparkleEffect({ active, color = '#FFB347' }: SparkleEffectProps) {
  const [sparkles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      distance: 30 + Math.random() * 40,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.3,
    }))
  )

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {sparkles.map((s) => {
            const x = Math.cos((s.angle * Math.PI) / 180) * s.distance
            const y = Math.sin((s.angle * Math.PI) / 180) * s.distance
            return (
              <motion.div
                key={s.id}
                className="absolute rounded-full"
                style={{ width: s.size, height: s.size, backgroundColor: color }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], x, y, scale: [0, 1.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: s.delay, ease: 'easeOut' }}
              />
            )
          })}
          <motion.div
            className="absolute text-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
          >
            ✨
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
