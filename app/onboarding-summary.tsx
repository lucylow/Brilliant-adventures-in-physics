import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";
import { firstActionForGoal, learnerGoalLabel, learnerLevelLabel, loadOnboarding, recommendationForGoal, type OnboardingProfile } from "@/lib/onboarding";

export default function OnboardingSummaryScreen() {
  const colors = useColors();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  useEffect(() => { void loadOnboarding().then(setProfile); }, []);
  if (!profile) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text style={{ color: colors.muted }}>Loading your learning path…</Text></ScreenContainer>;
  const recommendation = recommendationForGoal(profile.goal);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}><View style={{ flex: 1, justifyContent: "center" }}><SectionHeader title="Your learning path is ready" subtitle="You can change these choices anytime." /><Card><Pill label="PERSONALIZED START" active /><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 24, fontWeight: "800" }}>A good place to begin</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>PhysicaAI will use these choices to shape your starting recommendation. Your profile stays on this device.</Text><View style={{ marginTop: 20, gap: 10 }}><View style={{ padding: 14, borderRadius: 14, backgroundColor: colors.primary + "12" }}><Text style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>STARTING LEVEL</Text><Text style={{ marginTop: 4, color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{learnerLevelLabel(profile.level)}</Text></View><View style={{ padding: 14, borderRadius: 14, backgroundColor: colors.primary + "12" }}><Text style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>TODAY’S GOAL</Text><Text style={{ marginTop: 4, color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{learnerGoalLabel(profile.goal)}</Text></View></View><View style={{ marginTop: 18 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{recommendation.title}</Text><Text style={{ marginTop: 5, color: colors.muted, lineHeight: 20 }}>{recommendation.body}</Text></View><View style={{ marginTop: 18 }}><PrimaryButton label={recommendation.label} onPress={() => router.replace(firstActionForGoal(profile.goal) as never)} /></View><View style={{ marginTop: 10 }}><SecondaryButton label="Change my choices" onPress={() => router.replace("/onboarding" as never)} /></View></Card></View></ScrollView></ScreenContainer>;
}
