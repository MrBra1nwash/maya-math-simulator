import { motion, AnimatePresence } from 'framer-motion'
import type { MascotMood } from '@/types'

interface CapybaraMascotProps {
  mood: MascotMood
  size?: number
}

const moodConfig: Record<MascotMood, { emoji: string; label: string }> = {
  idle: { emoji: '🧙', label: 'Капибара-маг думает...' },
  thinking: { emoji: '🤔', label: 'Капибара думает...' },
  happy: { emoji: '🎉', label: 'Капибара радуется!' },
  sad: { emoji: '😢', label: 'Капибара грустит...' },
  excited: { emoji: '🤩', label: 'Капибара в восторге!' },
  dancing: { emoji: '💃', label: 'Капибара танцует!' },
}

const moodAnimations: Record<MascotMood, object> = {
  idle: {
    y: [0, -5, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  thinking: {
    rotate: [-3, 3, -3],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
  happy: {
    scale: [1, 1.2, 1],
    y: [0, -15, 0],
    transition: { repeat: 2, duration: 0.4, ease: 'easeOut' },
  },
  sad: {
    y: [0, 3, 0],
    rotate: [-2, 0, -2],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
  excited: {
    scale: [1, 1.15, 1, 1.15, 1],
    rotate: [0, -10, 10, -10, 0],
    transition: { repeat: 1, duration: 0.6, ease: 'easeOut' },
  },
  dancing: {
    rotate: [0, -15, 15, -15, 15, 0],
    y: [0, -10, 0, -10, 0],
    transition: { repeat: Infinity, duration: 1, ease: 'easeInOut' },
  },
}

export default function CapybaraMascot({ mood, size = 120 }: CapybaraMascotProps) {
  const config = moodConfig[mood]
  const animation = moodAnimations[mood]

  return (
    <div className="flex flex-col items-center gap-1" role="img" aria-label={config.label}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, ...animation }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: size * 0.7, lineHeight: 1 }}
          className="select-none"
        >
          <CapybaraSVG mood={mood} size={size} />
        </motion.div>
      </AnimatePresence>
      <motion.span
        key={`label-${mood}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-indigo-400"
      >
        {config.label}
      </motion.span>
    </div>
  )
}

function CapybaraSVG({ mood, size }: { mood: MascotMood; size: number }) {
  const eyeVariant = mood === 'happy' || mood === 'excited' || mood === 'dancing'
    ? 'happy'
    : mood === 'sad'
    ? 'sad'
    : 'normal'

  const hatColor = mood === 'excited' || mood === 'dancing' ? '#FFD700' : '#6B21A8'

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* wizard hat */}
      <path d="M60 5 L45 40 L75 40 Z" fill={hatColor} stroke="#4C1D95" strokeWidth="1.5" />
      <ellipse cx="60" cy="40" rx="20" ry="5" fill={hatColor} stroke="#4C1D95" strokeWidth="1.5" />
      {/* hat star */}
      <circle cx="58" cy="22" r="3" fill="#FDE68A" />

      {/* body */}
      <ellipse cx="60" cy="75" rx="30" ry="28" fill="#C4956A" />
      <ellipse cx="60" cy="78" rx="24" ry="20" fill="#D4A574" />

      {/* head */}
      <ellipse cx="60" cy="55" rx="22" ry="18" fill="#C4956A" />
      <ellipse cx="60" cy="58" rx="18" ry="13" fill="#D4A574" />

      {/* ears */}
      <ellipse cx="42" cy="44" rx="6" ry="4" fill="#C4956A" transform="rotate(-20 42 44)" />
      <ellipse cx="78" cy="44" rx="6" ry="4" fill="#C4956A" transform="rotate(20 78 44)" />

      {/* nose */}
      <ellipse cx="60" cy="56" rx="5" ry="3" fill="#8B6914" />

      {/* eyes */}
      {eyeVariant === 'happy' && (
        <>
          <path d="M50 50 Q53 47 56 50" stroke="#4C1D95" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M64 50 Q67 47 70 50" stroke="#4C1D95" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {eyeVariant === 'sad' && (
        <>
          <circle cx="52" cy="49" r="2.5" fill="#4C1D95" />
          <circle cx="68" cy="49" r="2.5" fill="#4C1D95" />
          <path d="M50 47 Q52 49 54 47" stroke="#4C1D95" strokeWidth="1" fill="none" />
          <path d="M66 47 Q68 49 70 47" stroke="#4C1D95" strokeWidth="1" fill="none" />
          {/* tear */}
          <circle cx="54" cy="53" r="1.5" fill="#93C5FD" opacity="0.8" />
        </>
      )}
      {eyeVariant === 'normal' && (
        <>
          <circle cx="52" cy="49" r="2.5" fill="#4C1D95" />
          <circle cx="68" cy="49" r="2.5" fill="#4C1D95" />
          <circle cx="53" cy="48" r="0.8" fill="white" />
          <circle cx="69" cy="48" r="0.8" fill="white" />
        </>
      )}

      {/* mouth */}
      {(mood === 'happy' || mood === 'excited' || mood === 'dancing') ? (
        <path d="M54 61 Q60 66 66 61" stroke="#8B6914" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : mood === 'sad' ? (
        <path d="M55 63 Q60 60 65 63" stroke="#8B6914" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M55 62 L65 62" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* whiskers */}
      <line x1="38" y1="55" x2="48" y2="56" stroke="#8B6914" strokeWidth="0.8" />
      <line x1="38" y1="58" x2="48" y2="58" stroke="#8B6914" strokeWidth="0.8" />
      <line x1="72" y1="56" x2="82" y2="55" stroke="#8B6914" strokeWidth="0.8" />
      <line x1="72" y1="58" x2="82" y2="58" stroke="#8B6914" strokeWidth="0.8" />

      {/* wand (for wizard) */}
      <line x1="85" y1="65" x2="100" y2="45" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="43" r="4" fill="#FDE68A" />
      {mood === 'happy' || mood === 'excited' ? (
        <>
          <circle cx="95" cy="38" r="1.5" fill="#FDE68A" opacity="0.7" />
          <circle cx="105" cy="40" r="1" fill="#FDE68A" opacity="0.5" />
          <circle cx="98" cy="35" r="1" fill="#FDE68A" opacity="0.6" />
        </>
      ) : null}

      {/* feet */}
      <ellipse cx="48" cy="100" rx="8" ry="4" fill="#A0764A" />
      <ellipse cx="72" cy="100" rx="8" ry="4" fill="#A0764A" />
    </svg>
  )
}
