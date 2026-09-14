import { View } from "react-native";
import { Caption } from "@/components/bav/BavText";
import { BavIcon } from "@/components/bav/BavIcon";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";

export function PremiumBadge({ label = "BAV+" }: { label?: string }) {
  const colors = useColors();
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        backgroundColor: withAlpha(colors.primary, 0.12),
      }}
    >
      <BavIcon name="xp" size="xs" color={colors.primary} />
      <Caption style={{ color: colors.primary }}>{label}</Caption>
    </View>
  );
}

export function BAVPlusBadge() {
  return <PremiumBadge label="BAV+" />;
}

export function LifetimeBadge() {
  return <PremiumBadge label="Lifetime" />;
}

export function TrialBadge() {
  return <PremiumBadge label="Trial" />;
}

export function FreeBadge() {
  const colors = useColors();
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel="Free"
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        backgroundColor: withAlpha(colors.success, 0.14),
      }}
    >
      <Caption style={{ color: colors.success }}>Free</Caption>
    </View>
  );
}

export function EntitlementBanner({ title, body }: { title: string; body: string }) {
  const colors = useColors();
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${body}`}
      style={{
        padding: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: withAlpha(colors.primary, 0.08),
        borderWidth: 1,
        borderColor: withAlpha(colors.primary, 0.2),
        gap: spacing.xs,
      }}
    >
      <Caption style={{ color: colors.primary }}>{title}</Caption>
      <Caption tone="muted">{body}</Caption>
    </View>
  );
}
