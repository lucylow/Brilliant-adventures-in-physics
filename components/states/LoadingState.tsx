import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function LoadingState({
  title = "Loading",
  body = "Please wait while this page prepares.",
}: {
  title?: string;
  body?: string;
}) {
  const colors = useColors();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={title}
      accessibilityHint={body}
      style={{ padding: 24, gap: 10, minHeight: 120, justifyContent: "center" }}
    >
      <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{title}</Text>
      <Text style={{ color: colors.muted, lineHeight: 21 }}>{body}</Text>
    </View>
  );
}
