import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing } from "@/lib/design-system";
import { Caption, Heading3 } from "@/components/bav/BavText";
import { FieldMotif, GridMotif, OrbitMotif, ParticleMotif, VectorMotif, WaveMotif } from "./ScientificMotifs";
import { placeholderForTopic, type BavPlaceholderKind } from "@/lib/assets";

export type ScientificDiagramKind = BavPlaceholderKind;

export function ScientificDiagramCanvas({
  kind,
  title,
  caption,
  height = 140,
}: {
  kind: ScientificDiagramKind;
  title?: string;
  caption?: string;
  height?: number;
}) {
  const colors = useColors();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={title ? `${title} diagram` : `${kind} scientific diagram`}
      style={{
        borderRadius: radius.lg,
        overflow: "hidden",
        backgroundColor: colors.simulationBackground,
        minHeight: height,
        padding: spacing.md,
      }}
    >
      {title ? <Heading3 style={{ color: colors.onPrimary }}>{title}</Heading3> : null}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", minHeight: height - 36 }}>
        <DiagramMotif kind={kind} color={colors.onPrimary} />
      </View>
      {caption ? <Caption style={{ color: colors.onPrimary, opacity: 0.8 }}>{caption}</Caption> : null}
    </View>
  );
}

export function ScientificDiagramForTopic({ topic, title, caption }: { topic: string; title?: string; caption?: string }) {
  return <ScientificDiagramCanvas kind={placeholderForTopic(topic)} title={title} caption={caption} />;
}

function DiagramMotif({ kind, color }: { kind: ScientificDiagramKind; color: string }) {
  if (kind === "orbit") return <OrbitMotif color={color} size={108} />;
  if (kind === "wave") return <WaveMotif color={color} width={180} height={52} />;
  if (kind === "vector") return <VectorMotif color={color} />;
  if (kind === "particle") return <ParticleMotif color={color} />;
  if (kind === "field") return <FieldMotif color={color} />;
  if (kind === "circuit") return <GridMotif color={color} width={180} height={80} />;
  if (kind === "ray") return <VectorMotif color={color} />;
  return <GridMotif color={color} width={180} height={80} />;
}

export const SCIENTIFIC_DIAGRAM_KINDS: ScientificDiagramKind[] = ["orbit", "wave", "grid", "vector", "particle", "field", "circuit", "ray"];
