import { View } from "react-native";
import { router } from "expo-router";
import { BavAvatar, BavMetricCard, BavProgressBar, BavSectionHeader, Body, BodySmall, Caption, Heading1, Heading3, Overline } from "@/components/bav";
import { BavCard } from "@/components/bav/BavCard";
import { BavButton } from "@/components/bav/BavButton";
import { BavIcon } from "@/components/bav/BavIcon";
import { BavListItem } from "@/components/bav/BavChrome";
import { OrbitMotif } from "@/components/scientific/ScientificMotifs";
import { MotionPressable } from "@/components/motion-primitives";
import { useColors } from "@/hooks/use-colors";
import { heroShadow, layout, opacity, quickActionTints, radius, withAlpha } from "@/lib/design-system";
import type { HomeQuickAction, HomeViewModel } from "@/lib/view-models/home";
import { triggerHaptic } from "@/lib/haptics";

export function HomeHeader({
  model,
  onProfile,
}: {
  model: HomeViewModel;
  onProfile: () => void;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Caption tone="muted">{model.dateLabel}</Caption>
        <Heading1>
          {model.salutation}, {model.displayName} ✦
        </Heading1>
      </View>
      <BavAvatar initials={model.initials} onPress={onProfile} accessibilityLabel="Open profile" />
    </View>
  );
}

export function HomeMetrics({ model, reducedMotion }: { model: HomeViewModel; reducedMotion: boolean }) {
  return (
    <View style={{ flexDirection: "row", gap: layout.metricGap }}>
      <BavMetricCard icon="streak" value={String(model.streakDays)} label="Day streak" reducedMotion={reducedMotion} />
      <BavMetricCard icon="xp" value={model.xp.toLocaleString()} label={`XP · Level ${model.level}`} reducedMotion={reducedMotion} />
      <BavMetricCard icon="mastery" value={`${Math.round(model.mastery * 100)}%`} label="Mastery" progress={model.mastery} reducedMotion={reducedMotion} />
    </View>
  );
}

export function ContinueAdventureCard({
  model,
  reducedMotion,
  hapticsEnabled,
}: {
  model: NonNullable<HomeViewModel["continueAdventure"]>;
  reducedMotion: boolean;
  hapticsEnabled: boolean;
}) {
  const colors = useColors();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`Continue adventure: ${model.title}, ${Math.round(model.progress * 100)} percent complete`}
      accessibilityHint="Opens the current lesson or lab"
      reducedMotion={reducedMotion}
      onPress={() => {
        void triggerHaptic("tap", hapticsEnabled && !reducedMotion);
        router.push(model.route as never);
      }}
      style={({ pressed }) => ({
        borderRadius: radius.xl,
        overflow: "hidden",
        backgroundColor: colors.primary,
        padding: 20,
        minHeight: layout.heroMinHeight,
        opacity: pressed ? opacity.pressed : 1,
        ...heroShadow(),
      })}
    >
      <View style={{ position: "absolute", right: -12, top: -18, opacity: 0.35 }} pointerEvents="none">
        <OrbitMotif color={colors.onPrimary} size={160} />
      </View>
      <Overline style={{ color: withAlpha(colors.onPrimary, 0.86), letterSpacing: 1.1 }}>CONTINUE ADVENTURE</Overline>
      <Heading1 style={{ color: colors.onPrimary, marginTop: 8 }}>{model.title}</Heading1>
      <BodySmall style={{ color: withAlpha(colors.onPrimary, 0.9), marginTop: 6 }}>{model.chapter}</BodySmall>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Caption style={{ color: withAlpha(colors.onPrimary, 0.86), marginBottom: 8 }}>Progress {Math.round(model.progress * 100)}%</Caption>
          <BavProgressBar value={model.progress} color={colors.onPrimary} reducedMotion={reducedMotion} />
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: withAlpha(colors.onPrimary, 0.18), alignItems: "center", justifyContent: "center" }}>
          <BavIcon name="arrow" color={colors.onPrimary} />
        </View>
      </View>
    </MotionPressable>
  );
}

export function QuickActionGrid({
  actions,
  reducedMotion,
}: {
  actions: HomeQuickAction[];
  reducedMotion: boolean;
}) {
  return (
    <View>
      <BavSectionHeader title="Quick Actions" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", margin: -6 }}>
        {actions.map((action) => {
          const tint = quickActionTints[action.id];
          return (
            <View key={action.id} style={{ width: "50%", padding: 6 }}>
              <BavCard
                elevation="soft"
                reducedMotion={reducedMotion}
                onPress={() => router.push(action.route as never)}
                accessibilityLabel={`${action.title}. ${action.subtitle}`}
                style={{ backgroundColor: tint.background, minHeight: 112, borderColor: withAlpha("#000000", 0.06) }}
              >
                <BavIcon name={action.id === "tutor" ? "tutor" : action.id === "scan" ? "camera" : action.id === "lens" ? "lens" : "simulation"} color={tint.accent} size="lg" />
                <Heading3 style={{ marginTop: 10 }}>{action.title}</Heading3>
                <BodySmall tone="secondary">{action.subtitle}</BodySmall>
              </BavCard>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function DailyChallengeCard({
  model,
  reducedMotion,
}: {
  model: NonNullable<HomeViewModel["dailyChallenge"]>;
  reducedMotion: boolean;
}) {
  return (
    <View>
      <BavSectionHeader title="Daily Challenge" />
      <BavCard elevation="soft" reducedMotion={reducedMotion}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <BavIcon name="challenge" size="sm" />
            <Caption tone="muted">Today · {model.minutes} min</Caption>
          </View>
          <Caption tone="info">+{model.xp} XP</Caption>
        </View>
        <Body style={{ marginTop: 12 }}>{model.prompt}</Body>
        <BodySmall tone="secondary" style={{ marginTop: 8 }}>{model.topic}</BodySmall>
        <View style={{ marginTop: 14, alignSelf: "flex-start" }}>
          <BavButton label="Accept Challenge →" size="sm" onPress={() => router.push({ pathname: "/practice", params: {} })} reducedMotion={reducedMotion} />
        </View>
      </BavCard>
    </View>
  );
}

export function HomeLists({ model }: { model: HomeViewModel }) {
  return (
    <View style={{ gap: layout.sectionGap }}>
      <View>
        <BavSectionHeader title="Recent Activity" action={model.recentActivity.length ? "View all" : undefined} onAction={() => router.push("/progress" as never)} />
        {model.recentActivity.length === 0 ? (
          <BavCard>
            <Heading3>No activity yet</Heading3>
            <BodySmall tone="secondary">A lesson, tutor session, simulation, or problem will appear here.</BodySmall>
          </BavCard>
        ) : (
          <View style={{ gap: 10 }}>
            {model.recentActivity.map((item) => (
              <BavListItem key={item.id} title={item.title} subtitle={item.subtitle} onPress={() => router.push(item.route as never)} />
            ))}
          </View>
        )}
      </View>
      <View>
        <BavSectionHeader title="Recommended for you" />
        {model.recommendations.length === 0 ? (
          <BavCard>
            <Heading3>Recommendations unlock with a first attempt</Heading3>
            <BodySmall tone="secondary">Personalize your path or complete one practice question.</BodySmall>
          </BavCard>
        ) : (
          <View style={{ gap: 10 }}>
            {model.recommendations.map((item) => (
              <BavListItem key={item.id} icon="hint" title={item.title} subtitle={item.subtitle} onPress={() => router.push(item.route as never)} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
