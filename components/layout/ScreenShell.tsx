import { type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { layout, spacing } from "@/lib/design-system";
import { useColors } from "@/hooks/use-colors";

export function ScrollScreen({
  children,
  padded = true,
  keyboard = false,
  contentStyle,
}: {
  children: ReactNode;
  padded?: boolean;
  keyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottom = layout.bottomNavHeight + Math.max(insets.bottom, 8) + spacing.xl;
  const scroll = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          paddingHorizontal: padded ? layout.screenPadding : 0,
          paddingTop: spacing.sm,
          paddingBottom: bottom,
          gap: layout.sectionGap,
          backgroundColor: colors.background,
        },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
  return (
    <ScreenContainer containerClassName="bg-background" className="">
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {scroll}
        </KeyboardAvoidingView>
      ) : (
        scroll
      )}
    </ScreenContainer>
  );
}

export function DetailScreen({
  children,
  padded = true,
}: {
  children: ReactNode;
  padded?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer edges={["top", "left", "right"]} className={padded ? "px-5" : ""}>
      <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, 8) }}>{children}</View>
    </ScreenContainer>
  );
}

export function ChatScreenShell({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {header}
        <View style={{ flex: 1 }}>{children}</View>
        {footer}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

export function ExperimentScreen({
  canvas,
  controls,
}: {
  canvas: ReactNode;
  controls: ReactNode;
}) {
  const colors = useColors();
  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="" className="">
      <View style={{ flex: 1, backgroundColor: colors.simulationBackground }}>{canvas}</View>
      <View style={{ backgroundColor: colors.surface }}>{controls}</View>
    </ScreenContainer>
  );
}
