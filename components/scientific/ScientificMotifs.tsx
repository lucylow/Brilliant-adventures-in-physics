import Svg, { Circle, Line, Path } from "react-native-svg";
import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { withAlpha } from "@/lib/design-system";

export function OrbitMotif({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityElementsHidden>
      <Circle cx="60" cy="60" r="8" fill={color} />
      <Circle cx="60" cy="60" r="28" stroke={withAlpha(color, 0.45)} strokeWidth="1.5" fill="none" />
      <Circle cx="60" cy="60" r="46" stroke={withAlpha(color, 0.28)} strokeWidth="1.2" fill="none" strokeDasharray="4 6" />
      <Circle cx="98" cy="48" r="5" fill={color} />
    </Svg>
  );
}

export function WaveMotif({ color, width = 160, height = 48 }: { color: string; width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 48" accessibilityElementsHidden>
      <Path d="M0 24 C 20 4, 40 44, 60 24 C 80 4, 100 44, 120 24 C 140 4, 150 20, 160 24" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

export function GridMotif({ color, width = 160, height = 90 }: { color: string; width?: number; height?: number }) {
  const lines = [20, 40, 60, 80, 100, 120, 140];
  return (
    <Svg width={width} height={height} viewBox="0 0 160 90" accessibilityElementsHidden>
      {lines.map((x) => (
        <Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={90} stroke={withAlpha(color, 0.28)} strokeWidth="1" />
      ))}
      {[18, 36, 54, 72].map((y) => (
        <Line key={`h-${y}`} x1={0} y1={y} x2={160} y2={y} stroke={withAlpha(color, 0.28)} strokeWidth="1" />
      ))}
    </Svg>
  );
}

export function VectorMotif({ color, width = 120, height = 72 }: { color: string; width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 72" accessibilityElementsHidden>
      <Line x1="16" y1="56" x2="96" y2="20" stroke={color} strokeWidth="2.5" />
      <Path d="M88 16 L104 18 L92 30 Z" fill={color} />
      <Circle cx="16" cy="56" r="3" fill={color} />
    </Svg>
  );
}

export function ParticleMotif({ color, size = 80 }: { color: string; size?: number }) {
  const dots = [
    [20, 24],
    [48, 18],
    [70, 36],
    [32, 52],
    [58, 62],
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" accessibilityElementsHidden>
      {dots.map(([x, y], index) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={index === 2 ? 5 : 3} fill={withAlpha(color, 0.4 + index * 0.1)} />
      ))}
    </Svg>
  );
}

export function FieldMotif({ color, width = 140, height = 80 }: { color: string; width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 140 80" accessibilityElementsHidden>
      {[16, 40, 64].map((y) => (
        <Path key={y} d={`M8 ${y} C 40 ${y - 12}, 80 ${y + 12}, 132 ${y}`} stroke={withAlpha(color, 0.7)} strokeWidth="1.4" fill="none" />
      ))}
    </Svg>
  );
}

export function ScientificPreview({ motif, accent }: { motif: string; accent: string }) {
  const colors = useColors();
  const color = accent || colors.primary;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {motif === "wave" ? <WaveMotif color={color} /> : null}
      {motif === "vector" ? <VectorMotif color={color} /> : null}
      {motif === "field" ? <FieldMotif color={color} /> : null}
      {motif === "particle" ? <ParticleMotif color={color} /> : null}
      {motif === "grid" ? <GridMotif color={color} /> : null}
      {motif !== "wave" && motif !== "vector" && motif !== "field" && motif !== "particle" && motif !== "grid" ? <OrbitMotif color={color} size={88} /> : null}
    </View>
  );
}

export function ScientificDiagram({
  kind,
}: {
  kind: "free-body" | "ray" | "vector" | "circuit" | "wave" | "orbit";
}) {
  const colors = useColors();
  if (kind === "wave") return <WaveMotif color={colors.primary} width={220} height={64} />;
  if (kind === "vector") return <VectorMotif color={colors.warning} width={180} height={90} />;
  if (kind === "orbit") return <OrbitMotif color={colors.primary} size={140} />;
  if (kind === "ray") return <VectorMotif color={colors.info} width={180} height={80} />;
  if (kind === "circuit") return <GridMotif color={colors.success} width={180} height={80} />;
  return <FieldMotif color={colors.primary} width={180} height={90} />;
}
