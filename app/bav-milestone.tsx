import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { BAVPillarMark } from "@/components/bav-discovery-panel";
import { bavMilestoneProgress, countStrongTopicEvidence, evaluateBAVMilestones, type BAVMilestoneId } from "@/lib/bav-milestones";
import { loadLearningStateWithStatus, type LearningState } from "@/lib/progress-store";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { AnimatedProgress } from "@/components/motion-primitives";

const EMPTY_LEARNING: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 };

function isMilestoneId(value: string | undefined): value is BAVMilestoneId {
  return value === "build-foundation" || value === "adventure-loop" || value === "visualize-mastery";
}

function titleKey(id: BAVMilestoneId): string {
  return id === "build-foundation" ? "progress.bavBuildTitle" : id === "adventure-loop" ? "progress.bavAdventureTitle" : "progress.bavVisualizeTitle";
}

function bodyKey(id: BAVMilestoneId): string {
  return id === "build-foundation" ? "progress.bavBuildBody" : id === "adventure-loop" ? "progress.bavAdventureBody" : "progress.bavVisualizeBody";
}

function accentFor(id: BAVMilestoneId): string {
  return id === "build-foundation" ? "#19A896" : id === "adventure-loop" ? "#E59A3A" : "#7C83F5";
}

export default function BAVMilestoneScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const milestoneId: BAVMilestoneId = isMilestoneId(id) ? id : "build-foundation";
  const [learning, setLearning] = useState<LearningState>(EMPTY_LEARNING);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadRecovered, setLoadRecovered] = useState(false);

  const load = () => {
    if (loading) return;
    setLoading(true);
    setLoadFailed(false);
    void loadLearningStateWithStatus().then((result) => { setLearning(result.state); setLoadRecovered(result.recovered); }).catch(() => setLoadFailed(true)).finally(() => setLoading(false));
  };

  useEffect(() => {
    void loadLearningStateWithStatus().then((result) => { setLearning(result.state); setLoadRecovered(result.recovered); }).catch(() => setLoadFailed(true)).finally(() => setLoading(false));
  }, []);

  const milestone = evaluateBAVMilestones(learning).find((item) => item.id === milestoneId) ?? evaluateBAVMilestones(learning)[0];
  const title = tr(titleKey(milestone.id));
  const body = tr(bodyKey(milestone.id));
  const accent = accentFor(milestone.id);
  const evidence = milestone.id === "build-foundation"
    ? tr("bavMilestone.buildEvidence", { attempts: learning.attempts })
    : milestone.id === "adventure-loop"
      ? tr("bavMilestone.adventureEvidence", { lessons: learning.lessonsCompleted, labs: learning.labsCompleted })
      : tr("bavMilestone.visualizeEvidence", { topics: countStrongTopicEvidence(learning) });

  if (loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="polite" style={{ color: colors.muted }}>{tr("achievement.loading")}</Text></ScreenContainer>;
  if (loadFailed) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 20 }}>{tr("persistence.progressLoadFailed")}</Text><View style={{ marginTop: 16 }}><PrimaryButton label={tr("achievement.retryProgress")} onPress={load} /></View></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
    {loadRecovered && <View style={{ marginBottom: 12, gap: 10 }}><Text accessibilityLiveRegion="polite" style={{ color: colors.warning, lineHeight: 20 }}>{tr("achievement.learningRecovered")}</Text><SecondaryButton label={tr("achievement.retryProgress")} onPress={load} /></View>}
    <SectionHeader title={tr("bavMilestone.title")} subtitle={tr("bavMilestone.subtitle")} />
    <Card accessibilityLabel={`${title}. ${body}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><BAVPillarMark pillar={milestone.pillar} size={46} /><View style={{ flex: 1 }}><Text style={{ color: accent, fontSize: 12, fontWeight: "900", letterSpacing: 0.8 }}>{title}</Text><Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "900", marginTop: 4 }}>{body}</Text></View></View>
      <View accessible accessibilityLabel={`${tr("bavMilestone.evidenceTitle")}: ${evidence}`} style={{ marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: accent + "12", borderWidth: 1, borderColor: accent + "35" }}><Text style={{ color: accent, fontWeight: "900" }}>{tr("bavMilestone.evidenceTitle")}</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{evidence}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("progress.bavMilestoneProgress", { current: milestone.current, goal: milestone.goal })}</Text><View style={{ marginTop: 10 }}><AnimatedProgress value={bavMilestoneProgress(milestone)} preferences={{ reducedMotion: false }} /></View></View>
      <View accessibilityLiveRegion="polite" style={{ marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: milestone.earned ? colors.success + "14" : colors.border + "66" }}><Text style={{ color: milestone.earned ? colors.success : colors.foreground, fontWeight: "900" }}>{milestone.earned ? tr("bavMilestone.earned") : tr("progress.inProgress")}</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{milestone.earned ? tr("progress.bavMilestoneUnlocked", { title }) : tr("bavMilestone.notEarned")}</Text></View>
      <Text style={{ color: colors.muted, marginTop: 16, lineHeight: 20 }}>{tr("bavMilestone.localOnly")}</Text>
      <View style={{ marginTop: 20 }}><PrimaryButton label={tr("bavMilestone.back")} onPress={() => router.back()} /></View>
    </Card>
  </ScrollView></ScreenContainer>;
}
