import { View } from "react-native";
import { BavButton } from "@/components/bav/BavButton";
import { BavCard } from "@/components/bav/BavCard";
import { BavLabCard } from "@/components/bav/BavLabCard";
import { BodySmall, Caption, Heading3 } from "@/components/bav/BavText";
import { PremiumBadge, BAVPlusBadge } from "./PremiumBadge";
import { ScientificPreview } from "@/components/scientific/ScientificMotifs";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import { useColors } from "@/hooks/use-colors";

export function PremiumLabCard({
  title,
  concept,
  locked,
  onPress,
  onUnlock,
}: {
  title: string;
  concept: string;
  locked: boolean;
  onPress: () => void;
  onUnlock: () => void;
}) {
  const colors = useColors();
  if (!locked) {
    return (
      <BavLabCard
        title={title}
        concept={concept}
        difficulty="Advanced"
        duration={12}
        motif="particle"
        accent={colors.primary}
        onPress={onPress}
      />
    );
  }
  return (
    <BavCard accessibilityLabel={`${title}, premium lab, locked`}>
      <View style={{ height: 110, borderRadius: radius.md, overflow: "hidden", backgroundColor: withAlpha("#0B1C3D", 0.92), marginBottom: spacing.sm }}>
        <ScientificPreview motif="particle" accent={colors.primary} />
      </View>
      <BAVPlusBadge />
      <Heading3 style={{ marginTop: spacing.sm }}>{title}</Heading3>
      <BodySmall tone="secondary">{concept}</BodySmall>
      <Caption tone="muted" style={{ marginTop: 8 }}>Preview the bench, then unlock the full experiment.</Caption>
      <View style={{ marginTop: spacing.sm, gap: 8 }}>
        <BavButton label="Try free sample" size="sm" variant="secondary" onPress={onPress} />
        <BavButton label="Unlock full experiment" size="sm" onPress={onUnlock} />
      </View>
    </BavCard>
  );
}

export function PremiumMissionCard({
  title,
  teaser,
  concepts,
  reward,
  state,
  onPress,
}: {
  title: string;
  teaser: string;
  concepts: string;
  reward: string;
  state: "locked" | "preview" | "available" | "completed";
  onPress: () => void;
}) {
  return (
    <BavCard accessibilityLabel={`${title}, ${state}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <PremiumBadge label={state === "completed" ? "Completed" : "Mission"} />
        {state === "locked" || state === "preview" ? <BAVPlusBadge /> : null}
      </View>
      <Heading3 style={{ marginTop: spacing.sm }}>{title}</Heading3>
      <BodySmall tone="secondary" style={{ marginTop: 6 }}>{teaser}</BodySmall>
      <Caption tone="muted" style={{ marginTop: 8 }}>Concepts: {concepts}</Caption>
      <Caption tone="muted">Reward preview: {reward}</Caption>
      <View style={{ marginTop: spacing.sm }}>
        <BavButton
          label={state === "available" || state === "completed" ? "Open mission" : "Preview mission"}
          size="sm"
          onPress={onPress}
        />
      </View>
    </BavCard>
  );
}

export function PremiumExamCard({ locked, onPress }: { locked: boolean; onPress: () => void }) {
  return (
    <BavCard accessibilityLabel="Exam preparation">
      <BAVPlusBadge />
      <Heading3 style={{ marginTop: spacing.sm }}>Exam preparation</Heading3>
      <BodySmall tone="secondary" style={{ marginTop: 6 }}>Timed practice, review analytics, and focused drills. Core practice stays free.</BodySmall>
      <View style={{ marginTop: spacing.sm }}>
        <BavButton label={locked ? "Preview exam tools" : "Open exam prep"} size="sm" onPress={onPress} />
      </View>
    </BavCard>
  );
}

export function PremiumAstronomyCard({ locked, onPress }: { locked: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <BavCard accessibilityLabel="Advanced astronomy">
      <View style={{ height: 88, borderRadius: radius.md, overflow: "hidden", backgroundColor: withAlpha(colors.primary, 0.12), marginBottom: spacing.sm }}>
        <ScientificPreview motif="orbit" accent={colors.primary} />
      </View>
      <BAVPlusBadge />
      <Heading3 style={{ marginTop: spacing.sm }}>Advanced astronomy</Heading3>
      <BodySmall tone="secondary">Extended cosmology visualizations. Intro solar-system tools stay free.</BodySmall>
      <View style={{ marginTop: spacing.sm }}>
        <BavButton label={locked ? "Preview astronomy lab" : "Open astronomy lab"} size="sm" onPress={onPress} />
      </View>
    </BavCard>
  );
}

export function PremiumQuantumCard({ locked, onPress }: { locked: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <BavCard accessibilityLabel="Quantum lab">
      <View style={{ height: 88, borderRadius: radius.md, overflow: "hidden", backgroundColor: withAlpha("#7C3AED", 0.16), marginBottom: spacing.sm }}>
        <ScientificPreview motif="particle" accent="#7C3AED" />
      </View>
      <BAVPlusBadge />
      <Heading3 style={{ marginTop: spacing.sm }}>Quantum lab</Heading3>
      <BodySmall tone="secondary">Tunneling and photoelectric benches. Intro photon calculations stay free.</BodySmall>
      <View style={{ marginTop: spacing.sm }}>
        <BavButton label={locked ? "Preview quantum lab" : "Open quantum lab"} size="sm" onPress={onPress} />
      </View>
    </BavCard>
  );
}

export function HomePremiumCta({ onPress }: { onPress: () => void }) {
  return (
    <BavCard onPress={onPress} accessibilityLabel="Discover BAV+ advanced labs">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <BAVPlusBadge />
        <View style={{ flex: 1 }}>
          <Heading3>Advanced lab preview</Heading3>
          <BodySmall tone="secondary">Peek at a deeper bench. Core Home learning stays first.</BodySmall>
        </View>
      </View>
    </BavCard>
  );
}

export function TrialReminder({ body, onPress }: { body: string; onPress: () => void }) {
  return (
    <BavCard accessibilityLabel={body}>
      <Caption>Trial</Caption>
      <BodySmall style={{ marginTop: 6 }}>{body}</BodySmall>
      <View style={{ marginTop: spacing.sm }}>
        <BavButton label="View plans" size="sm" variant="secondary" onPress={onPress} />
      </View>
    </BavCard>
  );
}
