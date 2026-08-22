import { useEffect, type ReactNode } from "react";
import { Pressable, Text, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { motion, motionDuration, progressPercent, type MotionPrefs } from "@/lib/motion";

export function MotionPressable({ children, reducedMotion = false, style, ...props }: Omit<PressableProps, "children"> & { children: ReactNode; reducedMotion?: boolean; style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Pressable {...props} onPressIn={(event) => { scale.value = withTiming(reducedMotion ? 1 : 0.97, { duration: motionDuration(100, { reducedMotion }) }); props.onPressIn?.(event); }} onPressOut={(event) => { scale.value = withTiming(1, { duration: motionDuration(motion.fast, { reducedMotion }) }); props.onPressOut?.(event); }} style={style}><Animated.View style={animatedStyle}>{children}</Animated.View></Pressable>;
}

export function AnimatedProgress({ value, preferences }: { value: number; preferences: Pick<MotionPrefs, "reducedMotion"> }) {
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(Math.max(0, Math.min(1, value)), { duration: motionDuration(360, preferences) }); }, [preferences, value, progress]);
  const style = useAnimatedStyle(() => ({ width: progressPercent(progress.value) }));
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 1, now: Math.max(0, Math.min(1, value)) }} style={{ height: 8, borderRadius: 8, backgroundColor: "#E5E7EB", overflow: "hidden" }}><Animated.View style={[{ height: 8, borderRadius: 8, backgroundColor: "#0A7EA4" }, style]} /></View>;
}

export function SimulationPlayhead({ progress, preferences }: { progress: number; preferences: Pick<MotionPrefs, "reducedMotion"> }) {
  const value = useSharedValue(0);
  useEffect(() => { value.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: motionDuration(120, preferences) }); }, [preferences, progress, value]);
  const style = useAnimatedStyle(() => ({ width: progressPercent(value.value) }));
  return <View accessibilityLabel={`Simulation progress ${Math.round(Math.max(0, Math.min(1, progress)) * 100)} percent`} style={{ height: 4, backgroundColor: "#CBD5E1", borderRadius: 4, overflow: "hidden" }}><Animated.View style={[{ height: 4, backgroundColor: "#60A5FA", borderRadius: 4 }, style]} /></View>;
}

export function VectorGrowth({ magnitude, preferences, label = "Vector" }: { magnitude: number; preferences: Pick<MotionPrefs, "reducedMotion">; label?: string }) {
  const scale = useSharedValue(0);
  useEffect(() => { scale.value = withSpring(Math.max(0, Math.min(1, magnitude)), preferences.reducedMotion ? { duration: 0 } : motion.spring); }, [magnitude, preferences.reducedMotion, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.value }] }));
  return <View accessible accessibilityLabel={`${label}, magnitude ${magnitude.toFixed(2)}`} style={{ width: 100, height: 6, justifyContent: "center" }}><Animated.View style={[{ width: 100, height: 6, borderRadius: 6, backgroundColor: "#F59E0B", transformOrigin: "left center" }, style]} /><Text style={{ position: "absolute", top: 8, fontSize: 11, color: "#687076" }}>{label}</Text></View>;
}
