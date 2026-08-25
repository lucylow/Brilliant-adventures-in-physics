import { PropsWithChildren } from "react";
import { Pressable, Text, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { MotionPressable } from "@/components/motion-primitives";

export const ui = { space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }, radius: { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 }, text: { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36 } } as const;

export function Card({ children, onPress, accessibilityLabel, style, reducedMotion = false }: PropsWithChildren<{ onPress?: () => void; accessibilityLabel?: string; style?: StyleProp<ViewStyle>; reducedMotion?: boolean }>) {
  const colors = useColors();
  const content = <View style={[{ padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, style]}>{children}</View>;
  return onPress ? <MotionPressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} reducedMotion={reducedMotion} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>{content}</MotionPressable> : content;
}

export function PrimaryButton({ label, onPress, disabled = false, reducedMotion = false }: { label: string; onPress: () => void; disabled?: boolean; reducedMotion?: boolean }) {
  const colors = useColors();
  return <MotionPressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} reducedMotion={reducedMotion} style={({ pressed }) => ({ minHeight: 50, padding: 14, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 })}><Text style={{ color: "#FFFFFF", fontWeight: "800", textAlign: "center" }}>{label}</Text></MotionPressable>;
}

export function SecondaryButton({ label, onPress, reducedMotion = false }: { label: string; onPress: () => void; reducedMotion?: boolean }) {
  const colors = useColors();
  return <MotionPressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} reducedMotion={reducedMotion} style={({ pressed }) => ({ minHeight: 50, padding: 14, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.72 : 1 })}><Text style={{ color: colors.foreground, fontWeight: "800", textAlign: "center" }}>{label}</Text></MotionPressable>;
}

export function Pill({ label, active = false }: { label: string; active?: boolean }) {
  const colors = useColors();
  return <View style={{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? colors.primary + "1A" : colors.border + "66" }}><Text style={{ fontSize: 12, fontWeight: "800", color: active ? colors.primary : colors.muted }}>{label}</Text></View>;
}

export function Chip({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}><Pill label={label} active={selected} /></Pressable>; }

export function SectionHeader({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={{ marginBottom: 12 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground }}>{title}</Text>{action && <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction}><Text style={{ fontWeight: "800", color: colors.primary }}>{action}</Text></Pressable>}</View>{subtitle && <Text style={{ marginTop: 4, color: colors.muted, lineHeight: 20 }}>{subtitle}</Text>}</View>;
}

export function ProgressBar({ value }: { value: number }) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(1, value));
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 1, now: clamped }} style={{ height: 8, borderRadius: 8, backgroundColor: colors.border }}><View style={{ height: 8, borderRadius: 8, width: `${clamped * 100}%`, backgroundColor: colors.primary }} /></View>;
}

export function MasteryRing({ value }: { value: number }) {
  const colors = useColors();
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 1, now: value }} style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 8, borderColor: colors.primary + "33", alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{Math.round(value * 100)}%</Text></View>;
}

export function StatTile({ label, value, detail }: { label: string; value: string; detail?: string }) { const colors = useColors(); return <Card style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{value}</Text>{detail && <Text style={{ color: colors.success, marginTop: 4 }}>{detail}</Text>}</Card>; }

export function EquationCard({ formula, caption }: { formula: string; caption?: string }) { const colors = useColors(); return <Card><Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", textAlign: "center" }}>{formula}</Text>{caption && <Text style={{ color: colors.muted, marginTop: 8, textAlign: "center" }}>{caption}</Text>}</Card>; }

export function SolutionStep({ number, title, body }: { number: number; title: string; body: string }) { const colors = useColors(); return <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}><View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary + "1A", alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.primary, fontWeight: "800" }}>{number}</Text></View><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{title}</Text><Text style={{ color: colors.muted, marginTop: 4, lineHeight: 21 }}>{body}</Text></View></View>; }

export function HintPanel({ visible, label }: { visible: boolean; label: string }) { const colors = useColors(); if (!visible) return null; return <Card><Text style={{ color: colors.foreground, fontWeight: "800" }}>Next hint</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{label}</Text></Card>; }

export function Skeleton({ width = "100%", height = 18 }: { width?: DimensionValue; height?: number }) { const colors = useColors(); return <View style={{ width, height, borderRadius: 8, backgroundColor: colors.border }} />; }
export function LoadingState() { return <View style={{ gap: 12 }}><Skeleton height={28} /><Skeleton height={120} /><Skeleton height={80} /></View>; }
export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) { const colors = useColors(); return <View style={{ padding: 28, alignItems: "center" }}><View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + "14" }} /><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginTop: 16, textAlign: "center" }}>{title}</Text><Text style={{ color: colors.muted, marginTop: 8, lineHeight: 21, textAlign: "center" }}>{body}</Text>{action && <View style={{ marginTop: 16, width: "100%" }}>{action}</View>}</View>; }
export function ErrorState({ onRetry }: { onRetry: () => void }) { return <EmptyState title="We hit a snag" body="Your progress is safe. Try the action again." action={<PrimaryButton label="Try again" onPress={onRetry} />} />; }
