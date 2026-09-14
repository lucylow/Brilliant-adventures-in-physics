import { router } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavButton, BavIconButton } from "@/components/bav/BavButton";
import { Body, BodySmall, Heading1 } from "@/components/bav/BavText";
import { PaywallHero, PlanSelector, PurchaseButton, RestoreButton } from "@/components/monetization";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { useMonetization } from "@/hooks/use-monetization";
import { buildPaywallViewModel } from "@/lib/monetization/paywall-view-model";
import { variantById } from "@/lib/monetization/variants";
import { purchaseSelected, restorePurchases, selectPlan } from "@/lib/monetization/runtime";
import { spacing } from "@/lib/design-system";

export default function UpgradeScreen() {
  const { tr } = useAppTranslations();
  const store = useMonetization();
  const model = useMemo(
    () =>
      buildPaywallViewModel({
        catalog: store.catalog,
        variant: variantById("standard"),
        selectedProductId: store.selectedProductId,
        flow: store.machine.state,
        entitlements: store.entitlements,
        connected: store.connected,
        errorMessage: store.errorMessage,
      }),
    [store],
  );
  return (
    <ScrollScreen>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <BavIconButton icon="close" accessibilityLabel={tr("upgrade.notNow")} onPress={() => router.back()} />
      </View>
      <Heading1>{tr("upgrade.title")}</Heading1>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>{tr("upgrade.subtitle")}</Body>
      <View style={{ marginTop: spacing.lg }}>
        <PaywallHero title={model.title} subtitle={model.subtitle} />
      </View>
      {model.emptyMessage ? <BodySmall tone="warning" style={{ marginTop: spacing.md }}>{tr("upgrade.noProducts")}</BodySmall> : null}
      <View style={{ marginTop: spacing.lg }}>
        <PlanSelector plans={model.plans} onSelect={selectPlan} />
      </View>
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <PurchaseButton
          label={model.plans.length ? model.cta.label : tr("upgrade.plansUnavailable")}
          disabled={model.cta.disabled}
          loading={model.cta.loading}
          onPress={() =>
            void purchaseSelected().then((result) => {
              if (result.status === "succeeded") router.push("/purchase-success" as never);
              else router.push({ pathname: "/purchase-failure", params: { code: result.error?.code ?? result.status } } as never);
            })
          }
        />
        <RestoreButton
          label={store.machine.state === "restoring" ? tr("upgrade.restoring") : tr("upgrade.restore")}
          disabled={model.restoreDisabled}
          onPress={() => void restorePurchases().then((result) => router.push(result.outcome === "nothing_found" ? "/restore" : "/purchase-success" as never))}
        />
        <BavButton label={tr("upgrade.manage")} variant="secondary" onPress={() => router.push("/subscription" as never)} />
        <BavButton label={tr("upgrade.notNow")} variant="ghost" onPress={() => router.back()} />
      </View>
      <BodySmall tone="muted" style={{ marginTop: spacing.md }}>{tr("upgrade.transparency")}</BodySmall>
    </ScrollScreen>
  );
}
