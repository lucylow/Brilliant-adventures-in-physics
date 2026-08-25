import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";

export default function TabLayout() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 } }}>
      <Tabs.Screen name="index" options={{ title: tr("tabs.home"), tabBarIcon: ({ color }) => <IconSymbol size={25} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="tutor" options={{ title: tr("tabs.tutor"), tabBarIcon: ({ color }) => <IconSymbol size={25} name="message.fill" color={color} /> }} />
      <Tabs.Screen name="lab" options={{ title: tr("tabs.lab"), tabBarIcon: ({ color }) => <IconSymbol size={25} name="atom" color={color} /> }} />
      <Tabs.Screen name="practice" options={{ title: tr("tabs.practice"), tabBarIcon: ({ color }) => <IconSymbol size={25} name="checkmark.circle.fill" color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: tr("tabs.progress"), tabBarIcon: ({ color }) => <IconSymbol size={25} name="chart.bar.fill" color={color} /> }} />
    </Tabs>
  );
}
