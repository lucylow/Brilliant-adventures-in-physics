import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import { BavCard } from "./BavCard";
import { BavBadge } from "./BavChrome";
import { BavIcon } from "./BavIcon";
import { BavButton } from "./BavButton";
import { BodySmall, Caption, Heading3 } from "./BavText";
import { BavProgressBar } from "./BavProgress";
import { ScientificPreview } from "@/components/scientific/ScientificMotifs";

export type LabCardVariant = "featured" | "standard" | "compact" | "recent" | "locked";

export function BavLabCard({
  title,
  concept,
  difficulty,
  duration,
  motif,
  accent,
  progress,
  favorite = false,
  variant = "standard",
  onPress,
  onFavorite,
  reducedMotion = false,
}: {
  title: string;
  concept: string;
  difficulty: string;
  duration: number;
  motif: string;
  accent: string;
  progress?: number;
  favorite?: boolean;
  variant?: LabCardVariant;
  onPress: () => void;
  onFavorite?: () => void;
  reducedMotion?: boolean;
}) {
  const colors = useColors();
  const locked = variant === "locked";
  return (
    <BavCard
      elevation={variant === "featured" ? "soft" : "border"}
      onPress={locked ? undefined : onPress}
      accessibilityLabel={`${title}, ${concept}, ${difficulty}, ${duration} minutes${locked ? ", locked" : ""}`}
      reducedMotion={reducedMotion}
      style={{ opacity: locked ? 0.6 : 1 }}
    >
      <View style={{ height: variant === "compact" ? 72 : 96, borderRadius: radius.md, overflow: "hidden", backgroundColor: withAlpha(accent, 0.12), marginBottom: spacing.sm }}>
        <ScientificPreview motif={motif} accent={accent} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Heading3>{title}</Heading3>
          <BodySmall tone="secondary">{concept}</BodySmall>
        </View>
        {onFavorite ? (
          <BavIcon name={favorite ? "favoriteFilled" : "favorite"} color={favorite ? colors.error : colors.muted} size="sm" />
        ) : null}
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.sm, flexWrap: "wrap" }}>
        <BavBadge label={difficulty} tone={difficulty === "Advanced" || difficulty === "hard" ? "warning" : "info"} />
        <Caption tone="muted">{duration} min</Caption>
        {locked ? <BavBadge label="Locked" tone="neutral" /> : null}
      </View>
      {typeof progress === "number" ? <View style={{ marginTop: spacing.sm }}><BavProgressBar value={progress} reducedMotion={reducedMotion} /></View> : null}
      {variant !== "compact" && !locked ? <View style={{ marginTop: spacing.sm }}><BavButton label="Open lab" size="sm" onPress={onPress} /></View> : null}
    </BavCard>
  );
}
