import { type ReactNode } from "react";
import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import { BavBadge } from "../bav/BavChrome";
import { BavButton } from "../bav/BavButton";
import { BavCard } from "../bav/BavCard";
import { Body, BodySmall, Caption, Heading3 } from "../bav/BavText";
import { BavEquationCard } from "../bav/BavEquationCard";

export type TutorCardKind = "verified" | "idea" | "hint" | "try" | "simulation" | "practice";

export function BavTutorCard({
  kind,
  title,
  body,
  equation,
  actionLabel,
  onAction,
  values,
}: {
  kind: TutorCardKind;
  title: string;
  body: string;
  equation?: string;
  actionLabel?: string;
  onAction?: () => void;
  values?: Array<{ label: string; value: string }>;
}) {
  const colors = useColors();
  const tone = kind === "verified" ? "verified" : kind === "hint" ? "warning" : kind === "practice" ? "info" : "neutral";
  return (
    <BavCard elevation="soft" accessibilityLabel={title}>
      <BavBadge label={title} tone={tone} />
      <Body style={{ marginTop: spacing.sm }}>{body}</Body>
      {equation ? <View style={{ marginTop: spacing.sm }}><BavEquationCard formula={equation} verified={kind === "verified"} expandable={false} /></View> : null}
      {values?.length ? (
        <View style={{ marginTop: spacing.sm, gap: 6 }}>
          {values.map((item) => (
            <View key={item.label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Caption tone="muted">{item.label}</Caption>
              <Caption>{item.value}</Caption>
            </View>
          ))}
        </View>
      ) : null}
      {actionLabel && onAction ? <View style={{ marginTop: spacing.sm }}><BavButton label={actionLabel} size="sm" variant="secondary" onPress={onAction} /></View> : null}
    </BavCard>
  );
}

export function BavTutorMessage({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: ReactNode;
}) {
  const colors = useColors();
  const isUser = role === "user";
  return (
    <View style={{ alignItems: isUser ? "flex-end" : "flex-start", marginBottom: spacing.sm }}>
      <View
        style={{
          maxWidth: "88%",
          backgroundColor: isUser ? colors.primary : colors.surface,
          borderRadius: 18,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: isUser ? 0 : 1,
          borderColor: colors.border,
        }}
      >
        {typeof children === "string" ? <Body style={{ color: isUser ? colors.onPrimary : colors.foreground }}>{children}</Body> : children}
      </View>
    </View>
  );
}

export function BavRelatedContent({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: Array<{ id: string; title: string; subtitle: string }>;
  onOpen: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <View style={{ gap: 8 }}>
      <Heading3>{title}</Heading3>
      {items.map((item) => (
        <BavCard key={item.id} onPress={() => onOpen(item.id)} accessibilityLabel={item.title}>
          <Heading3>{item.title}</Heading3>
          <BodySmall tone="secondary">{item.subtitle}</BodySmall>
        </BavCard>
      ))}
    </View>
  );
}
