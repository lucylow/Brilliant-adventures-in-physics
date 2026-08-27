import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { subscribeAutosaveSync, type AutosaveSyncEvent } from "@/lib/autosave-sync";
import { loadPreferences } from "@/lib/preferences";

const VISIBLE_MS = 3400;

export function AutosaveSyncToast() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tr } = useAppTranslations();
  const [event, setEvent] = useState<AutosaveSyncEvent | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));

  useEffect(() => {
    let active = true;
    void loadPreferences().then((preferences) => { if (active) setReducedMotion(preferences.reducedMotion); }).catch(() => undefined);
    const unsubscribe = subscribeAutosaveSync((next) => {
      if (!active) return;
      setEvent(next);
      opacity.value = withTiming(1, { duration: reducedMotion ? 0 : 180, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: reducedMotion ? 0 : 180, easing: Easing.out(Easing.cubic) });
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => {
        if (!active) return;
        opacity.value = withTiming(0, { duration: reducedMotion ? 0 : 160, easing: Easing.in(Easing.cubic) });
        translateY.value = withTiming(-10, { duration: reducedMotion ? 0 : 160, easing: Easing.in(Easing.cubic) });
        setEvent(null);
        dismissTimer.current = null;
      }, VISIBLE_MS);
    });
    return () => { active = false; unsubscribe(); if (dismissTimer.current) clearTimeout(dismissTimer.current); dismissTimer.current = null; };
  }, [opacity, reducedMotion, translateY]);

  if (!event) return null;
  const message = event.saved === 1 ? tr("autosave.syncSuccessOne") : tr("autosave.syncSuccessMany", { count: event.saved });
  return <Animated.View accessibilityRole="alert" accessibilityLiveRegion="polite" accessibilityLabel={message} style={[{ position: "absolute", top: insets.top + 12, left: 16, right: 16, zIndex: 20 }, style]}><View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, backgroundColor: colors.success, shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}><Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800", flex: 1 }}>{message}</Text></View></Animated.View>;
}
