import { useMemo, useState } from "react";
import { Keyboard, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams } from "expo-router";
import { Card, Pill, PrimaryButton, SectionHeader, SecondaryButton } from "@/components/physica-ui";
import { checkNumericAnswer } from "@/lib/physics";
import { useColors } from "@/hooks/use-colors";
import { recordAttempt } from "@/lib/progress-store";
import { DraftRecovery } from "@/components/draft-recovery";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { DraftStatus } from "@/components/draft-status";
import { deleteDraft } from "@/lib/progress-store";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";
import { practiceQuestionIndexForConcept, practiceQuestions } from "@/lib/practice";

export default function PracticeScreen() {
  const colors = useColors();
  const { concept: conceptId } = useLocalSearchParams<{ concept?: string }>();
  const requestedIndex = typeof conceptId === "string" ? practiceQuestionIndexForConcept(conceptId) : null;
  const [index, setIndex] = useState(requestedIndex ?? 0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [hint, setHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const question = practiceQuestions[index % practiceQuestions.length];
  const draftStatus = useDraftAutosave("practice", { index, answer });
  const expected = useMemo(() => question.solve(), [question]);
  const submit = async () => { Keyboard.dismiss(); if (submitting || !answer.trim()) return; setSubmitting(true); setPersistenceMessage(null); const numeric = Number(answer.replace(",", ".")); const isCorrect = checkNumericAnswer(numeric, expected); setFeedback(isCorrect ? "correct" : "incorrect"); const saved = await persistSafely(recordAttempt(isCorrect, question.concept)); const deleted = await persistSafely(deleteDraft("practice")); setPersistenceMessage(persistenceRecoveryMessage(saved) ?? persistenceRecoveryMessage(deleted)); setSubmitting(false); };
  const next = async () => { if (submitting) return; setIndex((value) => value + 1); setAnswer(""); setFeedback(null); setHint(false); const deleted = await persistSafely(deleteDraft("practice")); setPersistenceMessage(persistenceRecoveryMessage(deleted)); };
  return <ScreenContainer className="p-5"><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Practice" subtitle="Short attempts create durable intuition." /><DraftRecovery id="practice" onResume={(saved) => { if (typeof saved.data.answer === "string") setAnswer(saved.data.answer); }} /><DraftStatus status={draftStatus} /><Card><Pill label={question.concept.toUpperCase()} active /><Text style={{ marginTop: 14, fontSize: 21, lineHeight: 29, fontWeight: "800", color: colors.foreground }}>{question.prompt}</Text><Text style={{ marginTop: 12, color: colors.muted }}>Answer in {question.unit}. A small rounding difference is okay.</Text><View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 }}><TextInput accessibilityLabel={`Answer in ${question.unit}`} value={answer} onChangeText={setAnswer} keyboardType="decimal-pad" placeholder="Your answer" placeholderTextColor={colors.muted} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, color: colors.foreground, fontSize: 18 }} /><Text style={{ color: colors.muted, fontWeight: "700" }}>{question.unit}</Text></View><View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}><View style={{ flex: 1 }}><PrimaryButton label={submitting ? "Saving…" : "Check answer"} disabled={submitting} onPress={() => void submit()} /></View><View style={{ flex: 1 }}><SecondaryButton label={hint ? "Hint shown" : "Get hint"} onPress={() => setHint(true)} /></View></View>{hint && <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: colors.primary + "14" }}><Text style={{ color: colors.primary, lineHeight: 20 }}>Hint: identify the equation first, then substitute values while keeping the units visible.</Text></View>}{feedback && <View style={{ marginTop: 16 }}><Text accessibilityLiveRegion="polite" accessibilityRole="text" style={{ color: feedback === "correct" ? colors.success : colors.warning, fontSize: 18, fontWeight: "800" }}>{feedback === "correct" ? "Correct — verified by the engine." : "Not quite. Review the equation and try again."}</Text><Text style={{ marginTop: 5, color: colors.muted }}>Expected value: {expected.toFixed(2)} {question.unit}</Text>{feedback === "correct" && <View style={{ marginTop: 12 }}><PrimaryButton label="Next question" onPress={next} /></View>}</View>}{persistenceMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{persistenceMessage}</Text>}</Card></ScrollView></ScreenContainer>;
}
