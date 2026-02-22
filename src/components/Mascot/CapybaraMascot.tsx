import { motion } from 'framer-motion'
import type { MascotMood } from '@/types'

interface CapybaraMascotProps {
  mood: MascotMood
  size?: number
}

const moodConfig: Record<MascotMood, { label: string }> = {
  idle: { label: '🐹 Капибара-маг ждёт...' },
  thinking: { label: '🤔 Хм, думаю...' },
  happy: { label: '🎉 Ура, правильно!' },
  sad: { label: '💪 Попробуй ещё!' },
  excited: { label: '🤩 Невероятно!' },
  dancing: { label: '💃 Танцуем!' },
}

const moodAnimations: Record<MascotMood, object> = {
  idle: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  thinking: {
    rotate: [-3, 3, -3],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
  happy: {
    scale: [1, 1.15, 1],
    y: [0, -20, 0],
    transition: { repeat: 2, duration: 0.4, ease: 'easeOut' },
  },
  sad: {
    y: [0, 3, 0],
    rotate: [-2, 0, -2],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
  excited: {
    scale: [1, 1.15, 1, 1.15, 1],
    rotate: [0, -8, 8, -8, 0],
    transition: { repeat: 1, duration: 0.6, ease: 'easeOut' },
  },
  dancing: {
    rotate: [0, -12, 12, -12, 12, 0],
    y: [0, -10, 0, -10, 0],
    transition: { repeat: Infinity, duration: 1, ease: 'easeInOut' },
  },
}

export default function CapybaraMascot({ mood, size = 120 }: CapybaraMascotProps) {
  const config = moodConfig[mood]
  const animation = moodAnimations[mood]

  return (
    <div className="flex flex-col items-center gap-2" role="img" aria-label={config.label}>
      <motion.div
        animate={animation}
        className="select-none drop-shadow-lg"
      >
        <KawaiiCapybaraSVG mood={mood} size={size} />
      </motion.div>
      <span className="text-xs font-medium text-purple-600">
        {config.label}
      </span>
    </div>
  )
}

function KawaiiCapybaraSVG({ mood, size }: { mood: MascotMood; size: number }) {
  const isHappy = mood === 'happy' || mood === 'excited' || mood === 'dancing'
  const isSad = mood === 'sad'
  const hatColor = isHappy ? '#FF6B9D' : '#7C5CFC'
  const hatBand = isHappy ? '#FFB347' : '#C084FC'
  const cheekColor = isHappy ? '#FF9EC6' : '#FFB5C5'

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#F5D5B0" />
          <stop offset="100%" stopColor="#D4A574" />
        </radialGradient>
        <radialGradient id="bellyGrad" cx="50%" cy="45%">
          <stop offset="0%" stopColor="#FFF0DB" />
          <stop offset="100%" stopColor="#F0D5A8" />
        </radialGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#00000015" />
        </filter>
      </defs>

      {/* wizard hat */}
      <path d="M70 8 L50 48 L90 48 Z" fill={hatColor} filter="url(#softShadow)" />
      <ellipse cx="70" cy="48" rx="24" ry="6" fill={hatColor} />
      <rect x="50" y="45" width="40" height="5" rx="2" fill={hatBand} />
      <circle cx="68" cy="24" r="4" fill="#FDE68A" />
      <circle cx="72" cy="18" r="2.5" fill="#FFF0A0" opacity="0.8" />

      {/* ears */}
      <ellipse cx="48" cy="50" rx="8" ry="5" fill="#D4A574" transform="rotate(-15 48 50)" />
      <ellipse cx="48" cy="50" rx="5" ry="3" fill="#EDCBA0" transform="rotate(-15 48 50)" />
      <ellipse cx="92" cy="50" rx="8" ry="5" fill="#D4A574" transform="rotate(15 92 50)" />
      <ellipse cx="92" cy="50" rx="5" ry="3" fill="#EDCBA0" transform="rotate(15 92 50)" />

      {/* body */}
      <ellipse cx="70" cy="90" rx="35" ry="32" fill="url(#bodyGrad)" filter="url(#softShadow)" />
      <ellipse cx="70" cy="94" rx="26" ry="22" fill="url(#bellyGrad)" />

      {/* head */}
      <ellipse cx="70" cy="65" rx="26" ry="20" fill="url(#bodyGrad)" />
      <ellipse cx="70" cy="68" rx="20" ry="14" fill="url(#bellyGrad)" />

      {/* cheeks */}
      <ellipse cx="50" cy="68" rx="7" ry="5" fill={cheekColor} opacity="0.5" />
      <ellipse cx="90" cy="68" rx="7" ry="5" fill={cheekColor} opacity="0.5" />

      {/* nose */}
      <ellipse cx="70" cy="65" rx="6" ry="3.5" fill="#A07040" />
      <ellipse cx="68" cy="64" rx="2" ry="1.2" fill="#C09060" />

      {/* eyes */}
      {isHappy ? (
        <>
          <path d="M58 58 Q62 54 66 58" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M74 58 Q78 54 82 58" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : isSad ? (
        <>
          <circle cx="60" cy="57" r="3.5" fill="#4C1D95" />
          <circle cx="80" cy="57" r="3.5" fill="#4C1D95" />
          <circle cx="61" cy="55.5" r="1.2" fill="white" />
          <circle cx="81" cy="55.5" r="1.2" fill="white" />
          <path d="M57 55 Q59 57 63 55" stroke="#4C1D95" strokeWidth="1" fill="none" />
          <path d="M77 55 Q79 57 83 55" stroke="#4C1D95" strokeWidth="1" fill="none" />
          <ellipse cx="65" cy="62" rx="2" ry="2.5" fill="#93C5FD" opacity="0.6" />
        </>
      ) : (
        <>
          <circle cx="60" cy="57" r="3.5" fill="#4C1D95" />
          <circle cx="80" cy="57" r="3.5" fill="#4C1D95" />
          <circle cx="61.5" cy="55.5" r="1.5" fill="white" />
          <circle cx="81.5" cy="55.5" r="1.5" fill="white" />
        </>
      )}

      {/* mouth */}
      {isHappy ? (
        <path d="M62 71 Q70 78 78 71" stroke="#A07040" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : isSad ? (
        <path d="M64 73 Q70 70 76 73" stroke="#A07040" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M64 72 Q70 74 76 72" stroke="#A07040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* whiskers */}
      <line x1="42" y1="64" x2="54" y2="66" stroke="#C09060" strokeWidth="0.8" opacity="0.6" />
      <line x1="42" y1="68" x2="54" y2="68" stroke="#C09060" strokeWidth="0.8" opacity="0.6" />
      <line x1="86" y1="66" x2="98" y2="64" stroke="#C09060" strokeWidth="0.8" opacity="0.6" />
      <line x1="86" y1="68" x2="98" y2="68" stroke="#C09060" strokeWidth="0.8" opacity="0.6" />

      {/* wand */}
      <line x1="100" y1="80" x2="118" y2="55" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
      <circle cx="120" cy="52" r="5" fill="#FFB347" />
      <circle cx="120" cy="52" r="3" fill="#FDE68A" />
      {isHappy && (
        <>
          <circle cx="114" cy="46" r="2" fill="#FF6B9D" opacity="0.7" />
          <circle cx="126" cy="48" r="1.5" fill="#7C5CFC" opacity="0.6" />
          <circle cx="118" cy="42" r="1.5" fill="#FFB347" opacity="0.7" />
          <circle cx="124" cy="42" r="1" fill="#4ECDC4" opacity="0.5" />
        </>
      )}

      {/* feet */}
      <ellipse cx="55" cy="118" rx="10" ry="5" fill="#C4956A" />
      <ellipse cx="85" cy="118" rx="10" ry="5" fill="#C4956A" />
    </svg>
  )
}
