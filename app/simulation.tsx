import { useEffect, useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { BavButton, BavIconButton, BavProgressBar, BavSlider, Caption, Equation, Heading3, Metric } from "@/components/bav";
import { BavCard } from "@/components/bav/BavCard";
import { BavBottomSheet } from "@/components/bav/BavFeedback";
import { BavEquationCard } from "@/components/bav/BavEquationCard";
import { GridMotif } from "@/components/scientific/ScientificMotifs";
import { useColors } from "@/hooks/use-colors";
import { projectile } from "@/lib/physics";
import { buildSimulationViewModel } from "@/lib/view-models/lab";
import { layout, radius, spacing } from "@/lib/design-system";
import { loadPreferences } from "@/lib/preferences";
import { triggerHaptic } from "@/lib/haptics";

export default function SimulationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const model = buildSimulationViewModel(typeof id === "string" ? id : "sim-projectile");
  const [playing, setPlaying] = useState(false);
  const [angle, setAngle] = useState(model.defaults.angleDeg ?? 42);
  const [speed, setSpeed] = useState(model.defaults.speed ?? 18);
  const [time, setTime] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    let active = true;
    void loadPreferences().then((preferences) => {
      if (!active) return;
      setHapticsEnabled(preferences.hapticsEnabled);
      setReducedMotion(preferences.reducedMotion);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => setTime((value) => value + 0.1), 100);
    } else if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);
  const result = useMemo(() => projectile({ speed, angleDeg: angle, height: 0 }), [speed, angle]);
  const t = time % Math.max(result.flightTime, 0.2);
  const vx = speed * Math.cos((angle * Math.PI) / 180);
  const vy = speed * Math.sin((angle * Math.PI) / 180) - 9.81 * t;
  const x = vx * t;
  const y = Math.max(0, speed * Math.sin((angle * Math.PI) / 180) * t - 0.5 * 9.81 * t * t);
  const progress = Math.min(1, t / Math.max(result.flightTime, 0.01));
  return (
    <ScreenContainer edges={["left", "right"]} className="">
      <View style={{ flex: 1, backgroundColor: colors.simulationBackground, paddingTop: Math.max(insets.top, 12) }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: layout.screenPadding }}>
          <BavIconButton icon="arrowBack" tone="inverse" accessibilityLabel="Back" onPress={() => router.back()} />
          <Heading3 style={{ color: colors.onPrimary }}>{model.title}</Heading3>
          <View style={{ flexDirection: "row" }}>
            <BavIconButton icon={favorite ? "favoriteFilled" : "favorite"} tone="inverse" accessibilityLabel="Favorite simulation" onPress={() => setFavorite((value) => !value)} />
            <BavIconButton icon="info" tone="inverse" accessibilityLabel="Simulation information" onPress={() => setInfoOpen(true)} />
          </View>
        </View>
        <View style={{ flex: 1, margin: 16, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.simulationGrid }} accessibilityLabel="Simulation viewport with trajectory on a coordinate grid">
          <GridMotif color={colors.simulationGrid} width={360} height={220} />
          <View style={{ position: "absolute", left: 16 + progress * 220, bottom: 24 + Math.min(y * 8, 140), width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary }} />
          <View style={{ position: "absolute", left: 16, right: 16, bottom: 12 }}>
            <Caption style={{ color: colors.onPrimary }}>t = {t.toFixed(1)} s · v = {Math.sqrt(vx * vx + Math.max(0, vy) * Math.max(0, vy)).toFixed(1)} m/s</Caption>
          </View>
        </View>
      </View>
      <ScrollView style={{ maxHeight: 360, backgroundColor: colors.surface }} contentContainerStyle={{ padding: layout.screenPadding, paddingBottom: Math.max(insets.bottom, 16), gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><BavButton label={playing ? "Pause" : "Play"} icon={playing ? "pause" : "play"} onPress={() => { setPlaying((value) => !value); void triggerHaptic("tap", hapticsEnabled && !reducedMotion); }} /></View>
          <View style={{ flex: 1 }}><BavButton label="Step" variant="secondary" onPress={() => setTime((value) => value + 0.5)} /></View>
          <View style={{ flex: 1 }}><BavButton label="Reset" variant="secondary" onPress={() => { setPlaying(false); setTime(0); }} /></View>
        </View>
        <BavProgressBar value={progress} reducedMotion={reducedMotion} accessibilityLabel="Flight progress" />
        <BavSlider label="Launch angle" value={angle} min={10} max={80} step={1} unit="°" onChange={setAngle} />
        <BavSlider label="Initial speed" value={speed} min={5} max={40} step={1} unit="m/s" onChange={setSpeed} />
        <BavEquationCard formula="x = vₓ t" description="Horizontal motion is uniform. Values update from the deterministic engine." variables={[{ symbol: "vₓ", name: "Horizontal speed", unit: "m/s", value: result.horizontalSpeed.toFixed(2) }]} verified />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <BavCard style={{ flex: 1 }}><Caption tone="muted">Range</Caption><Metric>{result.range.toFixed(1)} m</Metric></BavCard>
          <BavCard style={{ flex: 1 }}><Caption tone="muted">Peak</Caption><Metric>{result.peakHeight.toFixed(1)} m</Metric></BavCard>
          <BavCard style={{ flex: 1 }}><Caption tone="muted">Time</Caption><Metric>{result.flightTime.toFixed(2)} s</Metric></BavCard>
        </View>
        <BavButton label="Try a practice question" variant="secondary" onPress={() => router.push("/practice" as never)} />
      </ScrollView>
      <BavBottomSheet visible={infoOpen} title="What you're exploring" onClose={() => setInfoOpen(false)} reducedMotion={reducedMotion}>
        <Text style={{ color: colors.muted, lineHeight: 21 }}>Projectile motion splits into independent horizontal and vertical parts. Gravity changes only the vertical velocity.</Text>
        <View style={{ marginTop: 12 }}><Equation>y = vᵧ t − ½gt²</Equation></View>
        <Caption tone="secondary" style={{ marginTop: 8 }}>Try this: keep speed fixed and change angle. Range peaks near 45° on level ground.</Caption>
        <Pressable onPress={() => { setInfoOpen(false); router.push("/tutor" as never); }} style={{ marginTop: 16, minHeight: 44 }}><Caption tone="info">Ask Bavi about this model</Caption></Pressable>
      </BavBottomSheet>
    </ScreenContainer>
  );
}
