import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";
import { loadOnboarding, saveOnboarding, type LearnerGoal, type LearnerLevel } from "@/lib/onboarding";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";
import { useEffect } from "react";
import { useAppTranslations } from "@/hooks/use-app-translations";

const levels: Array<{ value: LearnerLevel; titleKey: string; bodyKey: string }> = [
  { value: "new", titleKey: "onboarding.levelNew", bodyKey: "onboarding.levelNewBody" },
  { value: "school", titleKey: "onboarding.levelSchool", bodyKey: "onboarding.levelSchoolBody" },
  { value: "exam", titleKey: "onboarding.levelExam", bodyKey: "onboarding.levelExamBody" },
];
const goals: Array<{ value: LearnerGoal; titleKey: string; bodyKey: string }> = [
  { value: "understand", titleKey: "onboarding.goalUnderstand", bodyKey: "onboarding.goalUnderstandBody" },
  { value: "practice", titleKey: "onboarding.goalPractice", bodyKey: "onboarding.goalPracticeBody" },
  { value: "experiment", titleKey: "onboarding.goalExperiment", bodyKey: "onboarding.goalExperimentBody" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [level, setLevel] = useState<LearnerLevel>("new");
  const [goal, setGoal] = useState<LearnerGoal>("understand");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { let active = true; void loadOnboarding().then((profile) => { if (!active) return; if (!profile.completed) { setStep(profile.step); setLevel(profile.level); setGoal(profile.goal); } setHydrated(true); }); return () => { active = false; }; }, []);
  useEffect(() => { if (!hydrated) return; void persistSafely(saveOnboarding({ completed: false, level, goal, step })); }, [goal, hydrated, level, step]);
  const [error, setError] = useState<string | null>(null);
  const finish = async (skip = false) => {
    const result = await persistSafely(saveOnboarding({ completed: true, level: skip ? "new" : level, goal: skip ? "understand" : goal, step: 2 }));
    if (result.ok) { router.replace("/onboarding-summary" as never); return; }
    setError(persistenceRecoveryMessage(result));
  };
  const next = () => setStep((current) => current === 2 ? 2 : (current + 1) as 0 | 1 | 2);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}><View style={{ flex: 1, justifyContent: "center" }}><SectionHeader title={tr("onboarding.title")} subtitle={tr("onboarding.step", { step: step + 1 })} /><Card><Pill label={tr("onboarding.localFirst")} active />{step === 0 && <View><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 24, fontWeight: "800" }}>{tr("onboarding.learnByDoing")}</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>{tr("onboarding.introBody")}</Text><View style={{ marginTop: 20 }}><PrimaryButton label={tr("onboarding.chooseStart")} onPress={next} /></View></View>}{step === 1 && <View><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{tr("onboarding.startingQuestion")}</Text>{levels.map((item) => <View key={item.value} style={{ marginTop: 10 }}><SecondaryButton label={`${tr(item.titleKey)} · ${tr(item.bodyKey)}`} onPress={() => setLevel(item.value)} /><Text accessibilityLiveRegion="polite" style={{ position: "absolute", opacity: level === item.value ? 1 : 0, right: 12, top: 14, color: colors.primary, fontWeight: "800" }}>{tr("onboarding.selected")}</Text></View>)}<View style={{ marginTop: 18 }}><PrimaryButton label={tr("onboarding.chooseGoal")} onPress={next} /></View></View>}{step === 2 && <View><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{tr("onboarding.goalQuestion")}</Text>{goals.map((item) => <View key={item.value} style={{ marginTop: 10 }}><SecondaryButton label={`${tr(item.titleKey)} · ${tr(item.bodyKey)}`} onPress={() => setGoal(item.value)} /><Text accessibilityLiveRegion="polite" style={{ position: "absolute", opacity: goal === item.value ? 1 : 0, right: 12, top: 14, color: colors.primary, fontWeight: "800" }}>{tr("onboarding.selected")}</Text></View>)}<View style={{ marginTop: 18 }}><PrimaryButton label={tr("onboarding.startLearning")} onPress={() => void finish()} /></View></View>}{error && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 14, color: colors.warning, lineHeight: 20 }}>{error}</Text>}<View style={{ marginTop: 18 }}><SecondaryButton label={tr("onboarding.skip")} onPress={() => void finish(true)} /></View></Card></View></ScrollView></ScreenContainer>;
}
