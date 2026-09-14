import { View } from "react-native";
import { BavButton } from "@/components/bav/BavButton";
import { Body, BodySmall, Display, Heading3 } from "@/components/bav/BavText";
import { ScientificPreview } from "@/components/scientific/ScientificMotifs";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import { BAVPlusBadge } from "./PremiumBadge";
import { BavProgressBar } from "@/components/bav/BavProgress";
import type { AIUsageState, UsageLimit } from "@/lib/monetization/types";

export function PaywallHero({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = useColors();
  return (
    <View>
      <View style={{ height: 148, borderRadius: radius.xl, overflow: "hidden", backgroundColor: withAlpha(colors.primary, 0.1), marginBottom: spacing.md }}>
        <ScientificPreview motif="orbit" accent={colors.primary} />
      </View>
      <BAVPlusBadge />
      <Display style={{ marginTop: spacing.sm }}>{title}</Display>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>{subtitle}</Body>
    </View>
  );
}

export function PurchaseButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <BavButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      size="lg"
      accessibilityLabel={label}
    />
  );
}

export function RestoreButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <BavButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      variant="ghost"
      accessibilityLabel={label}
    />
  );
}

export function UsageMeter({ limit, label }: { limit: UsageLimit; label: string }) {
  const value = limit.unlimited ? 0 : limit.limit <= 0 ? 1 : limit.used / limit.limit;
  return (
    <View accessible accessibilityLabel={limit.unlimited ? `${label}, unlimited` : `${label}, ${limit.remaining} remaining of ${limit.limit}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Heading3>{label}</Heading3>
        <BodySmall>{limit.unlimited ? "Unlimited" : `${limit.remaining} left`}</BodySmall>
      </View>
      <BavProgressBar value={limit.unlimited ? 0 : value} />
      {!limit.unlimited ? <BodySmall tone="secondary" style={{ marginTop: 6 }}>Resets {new Date(limit.resetAt).toUTCString()}</BodySmall> : null}
    </View>
  );
}

export function AIUsageMeter({ state }: { state: AIUsageState }) {
  const limit: UsageLimit = {
    meter: "ai_requests",
    used: state.used,
    limit: state.dailyLimit,
    remaining: state.remaining,
    resetAt: state.resetAt,
    unlimited: state.isUnlimited,
    period: "daily",
  };
  return <UsageMeter limit={limit} label="AI coaching today" />;
}
