import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { RetryButton } from "./RetryButton";

export function ErrorState({
  title = "This activity needs a retry",
  body = "Your local study data was not changed. You can try again or continue with what still works on this device.",
  diagnosticId,
  onRetry,
  retryLabel = "Try again",
  retrying = false,
}: {
  title?: string;
  body?: string;
  diagnosticId?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
}) {
  const colors = useColors();
  return (
    <View accessibilityRole="alert" style={{ padding: 24, gap: 12, minHeight: 160, justifyContent: "center" }}>
      <Text accessibilityRole="header" style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", lineHeight: 28 }}>{title}</Text>
      <Text style={{ color: colors.muted, lineHeight: 21 }}>{body}</Text>
      {diagnosticId ? <Text style={{ color: colors.muted, fontSize: 12 }}>Reference {diagnosticId}</Text> : null}
      {onRetry ? <RetryButton label={retryLabel} onPress={onRetry} busy={retrying} /> : null}
    </View>
  );
}
