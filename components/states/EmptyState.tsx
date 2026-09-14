import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View accessibilityRole="text" style={{ padding: 28, alignItems: "center", gap: 8 }}>
      <Text accessibilityRole="header" style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", textAlign: "center" }}>{title}</Text>
      <Text style={{ color: colors.muted, lineHeight: 21, textAlign: "center" }}>{body}</Text>
      {action ? <View style={{ marginTop: 8, width: "100%" }}>{action}</View> : null}
    </View>
  );
}
