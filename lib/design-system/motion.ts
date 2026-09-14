import { Easing } from "react-native";
import type { EasingFunction } from "react-native";
import { duration } from "./tokens";
import { motionDuration, pressScale } from "@/lib/motion";
import type { MotionPrefs } from "@/lib/motion";

export type MotionKind = "fade" | "scale" | "slide" | "press" | "expand" | "collapse" | "progress" | "pulse" | "entrance";

export const motionEasing: Record<MotionKind, EasingFunction> = {
  fade: Easing.out(Easing.cubic),
  scale: Easing.out(Easing.cubic),
  slide: Easing.out(Easing.cubic),
  press: Easing.out(Easing.quad),
  expand: Easing.out(Easing.cubic),
  collapse: Easing.in(Easing.cubic),
  progress: Easing.out(Easing.cubic),
  pulse: Easing.inOut(Easing.sin),
  entrance: Easing.out(Easing.cubic),
};

export const motionMs: Record<MotionKind, number> = {
  fade: duration.fade,
  scale: duration.press,
  slide: duration.slide,
  press: duration.press,
  expand: duration.expand,
  collapse: duration.expand,
  progress: duration.progress,
  pulse: duration.pulse,
  entrance: duration.entrance,
};

export function motionConfig(kind: MotionKind, preferences: Pick<MotionPrefs, "reducedMotion">) {
  return {
    duration: motionDuration(motionMs[kind], preferences),
    easing: motionEasing[kind],
  };
}

export function entranceDelay(index: number, preferences: Pick<MotionPrefs, "reducedMotion">): number {
  if (preferences.reducedMotion) return 0;
  return Math.min(index * 45, 270);
}

export function pressScaleValue(reducedMotion: boolean): number {
  return pressScale(reducedMotion);
}

export function shouldAnimate(preferences: Pick<MotionPrefs, "reducedMotion">): boolean {
  return !preferences.reducedMotion;
}
