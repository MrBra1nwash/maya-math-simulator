import { motion } from 'framer-motion'
import { useMemo } from 'react'

type Direction = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top'

const DIRECTIONS: Direction[] = ['left-to-right', 'right-to-left', 'top-to-bottom', 'bottom-to-top']

interface PenguinConfig {
  id: number
  direction: Direction
  crossPos: number
  duration: number
  delay: number
  size: number
  variant: number
  waveAmplitude: number
  waveFrequency: number
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildPenguin(id: number): PenguinConfig {
  return {
    id,
    direction: DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)],
    crossPos: randRange(10, 90),
    duration: randRange(4, 8),
    delay: randRange(0, 5),
    size: randRange(48, 72),
    variant: id % 3,
    waveAmplitude: randRange(20, 60),
    waveFrequency: 2 + Math.floor(randRange(0, 3)),
  }
}

function getMainAxis(dir: Direction) {
  const isHorizontal = dir === 'left-to-right' || dir === 'right-to-left'
  const from = dir === 'left-to-right' || dir === 'top-to-bottom' ? -15 : 115
  const to = dir === 'left-to-right' || dir === 'top-to-bottom' ? 115 : -15
  return { isHorizontal, from, to }
}

function buildAllKeyframes(p: PenguinConfig) {
  const { isHorizontal, from, to } = getMainAxis(p.direction)
  const steps = 40
  const xs: number[] = []
  const ys: number[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const main = from + (to - from) * t
    const wave = Math.sin(t * Math.PI * 2 * p.waveFrequency) * p.waveAmplitude * 0.5
    if (isHorizontal) {
      xs.push(main)
      ys.push(p.crossPos + wave)
    } else {
      xs.push(p.crossPos + wave)
      ys.push(main)
    }
  }

  const rawRots: number[] = []
  for (let i = 0; i < xs.length; i++) {
    const next = Math.min(i + 1, xs.length - 1)
    const dx = xs[next] - xs[i]
    const dy = ys[next] - ys[i]
    rawRots.push(Math.atan2(dy, dx) * (180 / Math.PI) + 90)
  }

  const rots = [rawRots[0]]
  for (let i = 1; i < rawRots.length; i++) {
    let delta = rawRots[i] - rots[i - 1]
    while (delta > 180) delta -= 360
    while (delta < -180) delta += 360
    rots.push(rots[i - 1] + delta)
  }

  return {
    leftKeys: xs.map((v) => `${v}%`),
    topKeys: ys.map((v) => `${v}%`),
    rotKeys: rots,
  }
}

export default function SwimmingPenguins({ count = 8 }: { count?: number }) {
  const penguins = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const config = buildPenguin(i)
      return { ...config, ...buildAllKeyframes(config) }
    }),
    [count],
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[1]">
      {penguins.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: p.leftKeys[0],
            top: p.topKeys[0],
            rotate: p.rotKeys[0],
          }}
          animate={{
            left: p.leftKeys,
            top: p.topKeys,
            rotate: p.rotKeys,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: randRange(1, 3),
            ease: 'linear',
          }}
        >
          <MiniPenguinSVG size={p.size} variant={p.variant} />
        </motion.div>
      ))}
    </div>
  )
}

function MiniPenguinSVG({ size, variant }: { size: number; variant: number }) {
  const scarfColors = ['#FF6B9D', '#7C5CFC', '#4ECDC4']
  const scarfColor = scarfColors[variant]
  const cheekColors = ['#FFB5C5', '#C4B5FD', '#99F0E0']
  const cheekColor = cheekColors[variant]

  return (
    <svg width={size} height={size * 1.17} viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`spBody${variant}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="42" rx="18" ry="22" fill={`url(#spBody${variant})`} />
      <ellipse cx="30" cy="45" rx="13" ry="16" fill="#F3F4F6" />
      <circle cx="30" cy="22" r="14" fill="#1F2937" />
      <ellipse cx="30" cy="25" rx="10" ry="8" fill="#F9FAFB" />
      <ellipse cx="20" cy="24" rx="4" ry="3" fill={cheekColor} opacity="0.6" />
      <ellipse cx="40" cy="24" rx="4" ry="3" fill={cheekColor} opacity="0.6" />
      <circle cx="25" cy="18" r="2.5" fill="white" />
      <circle cx="35" cy="18" r="2.5" fill="white" />
      <circle cx="25.8" cy="18" r="1.3" fill="#1F2937" />
      <circle cx="35.8" cy="18" r="1.3" fill="#1F2937" />
      <circle cx="26.3" cy="17" r="0.6" fill="white" />
      <circle cx="36.3" cy="17" r="0.6" fill="white" />
      <path d="M26 24 L30 28 L34 24" fill="#FFB347" />
      <path d="M16 32 Q30 37 44 32 Q44 38 44 38 Q30 42 16 38 Z" fill={scarfColor} />
      <rect x="36" y="34" width="5" height="10" rx="2.5" fill={scarfColor} />
      <ellipse cx="12" cy="42" rx="5" ry="12" fill="#374151" transform="rotate(-5 12 42)" />
      <ellipse cx="48" cy="42" rx="5" ry="12" fill="#374151" transform="rotate(5 48 42)" />
      <ellipse cx="22" cy="62" rx="6" ry="3.5" fill="#FFB347" />
      <ellipse cx="38" cy="62" rx="6" ry="3.5" fill="#FFB347" />
    </svg>
  )
}
