import { Text, type TextProps } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { allowFontScaling, maxFontSizeMultiplier, numericType, typeRamp, type TypeRampName } from "@/lib/design-system";

type Tone = "primary" | "secondary" | "muted" | "inverse" | "success" | "warning" | "danger" | "info";

export function BavText({
  variant = "body",
  tone = "primary",
  children,
  style,
  ...props
}: TextProps & { variant?: TypeRampName; tone?: Tone }) {
  const colors = useColors();
  const toneColor =
    tone === "inverse"
      ? colors.onPrimary
      : tone === "secondary"
        ? colors.textSecondary
        : tone === "muted"
          ? colors.textMuted
          : tone === "success"
            ? colors.success
            : tone === "warning"
              ? colors.warning
              : tone === "danger"
                ? colors.error
                : tone === "info"
                  ? colors.info
                  : colors.foreground;
  return (
    <Text
      allowFontScaling={allowFontScaling(variant)}
      maxFontSizeMultiplier={maxFontSizeMultiplier(variant)}
      style={[
        typeRamp[variant],
        variant === "metric" || variant === "equation" ? numericType : null,
        { color: toneColor },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Display(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="display" {...props} />;
}
export function Heading1(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="heading1" {...props} />;
}
export function Heading2(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="heading2" {...props} />;
}
export function Heading3(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="heading3" {...props} />;
}
export function Body(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="body" {...props} />;
}
export function BodyMedium(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="bodyMedium" {...props} />;
}
export function BodySmall(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="bodySmall" {...props} />;
}
export function Caption(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="caption" {...props} />;
}
export function Overline(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="overline" {...props} />;
}
export function Equation(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="equation" {...props} />;
}
export function Metric(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="metric" {...props} />;
}
export function ButtonLabel(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="button" {...props} />;
}
export function NavigationLabel(props: Omit<TextProps, "variant"> & { tone?: Tone }) {
  return <BavText variant="navigation" {...props} />;
}
