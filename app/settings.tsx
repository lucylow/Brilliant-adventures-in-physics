import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { loadPreferencesWithStatus, savePreferences, type Preferences } from "@/lib/preferences";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";
import { useColors } from "@/hooks/use-colors";
import { PersistenceDiagnostics } from "@/components/persistence-diagnostics";
import { loadOnboarding, resetOnboarding, saveOnboarding } from "@/lib/onboarding";

export default function SettingsScreen() {
  const colors = useColors();
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  useEffect(() => { let active = true; void loadPreferencesWithStatus().then((result) => { if (!active) return; setPreferences(result.preferences); if (result.recovered) setLoadMessage("We could not read saved preferences, so safe defaults are in use."); }).catch(() => { if (active) setLoadMessage("Preferences are temporarily unavailable. You can try again later."); }); return () => { active = false; }; }, []);
  const update = (key: keyof Preferences, value: boolean) => { const next = { ...preferences, [key]: value }; void persistSafely(savePreferences(next)).then((saved) => { setSaveMessage(persistenceRecoveryMessage(saved)); if (saved.ok) setPreferences(saved.data); }); };
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title="Settings" subtitle="Choose how PhysicaAI supports your learning." />
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Show learning streak</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>Optional motivation only. Turning this off never affects progress or achievements.</Text></View>
            <Switch value={preferences.streakEnabled} onValueChange={(value) => update("streakEnabled", value)} accessibilityLabel="Show learning streak" />
          </View>
        </Card>
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Reduce motion</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>Use calmer state changes and less animated feedback.</Text></View>
            <Switch value={preferences.reducedMotion} onValueChange={(value) => update("reducedMotion", value)} accessibilityLabel="Reduce motion" />
          </View>
        </Card>
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Haptic feedback</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>Allow gentle vibration for meaningful actions such as completing a lab.</Text></View>
            <Switch value={preferences.hapticsEnabled} onValueChange={(value) => update("hapticsEnabled", value)} accessibilityLabel="Haptic feedback" />
          </View>
        </Card>
        <Card style={{ marginTop: 12 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Learning path</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>Revisit your starting level and goal, or reset them for a fresh first-run experience.</Text><View style={{ marginTop: 12 }}><SecondaryButton label="Review onboarding" onPress={() => router.push("/onboarding" as never)} /></View><View style={{ marginTop: 8 }}><SecondaryButton label="Reset onboarding choices" onPress={() => { void persistSafely(saveOnboarding(resetOnboarding())).then((result) => { const message = persistenceRecoveryMessage(result); setOnboardingMessage(message); if (result.ok) router.push("/onboarding" as never); }); }} /></View>{onboardingMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{onboardingMessage}</Text>}</Card>
        <Pressable accessibilityRole="button" onPress={() => router.push("/privacy" as never)} style={({ pressed }) => ({ marginTop: 12, opacity: pressed ? 0.7 : 1 })}>
          <Card><Text style={{ color: colors.foreground, fontWeight: "800" }}>Privacy and local data</Text><Text style={{ color: colors.muted, marginTop: 4 }}>Review, export, or clear device-only study data.</Text><PersistenceDiagnostics /></Card></Pressable>
        {loadMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning }}>{loadMessage}</Text>}{saveMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning }}>{saveMessage}</Text>}<View style={{ marginTop: 20 }}><SecondaryButton label="Done" onPress={() => router.back()} /></View>
      </ScrollView>
    </ScreenContainer>
  );
}
