export const motion = {
  fast: 140,
  normal: 240,
  slow: 420,
  spring: { damping: 16, stiffness: 150, mass: 0.8 },
} as const;

export type MotionPrefs = {
  reducedMotion: boolean;
  haptics?: boolean;
  autoPlay?: boolean;
};

export function motionDuration(milliseconds: number, preferences: Pick<MotionPrefs, "reducedMotion">): number {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return 0;
  return preferences.reducedMotion ? 0 : milliseconds;
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function progressPercent(value: number): `${number}%` {
  return `${Math.round(clampProgress(value) * 100)}%`;
}

export function pressScale(reducedMotion: boolean): 1 | 0.97 {
  return reducedMotion ? 1 : 0.97;
}

export function shouldAutoPlay(preferences: MotionPrefs): boolean {
  return preferences.autoPlay !== false && !preferences.reducedMotion;
}
