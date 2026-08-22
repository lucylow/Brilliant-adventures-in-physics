import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, MasteryRing, PrimaryButton, SectionHeader } from "@/components/physica-ui";
import { loadLearningState, type LearningState } from "@/lib/progress-store";
import { evaluateAchievements } from "@/lib/achievements";
import { achievementProgress } from "@/lib/achievement-progress";
import { generateMission, levelProgress, missionProgress, streakMessage } from "@/lib/gamification";
import { useColors } from "@/hooks/use-colors";
import { loadPreferencesWithStatus, type Preferences } from "@/lib/preferences";
import { AnimatedProgress } from "@/components/motion-primitives";

const TOPICS = [
  { name: "Kinematics", detail: "Review motion graphs and units." },
  { name: "Projectile motion", detail: "Practice launch angle and range." },
  { name: "Newton’s laws", detail: "Focus on free-body diagrams." },
  { name: "Circuits", detail: "Start with Ohm’s law." },
];

export default function ProgressScreen() {
  const colors = useColors();
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true });
  const [loadFailed, setLoadFailed] = useState(false);
  const loadProgress = () => { setLoadFailed(false); let active = true; void Promise.all([loadLearningState(), loadPreferencesWithStatus()]).then(([nextLearning, preferenceResult]) => { if (!active) return; setLearning(nextLearning); setPreferences(preferenceResult.preferences); }).catch(() => { if (active) setLoadFailed(true); }); return () => { active = false; }; };
  useEffect(() => loadProgress(), []);
  const accuracy = learning.attempts ? learning.correct / learning.attempts : 0;
  const level = levelProgress(learning.correct * 10);
  const mission = generateMission(new Date().getDate());
  const missionValue = mission.kind === "practice" ? learning.attempts : 0;
  const achievements = evaluateAchievements(learning);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "earned" | "progress">("all");
  const visibleAchievements = achievements.filter((achievement) => achievementFilter === "all" || (achievementFilter === "earned" ? achievement.earned : !achievement.earned));
  if (loadFailed) return <ScreenContainer className="p-5"><View style={{ flex: 1, justifyContent: "center" }}><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 21 }}>We could not load your progress data. Your local learning records are safe.</Text><View style={{ marginTop: 16 }}><PrimaryButton label="Retry loading progress" onPress={loadProgress} /></View></View></ScreenContainer>;

  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title="Progress" subtitle="Mastery comes first. Motivation stays gentle and optional." />
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <MasteryRing value={accuracy} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>Practice accuracy</Text>
              <Text style={{ marginTop: 5, color: colors.muted }}>{learning.attempts ? `${learning.correct} of ${learning.attempts} attempts correct.` : "Complete a practice question to start your progress map."}</Text>
              <View style={{ marginTop: 12 }}><AnimatedProgress value={accuracy} preferences={preferences} /></View>
            </View>
          </View>
        </Card>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Card style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>LEARNING XP</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{learning.correct * 10}</Text><Text style={{ color: colors.primary, marginTop: 4 }}>Level {level.level}</Text></Card>
          <Card style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>STREAK</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{preferences.streakEnabled ? `${learning.streak} days` : "Hidden"}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{preferences.streakEnabled ? streakMessage(learning.streak) : "Streak display is off in Settings."}</Text></Card>
        </View>
        <Card style={{ marginTop: 14, backgroundColor: colors.primary + "0D" }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>TODAY’S MISSION</Text>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 6 }}>{mission.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>{Math.min(missionValue, mission.goal)} of {mission.goal} complete · +{mission.rewardXp} XP</Text>
          <View style={{ marginTop: 10 }}><AnimatedProgress value={missionProgress(mission.goal, missionValue)} preferences={preferences} /></View>
        </Card>
        <View style={{ marginTop: 24 }}>
          <SectionHeader title="Achievements" subtitle="Earned through meaningful learning evidence." />
          <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "all" }} onPress={() => setAchievementFilter("all")}><Text style={{ color: achievementFilter === "all" ? colors.primary : colors.muted, fontWeight: "800" }}>All</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "earned" }} onPress={() => setAchievementFilter("earned")}><Text style={{ color: achievementFilter === "earned" ? colors.primary : colors.muted, fontWeight: "800" }}>Earned</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: achievementFilter === "progress" }} onPress={() => setAchievementFilter("progress")}><Text style={{ color: achievementFilter === "progress" ? colors.primary : colors.muted, fontWeight: "800" }}>In progress</Text></Pressable></View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {visibleAchievements.map((achievement) => <Card key={achievement.id} onPress={() => router.push({ pathname: "/achievement", params: { id: achievement.id } } as never)} style={{ width: "47%", opacity: achievement.earned ? 1 : 0.5 }}><Text style={{ color: colors.primary, fontSize: 22 }}>{achievement.icon}</Text><Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 6 }}>{achievement.title}</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{achievement.earned ? "Earned" : achievement.description}</Text><View style={{ marginTop: 8 }}><AnimatedProgress value={achievementProgress(achievement, learning)} preferences={preferences} /></View></Card>)}
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <SectionHeader title="Topic guidance" subtitle="Suggested starting points until more topic evidence is recorded." />
          {TOPICS.map((topic) => <Card key={topic.name} style={{ marginBottom: 10 }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{topic.name}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{topic.detail}</Text></Card>)}
        </View>
        <View style={{ marginTop: 6 }}><Card onPress={() => router.push("/settings" as never)}><Text style={{ color: colors.foreground, fontWeight: "800" }}>Settings and privacy</Text><Text style={{ color: colors.muted, marginTop: 4 }}>Control streak display and review local study data.</Text></Card></View>
      </ScrollView>
    </ScreenContainer>
  );
}
