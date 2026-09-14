import { SchemeColors, type ColorScheme } from "@/constants/theme";

export const BAV_BRAND = {
  name: "B.A.V.",
  fullName: "Brilliant Adventures in Physics",
  tagline: "Turn Curiosity Into Discovery.",
  tutorName: "Bavi",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const iconSize = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
} as const;

export const touchTarget = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

export const layout = {
  screenPadding: 20,
  sectionGap: 22,
  cardGap: 12,
  metricGap: 10,
  gridGap: 12,
  maxContentWidth: 560,
  compactPhone: 360,
  standardPhone: 390,
  largePhone: 430,
  bottomNavHeight: 64,
  headerHeight: 56,
  heroMinHeight: 168,
} as const;

export const zIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  nav: 20,
  sheet: 40,
  modal: 50,
  toast: 60,
} as const;

export const duration = {
  instant: 0,
  press: 100,
  fade: 180,
  slide: 240,
  expand: 280,
  progress: 360,
  pulse: 420,
  entrance: 220,
} as const;

export const opacity = {
  disabled: 0.45,
  pressed: 0.82,
  muted: 0.72,
  overlay: 0.48,
} as const;

export const borderWidth = {
  hairline: 0.5,
  thin: 1,
  medium: 1.5,
  thick: 2,
} as const;

export const quickActionTints = {
  tutor: { background: "#EEF2FF", accent: "#4F46E5" },
  scan: { background: "#DBEAFE", accent: "#2563EB" },
  lens: { background: "#F0FDF4", accent: "#15803D" },
  simulations: { background: "#FFF7ED", accent: "#EA580C" },
} as const;

export const scientificAccents = {
  mechanics: "#2563EB",
  waves: "#7C3AED",
  electricity: "#D97706",
  optics: "#E11D48",
  quantum: "#7C3AED",
  astronomy: "#0891B2",
  orbit: "#1D4ED8",
  vector: "#F59E0B",
  field: "#22D3EE",
} as const;

export function paletteFor(scheme: ColorScheme) {
  return scheme === "dark" ? SchemeColors.dark : SchemeColors.light;
}

export function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const clamped = Math.max(0, Math.min(1, alpha));
  const channel = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${normalized}${channel}`;
}

export function screenGutter(width: number): number {
  if (width >= 600) return 28;
  if (width >= layout.largePhone) return 22;
  if (width <= layout.compactPhone) return 16;
  return layout.screenPadding;
}

export function bottomNavClearance(insetBottom: number): number {
  return layout.bottomNavHeight + Math.max(insetBottom, 8) + spacing.md;
}

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type DurationToken = keyof typeof duration;
