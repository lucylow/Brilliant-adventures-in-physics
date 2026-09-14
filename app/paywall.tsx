import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavIconButton } from "@/components/bav/BavButton";
import { BodySmall } from "@/components/bav/BavText";
import { PaywallHero, PlanSelector, PurchaseButton, RestoreButton } from "@/components/monetization";
import { useMonetization } from "@/hooks/use-monetization";
import { buildPaywallViewModel } from "@/lib/monetization/paywall-view-model";
import { assignPaywallVariant } from "@/lib/monetization/variants";
import { purchaseSelected, restorePurchases, selectPlan, setPaywallReturnTo } from "@/lib/monetization/runtime";
import { trackMonetizationEvent } from "@/lib/monetization/analytics";
import type { PaywallVariantId } from "@/lib/monetization/types";
import { spacing } from "@/lib/design-system";

export default function PaywallScreen() {
  const params = useLocalSearchParams<{ from?: string; variant?: string; feature?: string }>();
  const store = useMonetization();
  const variant = assignPaywallVariant(store.userId ?? "anonymous", store.entitlements.plan === "lifetime" ? "lifetime" : store.entitlements.status === "trial" ? "trial" : store.entitlements.status === "expired" ? "expired" : "free", params.variant as PaywallVariantId | undefined);
  const model = buildPaywallViewModel({
    catalog: store.catalog,
    variant,
    selectedProductId: store.selectedProductId,
    flow: store.machine.state,
    entitlements: store.entitlements,
    connected: store.connected,
    errorMessage: store.errorMessage,
  });

  useEffect(() => {
    setPaywallReturnTo(typeof params.from === "string" ? params.from : undefined);
    trackMonetizationEvent("paywall_viewed", { variant: variant.id, feature: params.feature ?? null });
  }, [params.from, params.feature, variant.id]);

  const close = () => {
    trackMonetizationEvent("paywall_closed", { variant: variant.id });
    if (router.canGoBack()) router.back();
    else router.replace("/" as never);
  };

  const buy = async () => {
    const result = await purchaseSelected();
    if (result.status === "succeeded") {
      router.push({ pathname: "/purchase-success", params: { from: params.from ?? store.returnTo ?? "" } } as never);
      return;
    }
    if (result.status === "failed" || result.status === "cancelled") {
      router.push({ pathname: "/purchase-failure", params: { code: result.error?.code ?? result.status } } as never);
    }
  };

  const restore = async () => {
    const result = await restorePurchases();
    if (result.outcome === "nothing_found") {
      router.push("/restore" as never);
      return;
    }
    if (result.outcome === "failed") {
      router.push({ pathname: "/purchase-failure", params: { code: result.error?.code ?? "restore_failed" } } as never);
      return;
    }
    router.push({ pathname: "/purchase-success", params: { restored: "1", from: params.from ?? "" } } as never);
  };

  return (
    <ScrollScreen>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <BavIconButton icon="close" accessibilityLabel={model.closeLabel} onPress={close} />
      </View>
      <PaywallHero title={model.title} subtitle={model.subtitle} />
      {model.benefits.map((benefit) => (
        <View key={benefit.title} style={{ marginTop: spacing.sm }}>
          <BodySmall>{benefit.title}</BodySmall>
          <BodySmall tone="secondary">{benefit.body}</BodySmall>
        </View>
      ))}
      {model.trialMessage ? <BodySmall style={{ marginTop: spacing.md }}>{model.trialMessage}</BodySmall> : null}
      {model.savingsMessage ? <BodySmall style={{ marginTop: spacing.sm }}>{model.savingsMessage}</BodySmall> : null}
      {model.offlineMessage ? <BodySmall tone="warning" style={{ marginTop: spacing.sm }}>{model.offlineMessage}</BodySmall> : null}
      {model.emptyMessage ? <BodySmall tone="warning" style={{ marginTop: spacing.sm }}>{model.emptyMessage}</BodySmall> : null}
      {model.errorMessage ? <BodySmall tone="danger" style={{ marginTop: spacing.sm }}>{model.errorMessage}</BodySmall> : null}
      <View style={{ marginTop: spacing.lg }}>
        <PlanSelector plans={model.plans} onSelect={selectPlan} />
      </View>
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <PurchaseButton label={model.cta.label} onPress={() => void buy()} disabled={model.cta.disabled} loading={model.cta.loading} />
        <RestoreButton label={model.restoreLabel} onPress={() => void restore()} disabled={model.restoreDisabled} loading={store.machine.state === "restoring"} />
        <RestoreButton label="Not now" onPress={close} />
      </View>
      <BodySmall tone="muted" style={{ marginTop: spacing.md }}>
        Prices come from the store when configured. No fake scarcity, hidden close actions, or invented discounts.
      </BodySmall>
    </ScrollScreen>
  );
}
