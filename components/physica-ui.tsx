import { PropsWithChildren } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function Card({ children, onPress, style }: PropsWithChildren<{ onPress?: () => void; style?: StyleProp<ViewStyle> }>) {
  const colors = useColors();
  const content = <View style={[{ padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, style]}>{children}</View>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>{content}</Pressable> : content;
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ padding: 14, borderRadius: 14, backgroundColor: colors.primary, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 })}><Text style={{ color: "#FFFFFF", fontWeight: "800", textAlign: "center" }}>{label}</Text></Pressable>;
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.72 : 1 })}><Text style={{ color: colors.foreground, fontWeight: "800", textAlign: "center" }}>{label}</Text></Pressable>;
}

export function Pill({ label, active = false }: { label: string; active?: boolean }) {
  const colors = useColors();
  return <View style={{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? colors.primary + "1A" : colors.border + "66" }}><Text style={{ fontSize: 12, fontWeight: "800", color: active ? colors.primary : colors.muted }}>{label}</Text></View>;
}

export function SectionHeader({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={{ marginBottom: 12 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground }}>{title}</Text>{action && <Pressable accessibilityRole="button" onPress={onAction}><Text style={{ fontWeight: "800", color: colors.primary }}>{action}</Text></Pressable>}</View>{subtitle && <Text style={{ marginTop: 4, color: colors.muted, lineHeight: 20 }}>{subtitle}</Text>}</View>;
}

export function ProgressBar({ value }: { value: number }) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(1, value));
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 1, now: clamped }} style={{ height: 8, borderRadius: 8, backgroundColor: colors.border }}><View style={{ height: 8, borderRadius: 8, width: `${clamped * 100}%`, backgroundColor: colors.primary }} /></View>;
}

export function MasteryRing({ value }: { value: number }) {
  const colors = useColors();
  return <View style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 8, borderColor: colors.primary + "33", alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{Math.round(value * 100)}%</Text></View>;
}
