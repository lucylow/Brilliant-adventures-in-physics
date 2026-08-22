import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Keyboard, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { kinematics } from "@/lib/physics";
import { deleteExperiment, loadExperiments, saveExperiment, type SavedExperiment } from "@/lib/experiments";
import { deleteDraft } from "@/lib/progress-store";
import { useColors } from "@/hooks/use-colors";
import { DraftRecovery } from "@/components/draft-recovery";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { DraftStatus } from "@/components/draft-status";

export default function PhysicsLensScreen() {
  const colors = useColors();
  const [times, setTimes] = useState(["0", "1", "2", "3", "4"]);
  const [distances, setDistances] = useState(["0", "1.2", "4.5", "9.4", "16.1"]);
  const [analyzed, setAnalyzed] = useState(false);
  const [saved, setSaved] = useState<SavedExperiment[]>([]);
  const values = useMemo(() => times.map((time, index) => ({ time: Number(time) || 0, distance: Number(distances[index]) || 0 })), [times, distances]);
  const draftStatus = useDraftAutosave("lens", { times, distances });
  const last = values[values.length - 1];
  const estimatedVelocity = last && last.time > 0 ? last.distance / last.time : 0;
  const estimatedAcceleration = last && last.time > 0 ? 2 * last.distance / (last.time ** 2) : 0;
  useEffect(() => { void loadExperiments().then(setSaved); }, []);
  const analyze = () => { Keyboard.dismiss(); setAnalyzed(true); };
  const save = async () => { const item = await saveExperiment({ title: "Rolling object experiment", points: values, summary: `${estimatedVelocity.toFixed(2)} m/s average velocity; ${estimatedAcceleration.toFixed(2)} m/s² estimated acceleration.` }); setSaved((current) => [item, ...current]); await deleteDraft("lens"); };
  const remove = async (id: string) => { await deleteExperiment(id); setSaved((current) => current.filter((item) => item.id !== id)); };
  return <ScreenContainer className="p-5"><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Physics Lens" subtitle="Turn safe observations into a small, structured experiment." /><DraftRecovery id="lens" onResume={(saved) => { const nextTimes = saved.data.times; const nextDistances = saved.data.distances; if (Array.isArray(nextTimes)) setTimes(nextTimes.filter((value): value is string => typeof value === "string")); if (Array.isArray(nextDistances)) setDistances(nextDistances.filter((value): value is string => typeof value === "string")); }} /><DraftStatus status={draftStatus} /><Card><Pill label="MANUAL MEASUREMENTS" active /><Text style={{ marginTop: 12, color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Rolling object: distance over time</Text><Text style={{ marginTop: 6, color: colors.muted, lineHeight: 20 }}>Use a clear tabletop or floor, keep hands and devices away from hazards, and enter measurements manually.</Text><View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}><Text style={{ flex: 1, color: colors.muted, fontWeight: "800" }}>Time · s</Text><Text style={{ flex: 1, color: colors.muted, fontWeight: "800" }}>Distance · m</Text></View>{values.map((row, index) => <View key={index} style={{ flexDirection: "row", gap: 8, marginTop: 8 }}><TextInput accessibilityLabel={`Time measurement ${index + 1} in seconds`} value={times[index]} onChangeText={(value) => setTimes((current) => current.map((item, i) => i === index ? value : item))} keyboardType="decimal-pad" style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground }} /><TextInput accessibilityLabel={`Distance measurement ${index + 1} in meters`} value={distances[index]} onChangeText={(value) => setDistances((current) => current.map((item, i) => i === index ? value : item))} keyboardType="decimal-pad" style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground }} /></View>)}<View style={{ marginTop: 16 }}><PrimaryButton label="Analyze measurements" onPress={analyze} /></View><View style={{ marginTop: 10 }}><SecondaryButton label="Ask Tutor about this experiment" onPress={() => router.push("/tutor" as never)} /></View>{analyzed && <View style={{ marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: colors.success + "14" }}><Text style={{ color: colors.success, fontWeight: "800" }}>Deterministic analysis complete</Text><Text style={{ marginTop: 6, color: colors.foreground }}>Average velocity: {estimatedVelocity.toFixed(2)} m/s</Text><Text style={{ marginTop: 4, color: colors.foreground }}>Estimated acceleration: {estimatedAcceleration.toFixed(2)} m/s²</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 20 }}>This estimate assumes the object started from rest.</Text><View style={{ marginTop: 12 }}><PrimaryButton label="Save experiment" onPress={save} /></View></View>}</Card><View style={{ marginTop: 22 }}><SectionHeader title="Saved experiments" subtitle="Stored locally on this device." />{saved.length === 0 ? <Card><Text style={{ color: colors.muted }}>No saved experiments yet.</Text></Card> : saved.slice(0, 5).map((item) => <Card key={item.id} style={{ marginBottom: 10 }}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{item.title}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{item.summary}</Text></View><SecondaryButton label="Delete" onPress={() => void remove(item.id)} /></View></Card>)}</View></ScrollView></ScreenContainer>;
}
