import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { ChatScreenShell } from "@/components/layout";
import { Card, HintPanel, SolutionStep } from "@/components/physica-ui";
import { BavButton, BavEquationCard } from "@/components/bav";
import { TutorHeader, TutorInputBar, TutorPromptRow, TutorThread } from "@/components/tutor/TutorChrome";
import { createAppTutorService, requestTutorAnswerWithFallback } from "@/lib/tutor-service";
import { getActiveTutorSessions } from "@/lib/mock/adapters/catalog";
import { isMockModeEnabled } from "@/lib/mock/config";
import { tutorScreenModel } from "@/lib/mock/ai/ai-screen-adapters";
import { consumeTutorUse, loadUsageWithStatus, remainingTutorUses, type UsageState } from "@/lib/usage-meter";
import { useUsageLimits } from "@/hooks/use-monetization";
import { projectile } from "@/lib/physics";
import { useColors } from "@/hooks/use-colors";
import { DraftRecovery } from "@/components/draft-recovery";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { DraftStatus } from "@/components/draft-status";
import { deleteDraft } from "@/lib/progress-store";
import { normalizeServiceError, type ServiceError } from "@/lib/service-result";
import { recoveryMessage } from "@/lib/network";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { buildTutorViewModel } from "@/lib/view-models/tutor";
import type { TutorAnswer } from "@/lib/ai";
import { layout, spacing } from "@/lib/design-system";

type Message = { role: "assistant" | "user"; text: string };

export default function TutorScreen() {
  const colors = useColors();
  const { locale, tr, announce } = useAppTranslations();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (isMockModeEnabled()) {
      const session = getActiveTutorSessions()[0];
      if (session?.messages.length) return session.messages.map((message) => ({ role: message.role, text: message.text }));
    }
    return [{ role: "assistant", text: "I’m PhysicaAI. Give me a physics question and I’ll help you reason through it." }];
  });
  const [hint, setHint] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState<ServiceError | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState<TutorAnswer | null>(null);
  const tutorService = createAppTutorService();
  const demoTutor = tutorScreenModel();
  const [usage, setUsage] = useState<UsageState>({ date: "", tutorUsed: 0, tutorLimit: 5 });
  const [usageMessageKey, setUsageMessageKey] = useState<"tutor.usageRecovered" | "tutor.usageUnavailable" | null>(null);
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    void loadUsageWithStatus()
      .then((result) => {
        if (!active) return;
        setUsage(result.usage);
        setUsageMessageKey(result.recovered ? "tutor.usageRecovered" : null);
      })
      .catch(() => {
        if (active) setUsageMessageKey("tutor.usageUnavailable");
      });
    return () => {
      active = false;
    };
  }, [locale]);
  const remaining = remainingTutorUses(usage);
  const usageLimits = useUsageLimits();
  const aiOpen = usageLimits.ai.isUnlimited || remaining > 0;
  const checkingAnnouncement = announce("tutor.checking", "polite");
  const usageMessage = usageMessageKey ? tr(usageMessageKey) : null;
  const usageAnnouncement = usageMessage ? { message: usageMessage, accessibilityLiveRegion: "polite" as const } : null;
  const draftStatus = useDraftAutosave("tutor", { question: draft });
  const send = async (text = draft) => {
    const clean = text.trim();
    Keyboard.dismiss();
    if (!clean || remaining <= 0 || submitting) return;
    setSubmitting(true);
    setServiceError(null);
    setUsedLocalFallback(false);
    setLastQuestion(clean);
    setLastAnswer(null);
    try {
      const response = await requestTutorAnswerWithFallback(tutorService, { question: clean });
      if (!mountedRef.current) return;
      if (!response.ok) {
        setServiceError(response.error);
        setUsedLocalFallback(false);
        return;
      }
      if (response.usedFallback) {
        setUsageMessageKey(null);
        setUsedLocalFallback(true);
      } else {
        const nextUsage = await consumeTutorUse();
        if (!mountedRef.current) return;
        setUsage(nextUsage);
      }
      setLastAnswer(response.data.verifiedValues.length ? response.data : null);
      setMessages((current) => [...current, { role: "user", text: clean }, { role: "assistant", text: response.data.summary }]);
      setDraft("");
      setHint(0);
      void deleteDraft("tutor").catch(() => undefined);
    } catch (error) {
      if (mountedRef.current) setServiceError(normalizeServiceError(error));
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };
  const showVerifiedExample = async () => {
    if (remaining <= 0 || submitting) return;
    setSubmitting(true);
    setServiceError(null);
    setUsedLocalFallback(false);
    try {
      const nextUsage = await consumeTutorUse();
      if (!mountedRef.current) return;
      setUsage(nextUsage);
      const result = projectile({ speed: 18, angleDeg: 42, height: 0 });
      const verified: TutorAnswer = {
        summary: `For a launch at 18 m/s and 42°, the deterministic engine verifies a range of ${result.range.toFixed(2)} m.`,
        concept: "projectile-motion",
        steps: [{ label: "Resolve velocity", detail: "Split into independent axes." }],
        equations: ["R = v² sin(2θ) / g"],
        verifiedValues: [{ name: "range", value: Number(result.range.toFixed(2)), unit: "m" }],
        hint: "Keep g = 9.81 m/s² and θ in degrees converted to radians only inside the trig function.",
        nextAction: "Try a matching practice item.",
        confidence: 1,
      };
      setLastAnswer(verified);
      setMessages((current) => [...current, { role: "user", text: "Show me a verified projectile example" }, { role: "assistant", text: verified.summary }]);
      void deleteDraft("tutor").catch(() => undefined);
    } catch (error) {
      if (mountedRef.current) setServiceError(normalizeServiceError(error));
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };
  const model = useMemo(
    () =>
      buildTutorViewModel({
        remaining,
        limit: usage.tutorLimit,
        draft,
        submitting,
        error: serviceError ? recoveryMessage(serviceError) : null,
        messages,
        lastAnswer,
      }),
    [draft, lastAnswer, messages, remaining, serviceError, submitting, usage.tutorLimit],
  );
  const prompts = [
    ...(demoTutor?.starters.slice(0, 2) ?? []),
    tr("tutor.conceptChip"),
    tr("tutor.verifiedChip"),
  ];
  return (
    <ChatScreenShell
      header={
        <View>
          <TutorHeader subtitle={tr("tutor.subtitle")} remaining={remaining} limit={usage.tutorLimit} />
          <View style={{ paddingHorizontal: layout.screenPadding }}>
            <DraftRecovery id="tutor" onResume={(saved) => { const value = typeof saved.data.question === "string" ? saved.data.question : ""; setDraft(value); }} />
            <DraftStatus status={draftStatus} />
            {demoTutor ? <Text accessibilityLiveRegion="polite" style={{ color: colors.primary, marginBottom: 8, lineHeight: 20 }}>{tr("tutor.demoAi")}</Text> : null}
            {usedLocalFallback ? <Text accessibilityLiveRegion="polite" style={{ color: colors.primary, marginBottom: 8, lineHeight: 20 }}>{tr("tutor.localFallback")}</Text> : null}
            {usageAnnouncement ? <Text accessibilityLiveRegion={usageAnnouncement.accessibilityLiveRegion} style={{ color: colors.warning, marginBottom: 8 }}>{usageAnnouncement.message}</Text> : null}
            {!aiOpen ? (
              <Pressable accessibilityRole="button" onPress={() => router.push("/upgrade" as never)}>
                <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 8 }}>{tr("tutor.plusPrompt")}</Text>
              </Pressable>
            ) : null}
            {submitting ? <Text accessibilityLiveRegion={checkingAnnouncement.accessibilityLiveRegion} style={{ color: colors.primary, marginBottom: 8 }}>{checkingAnnouncement.message}</Text> : null}
            {serviceError ? (
              <Card style={{ marginBottom: 12, padding: 12 }}>
                <Text accessibilityLiveRegion="assertive" style={{ color: colors.error, fontWeight: "800" }}>{recoveryMessage(serviceError)}</Text>
                {serviceError.retryable && lastQuestion ? <BavButton label={tr("common.tryAgain")} variant="secondary" onPress={() => void send(lastQuestion)} /> : null}
              </Card>
            ) : null}
          </View>
        </View>
      }
      footer={
        <View style={{ paddingTop: spacing.sm }}>
          <TutorPromptRow
            prompts={prompts}
            disabled={!aiOpen || submitting}
            onPrompt={(prompt) => {
              if (prompt === tr("tutor.verifiedChip")) {
                void showVerifiedExample();
                return;
              }
              if (prompt === tr("tutor.conceptChip")) {
                void send("Why does mass not change acceleration due to gravity?");
                return;
              }
              void send(prompt);
            }}
          />
          <TutorInputBar
            draft={draft}
            onChange={setDraft}
            onSend={() => void send()}
            inputState={aiOpen ? model.inputState : "disabled"}
            placeholder={remaining ? tr("tutor.questionPlaceholder") : tr("tutor.limitReached")}
            sendLabel={submitting ? tr("tutor.checkingShort") : tr("common.send")}
            questionLabel={tr("tutor.questionLabel")}
          />
          <View style={{ paddingHorizontal: layout.screenPadding }}>
            <HintPanel visible={hint > 0} label={hint === 1 ? tr("tutor.hintTarget") : hint === 2 ? tr("tutor.hintEquation") : tr("tutor.hintUnits")} />
          </View>
        </View>
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <TutorThread
          messages={model.messages}
          onOpenSimulation={() => router.push("/play" as never)}
          onOpenPractice={() => router.push("/practice" as never)}
        />
        {messages.length > 1 ? (
          <View style={{ paddingHorizontal: layout.screenPadding, gap: 12 }}>
            <BavEquationCard formula="knowns → principle → verified result" description="Keep the calculation traceable." expandable={false} />
            <SolutionStep number={1} title="Identify the knowns" body="Write every value with a unit before choosing a formula." />
            <SolutionStep number={2} title="Choose the principle" body="Match the target quantity to a supported physics relationship." />
            <BavButton label={hint ? `${tr("tutor.hintChip")} ${hint}` : tr("tutor.hintLadder")} variant="ghost" onPress={() => setHint((value) => Math.min(3, value + 1))} />
          </View>
        ) : null}
      </ScrollView>
    </ChatScreenShell>
  );
}
