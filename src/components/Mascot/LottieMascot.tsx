import Lottie from 'lottie-react'
import { useState, useEffect } from 'react'

interface LottieMascotProps {
  src: string
  size?: number
  loop?: boolean
}

export default function LottieMascot({ src, size = 120, loop = true }: LottieMascotProps) {
  const [animationData, setAnimationData] = useState<object | null>(null)

  useEffect(() => {
    fetch(src)
      .then((r) => r.json())
      .then(setAnimationData)
      .catch(() => {})
  }, [src])

  if (!animationData) return null

  return (
    <div style={{ width: size, height: size }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
