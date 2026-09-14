import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout";
import { BavButton, BavLoadingState, Body, Heading2 } from "@/components/bav";
import { BavCard } from "@/components/bav/BavCard";
import { ContinueAdventureCard, DailyChallengeCard, HomeHeader, HomeLists, HomeMetrics, QuickActionGrid } from "@/components/home/HomeDashboard";
import { BAVDiscoveryPanel } from "@/components/bav-discovery-panel";
import { HomePremiumCta } from "@/components/monetization";
import { RevealBlock } from "@/components/motion-primitives";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { loadLearningState, type LearningState } from "@/lib/progress-store";
import { loadPreferences, type Preferences } from "@/lib/preferences";
import { loadOnboarding, type OnboardingProfile } from "@/lib/onboarding";
import { buildHomeViewModel } from "@/lib/view-models/home";
import { homeRecommendationModel } from "@/lib/mock/ai/ai-screen-adapters";
import { screenStatusFromFlags } from "@/lib/screen-recovery";

export default function HomeScreen() {
  const { tr } = useAppTranslations();
  const network = useNetworkStatus();
  const [learning, setLearning] = useState<LearningState>({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
  const [onboarding, setOnboarding] = useState<OnboardingProfile>({ completed: true, level: "school", goal: "understand", step: 2 });
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadDashboard = () => {
    setLoadFailed(false);
    setLoading(true);
    let active = true;
    void Promise.all([loadLearningState(), loadPreferences(), loadOnboarding()])
      .then(([nextLearning, nextPreferences, profile]) => {
        if (!active) return;
        setLearning(nextLearning);
        setPreferences(nextPreferences);
        setOnboarding(profile);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadFailed(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  };
  useEffect(() => loadDashboard(), []);
  const status = screenStatusFromFlags({ loading, error: loadFailed, empty: false, offline: network.status === "offline" });
  const model = buildHomeViewModel({
    learning,
    onboarding,
    streakEnabled: preferences.streakEnabled,
    locale: preferences.locale,
    status: loadFailed ? "error" : loading ? "loading" : status === "offline" ? "offline" : undefined,
  });

  if (status === "loading" || loading) {
    return (
      <ScrollScreen>
        <BavLoadingState title="Preparing your lab bench" body="Loading local progress and today’s path." />
      </ScrollScreen>
    );
  }
  if (status === "offline") {
    return (
      <ScrollScreen>
        <OfflineState onRetry={loadDashboard} />
      </ScrollScreen>
    );
  }
  if (status === "error" || loadFailed) {
    return (
      <ScrollScreen>
        <ErrorState title={tr("home.learningRecovered")} onRetry={loadDashboard} />
      </ScrollScreen>
    );
  }

  return (
    <ScrollScreen>
      <RevealBlock index={0} preferences={preferences}>
        <HomeHeader model={model} onProfile={() => router.push("/profile" as never)} />
      </RevealBlock>
      {homeRecommendationModel() && (
        <RevealBlock index={0} preferences={preferences}>
          <BavCard>
            <Heading2>{homeRecommendationModel()?.demoLabel}</Heading2>
            <Body tone="secondary" style={{ marginTop: 6 }}>{homeRecommendationModel()?.ranked.learnerSummary}</Body>
            <Body style={{ marginTop: 8 }}>{homeRecommendationModel()?.ranked.items[0]?.reason}</Body>
          </BavCard>
        </RevealBlock>
      )}
      {!onboarding.completed ? (
        <RevealBlock index={1} preferences={preferences}>
          <BavCard>
            <Heading2>{tr("home.setupPath")}</Heading2>
            <Body tone="secondary" style={{ marginTop: 6 }}>{tr("home.setupBody")}</Body>
            <View style={{ marginTop: 14 }}>
              <BavButton label={tr("home.personalize")} onPress={() => router.push("/onboarding" as never)} />
            </View>
          </BavCard>
        </RevealBlock>
      ) : null}
      <RevealBlock index={2} preferences={preferences}>
        <HomeMetrics model={model} reducedMotion={preferences.reducedMotion} />
      </RevealBlock>
      {model.continueAdventure ? (
        <RevealBlock index={3} preferences={preferences}>
          <ContinueAdventureCard model={model.continueAdventure} reducedMotion={preferences.reducedMotion} hapticsEnabled={preferences.hapticsEnabled} />
        </RevealBlock>
      ) : (
        <EmptyState title="No adventure in progress" body="Start a lesson to open your first scientific chapter." action={<BavButton label={tr("home.startPractice")} onPress={() => router.push("/lesson" as never)} />} />
      )}
      <RevealBlock index={4} preferences={preferences}>
        <QuickActionGrid actions={model.quickActions} reducedMotion={preferences.reducedMotion} />
      </RevealBlock>
      {model.dailyChallenge ? (
        <RevealBlock index={5} preferences={preferences}>
          <DailyChallengeCard model={model.dailyChallenge} reducedMotion={preferences.reducedMotion} />
        </RevealBlock>
      ) : null}
      <RevealBlock index={6} preferences={preferences}>
        <HomeLists model={model} />
      </RevealBlock>
      <RevealBlock index={7} preferences={preferences}>
        <HomePremiumCta onPress={() => router.push({ pathname: "/paywall", params: { from: "/", variant: "home_discovery" } } as never)} />
      </RevealBlock>
      <RevealBlock index={8} preferences={preferences}>
        <BAVDiscoveryPanel>
          reducedMotion={preferences.reducedMotion}
          learning={learning}
          onPillarPress={(route) => router.push(route as never)}
          onQuestPress={(quest) => {
            if (quest.id === "cosmic-visualizer") router.push("/astronomy" as never);
            else router.push({ pathname: "/practice", params: { concept: quest.topic } } as never);
          }}
        />
      </RevealBlock>
      <BavCard onPress={() => router.push("/notebook" as never)} accessibilityLabel={tr("home.notebook")}>
        <Heading2>{tr("home.notebook")}</Heading2>
        <Body tone="secondary">{tr("home.notebookBody")}</Body>
      </BavCard>
    </ScrollScreen>
  );
}
