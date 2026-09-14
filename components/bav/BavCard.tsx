import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { MotionPressable } from "@/components/motion-primitives";
import { useColors } from "@/hooks/use-colors";
import { cardShadow, opacity, radius, spacing, type CardElevation } from "@/lib/design-system";

export function BavCard({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  elevation = "border",
  padded = true,
  style,
  reducedMotion = false,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  elevation?: CardElevation;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  reducedMotion?: boolean;
}) {
  const colors = useColors();
  const background =
    elevation === "scientific"
      ? colors.simulationBackground
      : elevation === "featured"
        ? colors.primary
        : elevation === "flat"
          ? "transparent"
          : colors.surface;
  const borderColor = elevation === "flat" || elevation === "featured" || elevation === "scientific" ? "transparent" : colors.border;
  const content = (
    <View
      style={[
        {
          padding: padded ? spacing.md : 0,
          borderRadius: radius.lg,
          backgroundColor: background,
          borderWidth: elevation === "border" || elevation === "soft" ? 1 : 0,
          borderColor,
          overflow: "hidden",
        },
        cardShadow(elevation),
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return content;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      reducedMotion={reducedMotion}
      style={({ pressed }) => ({ opacity: pressed ? opacity.pressed : 1 })}
    >
      {content}
    </MotionPressable>
  );
}

export function BavDivider() {
  const colors = useColors();
  return <View accessibilityRole="none" style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }} />;
}
