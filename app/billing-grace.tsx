import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout/ScreenShell";
import { BavButton } from "@/components/bav/BavButton";
import { Body, Heading1 } from "@/components/bav/BavText";
import { GRACE_COPY } from "@/lib/monetization/copy";
import { getBillingPort } from "@/lib/monetization/runtime";
import * as WebBrowser from "expo-web-browser";
import { spacing } from "@/lib/design-system";

export default function BillingGraceScreen() {
  return (
    <ScrollScreen>
      <Heading1>{GRACE_COPY.title}</Heading1>
      <Body tone="secondary" style={{ marginTop: spacing.sm }}>{GRACE_COPY.body}</Body>
      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <BavButton
          label="Open store account"
          onPress={() => {
            void getBillingPort()?.presentManagement().then((destination) => {
              if (destination.url) return WebBrowser.openBrowserAsync(destination.url);
            });
          }}
        />
        <BavButton label="Keep learning" variant="ghost" onPress={() => router.replace("/" as never)} />
      </View>
    </ScrollScreen>
  );
}
