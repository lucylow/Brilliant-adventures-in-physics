import { useState } from "react";
import { Pressable, View } from "react-native";
import * as Sharing from "expo-sharing";
import { useColors } from "@/hooks/use-colors";
import { radius, spacing, withAlpha } from "@/lib/design-system";
import { BavCard } from "./BavCard";
import { BavBadge } from "./BavChrome";
import { BavIconButton } from "./BavButton";
import { Body, BodySmall, Caption, Equation, Heading3 } from "./BavText";
import type { MockEquationVariable } from "@/lib/mock/types";

export type EquationVariable = MockEquationVariable & { value?: string };

export function BavEquationCard({
  formula,
  description,
  variables = [],
  units,
  verified = false,
  expandable = true,
  onCopy,
}: {
  formula: string;
  description?: string;
  variables?: EquationVariable[];
  units?: string;
  verified?: boolean;
  expandable?: boolean;
  onCopy?: () => void;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(!expandable);
  return (
    <BavCard elevation="border" accessibilityLabel={`Equation ${formula}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        {verified ? <BavBadge label="Verified" tone="verified" /> : <Caption tone="muted">Equation</Caption>}
        <View style={{ flexDirection: "row" }}>
          {onCopy ? <BavIconButton icon="copy" accessibilityLabel="Copy equation" onPress={onCopy} /> : null}
          <BavIconButton
            icon="share"
            accessibilityLabel="Share equation"
            onPress={() => {
              void Sharing.isAvailableAsync().then((available) => {
                if (available) return Sharing.shareAsync(formula).catch(() => undefined);
              });
            }}
          />
        </View>
      </View>
      <View style={{ marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: withAlpha(colors.primary, 0.08) }}>
        <Equation>{formula}</Equation>
        {units ? <Caption tone="muted" style={{ textAlign: "center", marginTop: 6 }}>{units}</Caption> : null}
      </View>
      {description ? <BodySmall tone="secondary" style={{ marginTop: spacing.sm }}>{description}</BodySmall> : null}
      {expandable ? (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((value) => !value)} style={{ marginTop: spacing.sm, minHeight: 44, justifyContent: "center" }}>
          <Caption tone="info">{open ? "Hide variables" : "Show variables"}</Caption>
        </Pressable>
      ) : null}
      {open && variables.length > 0 ? (
        <View style={{ marginTop: spacing.sm, gap: 8 }}>
          {variables.map((variable) => (
            <View key={variable.symbol} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <BodyMediumLine symbol={variable.symbol} name={variable.name} />
              <Caption tone="muted">{variable.value ? `${variable.value} ${variable.unit}` : variable.unit}</Caption>
            </View>
          ))}
        </View>
      ) : null}
    </BavCard>
  );
}

function BodyMediumLine({ symbol, name }: { symbol: string; name: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, flex: 1, paddingRight: 12 }}>
      <Heading3>{symbol}</Heading3>
      <Body tone="secondary">{name}</Body>
    </View>
  );
}
