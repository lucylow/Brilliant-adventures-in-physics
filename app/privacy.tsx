import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { buildLocalDataShareText, clearAllLocalDataWithReport, formatClearLocalDataReport, formatLocalDataSummary, formatPrivacyActivityTimestamp, getLocalDataSummaryWithStatus, loadPrivacyActivityWithStatus, localSummaryFileUri, recordPrivacyActivity, type LocalDataSummary, type PrivacyActivityEvent } from "@/lib/privacy";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";

export default function PrivacyScreen() {
  const colors = useColors();
  const { locale, tr } = useAppTranslations();
  const [summary, setSummary] = useState<LocalDataSummary>({ learningRecords: 0, savedQuestions: 0, savedExperiments: 0, activeDrafts: 0, completionEvents: 0, lessonCompletions: 0, labCompletions: 0 });
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [activity, setActivity] = useState<PrivacyActivityEvent[]>([]);
  const [activityFallback, setActivityFallback] = useState(false);
  const [summaryFallback, setSummaryFallback] = useState(false);
  const loadFailureMessage = tr("privacy.loadFailed");
  const refresh = () => { void Promise.all([getLocalDataSummaryWithStatus(), loadPrivacyActivityWithStatus()]).then(([next, result]) => { setSummary(next.summary); setSummaryFallback(next.recovered); setActivity(result.events); setActivityFallback(result.usedFallback); setShareMessage(null); }).catch(() => setShareMessage(loadFailureMessage)); };
  useEffect(() => { let active = true; void Promise.all([getLocalDataSummaryWithStatus(), loadPrivacyActivityWithStatus()]).then(([next, result]) => { if (!active) return; setSummary(next.summary); setSummaryFallback(next.recovered); setActivity(result.events); setActivityFallback(result.usedFallback); setShareMessage(null); }).catch(() => { if (active) setShareMessage(loadFailureMessage); }); return () => { active = false; }; }, [loadFailureMessage]);
  const rows = [{ label: tr("privacy.practiceAttempts"), value: summary.learningRecords }, { label: tr("privacy.savedQuestions"), value: summary.savedQuestions }, { label: tr("privacy.savedExperiments"), value: summary.savedExperiments }, { label: tr("privacy.activeDrafts"), value: summary.activeDrafts }, { label: tr("privacy.completionEvents"), value: summary.completionEvents }, { label: tr("privacy.lessonsCompleted"), value: summary.lessonCompletions }, { label: tr("privacy.labsCompleted"), value: summary.labCompletions }];
  const activityOutcome = (outcome: PrivacyActivityEvent["outcome"]) => tr(outcome === "success" ? "privacy.activitySuccess" : outcome === "unavailable" ? "privacy.activityUnavailable" : "privacy.activityFailure");
  const activityLabel = (event: PrivacyActivityEvent) => tr("privacy.activityEntry", { action: tr(event.kind === "share" ? "privacy.activityShare" : "privacy.activityClear"), outcome: activityOutcome(event.outcome), date: formatPrivacyActivityTimestamp(event.occurredAt, locale) });
  const clear = () => Alert.alert(tr("privacy.clearTitle"), tr("privacy.clearBody"), [{ text: tr("privacy.cancel"), style: "cancel" }, { text: tr("privacy.clear"), style: "destructive", onPress: () => { void clearAllLocalDataWithReport().then(async (report) => { if (report.status === "fullyCleared") { await recordPrivacyActivity("clear", "success"); await refresh(); return; } await recordPrivacyActivity("clear", "failure"); await loadPrivacyActivityWithStatus().then((result) => { setActivity(result.events); setActivityFallback(result.usedFallback); }).catch(() => undefined); setShareMessage(formatClearLocalDataReport(report)); }).catch(async () => { await recordPrivacyActivity("clear", "failure"); await loadPrivacyActivityWithStatus().then((result) => { setActivity(result.events); setActivityFallback(result.usedFallback); }).catch(() => undefined); setShareMessage(tr("privacy.clearFailed")); }); } }]);
  const share = async () => {
    if (sharing) return;
    setSharing(true);
    setShareMessage(null);
    let uri: string | null = null;
    try {
      if (Platform.OS === "web" || !(await Sharing.isAvailableAsync())) {
        await recordPrivacyActivity("share", "unavailable");
        await loadPrivacyActivityWithStatus().then((result) => { setActivity(result.events); setActivityFallback(result.usedFallback); }).catch(() => undefined);
        setShareMessage(tr("privacy.shareUnavailable"));
        return;
      }
      const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      uri = localSummaryFileUri(directory);
      if (!uri) throw new Error("Local cache directory unavailable");
      await FileSystem.writeAsStringAsync(uri, buildLocalDataShareText(summary), { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { dialogTitle: tr("privacy.shareTitle"), mimeType: "text/plain", UTI: "public.plain-text" });
      await recordPrivacyActivity("share", "success");
      await loadPrivacyActivityWithStatus().then((result) => { setActivity(result.events); setActivityFallback(result.usedFallback); }).catch(() => undefined);
      setShareMessage(tr("privacy.shareSuccess"));
    } catch {
      await recordPrivacyActivity("share", "failure");
      await loadPrivacyActivityWithStatus().then((result) => { setActivity(result.events); setActivityFallback(result.usedFallback); }).catch(() => undefined);
      setShareMessage(tr("privacy.shareFailed"));
    } finally {
      if (uri) await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
      setSharing(false);
    }
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title={tr("privacy.title")} subtitle={tr("privacy.subtitle")} /><Card accessibilityLabel={tr("privacy.dataTitle")}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("privacy.dataTitle")}</Text>{summaryFallback && <Text accessibilityLiveRegion="polite" style={{ color: colors.warning, marginTop: 10, lineHeight: 20 }}>{tr("privacy.summaryFallback")}</Text>}{rows.map((item) => <View key={item.label} accessibilityLabel={`${item.label}: ${item.value}`} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}><Text style={{ color: colors.muted }}>{item.label}</Text><Text style={{ color: colors.foreground, fontWeight: "800" }}>{item.value}</Text></View>)}<View style={{ marginTop: 20, padding: 12, borderRadius: 12, backgroundColor: colors.border + "55" }}><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{tr("privacy.summary")}</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }}>{formatLocalDataSummary(summary)}</Text></View><View style={{ marginTop: 16 }}><SecondaryButton label={sharing ? tr("privacy.sharing") : tr("privacy.share")} onPress={() => { void share(); }} /></View>{shareMessage && <Text accessibilityRole="text" accessibilityLiveRegion="polite" style={{ marginTop: 10, color: colors.muted, lineHeight: 20 }}>{shareMessage}</Text>}<Card style={{ marginTop: 16 }} accessibilityLabel={tr("privacy.activityTitle")}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("privacy.activityTitle")}</Text>{activityFallback && <Text accessibilityLiveRegion="polite" style={{ color: colors.warning, marginTop: 10, lineHeight: 20 }}>{tr("privacy.activityFallback")}</Text>}<Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("privacy.activityBody")}</Text>{activity.length === 0 ? <Text accessibilityRole="text" style={{ color: colors.muted, marginTop: 16 }}>{tr("privacy.noActivity")}</Text> : activity.slice(0, 10).map((event) => <Text key={event.id} accessibilityLabel={activityLabel(event)} style={{ color: colors.muted, marginTop: 12, lineHeight: 20 }}>{activityLabel(event)}</Text>)}</Card><View style={{ marginTop: 24 }}><PrimaryButton label={tr("privacy.clear")} onPress={clear} /></View><View style={{ marginTop: 10 }}><SecondaryButton label={tr("privacy.done")} onPress={() => router.back()} /></View></Card></ScrollView></ScreenContainer>;
}
