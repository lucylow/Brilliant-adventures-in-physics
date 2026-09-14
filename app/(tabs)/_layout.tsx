import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { BavIcon } from "@/components/bav/BavIcon";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { layout, navShadow } from "@/lib/design-system";
import type { BavIconName } from "@/lib/design-system";

function TabIcon({ name, color, focused }: { name: BavIconName; color: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", minHeight: 28 }}>
      <BavIcon name={name} color={color} size={focused ? "lg" : "md"} />
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: layout.bottomNavHeight + bottomPadding - 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          ...navShadow(),
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: tr("tabs.home"), tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />, tabBarAccessibilityLabel: tr("tabs.home") }} />
      <Tabs.Screen name="lab" options={{ title: tr("tabs.build"), tabBarIcon: ({ color, focused }) => <TabIcon name="build" color={color} focused={focused} />, tabBarAccessibilityLabel: tr("tabs.build") }} />
      <Tabs.Screen name="play" options={{ title: tr("tabs.play"), tabBarIcon: ({ color, focused }) => <TabIcon name="play" color={color} focused={focused} />, tabBarAccessibilityLabel: tr("tabs.play") }} />
      <Tabs.Screen name="explore" options={{ title: tr("tabs.explore"), tabBarIcon: ({ color, focused }) => <TabIcon name="explore" color={color} focused={focused} />, tabBarAccessibilityLabel: tr("tabs.explore") }} />
      <Tabs.Screen name="tutor" options={{ title: tr("tabs.tutor"), tabBarIcon: ({ color, focused }) => <TabIcon name="tutor" color={color} focused={focused} />, tabBarAccessibilityLabel: tr("tabs.tutor") }} />
      <Tabs.Screen name="astronomy" options={{ href: null }} />
      <Tabs.Screen name="quantum" options={{ href: null }} />
      <Tabs.Screen name="practice" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
    </Tabs>
  );
}
