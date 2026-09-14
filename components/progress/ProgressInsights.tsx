import { View } from "react-native";
import { BavCard, BavProgressBar, BavSectionHeader, Body, Caption, Heading3, Metric } from "@/components/bav";
import type { ProgressViewModel } from "@/lib/view-models/progress";
import { useColors } from "@/hooks/use-colors";

export function ProgressInsights({ model, reducedMotion }: { model: ProgressViewModel; reducedMotion: boolean }) {
  const colors = useColors();
  const maxMinutes = Math.max(1, ...model.weekly.map((point) => point.minutes));
  return (
    <View style={{ gap: 16 }}>
      <View>
        <BavSectionHeader title="Topic mastery" />
        {model.topics.length === 0 ? (
          <BavCard>
            <Heading3>No mastery rows yet</Heading3>
            <Body tone="secondary">Complete a practice item to light the first topic.</Body>
          </BavCard>
        ) : (
          <View style={{ gap: 12 }}>
            {model.topics.map((topic) => (
              <BavCard key={topic.id} elevation="border">
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Heading3>{topic.name}</Heading3>
                  <Caption>{Math.round(topic.percent * 100)}%</Caption>
                </View>
                <View style={{ marginTop: 8 }}>
                  <BavProgressBar value={topic.percent} color={topic.color} reducedMotion={reducedMotion} accessibilityLabel={`${topic.name} mastery ${Math.round(topic.percent * 100)} percent`} />
                </View>
              </BavCard>
            ))}
          </View>
        )}
      </View>
      <View>
        <BavSectionHeader title="This week" subtitle="Minutes of local study" />
        <BavCard>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", minHeight: 88 }}>
            {model.weekly.map((point, index) => (
              <View key={`${point.day}-${index}`} style={{ alignItems: "center", flex: 1, gap: 6 }}>
                <View
                  accessibilityLabel={`${point.day}: ${point.minutes} minutes, ${point.problems} problems`}
                  style={{
                    width: 10,
                    height: Math.max(8, (point.minutes / maxMinutes) * 72),
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                />
                <Caption tone="muted">{point.day}</Caption>
              </View>
            ))}
          </View>
        </BavCard>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <BavCard style={{ flex: 1 }}><Caption tone="muted">Strongest</Caption><Heading3>{model.strongest}</Heading3></BavCard>
        <BavCard style={{ flex: 1 }}><Caption tone="muted">Needs review</Caption><Heading3>{model.needsReview}</Heading3></BavCard>
      </View>
      <BavCard>
        <Caption tone="muted">Recent improvement</Caption>
        <Body>{model.recentImprovement}</Body>
      </BavCard>
      <View>
        <BavSectionHeader title="Achievements" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {model.achievements.map((achievement) => (
            <BavCard key={achievement.id} style={{ width: "47%", opacity: achievement.state === "locked" ? 0.55 : 1 }}>
              <Metric>{achievement.state === "earned" ? "✓" : achievement.state === "in-progress" ? "…" : "○"}</Metric>
              <Heading3>{achievement.name}</Heading3>
              <Caption tone="muted">{achievement.description}</Caption>
            </BavCard>
          ))}
        </View>
      </View>
    </View>
  );
}
