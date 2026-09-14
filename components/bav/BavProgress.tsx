import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";
import { motionDuration } from "@/lib/motion";
import { radius, spacing, withAlpha, clampUnit } from "@/lib/design-system";
import { Metric, Caption, BodySmall } from "./BavText";
import { BavIcon } from "./BavIcon";
import { BavCard } from "./BavCard";
import type { BavIconName } from "@/lib/design-system";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function BavProgressBar({
  value,
  color,
  height = 6,
  reducedMotion = false,
  accessibilityLabel,
}: {
  value: number;
  color?: string;
  height?: number;
  reducedMotion?: boolean;
  accessibilityLabel?: string;
}) {
  const colors = useColors();
  const clamped = clampUnit(value);
  const width = useSharedValue(reducedMotion ? clamped : 0);
  useEffect(() => {
    width.value = withTiming(clamped, { duration: motionDuration(360, { reducedMotion }), easing: Easing.out(Easing.cubic) });
  }, [clamped, reducedMotion, width]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${Math.round(width.value * 100)}%` }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ height, borderRadius: radius.pill, backgroundColor: colors.border, overflow: "hidden" }}
    >
      <Animated.View style={[{ height, borderRadius: radius.pill, backgroundColor: color ?? colors.primary }, animatedStyle]} />
    </View>
  );
}

export function BavProgressRing({
  value,
  size = 72,
  stroke = 7,
  label,
  reducedMotion = false,
  color,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  reducedMotion?: boolean;
  color?: string;
}) {
  const colors = useColors();
  const clamped = clampUnit(value);
  const radiusPx = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  const progress = useSharedValue(reducedMotion ? clamped : 0);
  useEffect(() => {
    progress.value = withTiming(clamped, { duration: motionDuration(420, { reducedMotion }), easing: Easing.out(Easing.cubic) });
  }, [clamped, progress, reducedMotion]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));
  const percent = Math.round(clamped * 100);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? `Mastery ${percent} percent`}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={radiusPx} stroke={withAlpha(color ?? colors.primary, 0.18)} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={color ?? colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: size > 64 ? 16 : 13 }}>{percent}%</Text>
    </View>
  );
}

export function BavMetricCard({
  icon,
  value,
  label,
  detail,
  progress,
  onPress,
  reducedMotion = false,
}: {
  icon: BavIconName;
  value: string;
  label: string;
  detail?: string;
  progress?: number;
  onPress?: () => void;
  reducedMotion?: boolean;
}) {
  const colors = useColors();
  return (
    <BavCard
      elevation="soft"
      onPress={onPress}
      accessibilityLabel={`${label}: ${value}${detail ? `, ${detail}` : ""}`}
      reducedMotion={reducedMotion}
      style={{ flex: 1, minHeight: 92, padding: spacing.sm }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <BavIcon name={icon} color={colors.primary} size="sm" />
        {typeof progress === "number" ? <BavProgressRing value={progress} size={36} stroke={4} reducedMotion={reducedMotion} /> : null}
      </View>
      <Metric style={{ marginTop: 8 }}>{value}</Metric>
      <Caption tone="muted">{label}</Caption>
      {detail ? <BodySmall tone="secondary">{detail}</BodySmall> : null}
    </BavCard>
  );
}

export function BavXpBadge({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const colors = useColors();
  return (
    <View
      accessible
      accessibilityLabel={`${xp} experience points`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        paddingHorizontal: compact ? 8 : 10,
        paddingVertical: compact ? 4 : 6,
        borderRadius: 999,
        backgroundColor: withAlpha(colors.primary, 0.12),
      }}
    >
      <BavIcon name="xp" size="xs" color={colors.primary} />
      <Caption tone="info">{compact ? `+${xp}` : `${xp.toLocaleString()} XP`}</Caption>
    </View>
  );
}

export function BavStreakBadge({ days, enabled = true }: { days: number; enabled?: boolean }) {
  const colors = useColors();
  const label = enabled ? `${days}-day streak` : "Streak paused";
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: withAlpha(colors.warning, 0.12),
      }}
    >
      <BavIcon name="streak" size="xs" color={colors.warning} />
      <Caption style={{ color: colors.warning }}>{enabled ? `${days} day streak` : "Streak off"}</Caption>
    </View>
  );
}
