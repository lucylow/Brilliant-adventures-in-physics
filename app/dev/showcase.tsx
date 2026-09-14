import { ScrollView, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BavButton, BavCard, BavChip, BavLoadingState, BavProgressRing, BavSectionHeader, Body, Heading1, Heading3 } from "@/components/bav";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { FIGMA_HOME_FIXTURE } from "@/lib/mock/catalog";
import { isDevelopmentRuntime } from "@/lib/mock/config";
import { router } from "expo-router";

const DESTINATIONS = [
  { label: "Home", route: "/" },
  { label: "Tutor", route: "/tutor" },
  { label: "Scan", route: "/scan" },
  { label: "Lens", route: "/lens" },
  { label: "Build", route: "/lab" },
  { label: "Play", route: "/play" },
  { label: "Simulation", route: "/simulation" },
  { label: "Practice", route: "/practice" },
  { label: "Progress", route: "/progress" },
  { label: "Profile", route: "/profile" },
] as const;

export default function DesignShowcaseScreen() {
  if (!isDevelopmentRuntime()) {
    return (
      <ScreenContainer className="p-5">
        <ErrorState title="Showcase unavailable" body="This gallery is development-only and is not included in production builds." />
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 48, gap: 18 }}>
        <Heading1>B.A.V. design showcase</Heading1>
        <Body tone="secondary">Representative mock data and visual states. Production data contracts are unchanged.</Body>
        <BavCard>
          <Heading3>Figma home fixture</Heading3>
          <Body>{FIGMA_HOME_FIXTURE.displayName} · {FIGMA_HOME_FIXTURE.xp.toLocaleString()} XP · {FIGMA_HOME_FIXTURE.streak}-day streak</Body>
          <View style={{ marginTop: 12, alignItems: "flex-start" }}>
            <BavProgressRing value={FIGMA_HOME_FIXTURE.masteryPercent / 100} />
          </View>
        </BavCard>
        <BavSectionHeader title="Screens" />
        <View style={{ gap: 8 }}>
          {DESTINATIONS.map((item) => (
            <BavButton key={item.route} label={item.label} variant="secondary" onPress={() => router.push(item.route as never)} />
          ))}
        </View>
        <BavSectionHeader title="States" />
        <BavChip label="Default" selected onPress={() => undefined} />
        <BavLoadingState title="Home loading" body="Skeleton for dashboard." />
        <EmptyState title="No Tutor sessions" body="Ask Bavi a physics question to start a conversation." />
        <ErrorState title="Mock AI timeout" body="The explanation could not finish. Your draft is unchanged." />
        <OfflineState />
      </ScrollView>
    </ScreenContainer>
  );
}
