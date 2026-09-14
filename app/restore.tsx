import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavButton } from "@/components/bav/BavButton";
import { Body, Heading1 } from "@/components/bav/BavText";
import { RESTORE_COPY } from "@/lib/monetization/copy";
import { restorePurchases } from "@/lib/monetization/runtime";
import { useMonetization } from "@/hooks/use-monetization";
import { spacing } from "@/lib/design-system";

export default function RestoreScreen() {
  const store = useMonetization();
  const entitled = store.entitlements.lifetimeOwned || store.entitlements.status === "unlimited" || store.entitlements.status === "trial";
  return (
    <ScrollScreen>
      <Heading1>{entitled ? RESTORE_COPY.success : RESTORE_COPY.empty}</Heading1>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>
        {entitled
          ? "Your previous B.A.V. purchase is active on this account."
          : "This is not a failure — there was simply no active purchase to restore. Free learning remains available."}
      </Body>
      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        {!entitled ? <BavButton label="Try restore again" onPress={() => void restorePurchases()} loading={store.machine.state === "restoring"} /> : null}
        <BavButton label="See plans" variant="secondary" onPress={() => router.push("/paywall" as never)} />
        <BavButton label="Continue learning" variant="ghost" onPress={() => router.replace("/" as never)} />
      </View>
    </ScrollScreen>
  );
}
