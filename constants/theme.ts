/**
 * Thin re-exports so consumers don't need to know about internal theme plumbing.
 * Full implementation lives in lib/_core/theme.ts.
 */
export {
  Colors,
  Fonts,
  SchemeColors,
  ThemeColors,
} from "@/lib/_core/theme";
export type { ColorScheme, ThemeColorPalette } from "@/lib/_core/theme";
