import { View } from "react-native";
import { BavButton, BavCard, BavProgressBar, Body, BodySmall, Caption, Heading3 } from "@/components/bav";
import { BavEquationCard } from "@/components/bav/BavEquationCard";
import { BavRelatedContent } from "@/components/bav/BavTutor";
import { ScientificDiagramForTopic } from "@/components/scientific/ScientificDiagram";
import { spacing } from "@/lib/design-system";

export function LessonHeader({
  title,
  meta,
  progress,
}: {
  title: string;
  meta: string;
  progress: number;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Caption tone="muted">{meta}</Caption>
      <Heading3>{title}</Heading3>
      <BavProgressBar value={progress} accessibilityLabel={`Lesson progress ${Math.round(progress * 100)} percent`} />
    </View>
  );
}

export function LessonCheckpoint({
  prompt,
  onPractice,
  onSimulate,
}: {
  prompt: string;
  onPractice: () => void;
  onSimulate: () => void;
}) {
  return (
    <BavCard elevation="soft" accessibilityLabel="Lesson checkpoint">
      <Caption tone="info">Checkpoint</Caption>
      <Body style={{ marginTop: spacing.sm }}>{prompt}</Body>
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <BavButton label="Try a practice item" onPress={onPractice} />
        <BavButton label="Open matching simulation" variant="secondary" onPress={onSimulate} />
      </View>
    </BavCard>
  );
}

export function LessonEquationBlock({ formula, caption }: { formula: string; caption: string }) {
  return <BavEquationCard formula={formula} description={caption} expandable={false} />;
}

export function LessonRelated({
  topic,
  onOpen,
}: {
  topic: string;
  onOpen: (id: string) => void;
}) {
  return (
    <View style={{ gap: spacing.md }}>
      <ScientificDiagramForTopic topic={topic} title={topic} caption="Scientific motif only — not a measured plot." />
      <BavRelatedContent
        title="Related"
        items={[
          { id: "sim", title: "Matching simulation", subtitle: "Run the verified engine" },
          { id: "practice", title: "Practice this idea", subtitle: "One numeric check" },
          { id: "tutor", title: "Ask Bavi", subtitle: "Explain the same model" },
        ]}
        onOpen={onOpen}
      />
    </View>
  );
}

export function WorkedExampleCard({ title, body }: { title: string; body: string }) {
  return (
    <BavCard elevation="border">
      <Caption tone="muted">Worked example</Caption>
      <Heading3 style={{ marginTop: 6 }}>{title}</Heading3>
      <BodySmall tone="secondary" style={{ marginTop: spacing.sm }}>{body}</BodySmall>
    </BavCard>
  );
}
