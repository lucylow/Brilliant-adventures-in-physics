import { useState } from "react";
import { Pressable, Switch, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { opacity, radius, spacing, touchTarget } from "@/lib/design-system";
import { Caption, BodyMedium } from "./BavText";
import { sliderAccessibilityValue, sliderProgressPercent } from "@/lib/ui-logic";

export function BavTextField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  multiline = false,
  editable = true,
  error,
  keyboardType = "default",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel: string;
  multiline?: boolean;
  editable?: boolean;
  error?: string;
  keyboardType?: "default" | "decimal-pad" | "numeric";
}) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={accessibilityLabel}
        editable={editable}
        multiline={multiline}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          minHeight: multiline ? 88 : touchTarget.comfortable,
          borderWidth: 1.5,
          borderColor: error ? colors.error : focused ? colors.primary : colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          color: colors.foreground,
          fontSize: 16,
          textAlignVertical: multiline ? "top" : "center",
          opacity: editable ? 1 : opacity.disabled,
          backgroundColor: colors.surface,
        }}
      />
      {error ? <Caption tone="danger" style={{ marginTop: 6 }}>{error}</Caption> : null}
    </View>
  );
}

export function BavNumberInput({
  value,
  unit,
  onChangeText,
  accessibilityLabel,
  error,
}: {
  value: string;
  unit: string;
  onChangeText: (value: string) => void;
  accessibilityLabel: string;
  error?: string;
}) {
  const colors = useColors();
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <BavTextField value={value} onChangeText={onChangeText} accessibilityLabel={accessibilityLabel} keyboardType="decimal-pad" error={undefined} />
        </View>
        <Caption tone="muted" style={{ color: colors.muted }}>{unit}</Caption>
      </View>
      {error ? <Caption tone="danger" style={{ marginTop: 6 }}>{error}</Caption> : null}
      {!error ? <View /> : null}
    </View>
  );
}

export function BavSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const colors = useColors();
  const clamp = (next: number) => Math.max(min, Math.min(max, Number((Math.round(next / step) * step).toFixed(4))));
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <View style={{ marginBottom: spacing.md }} accessible={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <BodyMedium>{label}</BodyMedium>
        <Caption tone="info">{unit ? `${value} ${unit}` : String(value)}</Caption>
      </View>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        accessibilityValue={sliderAccessibilityValue(value, min, max)}
        style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, minHeight: touchTarget.minimum }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={disabled || atMin}
          onPress={() => onChange(clamp(value - step))}
          style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: atMin || disabled ? 0.4 : 1 }}
        >
          <BodyMedium tone="info">−</BodyMedium>
        </Pressable>
        <View style={{ flex: 1, height: 8, borderRadius: 8, backgroundColor: colors.border }}>
          <View style={{ width: `${sliderProgressPercent(value, min, max)}%`, height: 8, borderRadius: 8, backgroundColor: colors.primary }} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={disabled || atMax}
          onPress={() => onChange(clamp(value + step))}
          style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: atMax || disabled ? 0.4 : 1 }}
        >
          <BodyMedium tone="info">+</BodyMedium>
        </Pressable>
      </View>
    </View>
  );
}

export function BavToggle({
  label,
  body,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  body?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <View style={{ flex: 1 }}>
        <BodyMedium>{label}</BodyMedium>
        {body ? <Caption tone="secondary">{body}</Caption> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </View>
  );
}
