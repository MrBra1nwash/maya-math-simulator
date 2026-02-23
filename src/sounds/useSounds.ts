import { useCallback, useEffect, useMemo } from 'react'

let ctx: AudioContext | null = null
let unlocked = false

function unlockAudio() {
  try {
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioContext()
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    if (!unlocked && ctx.state === 'running') {
      const silent = ctx.createBuffer(1, 1, ctx.sampleRate)
      const src = ctx.createBufferSource()
      src.buffer = silent
      src.connect(ctx.destination)
      src.start()
      unlocked = true
    }
  } catch {
    // ignore
  }
}

function getCtx(): AudioContext | null {
  try {
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioContext()
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    return ctx
  } catch {
    return null
  }
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  vol: number,
  type: OscillatorType = 'sine',
) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.frequency.value = freq
  osc.type = type
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(vol, start + 0.01)
  gain.gain.linearRampToValueAtTime(0, start + dur)
  osc.start(start)
  osc.stop(start + dur)
}

function correctSound(ac: AudioContext) {
  const t = ac.currentTime
  tone(ac, 523.25, t, 0.15, 0.25, 'triangle')
  tone(ac, 659.25, t + 0.1, 0.15, 0.25, 'triangle')
  tone(ac, 783.99, t + 0.2, 0.2, 0.3, 'triangle')
}

function wrongSound(ac: AudioContext) {
  const t = ac.currentTime
  const dur = 0.6

  const noise = ac.createBufferSource()
  const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1)
  }
  noise.buffer = buf

  const noiseFilter = ac.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.setValueAtTime(250, t)
  noiseFilter.frequency.linearRampToValueAtTime(120, t + dur * 0.3)
  noiseFilter.frequency.linearRampToValueAtTime(80, t + dur)
  noiseFilter.Q.value = 3

  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0, t)
  noiseGain.gain.linearRampToValueAtTime(0.25, t + 0.03)
  noiseGain.gain.setValueAtTime(0.2, t + 0.1)
  noiseGain.gain.linearRampToValueAtTime(0.25, t + 0.15)
  noiseGain.gain.linearRampToValueAtTime(0.1, t + 0.25)
  noiseGain.gain.linearRampToValueAtTime(0.2, t + 0.3)
  noiseGain.gain.linearRampToValueAtTime(0.05, t + 0.45)
  noiseGain.gain.linearRampToValueAtTime(0, t + dur)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(ac.destination)

  const flutter = ac.createOscillator()
  const flutterGain = ac.createGain()
  flutter.type = 'sawtooth'
  flutter.frequency.setValueAtTime(80, t)
  flutter.frequency.linearRampToValueAtTime(40, t + dur)
  flutterGain.gain.setValueAtTime(0, t)
  flutterGain.gain.linearRampToValueAtTime(0.1, t + 0.03)
  flutterGain.gain.linearRampToValueAtTime(0, t + dur)
  flutter.connect(flutterGain)
  flutterGain.connect(ac.destination)

  const motorboat = ac.createOscillator()
  const mbGain = ac.createGain()
  motorboat.type = 'square'
  motorboat.frequency.setValueAtTime(15, t)
  motorboat.frequency.linearRampToValueAtTime(8, t + dur)
  mbGain.gain.value = 0.15
  motorboat.connect(mbGain)
  mbGain.connect(noiseGain.gain)

  noise.start(t)
  noise.stop(t + dur)
  flutter.start(t)
  flutter.stop(t + dur)
  motorboat.start(t)
  motorboat.stop(t + dur)
}

function streakSound(ac: AudioContext) {
  const t = ac.currentTime
  tone(ac, 523.25, t, 0.1, 0.2, 'triangle')
  tone(ac, 659.25, t + 0.08, 0.1, 0.2, 'triangle')
  tone(ac, 783.99, t + 0.16, 0.1, 0.22, 'triangle')
  tone(ac, 1046.5, t + 0.24, 0.2, 0.25, 'triangle')
}

function completeSound(ac: AudioContext) {
  const t = ac.currentTime
  tone(ac, 523.25, t, 0.12, 0.2, 'triangle')
  tone(ac, 659.25, t + 0.1, 0.12, 0.2, 'triangle')
  tone(ac, 783.99, t + 0.2, 0.12, 0.22, 'triangle')
  tone(ac, 1046.5, t + 0.3, 0.25, 0.25, 'triangle')
  tone(ac, 1318.5, t + 0.45, 0.3, 0.2, 'triangle')
}

function clickSound(ac: AudioContext) {
  const t = ac.currentTime
  tone(ac, 1200, t, 0.04, 0.1, 'sine')
}

function play(fn: (ac: AudioContext) => void) {
  try {
    unlockAudio()
    const ac = getCtx()
    if (ac) fn(ac)
  } catch {
    // silently ignore audio errors
  }
}

export interface UseSoundsOptions {
  enabled: boolean
}

export function useSounds({ enabled }: UseSoundsOptions) {
  useEffect(() => {
    if (!enabled) return
    const handler = () => unlockAudio()
    document.addEventListener('touchstart', handler, { once: true })
    document.addEventListener('click', handler, { once: true })
    return () => {
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('click', handler)
    }
  }, [enabled])

  const playCorrect = useCallback(() => { if (enabled) play(correctSound) }, [enabled])
  const playWrong = useCallback(() => { if (enabled) play(wrongSound) }, [enabled])
  const playStreak = useCallback(() => { if (enabled) play(streakSound) }, [enabled])
  const playComplete = useCallback(() => { if (enabled) play(completeSound) }, [enabled])
  const playClick = useCallback(() => { if (enabled) play(clickSound) }, [enabled])

  return useMemo(
    () => ({ playCorrect, playWrong, playStreak, playComplete, playClick }),
    [playCorrect, playWrong, playStreak, playComplete, playClick],
  )
}
