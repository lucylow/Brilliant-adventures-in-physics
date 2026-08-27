import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";
import { firstActionForGoal, learnerGoalLabel, learnerLevelLabel, loadOnboardingWithStatus, recommendationForGoal, type OnboardingProfile } from "@/lib/onboarding";
import { useAppTranslations } from "@/hooks/use-app-translations";

export default function OnboardingSummaryScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const mounted = useRef(true);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadRecovered, setLoadRecovered] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await loadOnboardingWithStatus();
      if (!mounted.current) return;
      setProfile(result.profile);
      setLoadRecovered(result.recovered);
    } catch {
      if (mounted.current) setLoadFailed(true);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);
  if (loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="polite" style={{ color: colors.muted }}>{tr("onboarding.summaryLoading")}</Text></ScreenContainer>;
  if (loadFailed) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 20 }}>{tr("onboarding.loadFailed")}</Text><View style={{ marginTop: 16, gap: 10 }}><SecondaryButton label={tr("onboarding.retry")} onPress={() => void load()} /><SecondaryButton label={tr("onboarding.changeChoices")} onPress={() => router.replace("/onboarding" as never)} /></View></ScreenContainer>;
  if (!profile) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 20 }}>{tr("onboarding.loadFailed")}</Text><View style={{ marginTop: 16 }}><SecondaryButton label={tr("onboarding.retry")} onPress={() => void load()} /></View></ScreenContainer>;
  const recommendation = recommendationForGoal(profile.goal);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}><View style={{ flex: 1, justifyContent: "center" }}>{loadRecovered && <Text accessibilityLiveRegion="polite" style={{ color: colors.warning, lineHeight: 20, marginBottom: 12 }}>{tr("onboarding.loadRecovered")}</Text>}<SectionHeader title={tr("onboarding.summaryTitle")} subtitle={tr("onboarding.summarySubtitle")} /><Card><Pill label={tr("onboarding.summaryPill")} active /><Text style={{ marginTop: 16, color: colors.foreground, fontSize: 24, fontWeight: "800" }}>{tr("onboarding.summaryHeading")}</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>{tr("onboarding.summaryBody")}</Text><View style={{ marginTop: 20, gap: 10 }}><View style={{ padding: 14, borderRadius: 14, backgroundColor: colors.primary + "12" }}><Text style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>{tr("onboarding.startingLevel")}</Text><Text style={{ marginTop: 4, color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{learnerLevelLabel(profile.level)}</Text></View><View style={{ padding: 14, borderRadius: 14, backgroundColor: colors.primary + "12" }}><Text style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>{tr("onboarding.todayGoal")}</Text><Text style={{ marginTop: 4, color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{learnerGoalLabel(profile.goal)}</Text></View></View><View style={{ marginTop: 18 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{recommendation.title}</Text><Text style={{ marginTop: 5, color: colors.muted, lineHeight: 20 }}>{recommendation.body}</Text></View><View style={{ marginTop: 18 }}><PrimaryButton label={recommendation.label} onPress={() => router.replace(firstActionForGoal(profile.goal) as never)} /></View><View style={{ marginTop: 10 }}><SecondaryButton label={tr("onboarding.changeChoices")} onPress={() => router.replace("/onboarding" as never)} /></View></Card></View></ScrollView></ScreenContainer>;
}
