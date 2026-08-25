import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, MasteryRing, PrimaryButton, SectionHeader, SecondaryButton } from "@/components/physica-ui";
import { loadLearningState, type LearningState } from "@/lib/progress-store";
import { evaluateAchievements } from "@/lib/achievements";
import { achievementProgress } from "@/lib/achievement-progress";
import { generateMission, levelProgress, missionProgress, streakMessage } from "@/lib/gamification";
import { useColors } from "@/hooks/use-colors";
import { loadPreferencesWithStatus, type Preferences } from "@/lib/preferences";
import { AnimatedProgress } from "@/components/motion-primitives";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { adventureProgress, completeAdventureMission, emptyAdventureState, generateAdventureMissions, loadAdventureState, missionIsComplete, saveAdventureState, worldForLevel, type AdventureState } from "@/lib/adventure";
import { loadPuzzleEvidence, missedPuzzleReviewQueue, summarizePuzzleEvidence, type PuzzleEvidence } from "@/lib/puzzle-evidence";

const TOPICS = [
  { name: "Kinematics", detail: "Review motion graphs and units." },
  { name: "Projectile motion", detail: "Practice launch angle and range." },
  { name: "Newton’s laws", detail: "Focus on free-body diagrams." },
  { name: "Circuits", detail: "Start with Ohm’s law." },
];

export default function ProgressScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
  const [loadFailed, setLoadFailed] = useState(false);
  const [adventureState, setAdventureState] = useState<AdventureState>(emptyAdventureState());
  const [adventureSaveFailed, setAdventureSaveFailed] = useState(false);
  const [puzzleEvidence, setPuzzleEvidence] = useState<PuzzleEvidence[]>([]);
  const loadProgress = () => { setLoadFailed(false); let active = true; void Promise.all([loadLearningState(), loadPreferencesWithStatus(), loadAdventureState(), loadPuzzleEvidence()]).then(([nextLearning, preferenceResult, adventureResult, puzzleResult]) => { if (!active) return; setLearning(nextLearning); setPreferences(preferenceResult.preferences); setAdventureState(adventureResult.state); setPuzzleEvidence(puzzleResult); }).catch(() => { if (active) setLoadFailed(true); }); return () => { active = false; }; };
  useEffect(() => loadProgress(), []);
  const accuracy = learning.attempts ? learning.correct / learning.attempts : 0;
  const level = levelProgress(learning.correct * 10);
  const mission = generateMission(new Date().getDate());
  const missionValue = mission.kind === "practice" ? learning.attempts : 0;
  const puzzleSummary = summarizePuzzleEvidence(puzzleEvidence);
  const reviewQueue = missedPuzzleReviewQueue(puzzleEvidence, 3);
  const adventureWorld = worldForLevel(level.level);
  const adventureMissions = generateAdventureMissions(adventureWorld.id);
  const adventureMission = adventureMissions[0];
  const adventureEvidence = Math.min(adventureMission.goal, learning.attempts);
  const adventureComplete = missionIsComplete(adventureState, adventureMission) || adventureEvidence >= adventureMission.goal;
  useEffect(() => { if (!adventureComplete || missionIsComplete(adventureState, adventureMission)) return; let active = true; const nextState = completeAdventureMission({ ...adventureState, worldId: adventureWorld.id }, adventureMission.id); setAdventureState(nextState); void saveAdventureState(nextState).then(() => { if (active) setAdventureSaveFailed(false); }).catch(() => { if (active) setAdventureSaveFailed(true); }); return () => { active = false; }; }, [adventureComplete, adventureMission, adventureState, adventureWorld.id]);
  const achievements = evaluateAchievements(learning);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "earned" | "progress">("all");
  const visibleAchievements = achievements.filter((achievement) => achievementFilter === "all" || (achievementFilter === "earned" ? achievement.earned : !achievement.earned));
  if (loadFailed) return <ScreenContainer className="p-5"><View style={{ flex: 1, justifyContent: "center" }}><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 21 }}>We could not load your progress data. Your local learning records are safe.</Text><View style={{ marginTop: 16 }}><PrimaryButton label={tr("progress.retry")} onPress={loadProgress} /></View></View></ScreenContainer>;

  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title={tr("progress.title")} subtitle={tr("progress.subtitle")} />
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <MasteryRing value={accuracy} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{tr("progress.accuracy")}</Text>
              <Text style={{ marginTop: 5, color: colors.muted }}>{learning.attempts ? `${learning.correct} of ${learning.attempts} attempts correct.` : tr("progress.emptyAccuracy")}</Text>
              <View style={{ marginTop: 12 }}><AnimatedProgress value={accuracy} preferences={preferences} /></View>
            </View>
          </View>
        </Card>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Card style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{tr("progress.xp")}</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{learning.correct * 10}</Text><Text style={{ color: colors.primary, marginTop: 4 }}>{tr("progress.level", { level: level.level })}</Text></Card>
          <Card style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{tr("progress.streak")}</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{preferences.streakEnabled ? `${learning.streak} days` : tr("progress.hidden")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{preferences.streakEnabled ? streakMessage(learning.streak) : tr("progress.streakOff")}</Text></Card>
        </View>
        <Card style={{ marginTop: 14, backgroundColor: colors.primary + "0D" }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>{tr("progress.todayMission")}</Text>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 6 }}>{mission.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>{Math.min(missionValue, mission.goal)} of {mission.goal} complete · +{mission.rewardXp} XP</Text>
          <View style={{ marginTop: 10 }}><AnimatedProgress value={missionProgress(mission.goal, missionValue)} preferences={preferences} /></View>
        </Card>
        <Card accessibilityLabel={`${tr("progress.adventure")}: ${adventureWorld.title}. ${adventureMission.title}.`} style={{ marginTop: 14 }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>{tr("progress.adventure")}</Text>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 6 }}>{adventureWorld.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.adventureBody")}</Text>
          <Text accessibilityLabel={tr("progress.puzzleEvidence", { total: puzzleSummary.total, accuracy: Math.round(puzzleSummary.accuracy * 100) })} style={{ color: colors.muted, marginTop: 6 }}>{tr("progress.puzzleEvidence", { total: puzzleSummary.total, accuracy: Math.round(puzzleSummary.accuracy * 100) })}</Text>
          {reviewQueue.length > 0 && <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.warning + "14" }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("progress.reviewTitle")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.reviewCount", { count: reviewQueue.length })}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.reviewBody")}</Text><View style={{ gap: 8, marginTop: 10 }}>{reviewQueue.map((item) => <View key={item.puzzleId}><Text accessibilityLabel={tr("progress.reviewTopic", { topic: item.topic ?? item.puzzleId })} style={{ color: colors.foreground, fontWeight: "700", marginBottom: 6 }}>{tr("progress.reviewTopic", { topic: item.topic ?? item.puzzleId })}</Text><PrimaryButton label={tr("progress.reviewOpen")} onPress={() => router.push({ pathname: "/practice", params: item.topic ? { concept: item.topic } : undefined } as never)} /></View>)}<View style={{ marginTop: 10 }}><SecondaryButton label={tr("progress.reviewAll")} onPress={() => router.push({ pathname: "/practice", params: { review: "1" } } as never)} /></View></View></View>}
          <Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 12 }}>{adventureMission.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>{adventureMission.objective}</Text>
          <Text accessibilityLiveRegion="polite" style={{ color: adventureComplete ? colors.success : colors.primary, marginTop: 8 }}>{adventureComplete ? tr("progress.missionComplete") : tr("progress.missionProgress", { done: adventureEvidence, goal: adventureMission.goal })}</Text>
          <View style={{ marginTop: 10 }}><AnimatedProgress value={adventureProgress(adventureComplete ? { ...adventureState, completedMissionIds: adventureState.completedMissionIds.includes(adventureMission.id) ? adventureState.completedMissionIds : [...adventureState.completedMissionIds, adventureMission.id] } : adventureState, adventureMissions)} preferences={preferences} /></View>
          {!adventureComplete && <View style={{ marginTop: 10 }}><PrimaryButton label={tr("progress.openMission")} onPress={() => router.push("/practice" as never)} /></View>}
          {adventureSaveFailed && <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 8 }}>{tr("progress.adventureSaveFailed")}</Text>}
        </Card>
        <View style={{ marginTop: 24 }}>
          <SectionHeader title={tr("progress.achievements")} subtitle={tr("progress.achievementsSubtitle")} />
          <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "all" }} onPress={() => setAchievementFilter("all")}><Text style={{ color: achievementFilter === "all" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.all")}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "earned" }} onPress={() => setAchievementFilter("earned")}><Text style={{ color: achievementFilter === "earned" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.earned")}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "progress" }} onPress={() => setAchievementFilter("progress")}><Text style={{ color: achievementFilter === "progress" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.inProgress")}</Text></Pressable></View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {visibleAchievements.map((achievement) => <Card key={achievement.id} onPress={() => router.push({ pathname: "/achievement", params: { id: achievement.id } } as never)} style={{ width: "47%", opacity: achievement.earned ? 1 : 0.5 }}><Text style={{ color: colors.primary, fontSize: 22 }}>{achievement.icon}</Text><Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 6 }}>{achievement.title}</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{achievement.earned ? tr("progress.earned") : achievement.description}</Text><View style={{ marginTop: 8 }}><AnimatedProgress value={achievementProgress(achievement, learning)} preferences={preferences} /></View></Card>)}
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <SectionHeader title={tr("progress.topicGuidance")} subtitle={tr("progress.topicGuidanceSubtitle")} />
          {TOPICS.map((topic) => <Card key={topic.name} style={{ marginBottom: 10 }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{topic.name}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{topic.detail}</Text></Card>)}
        </View>
        <View style={{ marginTop: 6 }}><Card onPress={() => router.push("/settings" as never)}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("progress.settingsPrivacy")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.settingsPrivacyBody")}</Text></Card></View>
      </ScrollView>
    </ScreenContainer>
  );
}
