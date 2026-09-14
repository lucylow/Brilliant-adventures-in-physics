import { View } from "react-native";
import { router } from "expo-router";
import { BavBadge, BavButton, BavCard, BavProgressBar, Body, BodySmall, Caption, Heading3 } from "@/components/bav";
import { BavXpBadge } from "@/components/bav/BavProgress";
import { spacing } from "@/lib/design-system";
import type { AdventureChapterCard, AdventureMissionCard, AdventureViewModel } from "@/lib/view-models/adventure";

export function AdventureJourney({ model }: { model: AdventureViewModel }) {
  if (model.status === "empty" || model.chapters.length === 0) {
    return (
      <BavCard>
        <Heading3>No adventures unlocked</Heading3>
        <BodySmall tone="secondary">Complete a lesson to open the first mission path.</BodySmall>
      </BavCard>
    );
  }
  return (
    <View style={{ gap: spacing.md }}>
      {model.activeMission ? <MissionDetailCard mission={model.activeMission} /> : null}
      {model.chapters.map((chapter) => (
        <ChapterCard key={chapter.id} chapter={chapter} />
      ))}
    </View>
  );
}

function ChapterCard({ chapter }: { chapter: AdventureChapterCard }) {
  return (
    <BavCard elevation={chapter.unlocked ? "soft" : "border"} accessibilityLabel={`${chapter.title}${chapter.unlocked ? "" : ", locked"}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Heading3>{chapter.title}</Heading3>
        <BavBadge label={chapter.unlocked ? "Open" : "Locked"} tone={chapter.unlocked ? "info" : "neutral"} />
      </View>
      <BodySmall tone="secondary" style={{ marginTop: 6 }}>{chapter.description}</BodySmall>
      <View style={{ marginTop: spacing.sm, gap: 8 }}>
        {chapter.missions.map((mission) => (
          <View key={mission.id}>
            <Caption>{mission.title}</Caption>
            <View style={{ marginTop: 6 }}>
              <BavProgressBar value={mission.progress} accessibilityLabel={`${mission.title} ${Math.round(mission.progress * 100)} percent`} />
            </View>
          </View>
        ))}
      </View>
    </BavCard>
  );
}

export function MissionDetailCard({ mission }: { mission: AdventureMissionCard }) {
  return (
    <BavCard elevation="featured" accessibilityLabel={`Mission ${mission.title}`}>
      <Caption style={{ color: "#FFFFFF" }}>Current mission</Caption>
      <Heading3 style={{ color: "#FFFFFF", marginTop: 6 }}>{mission.title}</Heading3>
      <BodySmall style={{ color: "#FFFFFF", marginTop: 8 }}>{mission.story}</BodySmall>
      <Body style={{ color: "#FFFFFF", marginTop: 10 }}>{mission.objective}</Body>
      <Caption style={{ color: "#FFFFFF", marginTop: 8 }}>Concepts · {mission.concepts.join(", ")}</Caption>
      <View style={{ marginTop: 12 }}>
        <BavXpBadge xp={mission.rewardXp} />
      </View>
      <View style={{ marginTop: 14 }}>
        <BavButton
          label={mission.locked ? "Locked" : "Continue mission"}
          variant="secondary"
          disabled={mission.locked}
          onPress={() => router.push(mission.route as never)}
        />
      </View>
    </BavCard>
  );
}
