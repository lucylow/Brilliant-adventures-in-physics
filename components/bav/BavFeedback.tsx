import { type ReactNode, useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { layout, overlayColor, radius, spacing } from "@/lib/design-system";
import { motionDuration } from "@/lib/motion";
import { Heading3, Body, Caption } from "./BavText";
import { BavButton, BavIconButton } from "./BavButton";
import { BavCard } from "./BavCard";

export function BavModal({
  visible,
  title,
  children,
  onClose,
  primaryAction,
  secondaryAction,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
}) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: overlayColor(), justifyContent: "center", padding: layout.screenPadding }}
      >
        <Pressable onPress={(event) => event.stopPropagation()} style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Heading3>{title}</Heading3>
            <BavIconButton icon="close" accessibilityLabel="Close" onPress={onClose} />
          </View>
          <View style={{ marginTop: spacing.md }}>{children}</View>
          {primaryAction ? (
            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <BavButton label={primaryAction.label} onPress={primaryAction.onPress} />
              {secondaryAction ? <BavButton label={secondaryAction.label} variant="secondary" onPress={secondaryAction.onPress} /> : null}
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function BavBottomSheet({
  visible,
  title,
  children,
  onClose,
  reducedMotion = false,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  reducedMotion?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(visible ? 0 : 40);
  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 48, { duration: motionDuration(240, { reducedMotion }), easing: Easing.out(Easing.cubic) });
  }, [reducedMotion, translateY, visible]);
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss sheet" onPress={onClose} style={{ flex: 1, backgroundColor: overlayColor(), justifyContent: "flex-end" }}>
        <Animated.View
          style={[
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingHorizontal: layout.screenPadding,
              paddingTop: spacing.md,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              maxHeight: "82%",
            },
            sheetStyle,
          ]}
        >
          <View style={{ alignItems: "center", marginBottom: spacing.sm }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Heading3>{title}</Heading3>
            <BavIconButton icon="close" accessibilityLabel="Close" onPress={onClose} />
          </View>
          <View style={{ marginTop: spacing.md }}>{children}</View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export function BavToast({
  message,
  tone = "info",
  visible,
}: {
  message: string;
  tone?: "info" | "success" | "warning" | "danger";
  visible: boolean;
}) {
  if (!visible) return null;
  const colors = {
    info: "info",
    success: "success",
    warning: "warning",
    danger: "danger",
  } as const;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ position: "absolute", left: 20, right: 20, bottom: 88, zIndex: 60 }}
      pointerEvents="none"
    >
      <BavCard elevation="soft">
        <Caption tone={tone === "danger" ? "danger" : tone}>{message}</Caption>
      </BavCard>
    </View>
  );
}

export function BavSkeleton({ height = 18, width = "100%" as const }: { height?: number; width?: number | `${number}%` }) {
  const colors = useColors();
  return <View accessibilityLabel="Loading" style={{ height, width, borderRadius: radius.sm, backgroundColor: colors.border }} />;
}

export function BavLoadingState({ title = "Loading", body }: { title?: string; body?: string }) {
  return (
    <View style={{ gap: 12, paddingVertical: 24 }}>
      <Heading3>{title}</Heading3>
      {body ? <Body tone="secondary">{body}</Body> : null}
      <BavSkeleton height={28} />
      <BavSkeleton height={120} />
      <BavSkeleton height={80} />
    </View>
  );
}
