import { motion } from 'framer-motion'
import { useMemo } from 'react'

const SHAPES = ['⭐', '✨', '🌟', '💫', '☁️', '🪄', '💜', '💖']

interface FloatingItem {
  id: number
  emoji: string
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function FloatingElements({ count = 15 }: { count?: number }) {
  const items: FloatingItem[] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: SHAPES[i % SHAPES.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 12 + Math.random() * 20,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 5,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute select-none opacity-20"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  )
}
