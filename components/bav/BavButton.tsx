import { ActivityIndicator, View } from "react-native";
import { MotionPressable } from "@/components/motion-primitives";
import { BavIcon } from "./BavIcon";
import { ButtonLabel } from "./BavText";
import { useColors } from "@/hooks/use-colors";
import { opacity, radius, spacing, touchTarget, type BavIconName } from "@/lib/design-system";
import { triggerHaptic } from "@/lib/haptics";

export type BavButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "scientific";
export type BavButtonSize = "sm" | "md" | "lg";

export function BavButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  reducedMotion = false,
  hapticsEnabled = true,
  accessibilityHint,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  variant?: BavButtonVariant;
  size?: BavButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: BavIconName;
  reducedMotion?: boolean;
  hapticsEnabled?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
}) {
  const colors = useColors();
  const height = size === "sm" ? touchTarget.minimum : size === "lg" ? touchTarget.large : 50;
  const background =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
        ? colors.error
        : variant === "scientific"
          ? colors.simulationBackground
          : variant === "ghost"
            ? "transparent"
            : colors.surface;
  const borderColor = variant === "secondary" || variant === "ghost" ? colors.border : "transparent";
  const labelTone = variant === "primary" || variant === "danger" || variant === "scientific" ? colors.onPrimary : colors.foreground;
  const inactive = disabled || loading;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      reducedMotion={reducedMotion}
      onPress={() => {
        void triggerHaptic("tap", hapticsEnabled && !reducedMotion);
        onPress();
      }}
      style={({ pressed }) => ({
        minHeight: height,
        paddingHorizontal: size === "sm" ? spacing.md : spacing.lg,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: spacing.xs,
        backgroundColor: pressed && variant === "primary" ? colors.primaryPressed : background,
        borderWidth: variant === "secondary" || variant === "ghost" ? 1 : 0,
        borderColor,
        opacity: inactive ? opacity.disabled : pressed && variant !== "primary" ? opacity.pressed : 1,
      })}
    >
      {loading ? <ActivityIndicator color={labelTone} /> : null}
      {!loading && icon ? <BavIcon name={icon} size="sm" color={labelTone} /> : null}
      <ButtonLabel style={{ color: labelTone }}>{label}</ButtonLabel>
    </MotionPressable>
  );
}

export function BavIconButton({
  icon,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  loading = false,
  tone = "default",
  reducedMotion = false,
  hapticsEnabled = true,
}: {
  icon: BavIconName;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  loading?: boolean;
  tone?: "default" | "inverse" | "primary";
  reducedMotion?: boolean;
  hapticsEnabled?: boolean;
}) {
  const colors = useColors();
  const color = tone === "inverse" ? colors.onPrimary : tone === "primary" ? colors.primary : colors.foreground;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      reducedMotion={reducedMotion}
      onPress={() => {
        void triggerHaptic("selection", hapticsEnabled && !reducedMotion);
        onPress();
      }}
      style={({ pressed }) => ({
        minWidth: touchTarget.minimum,
        minHeight: touchTarget.minimum,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.md,
        opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
      })}
    >
      {loading ? <View /> : <BavIcon name={icon} color={color} />}
    </MotionPressable>
  );
}
