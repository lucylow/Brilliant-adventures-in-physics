import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, MasteryRing, ProgressBar, SectionHeader } from "@/components/physica-ui";
import { loadLearningState, type LearningState } from "@/lib/progress-store";
import { evaluateAchievements } from "@/lib/achievements";
import { generateMission, levelProgress, missionProgress, streakMessage } from "@/lib/gamification";
import { useColors } from "@/hooks/use-colors";

const TOPICS = [
  { name: "Kinematics", detail: "Review motion graphs and units." },
  { name: "Projectile motion", detail: "Practice launch angle and range." },
  { name: "Newton’s laws", detail: "Focus on free-body diagrams." },
  { name: "Circuits", detail: "Start with Ohm’s law." },
];

export default function ProgressScreen() {
  const colors = useColors();
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0 });
  useEffect(() => { void loadLearningState().then(setLearning); }, []);
  const accuracy = learning.attempts ? learning.correct / learning.attempts : 0;
  const level = levelProgress(learning.correct * 10);
  const mission = generateMission(new Date().getDate());
  const missionValue = mission.kind === "practice" ? learning.attempts : 0;
  const achievements = evaluateAchievements(learning);

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
              <View style={{ marginTop: 12 }}><ProgressBar value={accuracy} /></View>
            </View>
          </View>
        </Card>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Card style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>LEARNING XP</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{learning.correct * 10}</Text><Text style={{ color: colors.primary, marginTop: 4 }}>Level {level.level}</Text></Card>
          <Card style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>STREAK</Text><Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{learning.streak} days</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{streakMessage(learning.streak)}</Text></Card>
        </View>
        <Card style={{ marginTop: 14, backgroundColor: colors.primary + "0D" }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>TODAY’S MISSION</Text>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 6 }}>{mission.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>{Math.min(missionValue, mission.goal)} of {mission.goal} complete · +{mission.rewardXp} XP</Text>
          <View style={{ marginTop: 10 }}><ProgressBar value={missionProgress(mission.goal, missionValue)} /></View>
        </Card>
        <View style={{ marginTop: 24 }}>
          <SectionHeader title="Achievements" subtitle="Earned through meaningful learning evidence." />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {achievements.map((achievement) => <Card key={achievement.id} style={{ width: "47%", opacity: achievement.earned ? 1 : 0.5 }}><Text style={{ color: colors.primary, fontSize: 22 }}>{achievement.icon}</Text><Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 6 }}>{achievement.title}</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{achievement.earned ? "Earned" : achievement.description}</Text></Card>)}
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <SectionHeader title="Topic guidance" subtitle="Suggested starting points until more topic evidence is recorded." />
          {TOPICS.map((topic) => <Card key={topic.name} style={{ marginBottom: 10 }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{topic.name}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{topic.detail}</Text></Card>)}
        </View>
        <View style={{ marginTop: 6 }}><Card onPress={() => router.push("/privacy" as never)}><Text style={{ color: colors.foreground, fontWeight: "800" }}>Privacy and local data</Text><Text style={{ color: colors.muted, marginTop: 4 }}>Review or clear what PhysicaAI stores on this device.</Text></Card></View>
      </ScrollView>
    </ScreenContainer>
  );
}
