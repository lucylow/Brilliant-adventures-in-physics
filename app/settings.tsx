import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { loadPreferencesWithStatus, savePreferences, type Preferences } from "@/lib/preferences";
import * as Network from "expo-network";
import { manualNetworkCheckMessage, networkStateToStatus, networkStatusLabel, shouldRetryAfterManualCheck, type NetworkStatus } from "@/lib/network";
import { persistSafely, persistenceRecoveryMessageKey } from "@/lib/persistence";
import { useColors } from "@/hooks/use-colors";
import { PersistenceDiagnostics } from "@/components/persistence-diagnostics";
import { resetOnboarding, saveOnboarding } from "@/lib/onboarding";
import { clearRetryQueue, formatLastSave, formatRetryItemAge, formatRetryItemResult, formatRetryProgress, formatRetryResult, getLastSave, getRetryItems, loadRetryQueueWithStatus, markLastSave, removeRetryItem, retryOneItem, retryQueue, RETRY_ITEM_DISCARD_COPY, RETRY_ITEM_DISCARDED_COPY, RETRY_QUEUE_DISCARD_COPY, RETRY_QUEUE_DISCARDED_COPY, type RetryItem, type RetryProgress } from "@/lib/retry-queue";
import { saveDraft } from "@/lib/progress-store";
import { LOCALES, type SupportedLocale } from "@/lib/locale";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { SubscriptionCard } from "@/components/monetization";
import { useEntitlements } from "@/hooks/use-monetization";
import { restorePurchases } from "@/lib/monetization/runtime";
import { publishAutosaveSync, subscribeAutosaveSync } from "@/lib/autosave-sync";
import { loadSyncHistoryWithStatus, recordSyncHistory, type SyncHistoryEntry } from "@/lib/sync-history";
import { loadBAVMilestoneAcknowledgementsWithStatus, resetBAVMilestoneAcknowledgements, type BAVMilestoneAcknowledgement } from "@/lib/bav-milestone-acknowledgements";
import type { BAVMilestoneId } from "@/lib/bav-milestones";
import { isMockModeEnabled, isProductionRuntime } from "@/lib/mock/config";

export default function SettingsScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const { lifetimeOwned, plan, status } = useEntitlements();
  const subscriptionTitle = lifetimeOwned ? "Lifetime Unlock" : plan === "plus" ? "BAV+" : "Free";
  const subscriptionStatus = status === "trial" ? "Trial" : status === "expired" ? "Ended" : lifetimeOwned ? "Permanent access" : status === "unlimited" ? "Active" : "Free learning";
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryItems, setRetryItems] = useState<RetryItem[]>([]);
  const [lastSave, setLastSave] = useState<string | null>(null);
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>([]);
  const [syncHistoryMessage, setSyncHistoryMessage] = useState<string | null>(null);
  const [bavCelebrationMessage, setBavCelebrationMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [bavCelebrationCount, setBavCelebrationCount] = useState<number | null>(null);
  const [bavCelebrationEntries, setBavCelebrationEntries] = useState<BAVMilestoneAcknowledgement[]>([]);
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryProgress, setRetryProgress] = useState<RetryProgress | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("unknown");
  const [checkingNetwork, setCheckingNetwork] = useState(false);
  const localizedPersistenceMessage = (result: Parameters<typeof persistenceRecoveryMessageKey>[0]) => { const key = persistenceRecoveryMessageKey(result); return key ? tr(key) : null; };
  const bavMilestoneRows: { id: BAVMilestoneId; titleKey: string }[] = [{ id: "build-foundation", titleKey: "progress.bavBuildTitle" }, { id: "adventure-loop", titleKey: "progress.bavAdventureTitle" }, { id: "visualize-mastery", titleKey: "progress.bavVisualizeTitle" }];
  useEffect(() => { let active = true; void loadPreferencesWithStatus().then((result) => { if (!active) return; setPreferences(result.preferences); if (result.recovered) setLoadMessage(tr("settings.preferencesRecovered")); }).catch(() => { if (active) setLoadMessage(tr("settings.preferencesUnavailable")); }); void Promise.all([loadRetryQueueWithStatus(), getLastSave(), loadSyncHistoryWithStatus()]).then(([queueResult, savedAt, historyResult]) => { if (!active) return; setRetryCount(queueResult.items.length); setRetryItems(queueResult.items); setLastSave(savedAt); setSyncHistory(historyResult.entries); if (queueResult.recovered) setRetryMessage(queueResult.reason === "malformed" ? tr("settings.retryQueueRecovered") : tr("settings.retryDetailsUnavailable")); if (historyResult.recovered) setSyncHistoryMessage(historyResult.reason === "malformed" ? tr("settings.syncHistoryRecovered") : tr("settings.syncHistoryUnavailable")); }).catch(() => { if (active) { setRetryMessage(tr("settings.retryDetailsUnavailable")); setSyncHistoryMessage(tr("settings.syncHistoryUnavailable")); } }); void loadBAVMilestoneAcknowledgementsWithStatus().then((result) => { if (!active) return; setBavCelebrationCount(result.recovered ? null : result.entries.length); setBavCelebrationEntries(result.recovered ? [] : result.entries); if (result.recovered) setBavCelebrationMessage({ text: tr("settings.bavCelebrationsUnavailable"), ok: false }); }).catch(() => { if (active) { setBavCelebrationCount(null); setBavCelebrationEntries([]); setBavCelebrationMessage({ text: tr("settings.bavCelebrationsUnavailable"), ok: false }); } }); return () => { active = false; }; }, [tr]);
  useEffect(() => { let active = true; const unsubscribe = subscribeAutosaveSync((event) => { if (!active) return; setLastSyncCount(event.saved); setLastSave(new Date(event.occurredAt).toISOString()); void Promise.all([loadRetryQueueWithStatus(), loadSyncHistoryWithStatus()]).then(([result, historyResult]) => { if (!active) return; setRetryCount(result.items.length); setRetryItems(result.items); setSyncHistory(historyResult.entries); if (result.recovered) setRetryMessage(result.reason === "malformed" ? tr("settings.retryQueueRecovered") : tr("settings.retryDetailsUnavailable")); if (historyResult.recovered) setSyncHistoryMessage(historyResult.reason === "malformed" ? tr("settings.syncHistoryRecovered") : tr("settings.syncHistoryUnavailable")); }).catch(() => { if (active) setRetryMessage(tr("settings.retryDetailsUnavailable")); }); }); return () => { active = false; unsubscribe(); }; }, [tr]);
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => { const next = { ...preferences, [key]: value }; void persistSafely(savePreferences(next)).then((saved) => { setSaveMessage(localizedPersistenceMessage(saved)); if (saved.ok) setPreferences(saved.data); }); };
  const retryPendingSaves = () => { if (retrying) return; setRetrying(true); setRetryProgress(null); setRetryMessage(null); void retryQueue(async (item) => { await saveDraft({ id: item.id, data: item.payload, updatedAt: item.queuedAt }); }, (progress) => setRetryProgress(progress)).then(async (result) => { if (result.saved > 0) { const occurredAt = Date.now(); await markLastSave(); await recordSyncHistory({ saved: result.saved, occurredAt }); publishAutosaveSync(result.saved, occurredAt); } setRetryCount(result.remaining); setRetryItems(result.remaining ? await getRetryItems() : []); setLastSave(result.saved > 0 ? new Date().toISOString() : lastSave); setRetryProgress(null); setRetryMessage(formatRetryResult(result.saved, result.remaining)); }).catch(() => { setRetryProgress(null); setRetryMessage(tr("settings.retryFailed")); }).finally(() => setRetrying(false)); };
  const checkConnection = () => { if (checkingNetwork || retrying) return; setCheckingNetwork(true); void Network.getNetworkStateAsync().then((state) => { const status = networkStateToStatus(state); setNetworkStatus(status); if (shouldRetryAfterManualCheck(status, retryCount)) { retryPendingSaves(); } else { setRetryMessage(manualNetworkCheckMessage(status)); } }).catch(() => { setNetworkStatus("unknown"); setRetryMessage(manualNetworkCheckMessage("unknown")); }).finally(() => setCheckingNetwork(false)); };
  const resetBAVCelebrations = () => { setBavCelebrationMessage(null); void resetBAVMilestoneAcknowledgements().then((result) => { if (result.ok) { setBavCelebrationCount(0); setBavCelebrationEntries([]); } setBavCelebrationMessage(result.ok ? { text: tr("settings.bavCelebrationsReset"), ok: true } : { text: tr("settings.bavCelebrationsResetFailed"), ok: false }); }).catch(() => setBavCelebrationMessage({ text: tr("settings.bavCelebrationsResetFailed"), ok: false })); };
  const confirmDiscardPendingSaves = () => { if (retrying || retryCount === 0) return; Alert.alert("Discard offline saves?", RETRY_QUEUE_DISCARD_COPY, [{ text: "Keep saves", style: "cancel" }, { text: "Discard", style: "destructive", onPress: () => { setRetrying(true); void clearRetryQueue().then(() => { setRetryCount(0); setRetryItems([]); setLastSave(null); setRetryMessage(RETRY_QUEUE_DISCARDED_COPY); }).catch(() => setRetryMessage(tr("settings.discardQueueFailed"))).finally(() => setRetrying(false)); } }]); };
  const confirmDiscardItem = (item: RetryItem, index: number) => { if (retrying) return; Alert.alert(`Discard draft ${index + 1}?`, RETRY_ITEM_DISCARD_COPY, [{ text: "Keep draft", style: "cancel" }, { text: "Discard", style: "destructive", onPress: () => { setRetrying(true); void removeRetryItem(item.id).then(async (remaining) => { setRetryCount(remaining); setRetryItems(await getRetryItems()); setRetryMessage(RETRY_ITEM_DISCARDED_COPY); }).catch(() => setRetryMessage(tr("settings.discardItemFailed"))).finally(() => setRetrying(false)); } }]); };
  const retryOnePendingSave = (item: RetryItem, index: number) => { if (retrying) return; setRetrying(true); setRetryMessage(null); void retryOneItem(item.id, async (queued) => { await saveDraft({ id: queued.id, data: queued.payload, updatedAt: queued.queuedAt }); }).then(async (result) => { setRetryCount(result.remaining); setRetryItems(await getRetryItems()); if (result.saved) { const occurredAt = Date.now(); await markLastSave(); await recordSyncHistory({ saved: 1, occurredAt }); setLastSave(new Date(occurredAt).toISOString()); publishAutosaveSync(1, occurredAt); } setRetryMessage(formatRetryItemResult(index, result.saved, result.remaining)); }).catch(() => setRetryMessage(tr("settings.retryItemFailed", { index: index + 1 }))).finally(() => setRetrying(false)); };
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title={tr("settings.title")} subtitle={tr("settings.subtitle")} />
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("settings.streakTitle")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("settings.streakBody")}</Text></View>
            <Switch value={preferences.streakEnabled} onValueChange={(value) => update("streakEnabled", value)} accessibilityLabel={tr("settings.streakTitle")} />
          </View>
        </Card>
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("settings.motionTitle")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("settings.motionBody")}</Text></View>
            <Switch value={preferences.reducedMotion} onValueChange={(value) => update("reducedMotion", value)} accessibilityLabel={tr("settings.motionTitle")} />
          </View>
        </Card>
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("settings.hapticsTitle")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("settings.hapticsBody")}</Text></View>
            <Switch value={preferences.hapticsEnabled} onValueChange={(value) => update("hapticsEnabled", value)} accessibilityLabel={tr("settings.hapticsTitle")} />
          </View>
        </Card>
        <View style={{ marginTop: 12 }}>
          <SubscriptionCard
            title={subscriptionTitle}
            status={subscriptionStatus}
            onManage={() => router.push("/subscription" as never)}
            onRestore={() => void restorePurchases().then(() => router.push("/restore" as never))}
          />
        </View>
        <Card style={{ marginTop: 12 }}>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("settings.languageTitle")}</Text>
          <Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("settings.languageBody")}</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>{LOCALES.map((locale) => <Pressable key={locale.code} accessibilityRole="radio" accessibilityState={{ selected: preferences.locale === locale.code }} accessibilityLabel={`${locale.nativeLabel}, ${locale.label}`} onPress={() => update("locale", locale.code as SupportedLocale)} style={({ pressed }) => ({ borderWidth: 1, borderColor: preferences.locale === locale.code ? colors.primary : colors.border, backgroundColor: preferences.locale === locale.code ? colors.primary + "18" : colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, opacity: pressed ? 0.7 : 1 })}><Text style={{ color: preferences.locale === locale.code ? colors.primary : colors.foreground, fontWeight: "800" }}>{locale.nativeLabel}</Text></Pressable>)}</View>
        </Card>
        <Card style={{ marginTop: 12 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("settings.offlineTitle")}</Text><Text accessibilityRole="text" style={{ color: colors.muted, marginTop: 5 }}>{tr("settings.currentStatus", { status: networkStatusLabel(networkStatus) })}</Text><View style={{ marginTop: 10 }}><SecondaryButton label={checkingNetwork ? tr("settings.checkingConnection") : tr("settings.checkConnection")} onPress={checkConnection} /></View><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{retryCount > 0 ? tr("settings.autosavesWaiting", { count: retryCount }) : tr("settings.noAutosavesWaiting")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{formatLastSave(lastSave)}</Text>{lastSyncCount !== null && <Text accessibilityLiveRegion="polite" style={{ color: colors.success, marginTop: 4, lineHeight: 20 }}>{lastSyncCount === 1 ? tr("settings.syncJustNowOne") : tr("settings.syncJustNowMany", { count: lastSyncCount })}</Text>}{syncHistory.length > 0 && <View accessibilityLabel={tr("settings.syncHistoryLabel")} style={{ marginTop: 10 }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("settings.syncHistoryTitle")}</Text>{syncHistory.slice(0, 5).map((entry, index) => <Text key={`${entry.occurredAt}-${index}`} style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{tr("settings.syncHistoryEntry", { count: entry.saved, time: new Date(entry.occurredAt).toLocaleString(preferences.locale) })}</Text>)}</View>}{syncHistoryMessage && <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 8 }}>{syncHistoryMessage}</Text>}{retryItems.length > 0 && <View style={{ marginTop: 8 }}>{retryItems.slice(0, 3).map((item, index) => <View key={item.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: index === 0 ? 0 : 8 }}><Text accessibilityLabel={tr("settings.draftQueued", { index: index + 1, age: formatRetryItemAge(item.queuedAt, Date.now()) })} style={{ color: colors.muted, lineHeight: 20, flex: 1 }}>Draft {index + 1} · queued {formatRetryItemAge(item.queuedAt, Date.now())}</Text><View style={{ flexDirection: "row", gap: 8 }}><SecondaryButton label={tr("settings.retryDraft", { index: index + 1 })} onPress={() => retryOnePendingSave(item, index)} /><SecondaryButton label={tr("settings.discardDraft", { index: index + 1 })} onPress={() => confirmDiscardItem(item, index)} /></View></View>)}{retryItems.length > 3 && <Text style={{ color: colors.muted, marginTop: 8 }}>{tr("settings.moreQueued", { count: retryItems.length - 3 })}</Text>}</View>}<View style={{ marginTop: 12 }}><SecondaryButton label={retrying ? tr("settings.retryingOffline") : tr("settings.retryOffline")} onPress={retryPendingSaves} /></View>{retryCount > 0 && <View style={{ marginTop: 8 }}><SecondaryButton label={tr("settings.discardQueued")} onPress={confirmDiscardPendingSaves} /></View>}{retryProgress && <Text accessibilityLiveRegion="polite" accessibilityLabel={formatRetryProgress(retryProgress)} style={{ marginTop: 10, color: colors.muted }}>{formatRetryProgress(retryProgress)}</Text>}{retryMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{retryMessage}</Text>}</Card>
        <Card style={{ marginTop: 12 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("settings.learningPathTitle")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("settings.learningPathBody")}</Text><View style={{ marginTop: 12 }}><SecondaryButton label={tr("settings.reviewOnboarding")} onPress={() => router.push("/onboarding" as never)} /></View><View style={{ marginTop: 8 }}><SecondaryButton label={tr("settings.resetOnboarding")} onPress={() => { void persistSafely(saveOnboarding(resetOnboarding())).then((result) => { const message = localizedPersistenceMessage(result); setOnboardingMessage(message); if (result.ok) router.push("/onboarding" as never); }); }} /></View>{onboardingMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{onboardingMessage}</Text>}</Card>
        <Card style={{ marginTop: 12 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("settings.bavCelebrationsTitle")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("settings.bavCelebrationsBody")}</Text><Text accessibilityLiveRegion="polite" style={{ color: colors.muted, marginTop: 8 }}>{bavCelebrationCount === null ? tr("settings.bavCelebrationsUnavailable") : tr("settings.bavCelebrationsCount", { count: bavCelebrationCount })}</Text>{bavCelebrationCount !== null && <View accessible accessibilityLabel={tr("settings.bavCelebrationBreakdownLabel")} style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("settings.bavCelebrationBreakdownTitle")}</Text>{bavMilestoneRows.map((row) => { const stored = bavCelebrationEntries.some((entry) => entry.id === row.id); return <Text key={row.id} style={{ color: stored ? colors.success : colors.muted, marginTop: 6, lineHeight: 20 }}>{tr(row.titleKey)} · {stored ? tr("settings.bavCelebrationStored") : tr("settings.bavCelebrationNotStored")}</Text>; })}</View>}<View style={{ marginTop: 12 }}><SecondaryButton label={tr("settings.resetBavCelebrations")} onPress={resetBAVCelebrations} /></View>{bavCelebrationMessage && <Text accessibilityLiveRegion="polite" style={{ color: bavCelebrationMessage.ok ? colors.success : colors.warning, marginTop: 10, lineHeight: 20 }}>{bavCelebrationMessage.text}</Text>}</Card>
        <Pressable accessibilityRole="button" onPress={() => router.push("/privacy" as never)} style={({ pressed }) => ({ marginTop: 12, opacity: pressed ? 0.7 : 1 })}>
          <Card><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("settings.privacyTitle")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("settings.privacyBody")}</Text><PersistenceDiagnostics /></Card></Pressable>
        {!isProductionRuntime() && isMockModeEnabled() ? (
          <Card style={{ marginTop: 12 }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Mock data</Text>
            <Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>Development-only controls for scenarios, learners, latency, and fixture reset. This card is hidden in production builds.</Text>
            <View style={{ marginTop: 12 }}>
              <SecondaryButton label="Open mock data panel" onPress={() => router.push("/dev/mock-data" as never)} />
            </View>
          </Card>
        ) : null}
        {loadMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning }}>{loadMessage}</Text>}{saveMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning }}>{saveMessage}</Text>}<View style={{ marginTop: 20 }}><SecondaryButton label={tr("common.done")} onPress={() => router.back()} /></View>
      </ScrollView>
    </ScreenContainer>
  );
}
