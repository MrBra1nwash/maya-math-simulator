import { motion } from 'framer-motion'
import { useMemo } from 'react'

const CONFETTI_COLORS = ['#FF6B9D', '#7C5CFC', '#FFB347', '#4ECDC4', '#FF6B6B', '#C44DFF', '#45B7D1', '#FFA07A']
const CONFETTI_SHAPES = ['●', '■', '▲', '★', '♦']

interface ConfettiPiece {
  id: number
  color: string
  shape: string
  x: number
  delay: number
  rotation: number
  size: number
}

export default function ConfettiOverlay({ active = true }: { active?: boolean }) {
  const pieces: ConfettiPiece[] = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 14,
      })),
    [],
  )

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
            color: piece.color,
            fontSize: piece.size,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: ['-5vh', '110vh'],
            rotate: [0, piece.rotation + 720],
            opacity: [1, 1, 0],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        >
          {piece.shape}
        </motion.div>
      ))}
    </div>
  )
}
