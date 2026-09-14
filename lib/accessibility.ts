export type AnnouncementPriority = "polite" | "assertive";

export function liveRegionProps(message: string, priority: AnnouncementPriority = "polite") {
  return {
    accessibilityLiveRegion: priority,
    accessibilityLabel: message,
    accessibilityRole: "text" as const,
  };
}

export function controlProps(label: string, hint?: string, disabled = false) {
  return {
    accessibilityRole: "button" as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: { disabled },
  };
}

export function sliderProps(label: string, value: number, min: number, max: number) {
  return {
    accessibilityRole: "adjustable" as const,
    accessibilityLabel: label,
    accessibilityValue: { min, max, now: value },
  };
}

export const MIN_TOUCH_TARGET = 44;
