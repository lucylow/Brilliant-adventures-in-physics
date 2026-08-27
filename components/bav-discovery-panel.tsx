import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";
import { Card, ProgressBar, SecondaryButton } from "@/components/physica-ui";
import { MotionPressable, RevealBlock } from "@/components/motion-primitives";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { BAV_FALLBACK_QUESTS, BAV_PILLARS, bavQuestProgress, type BAVPillar, type BAVQuest, type BAVRoute } from "@/lib/bav";
import type { LearningState } from "@/lib/progress-store";

const PILLAR_STYLE: Record<BAVPillar, { accent: string; icon: "build" | "explore" | "visibility"; number: string }> = {
  build: { accent: "#19A896", icon: "build", number: "01" },
  adventure: { accent: "#E59A3A", icon: "explore", number: "02" },
  visualize: { accent: "#7C83F5", icon: "visibility", number: "03" },
};

function pillarTitleKey(pillar: BAVPillar) {
  return pillar === "build" ? "home.bavBuild" : pillar === "adventure" ? "home.bavAdventure" : "home.bavVisualize";
}

function pillarDetailKey(pillar: BAVPillar) {
  return pillar === "build" ? "home.bavBuildDetail" : pillar === "adventure" ? "home.bavAdventureDetail" : "home.bavVisualizeDetail";
}

function pillarMetaKey(pillar: BAVPillar) {
  return pillar === "build" ? "home.bavBuildMeta" : pillar === "adventure" ? "home.bavAdventureMeta" : "home.bavVisualizeMeta";
}

function questTitleKey(quest: BAVQuest) {
  return quest.id === "first-observation" ? "home.bavQuestFirst" : quest.id === "evidence-builder" ? "home.bavQuestEvidence" : "home.bavQuestCosmic";
}

export function BAVPillarMark({ pillar, size = 38 }: { pillar: BAVPillar; size?: number }) {
  const colors = useColors();
  const treatment = PILLAR_STYLE[pillar];
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: "center", justifyContent: "center", backgroundColor: treatment.accent + "20", borderWidth: 1, borderColor: treatment.accent + "55" }}
    >
      <MaterialIcons name={treatment.icon} size={Math.round(size * 0.5)} color={treatment.accent} />
      <View style={{ position: "absolute", right: -4, bottom: -4, minWidth: 18, height: 18, paddingHorizontal: 3, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: colors.foreground }}>
        <Text style={{ color: colors.background, fontSize: 9, fontWeight: "900" }}>{treatment.number}</Text>
      </View>
    </View>
  );
}

export function BAVDiscoveryPanel({ onPillarPress, learning, onQuestPress, reducedMotion = false }: { onPillarPress: (route: BAVRoute) => void; learning?: LearningState; onQuestPress?: (quest: BAVQuest) => void; reducedMotion?: boolean }) {
  const colors = useColors();
  const { tr } = useAppTranslations();
  return (
    <Card accessibilityLabel={tr("home.bavTitle")} style={{ padding: 0, overflow: "hidden", borderColor: colors.primary + "45" }}>
      <View style={{ padding: 16, backgroundColor: colors.primary + "0D", borderBottomWidth: 1, borderBottomColor: colors.primary + "20" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.foreground }}>
            <Text style={{ color: colors.background, fontSize: 13, fontWeight: "900", letterSpacing: 1 }}>B·A·V</Text>
            <View style={{ width: 24, height: 2, marginTop: 4, borderRadius: 2, backgroundColor: colors.primary }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "900", letterSpacing: 0.2 }}>{tr("home.bavTitle")}</Text>
            <Text style={{ marginTop: 3, color: colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1 }}>{tr("home.bavTagline")}</Text>
          </View>
          <View style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.success + "18" }}>
            <Text style={{ color: colors.success, fontSize: 10, fontWeight: "900", letterSpacing: 0.6 }}>{tr("home.bavLocalBadge")}</Text>
          </View>
        </View>
        <Text style={{ marginTop: 14, color: colors.muted, lineHeight: 20 }}>{tr("home.bavSubtitle")}</Text>
        <Text style={{ marginTop: 6, color: colors.foreground, fontWeight: "800" }}>{tr("home.bavPrompt")}</Text>
      </View>
      <View style={{ padding: 12, gap: 10 }}>
        {BAV_PILLARS.map((pillar) => {
          const treatment = PILLAR_STYLE[pillar.id];
          const title = tr(pillarTitleKey(pillar.id));
          const detail = tr(pillarDetailKey(pillar.id));
          return (
            <MotionPressable
              key={pillar.id}
              accessibilityRole="button"
              accessibilityLabel={`${title}. ${detail}`}
              onPress={() => onPillarPress(pillar.route)}
              reducedMotion={reducedMotion}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 72, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: treatment.accent + "45", backgroundColor: treatment.accent + "0B", opacity: pressed ? 0.76 : 1 })}
            >
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <BAVPillarMark pillar={pillar.id} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: treatment.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1 }}>{tr(pillarMetaKey(pillar.id))}</Text>
                  <Text style={{ marginTop: 3, color: colors.foreground, fontSize: 17, fontWeight: "900" }}>{title}</Text>
                  <Text style={{ marginTop: 3, color: colors.muted, lineHeight: 18 }}>{detail}</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={22} color={treatment.accent} />
              </View>
            </MotionPressable>
          );
        })}
      </View>
      {learning && <View style={{ paddingHorizontal: 16, paddingTop: 15, paddingBottom: 4, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "900" }}>{tr("home.bavQuestTitle")}</Text>
            <Text style={{ marginTop: 3, color: colors.muted, lineHeight: 18 }}>{tr("home.bavQuestSubtitle")}</Text>
          </View>
          <View style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.warning + "18" }}>
            <Text style={{ color: colors.warning, fontSize: 10, fontWeight: "900", letterSpacing: 0.6 }}>{tr("home.bavQuestBadge")}</Text>
          </View>
        </View>
        <View style={{ gap: 12, marginTop: 12 }}>
          {BAV_FALLBACK_QUESTS.map((quest) => {
            const progress = bavQuestProgress(quest, learning);
            const completedActions = Math.min(quest.requiredActions, Math.floor(progress * quest.requiredActions));
            const completed = progress >= 1;
            return <View key={quest.id} accessibilityLabel={tr("home.bavQuestAccessibility", { title: tr(questTitleKey(quest)), done: completedActions, goal: quest.requiredActions, xp: quest.rewardXp, status: completed ? tr("home.bavQuestCompleted") : tr("home.bavQuestInProgress") })}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <MaterialIcons name={completed ? "check-circle" : "radio-button-unchecked"} size={20} color={completed ? colors.success : colors.muted} />
                <Text style={{ flex: 1, color: completed ? colors.success : colors.foreground, fontWeight: "800" }}>{tr(questTitleKey(quest))}</Text>
                <Text style={{ color: completed ? colors.success : colors.warning, fontSize: 12, fontWeight: "900" }}>+{quest.rewardXp} XP</Text>
              </View>
              <Text style={{ marginTop: 3, marginLeft: 30, color: completed ? colors.success : colors.muted, fontSize: 12, fontWeight: completed ? "800" : "400" }}>{completed ? tr("home.bavQuestCompleted") : tr("home.bavQuestProgress", { done: completedActions, goal: quest.requiredActions })}</Text>
              {completed && <RevealBlock index={1} preferences={{ reducedMotion }}><View accessibilityLabel={tr("home.bavQuestRewardAccessibility", { xp: quest.rewardXp })} style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, marginLeft: 30, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.success + "18", borderWidth: 1, borderColor: colors.success + "40" }}><MaterialIcons name="workspace-premium" size={15} color={colors.success} /><Text style={{ color: colors.success, fontSize: 11, fontWeight: "900" }}>{tr("home.bavQuestRewardUnlocked", { xp: quest.rewardXp })}</Text></View></RevealBlock>}
              <View style={{ marginTop: 5 }}><ProgressBar value={progress} /></View>
            </View>;
          })}
        </View>
        {onQuestPress && <View style={{ marginTop: 12 }}><SecondaryButton label={BAV_FALLBACK_QUESTS.every((quest) => bavQuestProgress(quest, learning) >= 1) ? tr("home.bavQuestReplay") : tr("home.bavQuestAction")} onPress={() => onQuestPress(BAV_FALLBACK_QUESTS.find((quest) => bavQuestProgress(quest, learning) < 1) ?? BAV_FALLBACK_QUESTS[0])} /></View>}
      </View>}
      <Text accessibilityLiveRegion="polite" style={{ paddingHorizontal: 16, paddingBottom: 15, color: colors.muted, fontSize: 12, lineHeight: 18 }}>{tr("home.bavFallback")}</Text>
    </Card>
  );
}
