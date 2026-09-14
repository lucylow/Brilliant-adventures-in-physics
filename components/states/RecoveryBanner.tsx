import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function RecoveryBanner({
  message,
  tone = "warning",
}: {
  message: string;
  tone?: "warning" | "error" | "info";
}) {
  const colors = useColors();
  const border = tone === "error" ? colors.error : tone === "info" ? colors.primary : colors.warning;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        borderWidth: 1,
        borderColor: border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: colors.surface,
      }}
    >
      <Text style={{ color: colors.foreground, lineHeight: 20 }}>{message}</Text>
    </View>
  );
}
