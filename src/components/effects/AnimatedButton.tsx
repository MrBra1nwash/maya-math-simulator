import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedButtonProps {
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
  disabled?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50',
  secondary: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-200/50',
  outline: 'bg-white/80 backdrop-blur-sm border-2 border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50/80',
  ghost: 'bg-transparent text-purple-500 hover:bg-purple-50',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  pulse = false,
  className = '',
  disabled,
  type = 'button',
  onClick,
}: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
      whileTap={disabled ? undefined : { scale: 0.95, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
      animate={pulse && !disabled ? { scale: [1, 1.02, 1] } : undefined}
      transition={pulse ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : { type: 'spring', stiffness: 400, damping: 17 }}
      className={`font-bold transition-colors duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
