import { useCallback, useEffect, useMemo } from 'react'

let ctx: AudioContext | null = null
let unlocked = false

const CORRECT_PHRASES = ['/sounds/correct-1.m4a', '/sounds/correct-2.m4a', '/sounds/correct-3.m4a']
const phraseCache = new Map<string, AudioBuffer>()

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

async function playCorrectPhrase(ac: AudioContext) {
  const url = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)]

  let buffer = phraseCache.get(url)
  if (!buffer) {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      buffer = await ac.decodeAudioData(arrayBuffer)
      phraseCache.set(url, buffer)
    } catch {
      return
    }
  }

  const source = ac.createBufferSource()
  source.buffer = buffer
  source.connect(ac.destination)
  source.start()
}

function preloadPhrases(ac: AudioContext) {
  for (const url of CORRECT_PHRASES) {
    if (phraseCache.has(url)) continue
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => ac.decodeAudioData(buf))
      .then((decoded) => phraseCache.set(url, decoded))
      .catch(() => {})
  }
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

function play(fn: (ac: AudioContext) => void) {
  try {
    unlockAudio()
    const ac = getCtx()
    if (ac) fn(ac)
  } catch {
    // silently ignore audio errors
  }
}

const noop = () => {}

export interface UseSoundsOptions {
  enabled: boolean
}

export function useSounds({ enabled }: UseSoundsOptions) {
  useEffect(() => {
    if (!enabled) return
    const handler = () => {
      unlockAudio()
      const ac = getCtx()
      if (ac) preloadPhrases(ac)
    }
    document.addEventListener('touchstart', handler, { once: true })
    document.addEventListener('click', handler, { once: true })
    return () => {
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('click', handler)
    }
  }, [enabled])

  const playCorrect = useCallback(() => {
    if (!enabled) return
    unlockAudio()
    const ac = getCtx()
    if (ac) {
      preloadPhrases(ac)
      playCorrectPhrase(ac)
    }
  }, [enabled])
  const playWrong = useCallback(() => { if (enabled) play(wrongSound) }, [enabled])

  return useMemo(
    () => ({
      playCorrect,
      playWrong,
      playStreak: playCorrect,
      playComplete: noop,
      playClick: noop,
    }),
    [playCorrect, playWrong],
  )
}
