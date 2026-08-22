import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";
import { firstActionForGoal, saveOnboarding, type LearnerGoal, type LearnerLevel } from "@/lib/onboarding";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";

const levels: Array<{ value: LearnerLevel; title: string; body: string }> = [
  { value: "new", title: "I’m new to physics", body: "Start with concepts and gentle examples." },
  { value: "school", title: "I’m studying physics", body: "Connect explanations to practice and equations." },
  { value: "exam", title: "I’m preparing for an exam", body: "Focus on efficient practice and misconceptions." },
];
const goals: Array<{ value: LearnerGoal; title: string; body: string }> = [
  { value: "understand", title: "Understand the ideas", body: "Build intuition before calculating." },
  { value: "practice", title: "Practice problems", body: "Work through feedback-rich questions." },
  { value: "experiment", title: "Run experiments", body: "Explore motion with deterministic labs." },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [level, setLevel] = useState<LearnerLevel>("new");
  const [goal, setGoal] = useState<LearnerGoal>("understand");
  const [error, setError] = useState<string | null>(null);
  const finish = async (skip = false) => {
    const result = await persistSafely(saveOnboarding({ completed: true, level: skip ? "new" : level, goal: skip ? "understand" : goal }));
    if (result.ok) { router.replace(firstActionForGoal(skip ? "understand" : goal) as never); return; }
    setError(persistenceRecoveryMessage(result));
  };
  const next = () => setStep((current) => current === 2 ? 2 : (current + 1) as 0 | 1 | 2);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}><View style={{ flex: 1, justifyContent: "center" }}><SectionHeader title="Welcome to PhysicaAI" subtitle={`Step ${step + 1} of 3`} /><Card><Pill label="LOCAL-FIRST LEARNING" active />{step === 0 && <View><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 24, fontWeight: "800" }}>Learn physics by doing.</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>Ask a Tutor question, test an idea in the Lab, practice with feedback, and watch your progress grow. You can change your choices later.</Text><View style={{ marginTop: 20 }}><PrimaryButton label="Choose my starting point" onPress={next} /></View></View>}{step === 1 && <View><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 20, fontWeight: "800" }}>Where are you starting?</Text>{levels.map((item) => <View key={item.value} style={{ marginTop: 10 }}><SecondaryButton label={`${item.title} · ${item.body}`} onPress={() => setLevel(item.value)} /><Text accessibilityLiveRegion="polite" style={{ position: "absolute", opacity: level === item.value ? 1 : 0, right: 12, top: 14, color: colors.primary, fontWeight: "800" }}>Selected</Text></View>)}<View style={{ marginTop: 18 }}><PrimaryButton label="Choose a goal" onPress={next} /></View></View>}{step === 2 && <View><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 20, fontWeight: "800" }}>What would help most today?</Text>{goals.map((item) => <View key={item.value} style={{ marginTop: 10 }}><SecondaryButton label={`${item.title} · ${item.body}`} onPress={() => setGoal(item.value)} /><Text accessibilityLiveRegion="polite" style={{ position: "absolute", opacity: goal === item.value ? 1 : 0, right: 12, top: 14, color: colors.primary, fontWeight: "800" }}>Selected</Text></View>)}<View style={{ marginTop: 18 }}><PrimaryButton label="Start learning" onPress={() => void finish()} /></View></View>}{error && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 14, color: colors.warning, lineHeight: 20 }}>{error}</Text>}<View style={{ marginTop: 18 }}><SecondaryButton label="Skip setup" onPress={() => void finish(true)} /></View></Card></View></ScrollView></ScreenContainer>;
}
