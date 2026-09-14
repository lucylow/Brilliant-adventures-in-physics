import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton } from "@/components/physica-ui";
import { BavButton } from "@/components/bav";
import { LessonCheckpoint, LessonEquationBlock, LessonHeader, LessonRelated, WorkedExampleCard } from "@/components/lesson/LessonChrome";
import { hintFor, reflectionPrompt, type HintLevel } from "@/lib/education";
import { getActiveLesson } from "@/lib/mock/adapters/catalog";
import { useColors } from "@/hooks/use-colors";
import { recordLessonCompletion } from "@/lib/progress-store";
import { persistSafely, persistenceRecoveryMessageKey } from "@/lib/persistence";
import { loadPreferencesWithStatus, type Preferences } from "@/lib/preferences";
import { RevealBlock } from "@/components/motion-primitives";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { spacing } from "@/lib/design-system";

export default function LessonScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const localizedPersistenceMessage = (result: Parameters<typeof persistenceRecoveryMessageKey>[0]) => {
    const key = persistenceRecoveryMessageKey(result);
    return key ? tr(key) : null;
  };
  const lesson = getActiveLesson();
  const [hintLevel, setHintLevel] = useState<HintLevel>("concept");
  const [completed, setCompleted] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [completionSaving, setCompletionSaving] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  useEffect(() => {
    let active = true;
    void loadPreferencesWithStatus()
      .then((result) => {
        if (!active) return;
        setPreferences(result.preferences);
        if (result.recovered) setPersistenceMessage(tr("lesson.preferencesUnavailable"));
      })
      .catch(() => {
        if (active) setPersistenceMessage(tr("lesson.preferencesUnavailable"));
      });
    return () => { active = false; };
  }, [tr]);
  const progress = completed ? 1 : hintLevel === "completion" ? 0.8 : hintLevel === "substitution" ? 0.6 : hintLevel === "equation" ? 0.4 : 0.2;
  const openRelated = (id: string) => {
    if (id === "sim") router.push("/play" as never);
    else if (id === "practice") router.push("/practice" as never);
    else router.push("/tutor" as never);
  };
  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32, gap: spacing.md }}>
        <LessonHeader title={lesson.title} meta={`${lesson.durationMin} min · ${lesson.topicId.replace(/-/g, " ")}`} progress={progress} />
        <Card>
          <Pill label={tr("lesson.deterministic")} active />
          {lesson.blocks.map((block, index) => (
            <RevealBlock key={`${block.type}-${index}`} index={index} preferences={preferences}>
              <View style={{ marginTop: 20 }}>
                {block.type === "explain" ? (
                  <>
                    <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{String(block.data.title)}</Text>
                    <Text style={{ marginTop: 6, color: colors.muted, lineHeight: 21 }}>{String(block.data.body)}</Text>
                  </>
                ) : null}
                {block.type === "equation" ? <LessonEquationBlock formula={String(block.data.formula)} caption={String(block.data.caption)} /> : null}
                {block.type === "example" ? <WorkedExampleCard title={String(block.data.title ?? "Worked example")} body={String(block.data.body ?? "")} /> : null}
                {block.type === "simulation" ? <PrimaryButton label={String(block.data.label)} onPress={() => router.push("/lab" as never)} /> : null}
                {block.type === "reflection" ? (
                  <>
                    <Text style={{ color: colors.foreground, fontWeight: "800" }}>{String(block.data.prompt)}</Text>
                    <View style={{ marginTop: 10 }}><SecondaryButton label="Reflect in Tutor" onPress={() => router.push("/tutor" as never)} /></View>
                  </>
                ) : null}
                {block.type === "check" ? <LessonCheckpoint prompt={String(block.data.prompt)} onPractice={() => router.push("/practice" as never)} onSimulate={() => router.push("/play" as never)} /> : null}
              </View>
            </RevealBlock>
          ))}
          <View style={{ marginTop: 24 }}>
            <LessonCheckpoint prompt={hintFor(hintLevel)} onPractice={() => router.push("/practice" as never)} onSimulate={() => router.push({ pathname: "/simulation", params: { id: "sim-projectile" } })} />
          </View>
          <View style={{ marginTop: 18 }}>
            <PrimaryButton
              label={completed ? "Lesson completed" : completionSaving ? "Saving…" : "Mark lesson complete"}
              disabled={completed || completionSaving}
              onPress={() => {
                if (completed || completionSaving) return;
                setCompletionSaving(true);
                void persistSafely(recordLessonCompletion({ contentId: lesson.id, topic: lesson.topicId }))
                  .then((saved) => {
                    if (!mountedRef.current) return;
                    setPersistenceMessage(localizedPersistenceMessage(saved));
                    if (saved.ok) setCompleted(true);
                  })
                  .catch(() => {
                    if (mountedRef.current) setPersistenceMessage(tr("lesson.saveFailed"));
                  })
                  .finally(() => {
                    if (mountedRef.current) setCompletionSaving(false);
                  });
              }}
            />
          </View>
          {persistenceMessage ? <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{persistenceMessage}</Text> : null}
          <Text style={{ marginTop: 14, color: colors.muted, lineHeight: 20 }}>{reflectionPrompt(completed)}</Text>
        </Card>
        <LessonRelated topic={lesson.topicId} onOpen={openRelated} />
        <BavButton label="Show next hint" variant="secondary" onPress={() => setHintLevel(hintLevel === "concept" ? "representation" : hintLevel === "representation" ? "equation" : hintLevel === "equation" ? "substitution" : "completion")} />
      </ScrollView>
    </ScreenContainer>
  );
}
