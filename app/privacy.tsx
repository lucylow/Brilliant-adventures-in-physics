import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { clearAllLocalData, formatLocalDataSummary, getLocalDataSummary, type LocalDataSummary } from "@/lib/privacy";
import { useColors } from "@/hooks/use-colors";

export default function PrivacyScreen() {
  const colors = useColors();
  const [summary, setSummary] = useState<LocalDataSummary>({ learningRecords: 0, savedQuestions: 0, savedExperiments: 0, activeDrafts: 0 });
  const refresh = () => { void getLocalDataSummary().then(setSummary); };
  useEffect(refresh, []);
  const clear = () => Alert.alert("Clear local study data?", "This removes saved questions, experiments, drafts, usage counters, and progress from this device.", [{ text: "Cancel", style: "cancel" }, { text: "Clear data", style: "destructive", onPress: () => void clearAllLocalData().then(refresh) }]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Privacy" subtitle="PhysicaAI keeps this learning data on the device unless you connect a sync service." /><Card><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>On-device study data</Text>{[{ label: "Practice attempts", value: summary.learningRecords }, { label: "Saved questions", value: summary.savedQuestions }, { label: "Saved experiments", value: summary.savedExperiments }, { label: "Active drafts", value: summary.activeDrafts }].map((item) => <View key={item.label} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}><Text style={{ color: colors.muted }}>{item.label}</Text><Text style={{ color: colors.foreground, fontWeight: "800" }}>{item.value}</Text></View>)}<View style={{ marginTop: 20, padding: 12, borderRadius: 12, backgroundColor: colors.border + "55" }}><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{formatLocalDataSummary(summary)}</Text></View><View style={{ marginTop: 24 }}><PrimaryButton label="Clear all local data" onPress={clear} /></View><View style={{ marginTop: 10 }}><SecondaryButton label="Done" onPress={() => router.back()} /></View></Card></ScrollView></ScreenContainer>;
}
