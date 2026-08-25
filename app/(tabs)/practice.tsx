import { useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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
import { persistSafely, persistenceRecoveryMessageKey } from "@/lib/persistence";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { practiceQuestionIndexForConcept, practiceQuestions } from "@/lib/practice";
import { saveNotebookEntry } from "@/lib/notebook";
import { createPhysicsPuzzle, getPhysicsHints, puzzleRewardXp, scorePuzzleAnswer, type PuzzleOutcome } from "@/lib/puzzles";
import { loadPuzzleEvidence, missedPuzzleReviewQueue, recordPuzzleEvidence } from "@/lib/puzzle-evidence";

export default function PracticeScreen() {
  const colors = useColors();
  const { tr, announce } = useAppTranslations();
  const { concept: conceptId, review } = useLocalSearchParams<{ concept?: string; review?: string }>();
  const isReviewMode = review === "1";
  const requestedIndex = typeof conceptId === "string" ? practiceQuestionIndexForConcept(conceptId) : null;
  const [index, setIndex] = useState(requestedIndex ?? 0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [hint, setHint] = useState(false);
  const [puzzleOutcome, setPuzzleOutcome] = useState<PuzzleOutcome | null>(null);
  const [puzzleHintsUsed, setPuzzleHintsUsed] = useState(0);
  const [puzzleHintVisible, setPuzzleHintVisible] = useState(false);
  const [puzzlePersistenceMessage, setPuzzlePersistenceMessage] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<Awaited<ReturnType<typeof missedPuzzleReviewQueue>>>([]);
  const [reviewCursor, setReviewCursor] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [notebookMessage, setNotebookMessage] = useState<string | null>(null);
  useEffect(() => { if (!isReviewMode) return; let active = true; void loadPuzzleEvidence().then((entries) => { if (!active) return; const items = missedPuzzleReviewQueue(entries, 3); setReviewItems(items); if (items[0]?.topic) setIndex(practiceQuestionIndexForConcept(items[0].topic) ?? 0); }).catch(() => { if (active) setReviewItems([]); }); return () => { active = false; }; }, [isReviewMode]);
  const question = practiceQuestions[index % practiceQuestions.length];
  const reviewItem = isReviewMode ? reviewItems[reviewCursor] : undefined;
  const draftStatus = useDraftAutosave("practice", { index, answer });
  const expected = useMemo(() => question.solve(), [question]);
  const puzzle = useMemo(() => createPhysicsPuzzle(question.concept, 2, index), [question.concept, index]);
  const puzzleHints = useMemo(() => getPhysicsHints(question.concept), [question.concept]);
  const puzzleAnnouncement = puzzleOutcome ? announce(puzzleOutcome === "correct" ? "practice.puzzleCorrect" : puzzleOutcome === "assisted-correct" ? "practice.puzzleAssisted" : "practice.puzzleIncorrect", puzzleOutcome === "incorrect" ? "assertive" : "polite") : null;
  const answerPuzzle = (choice: string) => { const outcome = scorePuzzleAnswer(puzzle, choice, puzzleHintsUsed); setPuzzleOutcome(outcome); setPuzzlePersistenceMessage(null); void recordPuzzleEvidence({ puzzleId: puzzle.id, topic: question.concept, outcome, hintsUsed: puzzleHintsUsed, xp: puzzleRewardXp(puzzle, outcome) }).catch(() => setPuzzlePersistenceMessage(tr("practice.puzzleSaveFailed"))); };
  const resetPuzzle = () => { setPuzzleOutcome(null); setPuzzleHintsUsed(0); setPuzzleHintVisible(false); setPuzzlePersistenceMessage(null); };
  const feedbackAnnouncement = feedback ? announce(feedback === "correct" ? "practice.correct" : "practice.incorrect", "polite") : null;
  const notebookAnnouncement = notebookMessage ? { message: notebookMessage, accessibilityLiveRegion: "polite" as const } : null;
  const localizedPersistenceMessage = (result: Awaited<ReturnType<typeof persistSafely>>) => { const key = persistenceRecoveryMessageKey(result); return key ? tr(key) : null; };
  const submit = async () => { Keyboard.dismiss(); if (submitting || !answer.trim()) return; setSubmitting(true); setPersistenceMessage(null); const numeric = Number(answer.replace(",", ".")); const isCorrect = checkNumericAnswer(numeric, expected); setFeedback(isCorrect ? "correct" : "incorrect"); const saved = await persistSafely(recordAttempt(isCorrect, question.concept)); const deleted = await persistSafely(deleteDraft("practice")); setPersistenceMessage(localizedPersistenceMessage(saved) ?? localizedPersistenceMessage(deleted)); setSubmitting(false); };
  const saveToNotebook = async () => { const result = await persistSafely(saveNotebookEntry({ title: `${question.concept} practice`, type: "experiment", content: `${question.prompt} Verified answer: ${expected.toFixed(2)} ${question.unit}.`, links: [question.concept] })); setNotebookMessage(result.ok ? tr("practice.savedNotebook") : localizedPersistenceMessage(result)); };
  const next = async () => { if (submitting) return; if (isReviewMode && reviewCursor + 1 < reviewItems.length) { const nextCursor = reviewCursor + 1; setReviewCursor(nextCursor); setIndex(practiceQuestionIndexForConcept(reviewItems[nextCursor].topic ?? "") ?? 0); } else if (!isReviewMode) setIndex((value) => value + 1); setAnswer(""); setFeedback(null); setHint(false); resetPuzzle(); const deleted = await persistSafely(deleteDraft("practice")); setPersistenceMessage(localizedPersistenceMessage(deleted)); };
  return <ScreenContainer className="p-5"><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title={isReviewMode ? tr("practice.reviewMode") : tr("practice.title")} subtitle={isReviewMode && reviewItems.length ? tr("practice.reviewProgress", { current: reviewCursor + 1, total: reviewItems.length }) : tr("practice.subtitle")} /><DraftRecovery id="practice" onResume={(saved) => { if (typeof saved.data.answer === "string") setAnswer(saved.data.answer); }} /><DraftStatus status={draftStatus} /><Card><Pill label={question.concept.toUpperCase()} active /><Text style={{ marginTop: 14, fontSize: 21, lineHeight: 29, fontWeight: "800", color: colors.foreground }}>{question.prompt}</Text><Text style={{ marginTop: 12, color: colors.muted }}>{tr("practice.answerGuidance", { unit: question.unit })}</Text><View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 }}><TextInput accessibilityLabel={`Answer in ${question.unit}`} value={answer} onChangeText={setAnswer} keyboardType="decimal-pad" placeholder={tr("practice.answerPlaceholder")} placeholderTextColor={colors.muted} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, color: colors.foreground, fontSize: 18 }} /><Text style={{ color: colors.muted, fontWeight: "700" }}>{question.unit}</Text></View><View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}><View style={{ flex: 1 }}><PrimaryButton label={submitting ? tr("common.saving") : tr("practice.checkAnswer")} disabled={submitting} onPress={() => void submit()} /></View><View style={{ flex: 1 }}><SecondaryButton label={hint ? tr("practice.hintShown") : tr("practice.getHint")} onPress={() => setHint(true)} /></View></View>{hint && <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: colors.primary + "14" }}><Text style={{ color: colors.primary, lineHeight: 20 }}>{tr("practice.hintBody")}</Text></View>}{feedback && <View style={{ marginTop: 16 }}><Text accessibilityLiveRegion={feedbackAnnouncement?.accessibilityLiveRegion} accessibilityRole="text" style={{ color: feedback === "correct" ? colors.success : colors.warning, fontSize: 18, fontWeight: "800" }}>{feedbackAnnouncement?.message}</Text><Text style={{ marginTop: 5, color: colors.muted }}>{tr("practice.expected", { value: expected.toFixed(2), unit: question.unit })}</Text>{feedback === "correct" && <View style={{ marginTop: 12 }}><PrimaryButton label={isReviewMode && reviewCursor + 1 >= reviewItems.length ? tr("practice.reviewDone") : tr("practice.nextQuestion")} onPress={next} /><View style={{ marginTop: 10 }}><SecondaryButton label={tr("practice.saveNotebook")} onPress={() => void saveToNotebook()} /></View>{notebookAnnouncement && <Text accessibilityLiveRegion={notebookAnnouncement.accessibilityLiveRegion} style={{ marginTop: 8, color: colors.success }}>{notebookAnnouncement.message}</Text>}</View>}</View>}{persistenceMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{persistenceMessage}</Text>}
      <View accessible accessibilityLabel={`${tr("practice.puzzleTitle")}: ${puzzle.question}`} style={{ marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Text style={{ color: colors.primary, fontWeight: "800" }}>{tr("practice.puzzleTitle")}</Text>
        <Text style={{ color: colors.foreground, fontWeight: "700", marginTop: 8, lineHeight: 21 }}>{puzzle.question}</Text>
        <View style={{ gap: 8, marginTop: 12 }}>{puzzle.choices.map((choice) => <Pressable key={choice} accessibilityRole="button" accessibilityState={{ selected: puzzleOutcome !== null && choice === puzzle.correctChoice }} onPress={() => answerPuzzle(choice)} style={({ pressed }) => ({ minHeight: 48, justifyContent: "center", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: choice === puzzle.correctChoice && puzzleOutcome && puzzleOutcome !== "incorrect" ? colors.success : colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.72 : 1 })}><Text style={{ color: colors.foreground, fontWeight: "700" }}>{choice}</Text></Pressable>)}</View>
        <SecondaryButton label={puzzleHintVisible ? tr("practice.puzzleHintShown") : tr("practice.puzzleHint")} onPress={() => { setPuzzleHintVisible(true); setPuzzleHintsUsed((value) => Math.min(value + 1, puzzleHints.length)); }} />
        {puzzleHintVisible && <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>{puzzleHints[Math.min(puzzleHintsUsed - 1, puzzleHints.length - 1)].text}</Text>}
        {puzzleAnnouncement && <Text accessibilityLiveRegion={puzzleAnnouncement.accessibilityLiveRegion} style={{ color: puzzleOutcome === "incorrect" ? colors.warning : colors.success, marginTop: 10, fontWeight: "800" }}>{puzzleAnnouncement.message}</Text>}
        {puzzleOutcome && <Text style={{ color: colors.muted, marginTop: 5 }}>{puzzleOutcome === "incorrect" ? puzzle.explanation : tr("practice.puzzleReward", { xp: puzzleRewardXp(puzzle, puzzleOutcome) })}</Text>}
        {puzzlePersistenceMessage && <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 8 }}>{puzzlePersistenceMessage}</Text>}
        {puzzleOutcome === "incorrect" && <View style={{ marginTop: 8 }}><SecondaryButton label={tr("common.tryAgain")} onPress={resetPuzzle} /></View>}
      </View></Card></ScrollView></ScreenContainer>;
}
