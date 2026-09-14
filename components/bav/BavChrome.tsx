import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import { Caption, Heading3, BodySmall } from "./BavText";
import { BavIcon } from "./BavIcon";
import { BavCard } from "./BavCard";
import { BAV_ICON_MAP, type BavIconName } from "@/lib/design-system";

function isBavIconName(value: unknown): value is BavIconName {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(BAV_ICON_MAP, value);
}

export function BavBadge({
  label,
  tone = "info",
}: {
  label: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral" | "verified";
}) {
  const colors = useColors();
  const map = {
    info: { bg: colors.infoMuted, fg: colors.info },
    success: { bg: colors.successMuted, fg: colors.success },
    warning: { bg: colors.warningMuted, fg: colors.warning },
    danger: { bg: colors.errorMuted, fg: colors.error },
    neutral: { bg: colors.surfaceTint, fg: colors.muted },
    verified: { bg: colors.successMuted, fg: colors.success },
  } as const;
  const palette = map[tone];
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={tone === "verified" ? `Verified: ${label}` : label}
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        backgroundColor: palette.bg,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      {tone === "verified" ? <BavIcon name="check" size="xs" color={palette.fg} /> : null}
      <Caption style={{ color: palette.fg }}>{label}</Caption>
    </View>
  );
}

export function BavChip({
  label,
  selected = false,
  onPress,
  disabled = false,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 36,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.md,
        backgroundColor: selected ? colors.foreground : colors.surface,
        borderWidth: 1,
        borderColor: selected ? colors.foreground : colors.border,
        opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
      })}
    >
      <Caption style={{ color: selected ? colors.onPrimary : colors.foreground }}>{label}</Caption>
    </Pressable>
  );
}

export function BavAvatar({
  initials,
  size = 42,
  onPress,
  accessibilityLabel,
}: {
  initials: string;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const colors = useColors();
  const content = (
    <View
      accessible
      accessibilityRole={onPress ? "button" : "image"}
      accessibilityLabel={accessibilityLabel ?? `Profile ${initials}`}
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.primary,
        shadowOpacity: 0.28,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Caption style={{ color: colors.onPrimary, fontSize: size > 40 ? 14 : 12 }}>{initials.slice(0, 2).toUpperCase()}</Caption>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? `Open profile`}>
      {content}
    </Pressable>
  );
}

export function BavSectionHeader({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
        <Heading3 style={{ flex: 1 }}>{title}</Heading3>
        {action ? (
          <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction} style={{ minHeight: 44, justifyContent: "center" }}>
            <Caption style={{ color: colors.primary }}>{action}</Caption>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? <BodySmall tone="secondary">{subtitle}</BodySmall> : null}
    </View>
  );
}

export function BavListItem({
  icon,
  title,
  subtitle,
  meta,
  onPress,
  accessibilityLabel,
}: {
  icon?: BavIconName | ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const colors = useColors();
  return (
    <BavCard onPress={onPress} accessibilityLabel={accessibilityLabel ?? title} padded elevation="border">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {isBavIconName(icon) ? (
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: withAlpha(colors.primary, 0.1), alignItems: "center", justifyContent: "center" }}>
            <BavIcon name={icon} color={colors.primary} size="sm" />
          </View>
        ) : (
          icon
        )}
        <View style={{ flex: 1 }}>
          <Heading3>{title}</Heading3>
          {subtitle ? <BodySmall tone="secondary">{subtitle}</BodySmall> : null}
        </View>
        {meta ? <Caption tone="muted">{meta}</Caption> : null}
        {onPress ? <BavIcon name="chevron" color={colors.muted} /> : null}
      </View>
    </BavCard>
  );
}
