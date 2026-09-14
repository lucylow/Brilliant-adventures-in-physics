import { Platform, type TextStyle } from "react-native";
import { Fonts } from "@/constants/theme";

export const fontFamily = {
  sans: Fonts.sans,
  mono: Fonts.mono,
} as const;

type TypeStyle = Pick<TextStyle, "fontSize" | "lineHeight" | "fontWeight" | "letterSpacing" | "fontFamily">;

function typeStyle(fontSize: number, lineHeight: number, fontWeight: TextStyle["fontWeight"], letterSpacing = 0, family: string = fontFamily.sans): TypeStyle {
  return { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily: family };
}

export const typeRamp = {
  display: typeStyle(32, 38, "800", -0.4),
  heading1: typeStyle(26, 32, "800", -0.3),
  heading2: typeStyle(22, 28, "800", -0.2),
  heading3: typeStyle(18, 24, "700", -0.1),
  body: typeStyle(16, 22, "400"),
  bodyMedium: typeStyle(16, 22, "600"),
  bodySmall: typeStyle(14, 20, "400"),
  caption: typeStyle(12, 16, "600"),
  overline: typeStyle(11, 14, "700", 0.8),
  equation: typeStyle(20, 28, "700", 0, fontFamily.mono),
  metric: typeStyle(22, 26, "800", -0.3),
  button: typeStyle(15, 20, "700"),
  navigation: typeStyle(11, 14, "600", 0.2),
} as const;

export type TypeRampName = keyof typeof typeRamp;

export function typeStyleFor(name: TypeRampName): TypeStyle {
  return typeRamp[name];
}

export function allowFontScaling(name: TypeRampName): boolean {
  return name !== "equation" && name !== "navigation";
}

export function maxFontSizeMultiplier(name: TypeRampName): number {
  if (name === "display" || name === "heading1") return 1.25;
  if (name === "metric" || name === "equation") return 1.15;
  if (name === "navigation" || name === "overline") return 1.2;
  return 1.35;
}

export const equationType = {
  ...typeRamp.equation,
  textAlign: "center" as const,
};

export const numericType = Platform.select({
  ios: { fontVariant: ["tabular-nums"] as NonNullable<TextStyle["fontVariant"]> },
  default: {},
});
