import { ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SectionHeader } from "@/components/physica-ui";
import { loadLearningState, type LearningState } from "@/lib/progress-store";
import { evaluateAchievements } from "@/lib/achievements";
import { useColors } from "@/hooks/use-colors";
import { loadRecoveryMessage } from "@/lib/persistence";
import { useEffect, useState } from "react";

export default function AchievementScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = () => { if (loading) return; setLoading(true); setLoadFailed(false); void loadLearningState().then(setLearning).catch(() => setLoadFailed(true)).finally(() => setLoading(false)); };
  useEffect(() => { setLoading(true); void loadLearningState().then(setLearning).catch(() => setLoadFailed(true)).finally(() => setLoading(false)); }, []);
  const achievement = evaluateAchievements(learning).find((item) => item.id === id) ?? evaluateAchievements(learning)[0];
  if (loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="polite" style={{ color: colors.muted }}>Loading achievement details…</Text></ScreenContainer>;
  if (loadFailed) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 20 }}>{loadRecoveryMessage("progress")}</Text><View style={{ marginTop: 16 }}><PrimaryButton label="Retry loading progress" onPress={load} /></View></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Achievement detail" subtitle="Progress is evidence of understanding, not a race." /><Card><Text style={{ color: colors.primary, fontSize: 42 }}>{achievement.icon}</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 12 }}>{achievement.title}</Text><Text style={{ color: colors.muted, marginTop: 8, lineHeight: 21 }}>{achievement.description}</Text><View style={{ marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: achievement.earned ? colors.success + "14" : colors.border + "66" }}><Text style={{ color: achievement.earned ? colors.success : colors.foreground, fontWeight: "800" }}>{achievement.earned ? "Earned from your learning activity" : "Not earned yet"}</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{achievement.earned ? "Keep building understanding at your own pace." : "Complete the evidence described above. Practice, lessons, and labs are counted only when you finish the learning action."}</Text></View><View style={{ marginTop: 20 }}><PrimaryButton label="Back to progress" onPress={() => router.back()} /></View></Card></ScrollView></ScreenContainer>;
}
