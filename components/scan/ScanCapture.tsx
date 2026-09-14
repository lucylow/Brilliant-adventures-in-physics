import { View } from "react-native";
import { BavBadge, BavButton, BavCard, BavNumberInput, BavTextField, Body, BodySmall, Caption, Heading3 } from "@/components/bav";
import { GridMotif } from "@/components/scientific/ScientificMotifs";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import type { ScanConfidence, ScanViewModel } from "@/lib/view-models/practice";

export function ScanCaptureFrame({
  onCapture,
  capturing = false,
}: {
  onCapture: () => void;
  capturing?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: spacing.md }}>
      <View
        accessible
        accessibilityLabel="Camera viewport for scanning a physics problem"
        style={{
          height: 240,
          borderRadius: radius.xl,
          overflow: "hidden",
          backgroundColor: colors.simulationBackground,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GridMotif color={colors.simulationGrid} width={280} height={180} />
        <View style={{ position: "absolute", left: 18, top: 18, width: 28, height: 28, borderLeftWidth: 3, borderTopWidth: 3, borderColor: colors.onPrimary }} />
        <View style={{ position: "absolute", right: 18, top: 18, width: 28, height: 28, borderRightWidth: 3, borderTopWidth: 3, borderColor: colors.onPrimary }} />
        <View style={{ position: "absolute", left: 18, bottom: 18, width: 28, height: 28, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: colors.onPrimary }} />
        <View style={{ position: "absolute", right: 18, bottom: 18, width: 28, height: 28, borderRightWidth: 3, borderBottomWidth: 3, borderColor: colors.onPrimary }} />
      </View>
      <BavButton label={capturing ? "Capturing…" : "Capture problem"} loading={capturing} onPress={onCapture} accessibilityHint="Takes a photo if the camera is available, otherwise opens review" />
    </View>
  );
}

export function ScanConfidenceBadge({ confidence }: { confidence: ScanConfidence }) {
  const tone = confidence === "high" ? "success" : confidence === "medium" ? "warning" : "danger";
  const label = confidence === "high" ? "High confidence" : confidence === "medium" ? "Medium confidence" : "Low confidence — confirm values";
  return <BavBadge label={label} tone={tone} />;
}

export function ScanReviewCard({
  model,
  onPromptChange,
  onSpeedChange,
  onAngleChange,
  onSolve,
  solvedBody,
}: {
  model: ScanViewModel;
  onPromptChange: (value: string) => void;
  onSpeedChange: (value: string) => void;
  onAngleChange: (value: string) => void;
  onSolve: () => void;
  solvedBody?: string;
}) {
  const colors = useColors();
  return (
    <BavCard elevation="soft">
      <Caption tone="muted">Detected Problem</Caption>
      <View style={{ marginTop: spacing.sm }}>
        <BavTextField value={model.prompt} onChangeText={onPromptChange} accessibilityLabel="Detected physics problem" multiline />
      </View>
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <Heading3>Detected values</Heading3>
        <BavNumberInput value={model.values[0]?.value ?? ""} unit={model.values[0]?.unit ?? "m/s"} onChangeText={onSpeedChange} accessibilityLabel="Detected launch speed" />
        <BavNumberInput value={model.values[1]?.value ?? ""} unit={model.values[1]?.unit ?? "°"} onChangeText={onAngleChange} accessibilityLabel="Detected launch angle" />
      </View>
      <View style={{ marginTop: spacing.md }}>
        <ScanConfidenceBadge confidence={model.confidence} />
        {model.confidence === "low" ? (
          <BodySmall tone="secondary" style={{ marginTop: 8 }}>Confirm the numbers before solving. Low-confidence extraction is never treated as verified physics.</BodySmall>
        ) : null}
      </View>
      <View style={{ marginTop: spacing.md }}>
        <BavButton label="Solve with verified engine" onPress={onSolve} />
      </View>
      {solvedBody ? (
        <View style={{ marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: withAlpha(colors.success, 0.12) }}>
          <Caption tone="success">Verified result</Caption>
          <Body style={{ marginTop: 6 }}>{solvedBody}</Body>
        </View>
      ) : null}
    </BavCard>
  );
}
