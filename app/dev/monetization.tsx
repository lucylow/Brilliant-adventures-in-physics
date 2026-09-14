import { ScrollView, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Body, BodySmall, Heading1, Heading3 } from "@/components/bav/BavText";
import { BavButton } from "@/components/bav/BavButton";
import { BavChip } from "@/components/bav/BavChrome";
import { isProductionRuntime } from "@/lib/mock/config";
import { MOCK_SCENARIO_LIST, type MockBillingScenarioId } from "@/lib/monetization/scenarios";
import { PAYWALL_VARIANTS } from "@/lib/monetization/variants";
import { setMockScenario, getMonetizationStore, setConnected } from "@/lib/monetization/runtime";
import { demoRevenueDashboard } from "@/lib/monetization/analytics";
import { useMonetization } from "@/hooks/use-monetization";
import { MockBillingAdapter } from "@/lib/monetization/mock-adapter";
import { getBillingPort } from "@/lib/monetization/runtime";
import { spacing } from "@/lib/design-system";

const SWITCHER: MockBillingScenarioId[] = [
  "FREE_USER",
  "TRIAL_USER",
  "PLUS_MONTHLY",
  "PLUS_ANNUAL",
  "LIFETIME_USER",
  "EXPIRED_USER",
  "PAYMENT_ERROR",
  "OFFLINE_USER",
  "PENDING_PURCHASE",
  "RESTORE_USER",
];

export default function MonetizationDevScreen() {
  const store = useMonetization();
  if (isProductionRuntime()) {
    return (
      <ScreenContainer className="p-5">
        <Heading1>Developer tools unavailable</Heading1>
        <Body style={{ marginTop: 12 }}>This panel is blocked in production builds.</Body>
      </ScreenContainer>
    );
  }
  const port = getBillingPort();
  const scenario = port instanceof MockBillingAdapter ? port.getScenario().id : "n/a";
  const demo = demoRevenueDashboard();
  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: spacing.md }}>
        <Heading1>Monetization lab</Heading1>
        <BodySmall tone="warning">DEMO DATA / development only. Never shown to learners in production.</BodySmall>
        <Heading3>Scenario switcher</Heading3>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {SWITCHER.map((id) => (
            <BavChip key={id} label={id} selected={scenario === id} onPress={() => setMockScenario(id)} />
          ))}
        </View>
        <Heading3>All mock scenarios</Heading3>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MOCK_SCENARIO_LIST.map((item) => (
            <BavChip key={item.id} label={item.id} selected={scenario === item.id} onPress={() => setMockScenario(item.id)} />
          ))}
        </View>
        <Heading3>Paywall variants</Heading3>
        <BodySmall>{PAYWALL_VARIANTS.map((variant) => variant.id).join(" · ")}</BodySmall>
        <Heading3>Inspector</Heading3>
        <BodySmall>Ready: {String(store.ready)}</BodySmall>
        <BodySmall>Flow: {store.machine.state}</BodySmall>
        <BodySmall>Plan: {store.entitlements.plan}</BodySmall>
        <BodySmall>Status: {store.entitlements.status}</BodySmall>
        <BodySmall>Lifetime: {String(store.entitlements.lifetimeOwned)}</BodySmall>
        <BodySmall>Selected: {store.selectedProductId ?? "none"}</BodySmall>
        <BodySmall>Products: {store.products.map((product) => product.id).join(", ") || "none"}</BodySmall>
        <BodySmall>Error: {store.errorMessage ?? "none"}</BodySmall>
        <BodySmall>Connected: {String(store.connected)}</BodySmall>
        <BavButton label={store.connected ? "Simulate offline" : "Simulate online"} variant="secondary" onPress={() => setConnected(!getMonetizationStore().connected)} />
        <Heading3>{demo.label} revenue</Heading3>
        <BodySmall>Monthly {demo.monthly} · Annual {demo.annual} · Lifetime {demo.lifetime} · Trials {demo.trials}</BodySmall>
      </ScrollView>
    </ScreenContainer>
  );
}
