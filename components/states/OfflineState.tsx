import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { RetryButton } from "./RetryButton";

export function OfflineState({
  title = "You're offline",
  body = "Your current experiment is safe on this device. Local tools still work. Reconnect to retry Tutor or cloud actions.",
  onRetry,
  retrying = false,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const colors = useColors();
  return (
    <View accessibilityRole="alert" style={{ padding: 24, gap: 12 }}>
      <Text accessibilityRole="header" style={{ color: colors.foreground, fontSize: 22, fontWeight: "800" }}>{title}</Text>
      <Text style={{ color: colors.muted, lineHeight: 21 }}>{body}</Text>
      {onRetry ? <RetryButton label="Check connection" onPress={onRetry} busy={retrying} /> : null}
    </View>
  );
}
