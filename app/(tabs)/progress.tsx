import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, MasteryRing, ProgressBar, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";

const TOPICS = [
  { name: "Kinematics", value: 0.72, detail: "Strong fundamentals; revisit graphs." },
  { name: "Projectile motion", value: 0.54, detail: "Practice launch angle and range." },
  { name: "Newton’s laws", value: 0.38, detail: "Focus on free-body diagrams." },
  { name: "Circuits", value: 0.26, detail: "Start with Ohm’s law." },
];

export default function ProgressScreen() {
  const colors = useColors();
  const overall = TOPICS.reduce((sum, topic) => sum + topic.value, 0) / TOPICS.length;
  return <ScreenContainer className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Progress" subtitle="Your map grows from real attempts, not guesses." /><Card><View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}><MasteryRing value={overall} /><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>Physics foundation</Text><Text style={{ marginTop: 5, color: colors.muted }}>Keep practicing the topics with the most room to grow.</Text><View style={{ marginTop: 12 }}><ProgressBar value={overall} /></View></View></View></Card><View style={{ marginTop: 24 }}><SectionHeader title="Topic mastery" subtitle="Select a topic to continue targeted practice." />{TOPICS.map((topic) => <Card key={topic.name} style={{ marginBottom: 10 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{topic.name}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{topic.detail}</Text><View style={{ marginTop: 12 }}><ProgressBar value={topic.value} /></View></View><Text style={{ color: colors.primary, fontWeight: "800" }}>{Math.round(topic.value * 100)}%</Text></View></Card>)}</View><Card style={{ marginTop: 14, backgroundColor: colors.primary + "0D" }}><Text style={{ color: colors.primary, fontWeight: "800" }}>Recommended next action</Text><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 6 }}>Complete 3 Newton’s laws questions</Text><Text style={{ color: colors.muted, marginTop: 5 }}>A focused review will strengthen your weakest current topic.</Text></Card></ScrollView></ScreenContainer>;
}
