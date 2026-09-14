import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavButton } from "@/components/bav/BavButton";
import { Body, Heading1, BodySmall } from "@/components/bav/BavText";
import { BAVPlusBadge } from "@/components/monetization";
import { PAYWALL_BENEFITS, SUCCESS_COPY } from "@/lib/monetization/copy";
import { useEntitlements } from "@/hooks/use-monetization";
import { spacing } from "@/lib/design-system";

export default function PurchaseSuccessScreen() {
  const params = useLocalSearchParams<{ from?: string; restored?: string }>();
  const { lifetimeOwned } = useEntitlements();
  const copy = lifetimeOwned ? SUCCESS_COPY.lifetime : SUCCESS_COPY.plus;
  const continueTo = () => {
    if (params.from) {
      router.replace(params.from as never);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace("/" as never);
  };
  return (
    <ScrollScreen>
      <BAVPlusBadge />
      <Heading1 style={{ marginTop: spacing.md }}>{params.restored === "1" ? "Purchases restored" : copy.title}</Heading1>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>{copy.body}</Body>
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {PAYWALL_BENEFITS.slice(0, 6).map((benefit) => (
          <BodySmall key={benefit.id}>• {benefit.title}</BodySmall>
        ))}
      </View>
      <View style={{ marginTop: spacing.xl }}>
        <BavButton label="Continue learning" size="lg" onPress={continueTo} />
      </View>
    </ScrollScreen>
  );
}
