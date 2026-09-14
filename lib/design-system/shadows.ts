import { Platform } from "react-native";
import type { ViewStyle } from "react-native";
import { withAlpha } from "./tokens";

export type CardElevation = "flat" | "border" | "soft" | "featured" | "scientific";

export function cardShadow(elevation: CardElevation, navy = "#111827"): ViewStyle {
  if (elevation === "flat" || elevation === "scientific") return {};
  if (Platform.OS === "android") {
    return { elevation: elevation === "featured" ? 8 : elevation === "soft" ? 3 : 1 };
  }
  if (elevation === "featured") {
    return {
      shadowColor: "#2563EB",
      shadowOpacity: 0.32,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    };
  }
  if (elevation === "soft") {
    return {
      shadowColor: navy,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    };
  }
  return {
    shadowColor: navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  };
}

export function heroShadow(): ViewStyle {
  if (Platform.OS === "android") return { elevation: 10 };
  return {
    shadowColor: "#2563EB",
    shadowOpacity: 0.38,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  };
}

export function navShadow(navy = "#111827"): ViewStyle {
  if (Platform.OS === "android") return { elevation: 12 };
  return {
    shadowColor: navy,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  };
}

export function overlayColor(navy = "#111827"): string {
  return withAlpha(navy, 0.48);
}
