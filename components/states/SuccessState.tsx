import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function SuccessState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const colors = useColors();
  return (
    <View accessibilityRole="text" accessibilityLiveRegion="polite" style={{ padding: 20, gap: 8 }}>
      <Text accessibilityRole="header" style={{ color: colors.success, fontSize: 20, fontWeight: "800" }}>{title}</Text>
      <Text style={{ color: colors.muted, lineHeight: 21 }}>{body}</Text>
    </View>
  );
}
