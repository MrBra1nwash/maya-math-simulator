import { motion } from 'framer-motion'

interface PenguinFriendsProps {
  count?: number
  size?: number
  celebrating?: boolean
}

export default function PenguinFriends({ count = 3, size = 50, celebrating = false }: PenguinFriendsProps) {
  const penguins = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="flex items-end justify-center gap-2">
      {penguins.map((i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            ...(celebrating
              ? {
                  y: [0, -10, 0],
                  rotate: [0, i % 2 === 0 ? -10 : 10, 0],
                }
              : {}),
          }}
          transition={{
            delay: i * 0.15,
            duration: celebrating ? 0.5 : 0.4,
            repeat: celebrating ? 3 : 0,
            ease: 'easeOut',
          }}
        >
          <PenguinSVG size={size} variant={i % 3} celebrating={celebrating} />
        </motion.div>
      ))}
    </div>
  )
}

function PenguinSVG({ size, variant, celebrating }: { size: number; variant: number; celebrating: boolean }) {
  const scarfColors = ['#EF4444', '#3B82F6', '#10B981']
  const scarfColor = scarfColors[variant]

  return (
    <svg width={size} height={size} viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <ellipse cx="30" cy="42" rx="18" ry="22" fill="#1E293B" />
      <ellipse cx="30" cy="45" rx="12" ry="16" fill="#E2E8F0" />

      {/* head */}
      <circle cx="30" cy="22" r="14" fill="#1E293B" />
      <ellipse cx="30" cy="24" rx="9" ry="7" fill="#E2E8F0" />

      {/* eyes */}
      {celebrating ? (
        <>
          <path d="M24 20 Q26 18 28 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M32 20 Q34 18 36 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="25" cy="19" r="2" fill="white" />
          <circle cx="35" cy="19" r="2" fill="white" />
          <circle cx="25.5" cy="19" r="1" fill="#1E293B" />
          <circle cx="35.5" cy="19" r="1" fill="#1E293B" />
        </>
      )}

      {/* beak */}
      <path d="M27 24 L30 28 L33 24" fill="#F59E0B" />

      {/* scarf */}
      <path d={`M18 32 Q30 36 42 32 Q42 37 42 37 Q30 41 18 37 Z`} fill={scarfColor} />
      <rect x="35" y="33" width="4" height="10" rx="2" fill={scarfColor} />

      {/* wings */}
      <ellipse cx="12" cy="42" rx="5" ry="12" fill="#1E293B" transform={celebrating ? "rotate(-20 12 42)" : ""} />
      <ellipse cx="48" cy="42" rx="5" ry="12" fill="#1E293B" transform={celebrating ? "rotate(20 48 42)" : ""} />

      {/* feet */}
      <ellipse cx="23" cy="62" rx="5" ry="3" fill="#F59E0B" />
      <ellipse cx="37" cy="62" rx="5" ry="3" fill="#F59E0B" />
    </svg>
  )
}
