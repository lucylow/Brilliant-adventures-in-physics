import { Text, View } from "react-native";
import { mapPointToViewport, visualStateLabel, type VisualPoint, visualTheme } from "@/lib/visuals";

export function ProjectileVisual({ points, peakHeight, running }: { points: VisualPoint[]; peakHeight: number; running: boolean }) {
  const maxX = Math.max(...points.map((point) => point.x), 1);
  const maxY = Math.max(peakHeight, 1);
  return <View accessibilityRole="image" accessibilityLabel={`Projectile trajectory. ${visualStateLabel(running ? "running" : points.length ? "complete" : "empty")}. Peak height ${peakHeight.toFixed(2)} meters.`} style={{ height: 220, borderRadius: 16, backgroundColor: visualTheme.background, padding: 16, justifyContent: "flex-end", overflow: "hidden" }}><View style={{ position: "absolute", left: 16, right: 16, bottom: 24, height: 1, backgroundColor: visualTheme.grid }} /><View style={{ position: "absolute", left: 16, top: 16 }}><Text style={{ color: visualTheme.ink, fontWeight: "700" }}>Projectile trajectory</Text><Text accessibilityLiveRegion="polite" style={{ color: visualTheme.accent, fontSize: 12, marginTop: 4 }}>{visualStateLabel(running ? "running" : points.length ? "complete" : "empty")}</Text></View>{points.map((point, index) => { const position = mapPointToViewport(point, { maxX, maxY, width: 250, height: 150 }); return <View key={`${point.x}-${index}`} style={{ position: "absolute", left: 16 + position.left, bottom: 24 + position.bottom, width: 7, height: 7, borderRadius: 4, backgroundColor: index === points.length - 1 ? visualTheme.warning : visualTheme.accent }} />; })}</View>;
}
