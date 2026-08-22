import { Text } from "react-native";
import type { DraftSaveStatus } from "@/hooks/use-draft-autosave";
import { useColors } from "@/hooks/use-colors";

export function DraftStatus({ status }: { status: DraftSaveStatus }) {
  const colors = useColors();
  if (status === "idle") return null;
  const message = status === "saving" ? "Saving draft…" : status === "retrying" ? "Connection interrupted. Retrying…" : status === "offline" ? "Offline: your draft could not be saved yet. Keep this screen open and try again when connected." : "Draft saved on this device.";
  const color = status === "offline" ? colors.warning : status === "saved" ? colors.success : colors.muted;
  return <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={{ color, fontSize: 12, lineHeight: 18, marginTop: 8 }}>{message}</Text>;
}
