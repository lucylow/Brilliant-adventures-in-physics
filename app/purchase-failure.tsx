import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavButton } from "@/components/bav/BavButton";
import { Body, Heading1 } from "@/components/bav/BavText";
import { errorFromCode } from "@/lib/monetization/errors";
import type { MonetizationErrorCode } from "@/lib/monetization/types";
import { purchaseSelected } from "@/lib/monetization/runtime";
import { spacing } from "@/lib/design-system";

export default function PurchaseFailureScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const code = (params.code ?? "unknown") as MonetizationErrorCode;
  const error = errorFromCode(code);
  return (
    <ScrollScreen>
      <Heading1>We couldn’t finish that</Heading1>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>{error.userMessage}</Body>
      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        {error.retryable ? <BavButton label="Try again" onPress={() => void purchaseSelected().then((result) => { if (result.status === "succeeded") router.replace("/purchase-success" as never); })} /> : null}
        <BavButton label="Back to plans" variant="secondary" onPress={() => router.replace("/paywall" as never)} />
        <BavButton label="Continue free" variant="ghost" onPress={() => router.replace("/" as never)} />
      </View>
    </ScrollScreen>
  );
}
