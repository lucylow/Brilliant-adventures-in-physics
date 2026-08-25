import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useEffect, type ReactNode } from "react";

export type PhysicsVector = { id: string; label: string; x: number; y: number; color?: string };

export function PhysicsGrid({ width, height, spacing = 32, children }: { width: number; height: number; spacing?: number; children?: ReactNode }) {
  const columns = Math.floor(width / spacing) + 1;
  const rows = Math.floor(height / spacing) + 1;
  return <View pointerEvents="none" accessible={false} style={{ width, height, position: "relative", overflow: "hidden" }}>
    {Array.from({ length: columns }, (_, index) => <View key={`x-${index}`} style={{ position: "absolute", left: index * spacing, top: 0, bottom: 0, borderLeftWidth: 1, borderColor: "#CBD5E155" }} />)}
    {Array.from({ length: rows }, (_, index) => <View key={`y-${index}`} style={{ position: "absolute", top: index * spacing, left: 0, right: 0, borderTopWidth: 1, borderColor: "#CBD5E155" }} />)}
    {children}
  </View>;
}

export function AnimatedVector({ origin, vector, color = "#0A7EA4", reducedMotion = false }: { origin: { x: number; y: number }; vector: { x: number; y: number }; color?: string; reducedMotion?: boolean }) {
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const length = Math.hypot(vector.x, vector.y);
  const angle = Math.atan2(-vector.y, vector.x);
  useEffect(() => { progress.value = reducedMotion ? 1 : withTiming(1, { duration: 280 }); }, [progress, reducedMotion, vector.x, vector.y]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle}rad` }, { scaleX: progress.value }] }));
  return <Animated.View accessibilityRole="image" accessibilityLabel={`Vector ${Math.round(length)} units`} style={[{ position: "absolute", left: origin.x, top: origin.y, width: length, height: 3, backgroundColor: color, transformOrigin: "left center" }, animatedStyle]} />;
}

export function FreeBodyDiagram({ forces, reducedMotion = false }: { forces: PhysicsVector[]; reducedMotion?: boolean }) {
  const center = 110;
  const maxMagnitude = Math.max(1, ...forces.map((force) => Math.hypot(force.x, force.y)));
  return <View accessible accessibilityRole="image" accessibilityLabel={`Free-body diagram with ${forces.length} force vectors`} style={{ width: 220, height: 220, alignSelf: "center" }}>
    <PhysicsGrid width={220} height={220} spacing={22}>
      <View style={{ position: "absolute", left: center - 14, top: center - 14, width: 28, height: 28, borderRadius: 14, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#111827", fontWeight: "900" }}>m</Text></View>
      {forces.map((force) => { const scale = 75 / maxMagnitude; return <AnimatedVector key={force.id} origin={{ x: center, y: center }} vector={{ x: force.x * scale, y: force.y * scale }} color={force.color} reducedMotion={reducedMotion} />; })}
      {forces.map((force) => <Text key={`${force.id}-label`} style={{ position: "absolute", left: center + force.x * 28 / maxMagnitude - 18, top: center - force.y * 28 / maxMagnitude - 22, color: force.color ?? "#0A7EA4", fontSize: 12, fontWeight: "800" }}>{force.label}</Text>)}
    </PhysicsGrid>
  </View>;
}

export function RelativityMeter({ fraction, reducedMotion = false }: { fraction: number; reducedMotion?: boolean }) {
  const value = Math.max(0, Math.min(0.999, fraction));
  const progress = useSharedValue(reducedMotion ? value : 0);
  useEffect(() => { progress.value = reducedMotion ? value : withSpring(value, { damping: 18, stiffness: 160 }); }, [progress, reducedMotion, value]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return <View accessibilityRole="progressbar" accessibilityLabel={`Speed is ${Math.round(value * 100)} percent of the speed of light`} accessibilityValue={{ min: 0, max: 1, now: value }} style={{ height: 10, borderRadius: 10, backgroundColor: "#CBD5E1", overflow: "hidden" }}><Animated.View style={[{ height: 10, borderRadius: 10, backgroundColor: "#7C3AED" }, animatedStyle]} /></View>;
}
