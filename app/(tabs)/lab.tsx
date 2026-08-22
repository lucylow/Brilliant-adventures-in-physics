import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SectionHeader, SecondaryButton } from "@/components/physica-ui";
import { PHYSICS, projectile, sampleProjectile } from "@/lib/physics";
import { useColors } from "@/hooks/use-colors";
import { recordLabCompletion } from "@/lib/progress-store";
import { ProjectileVisual } from "@/components/projectile-visual";
import { SimulationPlayhead, VectorGrowth } from "@/components/motion-primitives";
import { loadPreferencesWithStatus, type Preferences } from "@/lib/preferences";
import { triggerHaptic } from "@/lib/haptics";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  const colors = useColors();
  const nudge = (delta: number) => onChange(Math.max(min, Math.min(max, Number((value + delta).toFixed(2)))));
  return <View style={{ marginBottom: 16 }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ color: colors.foreground, fontWeight: "700" }}>{label}</Text><Text style={{ color: colors.primary, fontWeight: "800" }}>{value} </Text></View><View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}><Pressable accessibilityLabel={`Decrease ${label}`} onPress={() => nudge(-step)}><Text style={{ fontSize: 24, color: colors.primary }}>−</Text></Pressable><View style={{ flex: 1, height: 8, borderRadius: 8, backgroundColor: colors.border }}><View style={{ width: `${((value - min) / (max - min)) * 100}%`, height: 8, borderRadius: 8, backgroundColor: colors.primary }} /></View><Pressable accessibilityLabel={`Increase ${label}`} onPress={() => nudge(step)}><Text style={{ fontSize: 24, color: colors.primary }}>+</Text></Pressable></View></View>;
}

export default function LabScreen() {
  const colors = useColors();
  const [speed, setSpeed] = useState(18);
  const [angle, setAngle] = useState(42);
  const [running, setRunning] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true });
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [completionSaving, setCompletionSaving] = useState(false);
  useEffect(() => { let active = true; void loadPreferencesWithStatus().then((result) => { if (active) setPreferences(result.preferences); }).catch(() => undefined); return () => { active = false; }; }, []);
  const result = useMemo(() => projectile({ speed, angleDeg: angle, height: 0 }), [speed, angle]);
  const points = useMemo(() => sampleProjectile({ speed, angleDeg: angle, height: 0 }, 10), [speed, angle]);
  return <ScreenContainer className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Physics Lab" subtitle="Manipulate a model and inspect verified values." /><Card><ProjectileVisual points={points} peakHeight={result.peakHeight} running={running} vectors={[{ x: 0, y: 0, dx: result.horizontalSpeed, dy: result.verticalSpeed, label: "v₀" }, { x: 0, y: result.peakHeight * 0.45, dx: 0, dy: -PHYSICS.g, label: "g" }]} /><View style={{ marginTop: 12 }}><SimulationPlayhead progress={running ? 0.55 : 1} preferences={preferences} /></View><View style={{ marginTop: 16, flexDirection: "row", gap: 24 }}><VectorGrowth magnitude={Math.min(1, result.horizontalSpeed / 32)} preferences={preferences} label="vₓ" /><VectorGrowth magnitude={Math.min(1, Math.abs(result.verticalSpeed) / 32)} preferences={preferences} label="vᵧ" /></View><View style={{ marginTop: 18 }}><Slider label="Launch speed (m/s)" value={speed} min={4} max={32} step={2} onChange={setSpeed} /><Slider label="Launch angle (°)" value={angle} min={10} max={80} step={2} onChange={setAngle} /></View><View style={{ flexDirection: "row", gap: 8 }}><View style={{ flex: 1 }}><PrimaryButton label={running ? "Pause" : "Play"} onPress={() => { setRunning((value) => !value); void triggerHaptic("tap", preferences.hapticsEnabled); }} /></View><View style={{ flex: 1 }}><SecondaryButton label="Reset" onPress={() => { setSpeed(18); setAngle(42); setRunning(false); }} /></View></View></Card><Card style={{ marginTop: 14 }}><Text style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>DETERMINISTIC ENGINE · VERIFIED</Text><View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}><View><Text style={{ color: colors.muted }}>Flight time</Text><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{result.flightTime.toFixed(2)} s</Text></View><View><Text style={{ color: colors.muted }}>Range</Text><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{result.range.toFixed(2)} m</Text></View><View><Text style={{ color: colors.muted }}>Peak</Text><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{result.peakHeight.toFixed(2)} m</Text></View></View><View style={{ marginTop: 16 }}><PrimaryButton label={completionSaving ? "Saving…" : "Mark lab complete"} disabled={completionSaving} onPress={() => { if (completionSaving) return; setCompletionSaving(true); void persistSafely(recordLabCompletion()).then((saved) => { setPersistenceMessage(persistenceRecoveryMessage(saved)); if (saved.ok) void triggerHaptic("success", preferences.hapticsEnabled); }).finally(() => setCompletionSaving(false)); }} /></View>{persistenceMessage && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 10, color: colors.warning }}>{persistenceMessage}</Text>}</Card></ScrollView></ScreenContainer>;
}
