import { useCallback, useMemo } from 'react';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine'
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playCorrectSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.12, 0.2);
  playTone(ctx, 659.25, now + 0.08, 0.15, 0.2);
}

function playWrongSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 120;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
  gain.gain.linearRampToValueAtTime(0, now + 0.25);
  osc.start(now);
  osc.stop(now + 0.25);
}

function playStreakSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.1, 0.18);
  playTone(ctx, 659.25, now + 0.06, 0.1, 0.18);
  playTone(ctx, 783.99, now + 0.12, 0.15, 0.2);
}

function playCompleteSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.12, 0.18);
  playTone(ctx, 659.25, now + 0.08, 0.12, 0.18);
  playTone(ctx, 783.99, now + 0.16, 0.12, 0.18);
  playTone(ctx, 1046.5, now + 0.24, 0.2, 0.2);
}

function playClickSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 1200;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.03);
  osc.start(now);
  osc.stop(now + 0.03);
}

export interface UseSoundsOptions {
  enabled: boolean;
}

export function useSounds({ enabled }: UseSoundsOptions) {
  const playCorrect = useCallback(() => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    playCorrectSound(ctx);
  }, [enabled]);

  const playWrong = useCallback(() => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    playWrongSound(ctx);
  }, [enabled]);

  const playStreak = useCallback(() => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    playStreakSound(ctx);
  }, [enabled]);

  const playComplete = useCallback(() => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    playCompleteSound(ctx);
  }, [enabled]);

  const playClick = useCallback(() => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    playClickSound(ctx);
  }, [enabled]);

  return useMemo(
    () => ({
      playCorrect,
      playWrong,
      playStreak,
      playComplete,
      playClick,
    }),
    [playCorrect, playWrong, playStreak, playComplete, playClick]
  );
}
