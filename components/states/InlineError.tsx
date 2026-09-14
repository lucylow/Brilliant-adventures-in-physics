import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function InlineError({
  message,
  diagnosticId,
}: {
  message: string;
  diagnosticId?: string;
}) {
  const colors = useColors();
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={{ paddingVertical: 8 }}>
      <Text style={{ color: colors.error, lineHeight: 20 }}>{message}</Text>
      {diagnosticId ? <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Reference {diagnosticId}</Text> : null}
    </View>
  );
}
