import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionGlobalConfig } from 'framer-motion'
import './index.css'
import App from './App.tsx'

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  MotionGlobalConfig.skipAnimations = true
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
