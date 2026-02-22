import { motion } from 'framer-motion'

interface PenguinFriendsProps {
  count?: number
  size?: number
  celebrating?: boolean
}

export default function PenguinFriends({ count = 3, size = 50, celebrating = false }: PenguinFriendsProps) {
  const penguins = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="flex items-end justify-center gap-3">
      {penguins.map((i) => (
        <motion.div
          key={i}
          initial={{ y: 30, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            ...(celebrating
              ? {
                  y: [0, -15, 0],
                  rotate: [0, i % 2 === 0 ? -12 : 12, 0],
                }
              : {}),
          }}
          transition={{
            delay: i * 0.15,
            duration: celebrating ? 0.5 : 0.4,
            repeat: celebrating ? 3 : 0,
            ease: 'easeOut',
          }}
          className="drop-shadow-md"
        >
          <KawaiiPenguinSVG size={size} variant={i % 3} celebrating={celebrating} />
        </motion.div>
      ))}
    </div>
  )
}

function KawaiiPenguinSVG({ size, variant, celebrating }: { size: number; variant: number; celebrating: boolean }) {
  const scarfColors = ['#FF6B9D', '#7C5CFC', '#4ECDC4']
  const scarfColor = scarfColors[variant]
  const cheekColors = ['#FFB5C5', '#C4B5FD', '#99F0E0']
  const cheekColor = cheekColors[variant]

  return (
    <svg width={size} height={size * 1.17} viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`pgBody${variant}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </radialGradient>
      </defs>

      {/* body */}
      <ellipse cx="30" cy="42" rx="18" ry="22" fill={`url(#pgBody${variant})`} />
      <ellipse cx="30" cy="45" rx="13" ry="16" fill="#F3F4F6" />

      {/* head */}
      <circle cx="30" cy="22" r="14" fill="#1F2937" />
      <ellipse cx="30" cy="25" rx="10" ry="8" fill="#F9FAFB" />

      {/* cheeks */}
      <ellipse cx="20" cy="24" rx="4" ry="3" fill={cheekColor} opacity="0.6" />
      <ellipse cx="40" cy="24" rx="4" ry="3" fill={cheekColor} opacity="0.6" />

      {/* eyes */}
      {celebrating ? (
        <>
          <path d="M23 19 Q26 16 29 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M31 19 Q34 16 37 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="25" cy="18" r="2.5" fill="white" />
          <circle cx="35" cy="18" r="2.5" fill="white" />
          <circle cx="25.8" cy="18" r="1.3" fill="#1F2937" />
          <circle cx="35.8" cy="18" r="1.3" fill="#1F2937" />
          <circle cx="26.3" cy="17" r="0.6" fill="white" />
          <circle cx="36.3" cy="17" r="0.6" fill="white" />
        </>
      )}

      {/* beak */}
      <path d="M26 24 L30 28 L34 24" fill="#FFB347" />

      {/* scarf */}
      <path d="M16 32 Q30 37 44 32 Q44 38 44 38 Q30 42 16 38 Z" fill={scarfColor} />
      <rect x="36" y="34" width="5" height="10" rx="2.5" fill={scarfColor} />

      {/* wings */}
      <ellipse cx="12" cy="42" rx="5" ry="12" fill="#374151" transform={celebrating ? "rotate(-25 12 42)" : "rotate(-5 12 42)"} />
      <ellipse cx="48" cy="42" rx="5" ry="12" fill="#374151" transform={celebrating ? "rotate(25 48 42)" : "rotate(5 48 42)"} />

      {/* feet */}
      <ellipse cx="22" cy="62" rx="6" ry="3.5" fill="#FFB347" />
      <ellipse cx="38" cy="62" rx="6" ry="3.5" fill="#FFB347" />

      {/* sparkle if celebrating */}
      {celebrating && (
        <>
          <circle cx="10" cy="12" r="2" fill="#FFB347" opacity="0.7" />
          <circle cx="50" cy="10" r="1.5" fill="#FF6B9D" opacity="0.6" />
          <circle cx="45" cy="5" r="1" fill="#7C5CFC" opacity="0.5" />
        </>
      )}
    </svg>
  )
}
