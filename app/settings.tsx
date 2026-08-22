import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { loadPreferencesWithStatus, savePreferences, type Preferences } from "@/lib/preferences";
import * as Network from "expo-network";
import { manualNetworkCheckMessage, networkStateToStatus, networkStatusLabel, shouldRetryAfterManualCheck, type NetworkStatus } from "@/lib/network";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";
import { useColors } from "@/hooks/use-colors";
import { PersistenceDiagnostics } from "@/components/persistence-diagnostics";
import { loadOnboarding, resetOnboarding, saveOnboarding } from "@/lib/onboarding";
import { clearRetryQueue, formatLastSave, formatRetryItemAge, formatRetryItemResult, formatRetryProgress, formatRetryResult, getLastSave, getRetryCount, getRetryItems, markLastSave, removeRetryItem, retryOneItem, retryQueue, RETRY_ITEM_DISCARD_COPY, RETRY_ITEM_DISCARDED_COPY, RETRY_QUEUE_DISCARD_COPY, RETRY_QUEUE_DISCARDED_COPY, type RetryItem, type RetryProgress } from "@/lib/retry-queue";
import { saveDraft } from "@/lib/progress-store";

export default function SettingsScreen() {
  const colors = useColors();
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryItems, setRetryItems] = useState<RetryItem[]>([]);
  const [lastSave, setLastSave] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryProgress, setRetryProgress] = useState<RetryProgress | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("unknown");
  const [checkingNetwork, setCheckingNetwork] = useState(false);
  useEffect(() => { let active = true; void loadPreferencesWithStatus().then((result) => { if (!active) return; setPreferences(result.preferences); if (result.recovered) setLoadMessage("We could not read saved preferences, so safe defaults are in use."); }).catch(() => { if (active) setLoadMessage("Preferences are temporarily unavailable. You can try again later."); }); void Promise.all([getRetryCount(), getRetryItems(), getLastSave()]).then(([count, items, savedAt]) => { if (!active) return; setRetryCount(count); setRetryItems(items); setLastSave(savedAt); }).catch(() => { if (active) setRetryMessage("Offline-save details are temporarily unavailable."); }); return () => { active = false; }; }, []);
  const update = (key: keyof Preferences, value: boolean) => { const next = { ...preferences, [key]: value }; void persistSafely(savePreferences(next)).then((saved) => { setSaveMessage(persistenceRecoveryMessage(saved)); if (saved.ok) setPreferences(saved.data); }); };
  const retryPendingSaves = () => { if (retrying) return; setRetrying(true); setRetryProgress(null); setRetryMessage(null); void retryQueue(async (item) => { await saveDraft({ id: item.id, data: item.payload, updatedAt: item.queuedAt }); }, (progress) => setRetryProgress(progress)).then(async (result) => { if (result.saved > 0) await markLastSave(); setRetryCount(result.remaining); setRetryItems(result.remaining ? await getRetryItems() : []); setLastSave(result.saved > 0 ? new Date().toISOString() : lastSave); setRetryProgress(null); setRetryMessage(formatRetryResult(result.saved, result.remaining)); }).catch(() => { setRetryProgress(null); setRetryMessage("We could not retry offline saves. Your queued work remains available to try again."); }).finally(() => setRetrying(false)); };
  const checkConnection = () => { if (checkingNetwork || retrying) return; setCheckingNetwork(true); void Network.getNetworkStateAsync().then((state) => { const status = networkStateToStatus(state); setNetworkStatus(status); if (shouldRetryAfterManualCheck(status, retryCount)) { retryPendingSaves(); } else { setRetryMessage(manualNetworkCheckMessage(status)); } }).catch(() => { setNetworkStatus("unknown"); setRetryMessage(manualNetworkCheckMessage("unknown")); }).finally(() => setCheckingNetwork(false)); };
  const confirmDiscardPendingSaves = () => { if (retrying || retryCount === 0) return; Alert.alert("Discard offline saves?", RETRY_QUEUE_DISCARD_COPY, [{ text: "Keep saves", style: "cancel" }, { text: "Discard", style: "destructive", onPress: () => { setRetrying(true); void clearRetryQueue().then(() => { setRetryCount(0); setRetryItems([]); setLastSave(null); setRetryMessage(RETRY_QUEUE_DISCARDED_COPY); }).catch(() => setRetryMessage("We could not discard queued offline saves. Your work remains available.")).finally(() => setRetrying(false)); } }]); };
  const confirmDiscardItem = (item: RetryItem, index: number) => { if (retrying) return; Alert.alert(`Discard draft ${index + 1}?`, RETRY_ITEM_DISCARD_COPY, [{ text: "Keep draft", style: "cancel" }, { text: "Discard", style: "destructive", onPress: () => { setRetrying(true); void removeRetryItem(item.id).then(async (remaining) => { setRetryCount(remaining); setRetryItems(await getRetryItems()); setRetryMessage(RETRY_ITEM_DISCARDED_COPY); }).catch(() => setRetryMessage("We could not discard this queued autosave. Your work remains available.")).finally(() => setRetrying(false)); } }]); };
  const retryOnePendingSave = (item: RetryItem, index: number) => { if (retrying) return; setRetrying(true); setRetryMessage(null); void retryOneItem(item.id, async (queued) => { await saveDraft({ id: queued.id, data: queued.payload, updatedAt: queued.queuedAt }); }).then(async (result) => { setRetryCount(result.remaining); setRetryItems(await getRetryItems()); if (result.saved) { await markLastSave(); setLastSave(new Date().toISOString()); } setRetryMessage(formatRetryItemResult(index, result.saved, result.remaining)); }).catch(() => setRetryMessage(`We could not retry draft ${index + 1}. Your queued work was kept.`)).finally(() => setRetrying(false)); };
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
        <Card style={{ marginTop: 12 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Connection and offline saves</Text><Text accessibilityRole="text" style={{ color: colors.muted, marginTop: 5 }}>Current status: {networkStatusLabel(networkStatus)}.</Text><View style={{ marginTop: 10 }}><SecondaryButton label={checkingNetwork ? "Checking connection…" : "Check connection"} onPress={checkConnection} /></View><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{retryCount > 0 ? `${retryCount} autosave${retryCount === 1 ? "" : "s"} waiting to retry.` : "No offline autosaves are waiting."}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{formatLastSave(lastSave)}</Text>{retryItems.length > 0 && <View style={{ marginTop: 8 }}>{retryItems.slice(0, 3).map((item, index) => <View key={item.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: index === 0 ? 0 : 8 }}><Text accessibilityLabel={`Draft ${index + 1}, queued ${formatRetryItemAge(item.queuedAt, Date.now())}`} style={{ color: colors.muted, lineHeight: 20, flex: 1 }}>Draft {index + 1} · queued {formatRetryItemAge(item.queuedAt, Date.now())}</Text><View style={{ flexDirection: "row", gap: 8 }}><SecondaryButton label={`Retry draft ${index + 1}`} onPress={() => retryOnePendingSave(item, index)} /><SecondaryButton label={`Discard draft ${index + 1}`} onPress={() => confirmDiscardItem(item, index)} /></View></View>)}{retryItems.length > 3 && <Text style={{ color: colors.muted, marginTop: 8 }}>Plus {retryItems.length - 3} more queued.</Text>}</View>}<View style={{ marginTop: 12 }}><SecondaryButton label={retrying ? "Retrying offline saves…" : "Retry offline saves"} onPress={retryPendingSaves} /></View>{retryCount > 0 && <View style={{ marginTop: 8 }}><SecondaryButton label="Discard queued offline saves" onPress={confirmDiscardPendingSaves} /></View>}{retryProgress && <Text accessibilityLiveRegion="polite" accessibilityLabel={formatRetryProgress(retryProgress)} style={{ marginTop: 10, color: colors.muted }}>{formatRetryProgress(retryProgress)}</Text>}{retryMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{retryMessage}</Text>}</Card>
        <Card style={{ marginTop: 12 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Learning path</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>Revisit your starting level and goal, or reset them for a fresh first-run experience.</Text><View style={{ marginTop: 12 }}><SecondaryButton label="Review onboarding" onPress={() => router.push("/onboarding" as never)} /></View><View style={{ marginTop: 8 }}><SecondaryButton label="Reset onboarding choices" onPress={() => { void persistSafely(saveOnboarding(resetOnboarding())).then((result) => { const message = persistenceRecoveryMessage(result); setOnboardingMessage(message); if (result.ok) router.push("/onboarding" as never); }); }} /></View>{onboardingMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{onboardingMessage}</Text>}</Card>
        <Pressable accessibilityRole="button" onPress={() => router.push("/privacy" as never)} style={({ pressed }) => ({ marginTop: 12, opacity: pressed ? 0.7 : 1 })}>
          <Card><Text style={{ color: colors.foreground, fontWeight: "800" }}>Privacy and local data</Text><Text style={{ color: colors.muted, marginTop: 4 }}>Review, export, or clear device-only study data.</Text><PersistenceDiagnostics /></Card></Pressable>
        {loadMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning }}>{loadMessage}</Text>}{saveMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning }}>{saveMessage}</Text>}<View style={{ marginTop: 20 }}><SecondaryButton label="Done" onPress={() => router.back()} /></View>
      </ScrollView>
    </ScreenContainer>
  );
}
