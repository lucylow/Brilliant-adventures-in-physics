import { ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { loadLearningStateWithStatus, summarizeCompletionEvents, type LearningState } from "@/lib/progress-store";
import { evaluateAchievements } from "@/lib/achievements";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { ErrorState } from "@/components/states";
import { requireId } from "@/lib/navigation";

export default function AchievementScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const parsedId = id ? requireId(id, "achievement") : null;
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadRecovered, setLoadRecovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const applyLoad = (result: Awaited<ReturnType<typeof loadLearningStateWithStatus>>) => { setLearning(result.state); setLoadRecovered(result.recovered); };
  const load = () => { if (loading) return; setLoading(true); setLoadFailed(false); void loadLearningStateWithStatus().then(applyLoad).catch(() => setLoadFailed(true)).finally(() => setLoading(false)); };
  useEffect(() => { setLoading(true); void loadLearningStateWithStatus().then(applyLoad).catch(() => setLoadFailed(true)).finally(() => setLoading(false)); }, []);
  const achievement = evaluateAchievements(learning).find((item) => item.id === (parsedId?.ok ? parsedId.data : id)) ?? evaluateAchievements(learning)[0];
  const completionSummary = summarizeCompletionEvents(learning.completionEvents ?? []);
  if (parsedId && !parsedId.ok) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ErrorState title="That achievement could not be opened" body={parsedId.error.userMessage} onRetry={() => router.replace("/(tabs)/progress" as never)} retryLabel={tr("achievement.back")} /></ScreenContainer>;
  if (loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="polite" style={{ color: colors.muted }}>{tr("achievement.loading")}</Text></ScreenContainer>;
  if (loadFailed) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 20 }}>{tr("persistence.progressLoadFailed")}</Text><View style={{ marginTop: 16 }}><PrimaryButton label={tr("achievement.retryProgress")} onPress={load} /></View></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}>{loadRecovered && <View style={{ marginBottom: 12, gap: 10 }}><Text accessibilityLiveRegion="polite" style={{ color: colors.warning, lineHeight: 20 }}>{tr("achievement.learningRecovered")}</Text><SecondaryButton label={tr("achievement.retryProgress")} onPress={load} /></View>}<SectionHeader title={tr("achievement.title")} subtitle={tr("achievement.subtitle")} /><Card><Text style={{ color: colors.primary, fontSize: 42 }}>{achievement.icon}</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 12 }}>{achievement.title}</Text><Text style={{ color: colors.muted, marginTop: 8, lineHeight: 21 }}>{achievement.description}</Text><View accessible accessibilityLabel={`${tr("achievement.completionEvidence")}: ${tr("achievement.completionEvidenceBody", { lessons: completionSummary.lessons, labs: completionSummary.labs })}`} style={{ marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: colors.primary + "0D" }}><Text style={{ color: colors.primary, fontWeight: "800" }}>{tr("achievement.completionEvidence")}</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{tr("achievement.completionEvidenceBody", { lessons: completionSummary.lessons, labs: completionSummary.labs })}</Text></View><View style={{ marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: achievement.earned ? colors.success + "14" : colors.border + "66" }}><Text style={{ color: achievement.earned ? colors.success : colors.foreground, fontWeight: "800" }}>{achievement.earned ? tr("achievement.earned") : tr("achievement.notEarned")}</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{achievement.earned ? tr("achievement.keepGoing") : tr("achievement.evidence")}</Text></View><View style={{ marginTop: 20 }}><PrimaryButton label={tr("achievement.back")} onPress={() => router.back()} /></View></Card></ScrollView></ScreenContainer>;
}
