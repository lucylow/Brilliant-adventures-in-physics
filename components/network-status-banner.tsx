import * as Network from "expo-network";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { networkStateToStatus, networkStatusMessage } from "@/lib/network";

export function NetworkStatusBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tr } = useAppTranslations();
  const status = networkStateToStatus(Network.useNetworkState());
  const translationKey = status === "offline" ? "network.offline" : "network.checking";
  const messageKey = status === "offline" ? "network.offlineMessage" : "network.checkingMessage";
  const message = networkStatusMessage(status);
  const localizedLabel = tr(translationKey);
  const localizedMessage = tr(messageKey);

  if (!message) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${localizedLabel}. ${localizedMessage}`}
      style={{
        position: "absolute",
        top: Math.max(insets.top + 8, 12),
        left: 12,
        right: 12,
        zIndex: 20,
        borderWidth: 1,
        borderColor: colors.warning,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: colors.surface,
      }}
    >
      <Text style={{ color: colors.foreground, fontWeight: "800", lineHeight: 20 }}>
        {localizedLabel}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 2, lineHeight: 18 }}>{localizedMessage}</Text>
    </View>
  );
}

export default NetworkStatusBanner;

