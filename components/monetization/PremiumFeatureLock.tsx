import { View } from "react-native";
import { BavButton } from "@/components/bav/BavButton";
import { BavCard } from "@/components/bav/BavCard";
import { Body, BodySmall, Heading2, Heading3 } from "@/components/bav/BavText";
import { BAVPlusBadge } from "./PremiumBadge";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import { useColors } from "@/hooks/use-colors";
import { ScientificPreview } from "@/components/scientific/ScientificMotifs";

export type FeatureLockVariant = "compact" | "card" | "fullScreen" | "inline";

export function PremiumFeatureLock({
  title,
  body,
  ctaLabel = "See BAV+",
  onPress,
  variant = "card",
  motif = "orbit",
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  onPress: () => void;
  variant?: FeatureLockVariant;
  motif?: string;
}) {
  const colors = useColors();
  if (variant === "inline") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
        <BAVPlusBadge />
        <BodySmall style={{ flex: 1 }}>{body}</BodySmall>
        <BavButton label={ctaLabel} size="sm" onPress={onPress} accessibilityLabel={ctaLabel} />
      </View>
    );
  }
  if (variant === "compact") {
    return (
      <View
        accessible
        accessibilityRole="summary"
        accessibilityLabel={`${title}. ${body}`}
        style={{ paddingVertical: spacing.sm, gap: 6 }}
      >
        <BAVPlusBadge />
        <BodySmall>{title}</BodySmall>
        <BavButton label={ctaLabel} size="sm" onPress={onPress} />
      </View>
    );
  }
  const inner = (
    <View style={{ gap: spacing.sm }}>
      <BAVPlusBadge />
      <Heading3>{title}</Heading3>
      <BodySmall tone="secondary">{body}</BodySmall>
      <BavButton label={ctaLabel} onPress={onPress} />
    </View>
  );
  if (variant === "fullScreen") {
    return (
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center", backgroundColor: colors.background }}>
        <View style={{ height: 140, borderRadius: radius.lg, overflow: "hidden", backgroundColor: withAlpha(colors.primary, 0.1), marginBottom: spacing.lg }}>
          <ScientificPreview motif={motif} accent={colors.primary} />
        </View>
        <Heading2>{title}</Heading2>
        <Body tone="secondary" style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>{body}</Body>
        <BavButton label={ctaLabel} size="lg" onPress={onPress} />
      </View>
    );
  }
  return <BavCard accessibilityLabel={`${title}. ${body}`}>{inner}</BavCard>;
}

export function PremiumPreview({
  title,
  why,
  included,
  onPress,
}: {
  title: string;
  why: string;
  included: string[];
  onPress: () => void;
}) {
  return (
    <BavCard accessibilityLabel={title}>
      <BAVPlusBadge />
      <Heading3 style={{ marginTop: spacing.sm }}>{title}</Heading3>
      <BodySmall tone="secondary" style={{ marginTop: 6 }}>{why}</BodySmall>
      {included.map((item) => (
        <BodySmall key={item} style={{ marginTop: 8 }}>• {item}</BodySmall>
      ))}
      <View style={{ marginTop: spacing.md }}>
        <BavButton label="Unlock with BAV+" onPress={onPress} />
      </View>
    </BavCard>
  );
}

export function SoftPaywall({
  title,
  preview,
  benefit,
  onPress,
}: {
  title: string;
  preview: string;
  benefit: string;
  onPress: () => void;
}) {
  return (
    <PremiumFeatureLock
      variant="card"
      title={title}
      body={`${preview} ${benefit}`}
      ctaLabel="See what’s included"
      onPress={onPress}
    />
  );
}
