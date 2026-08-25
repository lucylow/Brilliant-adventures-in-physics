import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, EquationCard, HintPanel, Pill, PrimaryButton, SectionHeader, SolutionStep } from "@/components/physica-ui";
import { createDeterministicTutorService, requestTutorAnswerWithFallback } from "@/lib/tutor-service";
import { consumeTutorUse, loadUsageWithStatus, remainingTutorUses, type UsageState } from "@/lib/usage-meter";
import { projectile } from "@/lib/physics";
import { useColors } from "@/hooks/use-colors";
import { DraftRecovery } from "@/components/draft-recovery";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { DraftStatus } from "@/components/draft-status";
import { deleteDraft } from "@/lib/progress-store";
import { normalizeServiceError, type ServiceError } from "@/lib/service-result";
import { recoveryMessage } from "@/lib/network";
import { createAppTranslations, translate, type SupportedLocale } from "@/lib/locale";
import { useAppTranslations } from "@/hooks/use-app-translations";

type Message = { role: "assistant" | "user"; text: string };

export default function TutorScreen() {
  const colors = useColors();
  const { locale, tr, announce } = useAppTranslations();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "I’m PhysicaAI. Give me a physics question and I’ll help you reason through it." }]);
  const [hint, setHint] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState<ServiceError | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const tutorService = createDeterministicTutorService();
  const [usage, setUsage] = useState<UsageState>({ date: "", tutorUsed: 0, tutorLimit: 5 });
  const [usageMessage, setUsageMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);
  useEffect(() => { let active = true; void loadUsageWithStatus().then((result) => { if (!active) return; setUsage(result.usage); if (result.recovered) setUsageMessage(tr("tutor.usageRecovered")); }).catch(() => { if (active) setUsageMessage(tr("tutor.usageUnavailable")); }); return () => { active = false; }; }, []);
  const remaining = remainingTutorUses(usage);
  const checkingAnnouncement = announce("tutor.checking", "polite");
  const usageAnnouncement = usageMessage ? { message: usageMessage, accessibilityLiveRegion: "polite" as const } : null;
  const draftStatus = useDraftAutosave("tutor", { question: draft });
  const send = async (text = draft) => {
    const clean = text.trim();
    Keyboard.dismiss();
    if (!clean || remaining <= 0 || submitting) return;
    setSubmitting(true);
    setServiceError(null);
    setLastQuestion(clean);
    try {
      const response = await requestTutorAnswerWithFallback(tutorService, { question: clean });
      if (!mountedRef.current) return;
      if (!response.ok) { setServiceError(response.error); return; }
      if (response.usedFallback) {
        setUsageMessage(tr("tutor.localFallback"));
      } else {
        const nextUsage = await consumeTutorUse();
        if (!mountedRef.current) return;
        setUsage(nextUsage);
      }
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
    try {
      const nextUsage = await consumeTutorUse();
      if (!mountedRef.current) return;
      setUsage(nextUsage);
      const result = projectile({ speed: 18, angleDeg: 42, height: 0 });
      setMessages((current) => [...current, { role: "user", text: "Show me a verified projectile example" }, { role: "assistant", text: `For a launch at 18 m/s and 42°, the deterministic engine verifies a range of ${result.range.toFixed(2)} m.` }]);
      void deleteDraft("tutor").catch(() => undefined);
    } catch (error) {
      if (mountedRef.current) setServiceError(normalizeServiceError(error));
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };
  return <ScreenContainer className="p-5"><View style={{ flex: 1 }}><SectionHeader title={tr("tutor.title")} subtitle={tr("tutor.subtitle")} /><DraftRecovery id="tutor" onResume={(saved) => { const value = typeof saved.data.question === "string" ? saved.data.question : ""; setDraft(value); }} /><DraftStatus status={draftStatus} /><Card style={{ marginBottom: 12, padding: 12 }}>{usageAnnouncement && <Text accessibilityLiveRegion={usageAnnouncement.accessibilityLiveRegion} style={{ color: colors.warning, marginBottom: 8 }}>{usageAnnouncement.message}</Text>}<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ color: colors.muted }}>{tr("tutor.remaining") }</Text><Text style={{ color: remaining ? colors.primary : colors.warning, fontWeight: "800" }}>{remaining}/{usage.tutorLimit}</Text></View>{remaining === 0 && <Pressable accessibilityRole="button" onPress={() => router.push("/upgrade" as never)}><Text style={{ color: colors.primary, fontWeight: "800", marginTop: 8 }}>{tr("tutor.plusPrompt") }</Text></Pressable>}{submitting && <Text accessibilityLiveRegion={checkingAnnouncement.accessibilityLiveRegion} style={{ color: colors.primary, marginTop: 8 }}>{checkingAnnouncement.message}</Text>}</Card>{serviceError && <Card style={{ marginBottom: 12, padding: 12 }}><Text accessibilityLiveRegion="assertive" style={{ color: colors.error, fontWeight: "800" }}>{recoveryMessage(serviceError)}</Text>{serviceError.retryable && lastQuestion && <Pressable accessibilityRole="button" onPress={() => void send(lastQuestion)}><Text style={{ color: colors.primary, fontWeight: "800", marginTop: 8 }}>{tr("common.tryAgain")}</Text></Pressable>}</Card>}<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>{messages.map((message, index) => <View key={`${message.role}-${index}`} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%" }}><View style={{ padding: 14, borderRadius: 18, backgroundColor: message.role === "user" ? colors.primary : colors.surface, borderWidth: message.role === "user" ? 0 : 1, borderColor: colors.border }}><Text accessibilityRole="text" style={{ color: message.role === "user" ? "#FFFFFF" : colors.foreground, lineHeight: 22 }}>{message.text}</Text></View></View>)}{messages.length > 1 && <><EquationCard formula="knowns → principle → verified result" caption="Keep the calculation traceable." /><SolutionStep number={1} title="Identify the knowns" body="Write every value with a unit before choosing a formula." /><SolutionStep number={2} title="Choose the principle" body="Match the target quantity to a supported physics relationship." /></>}</ScrollView><Card><Text style={{ color: colors.muted, fontSize: 12 }}>{tr("tutor.focusedPrompt")}</Text><View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}><Pressable onPress={() => void send("Why does mass not change acceleration due to gravity?")}><Pill label={tr("tutor.conceptChip")} /></Pressable><Pressable onPress={() => void showVerifiedExample()}><Pill label={tr("tutor.verifiedChip")} active /></Pressable><Pressable onPress={() => setHint((value) => Math.min(3, value + 1))}><Pill label={hint ? `${tr("tutor.hintChip")} ${hint}` : tr("tutor.hintLadder")} /></Pressable></View><View style={{ flexDirection: "row", gap: 8, marginTop: 12, alignItems: "flex-end" }}><TextInput accessibilityLabel="Physics question" editable={remaining > 0 && !submitting} value={draft} onChangeText={setDraft} onSubmitEditing={() => void send()} returnKeyType="done" multiline placeholder={remaining ? tr("tutor.questionPlaceholder") : tr("tutor.limitReached")} placeholderTextColor={colors.muted} style={{ flex: 1, minHeight: 46, maxHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, color: colors.foreground }} /><View style={{ width: 86 }}><PrimaryButton label={submitting ? tr("tutor.checkingShort") : tr("common.send")} disabled={remaining <= 0 || submitting} onPress={() => void send()} /></View></View><HintPanel visible={hint > 0} label={hint === 1 ? "Name the target quantity." : hint === 2 ? "Write the governing equation." : "Substitute values only after checking units."} /></Card></View></ScreenContainer>;
}
