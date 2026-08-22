import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, MasteryRing, ProgressBar, SectionHeader } from "@/components/physica-ui";
import { loadLearningState, type LearningState } from "@/lib/progress-store";
import { useColors } from "@/hooks/use-colors";

const TOPICS = [
  { name: "Kinematics", value: 0.72, detail: "Strong fundamentals; revisit graphs." },
  { name: "Projectile motion", value: 0.54, detail: "Practice launch angle and range." },
  { name: "Newton’s laws", value: 0.38, detail: "Focus on free-body diagrams." },
  { name: "Circuits", value: 0.26, detail: "Start with Ohm’s law." },
];

export default function ProgressScreen() {
  const colors = useColors();
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [] });
  useEffect(() => { void loadLearningState().then(setLearning); }, []);
  const overall = learning.attempts ? learning.correct / learning.attempts : 0;
  return <ScreenContainer className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Progress" subtitle="Your map grows from real attempts, not guesses." /><Card><View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}><MasteryRing value={overall} /><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>Practice accuracy</Text><Text style={{ marginTop: 5, color: colors.muted }}>{learning.attempts ? `${learning.correct} of ${learning.attempts} attempts correct.` : "Complete a practice question to start your progress map."}</Text><View style={{ marginTop: 12 }}><ProgressBar value={overall} /></View></View></View></Card><View style={{ marginTop: 24 }}><SectionHeader title="Topic guidance" subtitle="These are suggested starting points until more attempts are recorded." />{TOPICS.map((topic) => <Card key={topic.name} style={{ marginBottom: 10 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{topic.name}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{topic.detail}</Text><View style={{ marginTop: 12 }}><ProgressBar value={learning.lastTopic === topic.name ? overall : 0} /></View></View><Text style={{ color: colors.primary, fontWeight: "800" }}>{learning.lastTopic === topic.name ? `${Math.round(overall * 100)}%` : "New"}</Text></View></Card>)}</View><Card style={{ marginTop: 14, backgroundColor: colors.primary + "0D" }}><Text style={{ color: colors.primary, fontWeight: "800" }}>Recommended next action</Text><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 6 }}>{learning.attempts ? "Review your last topic" : "Complete your first practice question"}</Text><Text style={{ color: colors.muted, marginTop: 5 }}>Use the Tutor or Practice tab to build evidence for your learning map.</Text></Card></ScrollView></ScreenContainer>;
}
