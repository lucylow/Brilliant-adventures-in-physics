import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout";
import { BavAvatar, BavButton, BavListItem, BavMetricCard, BavSectionHeader, Body, Heading1 } from "@/components/bav";
import { loadLearningState, type LearningState } from "@/lib/progress-store";
import { loadPreferences, type Preferences } from "@/lib/preferences";
import { loadOnboarding } from "@/lib/onboarding";
import { buildHomeViewModel } from "@/lib/view-models/home";
import { ErrorState } from "@/components/states";

export default function ProfileScreen() {
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([loadLearningState(), loadPreferences(), loadOnboarding()])
      .then(([nextLearning, nextPreferences, onboarding]) => {
        if (!active) return;
        setLearning(nextLearning);
        setPreferences(nextPreferences);
        setOnboardingComplete(onboarding.completed);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const model = buildHomeViewModel({
    learning,
    onboarding: { completed: onboardingComplete, level: "school", goal: "understand", step: 2 },
    streakEnabled: preferences.streakEnabled,
    locale: preferences.locale,
  });
  if (failed) return <ScrollScreen><ErrorState onRetry={() => router.replace("/profile" as never)} /></ScrollScreen>;
  return (
    <ScrollScreen>
      <View style={{ alignItems: "center", gap: 10 }}>
        <BavAvatar initials={model.initials} size={72} />
        <Heading1>{model.displayName}</Heading1>
        <Body tone="secondary">Level {model.level} · {model.xp.toLocaleString()} XP</Body>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <BavMetricCard icon="streak" value={String(model.streakDays)} label="Streak" />
        <BavMetricCard icon="xp" value={String(model.level)} label="Level" />
        <BavMetricCard icon="mastery" value={`${Math.round(model.mastery * 100)}%`} label="Mastery" progress={model.mastery} />
      </View>
      <BavSectionHeader title="Learning" />
      <View style={{ gap: 10 }}>
        <BavListItem icon="settings" title="Settings" subtitle="Tutor, motion, privacy, and local data" onPress={() => router.push("/settings" as never)} />
        <BavListItem icon="mastery" title="Progress" subtitle="Topic mastery and achievements" onPress={() => router.push("/progress" as never)} />
        <BavListItem icon="hint" title="Learning path" subtitle={onboardingComplete ? "Review your starting choices" : "Set up your path"} onPress={() => router.push("/onboarding" as never)} />
        <BavListItem icon="bookmark" title="Notebook" subtitle="Local reflections" onPress={() => router.push("/notebook" as never)} />
      </View>
      <BavButton label="Privacy and local data" variant="secondary" onPress={() => router.push("/privacy" as never)} />
    </ScrollScreen>
  );
}
