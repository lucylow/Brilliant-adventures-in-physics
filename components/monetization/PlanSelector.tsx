import { Pressable, View } from "react-native";
import { BavCard } from "@/components/bav/BavCard";
import { BodySmall, Caption, Heading3 } from "@/components/bav/BavText";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import type { PlanCardViewModel } from "@/lib/monetization/paywall-view-model";

export function PlanCard({
  model,
  onSelect,
}: {
  model: PlanCardViewModel;
  onSelect: () => void;
}) {
  const colors = useColors();
  const border = model.selected ? colors.primary : colors.border;
  const background = model.selected ? withAlpha(colors.primary, 0.08) : colors.surface;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: model.selected, disabled: model.disabled }}
      accessibilityLabel={model.accessibilityLabel}
      disabled={model.disabled || model.loading}
      onPress={onSelect}
      style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
    >
      <View
        style={{
          borderWidth: model.selected ? 2 : 1,
          borderColor: border,
          backgroundColor: background,
          borderRadius: radius.lg,
          padding: spacing.md,
          minHeight: 96,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
          <Caption style={{ color: colors.primary }}>{model.eyebrow}</Caption>
          {model.recommended ? <Caption style={{ color: colors.primary }}>Recommended</Caption> : null}
        </View>
        <Heading3 style={{ marginTop: 6 }}>{model.periodLabel}</Heading3>
        <BodySmall style={{ marginTop: 4, flexShrink: 1 }}>{model.priceLabel}</BodySmall>
        <Caption tone="muted" style={{ marginTop: 8 }}>{model.finePrint}</Caption>
        {!model.isSubscription ? <Caption style={{ marginTop: 6, color: colors.primary }}>One-time purchase · permanent access</Caption> : null}
      </View>
    </Pressable>
  );
}

export function PlanSelector({
  plans,
  onSelect,
}: {
  plans: PlanCardViewModel[];
  onSelect: (productId: string) => void;
}) {
  if (plans.length === 0) return null;
  return (
    <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
      {plans.map((plan) => (
        <PlanCard key={plan.product.id} model={plan} onSelect={() => onSelect(plan.product.id)} />
      ))}
    </View>
  );
}

export function SubscriptionCard({
  title,
  status,
  period,
  renewal,
  onManage,
  onRestore,
}: {
  title: string;
  status: string;
  period?: string;
  renewal?: string;
  onManage: () => void;
  onRestore: () => void;
}) {
  return (
    <BavCard accessibilityLabel={`${title}. ${status}`}>
      <Caption>Subscription</Caption>
      <Heading3 style={{ marginTop: 6 }}>{title}</Heading3>
      <BodySmall tone="secondary" style={{ marginTop: 4 }}>{status}</BodySmall>
      {period ? <Caption tone="muted" style={{ marginTop: 8 }}>{period}</Caption> : null}
      {renewal ? <Caption tone="muted" style={{ marginTop: 4 }}>{renewal}</Caption> : null}
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Manage subscription" onPress={onManage}>
          <BodySmall style={{ textDecorationLine: "underline" }}>Manage subscription</BodySmall>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Restore purchases" onPress={onRestore}>
          <BodySmall style={{ textDecorationLine: "underline" }}>Restore purchases</BodySmall>
        </Pressable>
      </View>
    </BavCard>
  );
}
