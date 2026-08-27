import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { hintFor, projectileLesson, reflectionPrompt, type HintLevel } from "@/lib/education";
import { useColors } from "@/hooks/use-colors";
import { recordLessonCompletion } from "@/lib/progress-store";
import { persistSafely, persistenceRecoveryMessageKey } from "@/lib/persistence";
import { loadPreferencesWithStatus, type Preferences } from "@/lib/preferences";
import { RevealBlock } from "@/components/motion-primitives";
import { useAppTranslations } from "@/hooks/use-app-translations";

export default function LessonScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const localizedPersistenceMessage = (result: Parameters<typeof persistenceRecoveryMessageKey>[0]) => { const key = persistenceRecoveryMessageKey(result); return key ? tr(key) : null; };
  const [hintLevel, setHintLevel] = useState<HintLevel>("concept");
  const [completed, setCompleted] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [completionSaving, setCompletionSaving] = useState(false);
  useEffect(() => { let active = true; void loadPreferencesWithStatus().then((result) => { if (active) setPreferences(result.preferences); }).catch(() => undefined); return () => { active = false; }; }, []);
  return <ScreenContainer className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title={projectileLesson.title} subtitle={`${projectileLesson.durationMin} min · Projectile motion`} /><Card><Pill label="LESSON" active />{projectileLesson.blocks.map((block, index) => <RevealBlock key={`${block.type}-${index}`} index={index} preferences={preferences}><View style={{ marginTop: 20 }}>{block.type === "explain" && <><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{String(block.data.title)}</Text><Text style={{ marginTop: 6, color: colors.muted, lineHeight: 21 }}>{String(block.data.body)}</Text></>}{block.type === "equation" && <View style={{ padding: 16, borderRadius: 14, backgroundColor: colors.border + "66" }}><Text style={{ color: colors.foreground, textAlign: "center", fontSize: 22, fontWeight: "800" }}>{String(block.data.formula)}</Text><Text style={{ marginTop: 6, color: colors.muted, textAlign: "center" }}>{String(block.data.caption)}</Text></View>}{block.type === "simulation" && <PrimaryButton label={String(block.data.label)} onPress={() => router.push("/lab" as never)} />}{block.type === "reflection" && <><Text style={{ color: colors.foreground, fontWeight: "800" }}>{String(block.data.prompt)}</Text><View style={{ marginTop: 10 }}><SecondaryButton label="Reflect in Tutor" onPress={() => router.push("/tutor" as never)} /></View></>}{block.type === "check" && <Text style={{ color: colors.foreground }}>{String(block.data.prompt)}</Text>}</View></RevealBlock>)}<View style={{ marginTop: 24, padding: 14, borderRadius: 14, backgroundColor: colors.primary + "12" }}><Text style={{ color: colors.primary, fontWeight: "800" }}>Progressive hint</Text><Text style={{ marginTop: 6, color: colors.foreground, lineHeight: 20 }}>{hintFor(hintLevel)}</Text><View style={{ marginTop: 12 }}><SecondaryButton label={hintLevel === "completion" ? "Hint complete" : "Show next hint"} onPress={() => setHintLevel(hintLevel === "concept" ? "representation" : hintLevel === "representation" ? "equation" : hintLevel === "equation" ? "substitution" : "completion")} /></View></View><View style={{ marginTop: 18 }}><PrimaryButton label={completed ? "Lesson completed" : completionSaving ? "Saving…" : "Mark lesson complete"} disabled={completed || completionSaving} onPress={() => { if (completed || completionSaving) return; setCompletionSaving(true); void persistSafely(recordLessonCompletion({ contentId: "projectile-motion", topic: "projectile-motion" })).then((saved) => { setPersistenceMessage(localizedPersistenceMessage(saved)); if (saved.ok) setCompleted(true); }).finally(() => setCompletionSaving(false)); }} /></View>{persistenceMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{persistenceMessage}</Text>}<Text style={{ marginTop: 14, color: colors.muted, lineHeight: 20 }}>{reflectionPrompt(completed)}</Text></Card></ScrollView></ScreenContainer>;
}
