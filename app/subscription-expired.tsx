import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavButton } from "@/components/bav/BavButton";
import { Body, Heading1 } from "@/components/bav/BavText";
import { EXPIRATION_COPY } from "@/lib/monetization/copy";
import { spacing } from "@/lib/design-system";

export default function SubscriptionExpiredScreen() {
  return (
    <ScrollScreen>
      <Heading1>{EXPIRATION_COPY.title}</Heading1>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>{EXPIRATION_COPY.body}</Body>
      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <BavButton label="See plans" onPress={() => router.push("/paywall" as never)} />
        <BavButton label="Continue free" variant="ghost" onPress={() => router.replace("/" as never)} />
      </View>
    </ScrollScreen>
  );
}
