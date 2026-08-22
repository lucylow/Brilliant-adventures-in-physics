import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { loadPreferences, savePreferences, type Preferences } from "@/lib/preferences";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";
import { useColors } from "@/hooks/use-colors";
import { PersistenceDiagnostics } from "@/components/persistence-diagnostics";

export default function SettingsScreen() {
  const colors = useColors();
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  useEffect(() => { void loadPreferences().then(setPreferences); }, []);
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
        <Pressable accessibilityRole="button" onPress={() => router.push("/privacy" as never)} style={({ pressed }) => ({ marginTop: 12, opacity: pressed ? 0.7 : 1 })}>
          <Card><Text style={{ color: colors.foreground, fontWeight: "800" }}>Privacy and local data</Text><Text style={{ color: colors.muted, marginTop: 4 }}>Review, export, or clear device-only study data.</Text><PersistenceDiagnostics /></Card></Pressable>
        {saveMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning }}>{saveMessage}</Text>}<View style={{ marginTop: 20 }}><SecondaryButton label="Done" onPress={() => router.back()} /></View>
      </ScrollView>
    </ScreenContainer>
  );
}
