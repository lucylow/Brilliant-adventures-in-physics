import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavButton } from "@/components/bav/BavButton";
import { Body, BodySmall, Heading1, Heading3 } from "@/components/bav/BavText";
import { SubscriptionCard, EntitlementBanner } from "@/components/monetization";
import { useEntitlements } from "@/hooks/use-monetization";
import { FEATURE_GATES } from "@/lib/monetization/features";
import { restorePurchases, getBillingPort } from "@/lib/monetization/runtime";
import { spacing } from "@/lib/design-system";
import type { BillingPort } from "@/lib/monetization/billing-port";
import * as WebBrowser from "expo-web-browser";

async function manage(port: BillingPort | null) {
  if (!port) return;
  const destination = await port.presentManagement();
  if (destination.url) await WebBrowser.openBrowserAsync(destination.url);
}

export default function SubscriptionScreen() {
  const { entitlements, lifetimeOwned, plan, status } = useEntitlements();
  const title = lifetimeOwned ? "Lifetime Unlock" : plan === "plus" ? "BAV+" : "Free";
  const statusLabel =
    status === "trial" ? "Trial" : status === "expired" ? "Ended" : lifetimeOwned ? "Permanent access" : status === "unlimited" ? "Active" : "Free learning";
  const unlocked = Object.entries(entitlements.features)
    .filter(([, access]) => access === "unlimited" || access === "trial")
    .map(([id]) => FEATURE_GATES[id as keyof typeof FEATURE_GATES].title);
  return (
    <ScrollScreen>
      <Heading1>Your B.A.V. access</Heading1>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>Core learning stays available on every plan.</Body>
      <View style={{ marginTop: spacing.lg }}>
        <SubscriptionCard
          title={title}
          status={statusLabel}
          period={entitlements.subscription?.productId ? `Product on file from the store` : "No store product"}
          renewal={entitlements.subscription?.expiresAt && !lifetimeOwned ? `Next store date ${entitlements.subscription.expiresAt.slice(0, 10)}` : lifetimeOwned ? "Not a subscription" : undefined}
          onManage={() => void manage(getBillingPort())}
          onRestore={() => void restorePurchases()}
        />
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <EntitlementBanner title="Unlocked capabilities" body={unlocked.length ? unlocked.join(" · ") : "Free Tutor, Practice, Lessons, and core Lab."} />
      </View>
      {status === "expired" ? (
        <View style={{ marginTop: spacing.lg }}>
          <Heading3>What changed</Heading3>
          <BodySmall tone="secondary" style={{ marginTop: 6 }}>Advanced labs and extra AI usage paused. Saved progress and free tools remain.</BodySmall>
          <View style={{ marginTop: spacing.sm }}>
            <BavButton label="See BAV+ plans" onPress={() => router.push("/paywall" as never)} />
          </View>
        </View>
      ) : null}
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <BavButton label="Restore purchases" variant="secondary" onPress={() => router.push("/restore" as never)} />
        <BavButton label="Done" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScrollScreen>
  );
}
