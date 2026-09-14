import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, MasteryRing, PrimaryButton, SectionHeader, SecondaryButton } from "@/components/physica-ui";
import { completionTimelineEntries, formatCompletionDate, loadLearningState, summarizeCompletionEvents, type CompletionEventFilter, type LearningState } from "@/lib/progress-store";
import { evaluateAchievements } from "@/lib/achievements";
import { getActiveAchievements, getActiveMissions } from "@/lib/mock/adapters/catalog";
import { isMockModeEnabled } from "@/lib/mock/config";
import { progressScreenModel } from "@/lib/mock/ai/ai-screen-adapters";
import { getMockDataset } from "@/lib/mock/registry";
import { achievementProgress } from "@/lib/achievement-progress";
import { generateMission, levelProgress, missionProgress, streakMessage } from "@/lib/gamification";
import { useColors } from "@/hooks/use-colors";
import { loadPreferencesWithStatus, type Preferences } from "@/lib/preferences";
import { AnimatedProgress, RevealBlock } from "@/components/motion-primitives";
import { bavMilestoneProgress, evaluateBAVMilestones } from "@/lib/bav-milestones";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { BAVPillarMark } from "@/components/bav-discovery-panel";
import { adventureProgress, completeAdventureMission, emptyAdventureState, generateAdventureMissions, loadAdventureState, missionEvidenceCount, missionIsComplete, saveAdventureState, worldForLevel, type AdventureState } from "@/lib/adventure";
import { buildProgressViewModel, GUIDANCE_TOPICS } from "@/lib/view-models/progress";
import { ProgressInsights } from "@/components/progress/ProgressInsights";
import { loadPuzzleEvidenceWithStatus, loadResolvedPuzzleIdsWithStatus, loadReviewMasteryWithStatus, missedPuzzleReviewQueue, reviewHistorySummary, reviewMasteryPercentDelta, reviewReinforcementDelta, summarizePuzzleEvidence, summarizeReviewMastery, type PuzzleEvidence, type ReviewMasteryRecord } from "@/lib/puzzle-evidence";

export default function ProgressScreen() {
  const colors = useColors();
  const { tr, announce } = useAppTranslations();
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
  const [loadFailed, setLoadFailed] = useState(false);
  const [reviewDataFallback, setReviewDataFallback] = useState(false);
  const [adventureDataFallback, setAdventureDataFallback] = useState(false);
  const [adventureState, setAdventureState] = useState<AdventureState>(emptyAdventureState());
  const [adventureSaveFailed, setAdventureSaveFailed] = useState(false);
  const [puzzleEvidence, setPuzzleEvidence] = useState<PuzzleEvidence[]>([]);
  const [resolvedPuzzleIds, setResolvedPuzzleIds] = useState<string[]>([]);
  const [reviewMastery, setReviewMastery] = useState<ReviewMasteryRecord[]>([]);
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [completionFilter, setCompletionFilter] = useState<CompletionEventFilter>("all");
  const loadProgress = () => { setLoadFailed(false); let active = true; void Promise.all([loadLearningState(), loadPreferencesWithStatus(), loadAdventureState(), loadPuzzleEvidenceWithStatus(), loadResolvedPuzzleIdsWithStatus(), loadReviewMasteryWithStatus()]).then(([nextLearning, preferenceResult, adventureResult, puzzleResult, resolvedResult, masteryResult]) => { if (!active) return; setLearning(nextLearning); setPreferences(preferenceResult.preferences); setAdventureState(adventureResult.state); setAdventureDataFallback(adventureResult.recovered); setPuzzleEvidence(puzzleResult.value); setResolvedPuzzleIds(resolvedResult.value); setReviewMastery(masteryResult.value); setReviewDataFallback(puzzleResult.usedFallback || resolvedResult.usedFallback || masteryResult.usedFallback); }).catch(() => { if (active) { setLoadFailed(true); setReviewDataFallback(true); } }); return () => { active = false; }; };
  useEffect(() => loadProgress(), []);
  const accuracy = learning.attempts ? learning.correct / learning.attempts : 0;
  const level = levelProgress(learning.correct * 10);
  const mission = generateMission(new Date().getDate());
  const missionValue = mission.kind === "practice" ? learning.attempts : 0;
  const bavMilestones = evaluateBAVMilestones(learning);
  const puzzleSummary = summarizePuzzleEvidence(puzzleEvidence);
  const completionSummary = summarizeCompletionEvents(learning.completionEvents ?? []);
  const completionTimeline = completionTimelineEntries(learning.completionEvents ?? [], completionFilter, 10);
  const completionFilterKey = completionFilter === "all" ? "progress.completionAll" : completionFilter === "lesson" ? "progress.completionLessons" : "progress.completionLabs";
  const completionAnnouncement = announce("progress.completionFilterAnnouncement", "polite", { filter: tr(completionFilterKey), count: completionTimeline.length });
  const reviewQueue = missedPuzzleReviewQueue(puzzleEvidence, 3, resolvedPuzzleIds);
  const reviewMasterySummary = summarizeReviewMastery(reviewMastery);
  const recentReviewHistory = reviewHistorySummary(reviewMastery, 5);
  const adventureWorld = worldForLevel(level.level);
  const adventureMissions = isMockModeEnabled() ? getActiveMissions(adventureWorld.id) : generateAdventureMissions(adventureWorld.id);
  const adventureMission = adventureMissions[0];
  const adventureEvidence = missionEvidenceCount(adventureMission, learning.topics, learning.completionEvents ?? []);
  const adventureComplete = missionIsComplete(adventureState, adventureMission) || adventureEvidence >= adventureMission.goal;
  useEffect(() => { if (adventureDataFallback || !adventureComplete || missionIsComplete(adventureState, adventureMission)) return; let active = true; const nextState = completeAdventureMission({ ...adventureState, worldId: adventureWorld.id }, adventureMission.id); setAdventureState(nextState); void saveAdventureState(nextState).then(() => { if (active) setAdventureSaveFailed(false); }).catch(() => { if (active) setAdventureSaveFailed(true); }); return () => { active = false; }; }, [adventureComplete, adventureDataFallback, adventureMission, adventureState, adventureWorld.id]);
  const achievements = isMockModeEnabled() ? getActiveAchievements(learning) : evaluateAchievements(learning);
  const TOPICS = isMockModeEnabled()
    ? getMockDataset().topics.slice(0, 8).map((topic) => ({ name: topic.name, detail: topic.shortDescription }))
    : GUIDANCE_TOPICS;
  const [achievementFilter, setAchievementFilter] = useState<"all" | "earned" | "progress">("all");
  const visibleAchievements = achievements.filter((achievement) => achievementFilter === "all" || (achievementFilter === "earned" ? achievement.earned : !achievement.earned));
  if (loadFailed) return <ScreenContainer className="p-5"><View style={{ flex: 1, justifyContent: "center" }}><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 21 }}>{tr("progress.learningRecovered")}</Text><View style={{ marginTop: 16 }}><PrimaryButton label={tr("progress.retry")} onPress={loadProgress} /></View></View></ScreenContainer>;

  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title={tr("progress.title")} subtitle={tr("progress.subtitle")} />
        {progressScreenModel() && <Card style={{ marginBottom: 12 }}><Text style={{ color: colors.primary, fontWeight: "800" }}>{progressScreenModel()?.demoLabel}</Text><Text style={{ marginTop: 8, color: colors.foreground, lineHeight: 22 }}>{progressScreenModel()?.narrative.narrative}</Text><Text style={{ marginTop: 6, color: colors.muted }}>{progressScreenModel()?.coach.body}</Text></Card>}
        {reviewDataFallback && <Text accessibilityLiveRegion="polite" style={{ color: colors.warning, lineHeight: 21, marginBottom: 10 }}>{tr("progress.reviewDataFallback")}</Text>}
        {adventureDataFallback && <Text accessibilityLiveRegion="polite" style={{ color: colors.warning, lineHeight: 21, marginBottom: 10 }}>{tr("progress.adventureLoadFallback")}</Text>}
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
        <View style={{ marginTop: 16 }}>
          <ProgressInsights model={buildProgressViewModel(learning)} reducedMotion={preferences.reducedMotion} />
        </View>
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
        <Card accessibilityLabel={tr("progress.bavMilestonesTitle")} style={{ marginTop: 14, borderColor: colors.primary + "45" }}>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "900" }}>{tr("progress.bavMilestonesTitle")}</Text>
          <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{tr("progress.bavMilestonesSubtitle")}</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            {bavMilestones.map((milestone, index) => {
              const titleKey = milestone.id === "build-foundation" ? "progress.bavBuildTitle" : milestone.id === "adventure-loop" ? "progress.bavAdventureTitle" : "progress.bavVisualizeTitle";
              const bodyKey = milestone.id === "build-foundation" ? "progress.bavBuildBody" : milestone.id === "adventure-loop" ? "progress.bavAdventureBody" : "progress.bavVisualizeBody";
              const accent = milestone.pillar === "build" ? "#19A896" : milestone.pillar === "adventure" ? "#E59A3A" : "#7C83F5";
              const title = tr(titleKey);
              const body = tr(bodyKey);
              const status = milestone.earned ? tr("progress.bavMilestoneEarned") : tr("progress.inProgress");
              const label = tr("progress.bavMilestoneAccessibility", { title, body, status, current: milestone.current, goal: milestone.goal });
              return <RevealBlock key={milestone.id} index={index} preferences={preferences}><Pressable accessibilityRole="button" accessibilityLabel={`${label}. ${tr("bavMilestone.openDetails")}`} onPress={() => router.push({ pathname: "/bav-milestone", params: { id: milestone.id } } as never)} style={({ pressed }) => ({ opacity: pressed ? 0.76 : 1 })}><View accessibilityLabel={label} style={{ padding: 12, borderRadius: 16, borderWidth: 1, borderColor: accent + "45", backgroundColor: accent + "0B" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><BAVPillarMark pillar={milestone.pillar} size={34} /><View style={{ flex: 1 }}><Text style={{ color: accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.7 }}>{title}</Text><Text style={{ color: colors.muted, marginTop: 3, lineHeight: 18 }}>{body}</Text></View><Text accessibilityLiveRegion={milestone.earned ? "polite" : undefined} style={{ color: milestone.earned ? colors.success : colors.muted, fontSize: 11, fontWeight: "900" }}>{milestone.earned ? tr("progress.bavMilestoneEarned") : `${milestone.current}/${milestone.goal}`}</Text></View>
                <Text style={{ color: milestone.earned ? colors.success : colors.muted, marginTop: 7, fontSize: 12, fontWeight: milestone.earned ? "800" : "400" }}>{milestone.earned ? tr("progress.bavMilestoneUnlocked", { title }) : tr("progress.bavMilestoneProgress", { current: milestone.current, goal: milestone.goal })}</Text>
                <View style={{ marginTop: 7 }}><AnimatedProgress value={bavMilestoneProgress(milestone)} preferences={preferences} /></View>
              </View></Pressable></RevealBlock>;
            })}
          </View>
        </Card>
        <Card accessibilityLabel={`${tr("progress.adventure")}: ${adventureWorld.title}. ${adventureMission.title}.`} style={{ marginTop: 14, borderColor: "#E59A3A55" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><BAVPillarMark pillar="adventure" /><View style={{ flex: 1 }}><Text style={{ color: "#E59A3A", fontSize: 11, fontWeight: "900", letterSpacing: 1 }}>{tr("progress.adventure")}</Text><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "900", marginTop: 4 }}>{adventureWorld.title}</Text></View></View>
          <Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.adventureBody")}</Text>
          <Text accessibilityLabel={tr("progress.puzzleEvidence", { total: puzzleSummary.total, accuracy: Math.round(puzzleSummary.accuracy * 100) })} style={{ color: colors.muted, marginTop: 6 }}>{tr("progress.puzzleEvidence", { total: puzzleSummary.total, accuracy: Math.round(puzzleSummary.accuracy * 100) })}</Text><Text accessibilityLiveRegion="polite" accessibilityLabel={tr("progress.completionEvidence", { lessons: completionSummary.lessons, labs: completionSummary.labs })} style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.completionEvidence", { lessons: completionSummary.lessons, labs: completionSummary.labs })}</Text><Text accessibilityLiveRegion="polite" style={{ color: colors.success, marginTop: 4 }}>{tr("progress.reviewMastery", { count: reviewMasterySummary.resolved })}</Text>{recentReviewHistory.length > 0 ? <View style={{ marginTop: 10 }}><SecondaryButton label={showReviewHistory ? tr("progress.reviewHistoryHide") : tr("progress.reviewHistoryShow")} onPress={() => setShowReviewHistory((value) => !value)} /><View accessible={showReviewHistory} accessibilityLabel={tr("progress.reviewHistory")} accessibilityState={{ expanded: showReviewHistory }} style={{ marginTop: 8 }}>{showReviewHistory ? <><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("progress.reviewHistory")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.reviewHistoryPrivacy")}</Text>{recentReviewHistory.map((item) => <Text key={item.topic} accessibilityLabel={tr("progress.reviewHistoryItem", { topic: item.topic })} style={{ color: colors.muted, marginTop: 4 }}>• {tr("progress.reviewHistoryItem", { topic: item.topic })}</Text>)}</> : null}</View></View> : null}
          {reviewQueue.length > 0 && <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.warning + "14" }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("progress.reviewTitle")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.reviewCount", { count: reviewQueue.length })}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.reviewBody")}</Text><View style={{ gap: 8, marginTop: 10 }}>{reviewQueue.map((item) => <View key={item.puzzleId}><Text accessibilityLabel={tr("progress.reviewTopic", { topic: item.topic ?? item.puzzleId })} style={{ color: colors.foreground, fontWeight: "700", marginBottom: 6 }}>{tr("progress.reviewTopic", { topic: item.topic ?? item.puzzleId })}</Text><PrimaryButton label={tr("progress.reviewOpen")} onPress={() => router.push({ pathname: "/practice", params: item.topic ? { concept: item.topic } : undefined } as never)} /></View>)}<View style={{ marginTop: 10 }}><SecondaryButton label={tr("progress.reviewAll")} onPress={() => router.push({ pathname: "/practice", params: { review: "1" } } as never)} /></View></View></View>}
          <Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 12 }}>{adventureMission.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>{adventureMission.objective}</Text>
          <Text accessibilityLiveRegion="polite" style={{ color: adventureComplete ? colors.success : colors.primary, marginTop: 8 }}>{adventureComplete ? tr("progress.missionComplete") : tr("progress.missionProgress", { done: adventureEvidence, goal: adventureMission.goal })}</Text>
          <View style={{ marginTop: 10 }}><AnimatedProgress value={adventureProgress(adventureComplete ? { ...adventureState, completedMissionIds: adventureState.completedMissionIds.includes(adventureMission.id) ? adventureState.completedMissionIds : [...adventureState.completedMissionIds, adventureMission.id] } : adventureState, adventureMissions)} preferences={preferences} /></View>
          {!adventureComplete && <View style={{ marginTop: 10 }}><PrimaryButton label={tr("progress.openMission")} onPress={() => router.push("/practice" as never)} /></View>}
          {adventureSaveFailed && <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 8 }}>{tr("progress.adventureSaveFailed")}</Text>}
        </Card>
        {completionSummary.total > 0 && <Card accessibilityLabel={tr("progress.completionTimeline")} style={{ marginTop: 14 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{tr("progress.completionTimeline")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{tr("progress.completionTimelineBody")}</Text><Text accessibilityRole="text" accessibilityLiveRegion={completionAnnouncement.accessibilityLiveRegion} style={{ color: colors.muted, marginTop: 8 }}>{completionAnnouncement.message}</Text><View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 8, marginTop: 12 }}><Pressable accessibilityRole="tab" accessibilityState={{ selected: completionFilter === "all" }} onPress={() => setCompletionFilter("all")}><Text style={{ color: completionFilter === "all" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.completionAll")}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: completionFilter === "lesson" }} onPress={() => setCompletionFilter("lesson")}><Text style={{ color: completionFilter === "lesson" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.completionLessons")}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: completionFilter === "lab" }} onPress={() => setCompletionFilter("lab")}><Text style={{ color: completionFilter === "lab" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.completionLabs")}</Text></Pressable></View><View accessible accessibilityLabel={tr("progress.completionTimeline")} style={{ marginTop: 10 }}>{completionTimeline.length > 0 ? completionTimeline.map((event) => { const kind = tr(event.kind === "lesson" ? "progress.completionLesson" : "progress.completionLab"); const date = formatCompletionDate(event.completedAt, preferences.locale); const label = tr("progress.completionTimelineItem", { kind, contentId: event.contentId, date }); return <Text key={event.id} accessibilityLabel={label} style={{ color: colors.muted, marginTop: 5 }}>{label}</Text>; }) : <Text accessibilityRole="text" accessibilityLiveRegion="polite" style={{ color: colors.muted, marginTop: 5 }}>{tr("progress.completionTimelineEmpty")}</Text>}</View></Card>}
        <View style={{ marginTop: 24 }}>
          <SectionHeader title={tr("progress.achievements")} subtitle={tr("progress.achievementsSubtitle")} />
          <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "all" }} onPress={() => setAchievementFilter("all")}><Text style={{ color: achievementFilter === "all" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.all")}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "earned" }} onPress={() => setAchievementFilter("earned")}><Text style={{ color: achievementFilter === "earned" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.earned")}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "progress" }} onPress={() => setAchievementFilter("progress")}><Text style={{ color: achievementFilter === "progress" ? colors.primary : colors.muted, fontWeight: "800" }}>{tr("progress.inProgress")}</Text></Pressable></View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {visibleAchievements.map((achievement) => <Card key={achievement.id} onPress={() => router.push({ pathname: "/achievement", params: { id: achievement.id } } as never)} style={{ width: "47%", opacity: achievement.earned ? 1 : 0.5 }}><Text style={{ color: colors.primary, fontSize: 22 }}>{achievement.icon}</Text><Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 6 }}>{achievement.title}</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{achievement.earned ? tr("progress.earned") : achievement.description}</Text><View style={{ marginTop: 8 }}><AnimatedProgress value={achievementProgress(achievement, learning)} preferences={preferences} /></View></Card>)}
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <SectionHeader title={tr("progress.topicGuidance")} subtitle={tr("progress.topicGuidanceSubtitle")} />
          {TOPICS.map((topic) => <Card key={topic.name} style={{ marginBottom: 10 }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{topic.name}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{topic.detail}</Text>{reviewMasterySummary.topicCounts[topic.name] ? <View><Text accessibilityLiveRegion="polite" style={{ color: colors.success, marginTop: 4 }}>{tr("progress.topicReinforced", { count: reviewMasterySummary.topicCounts[topic.name] })}</Text><Text accessibilityLabel={tr("progress.topicReinforcedDelta", { count: reviewReinforcementDelta(reviewMastery, topic.name) })} style={{ color: colors.success, marginTop: 2, fontSize: 12 }}>{tr("progress.topicReinforcedDelta", { count: reviewReinforcementDelta(reviewMastery, topic.name) })}</Text><Text accessibilityLiveRegion="polite" accessibilityLabel={tr("progress.topicReinforcedPercent", { percent: reviewMasteryPercentDelta(reviewMastery, topic.name) })} style={{ color: colors.primary, marginTop: 2, fontSize: 12 }}>{tr("progress.topicReinforcedPercent", { percent: reviewMasteryPercentDelta(reviewMastery, topic.name) })}</Text></View> : null}</Card>)}
        </View>
        <View style={{ marginTop: 6 }}><Card onPress={() => router.push("/settings" as never)}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("progress.settingsPrivacy")}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{tr("progress.settingsPrivacyBody")}</Text></Card></View>
      </ScrollView>
    </ScreenContainer>
  );
}
