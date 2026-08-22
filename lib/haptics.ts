export type HapticKind = "tap" | "success" | "warning" | "selection";

export async function triggerHaptic(kind: HapticKind, enabled = true): Promise<void> {
  if (!enabled) return;
  try {
    const Haptics = await import("expo-haptics");
    if (kind === "tap") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (kind === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === "warning") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.selectionAsync();
  } catch {
    // Web, simulators, and older devices may not expose haptic feedback.
  }
}
