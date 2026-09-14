import { View } from "react-native";
import { BavBottomSheet } from "@/components/bav/BavFeedback";
import { BavBadge, BavButton, BavCard, BavProgressBar, BavXpBadge, Body, BodySmall, Caption, Heading3 } from "@/components/bav";
import { spacing } from "@/lib/design-system";
import type { PracticeViewModel } from "@/lib/view-models/practice";
import { useColors } from "@/hooks/use-colors";

export function PracticeHeader({ model }: { model: PracticeViewModel }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Caption tone="muted">
          Problem {model.index + 1} of {model.total}
        </Caption>
        <BavBadge label={model.difficulty} tone="info" />
      </View>
      <BavProgressBar
        value={(model.index + 1) / Math.max(1, model.total)}
        accessibilityLabel={`Practice progress, problem ${model.index + 1} of ${model.total}`}
      />
    </View>
  );
}

export function PracticeFeedbackCard({
  model,
  onNext,
  nextLabel,
}: {
  model: PracticeViewModel;
  onNext: () => void;
  nextLabel: string;
}) {
  if (model.feedback === "idle") return null;
  const success = model.feedback === "correct";
  return (
    <BavCard elevation="soft" accessibilityLabel={success ? "Correct answer" : "Needs another try"}>
      <BavBadge label={success ? "Correct" : "Not yet"} tone={success ? "success" : "warning"} />
      <Body style={{ marginTop: spacing.sm }}>{model.explanation}</Body>
      {model.expected ? <BodySmall tone="secondary" style={{ marginTop: 6 }}>Verified: {model.expected}</BodySmall> : null}
      {success ? (
        <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
          <BavXpBadge xp={model.xp} />
          <BavButton label={nextLabel} onPress={onNext} />
        </View>
      ) : (
        <BodySmall tone="secondary" style={{ marginTop: 8 }}>Retry with the same numbers. A unit mix-up is more common than a wrong principle.</BodySmall>
      )}
    </BavCard>
  );
}

export function PracticeHintSheet({
  visible,
  hints,
  revealed,
  onReveal,
  onClose,
  reducedMotion,
}: {
  visible: boolean;
  hints: string[];
  revealed: number;
  onReveal: () => void;
  onClose: () => void;
  reducedMotion?: boolean;
}) {
  const colors = useColors();
  return (
    <BavBottomSheet visible={visible} title="Hints" onClose={onClose} reducedMotion={reducedMotion}>
      <View style={{ gap: 12 }}>
        {hints.map((hint, index) => {
          const open = index < revealed;
          return (
            <View key={hint} style={{ padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
              <Heading3>Hint {index + 1}</Heading3>
              <BodySmall tone="secondary" style={{ marginTop: 6 }}>{open ? hint : "Tap reveal to show this step."}</BodySmall>
            </View>
          );
        })}
        <BavButton
          label={revealed >= hints.length ? "All hints shown" : `Reveal hint ${Math.min(revealed + 1, hints.length)}`}
          variant="secondary"
          disabled={revealed >= hints.length}
          onPress={onReveal}
        />
      </View>
    </BavBottomSheet>
  );
}
