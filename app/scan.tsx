import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BavButton, BavSectionHeader, BodySmall } from "@/components/bav";
import { InlineError } from "@/components/states";
import { ScanCaptureFrame, ScanReviewCard } from "@/components/scan/ScanCapture";
import { safeProjectile } from "@/lib/physics-validation";
import { scanScreenModel } from "@/lib/mock/ai/ai-screen-adapters";
import { buildScanViewModel } from "@/lib/view-models/practice";
import { canUseCamera, takePhoto } from "@/lib/media-adapters";
import { layout, spacing } from "@/lib/design-system";

export default function ScanProblemScreen() {
  const demoScan = scanScreenModel();
  const [step, setStep] = useState<"capture" | "review">("capture");
  const [capturing, setCapturing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [question, setQuestion] = useState(demoScan?.scan.detectedText ?? "A ball is launched at 18 m/s at 42° from level ground. Find its range.");
  const [speed, setSpeed] = useState("18");
  const [angle, setAngle] = useState("42");
  const [solved, setSolved] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const numericSpeed = Number(speed.replace(",", "."));
  const numericAngle = Number(angle.replace(",", "."));
  const inputValid = Number.isFinite(numericSpeed) && numericSpeed > 0 && Number.isFinite(numericAngle) && numericAngle > 0 && numericAngle < 90;
  const computed = inputValid ? safeProjectile({ speed: numericSpeed, angleDeg: numericAngle, height: 0 }) : null;
  const model = buildScanViewModel({ prompt: question, speed, angle, solved });
  const capture = () => {
    if (capturing) return;
    setCapturing(true);
    const finish = () => {
      setCapturing(false);
      setStep("review");
      setSolved(false);
    };
    if (!canUseCamera()) {
      finish();
      return;
    }
    void takePhoto()
      .then(() => finish())
      .catch(() => finish());
  };
  const solve = () => {
    if (model.confidence === "low" && !confirmed) {
      setValidationMessage("Low-confidence extraction needs a confirmation tap before the engine runs.");
      setConfirmed(true);
      return;
    }
    if (!inputValid || !computed || !computed.ok) {
      setSolved(false);
      setValidationMessage(computed && !computed.ok ? computed.error.userMessage : "Enter a speed greater than 0 and an angle between 0° and 90°.");
      return;
    }
    setValidationMessage(null);
    setSolved(true);
  };
  const result = computed?.ok ? computed.data : null;
  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32, gap: spacing.md }} keyboardShouldPersistTaps="handled">
        <BavSectionHeader title="Scan Problem" subtitle="Capture, review values, then solve with the verified engine." />
        {step === "capture" ? (
          <ScanCaptureFrame onCapture={capture} capturing={capturing} />
        ) : (
          <ScanReviewCard
            model={model}
            onPromptChange={(value) => { setQuestion(value); setSolved(false); }}
            onSpeedChange={(value) => { setSpeed(value); setValidationMessage(null); setSolved(false); }}
            onAngleChange={(value) => { setAngle(value); setValidationMessage(null); setSolved(false); }}
            onSolve={solve}
            solvedBody={solved && result ? `${result.range.toFixed(2)} m range · flight time ${result.flightTime.toFixed(2)} s · peak ${result.peakHeight.toFixed(2)} m` : undefined}
          />
        )}
        {demoScan ? <BodySmall tone="secondary">{demoScan.demoLabel}</BodySmall> : null}
        {validationMessage ? <InlineError message={validationMessage} /> : null}
        {solved ? (
          <View style={{ gap: 8 }}>
            <BavButton label="Practice a similar problem" onPress={() => router.push("/practice" as never)} />
            <BavButton label="Ask Bavi to explain" variant="secondary" onPress={() => router.push("/tutor" as never)} />
          </View>
        ) : null}
        {step === "review" ? <BavButton label="Recapture" variant="ghost" onPress={() => setStep("capture")} /> : null}
        <BavButton label="Back to tutor" variant="secondary" onPress={() => router.push("/tutor" as never)} />
        <View style={{ height: layout.sectionGap }} />
      </ScrollView>
    </ScreenContainer>
  );
}
