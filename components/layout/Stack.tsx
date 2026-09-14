import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { layout, spacing } from "@/lib/design-system";

export function Stack({
  children,
  gap = "md",
  style,
}: {
  children: ReactNode;
  gap?: keyof typeof spacing | number;
  style?: StyleProp<ViewStyle>;
}) {
  const resolved = typeof gap === "number" ? gap : spacing[gap];
  return <View style={[{ gap: resolved }, style]}>{children}</View>;
}

export function Row({
  children,
  gap = "sm",
  align = "center",
  justify = "flex-start",
  wrap = false,
  style,
}: {
  children: ReactNode;
  gap?: keyof typeof spacing | number;
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const resolved = typeof gap === "number" ? gap : spacing[gap];
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : "nowrap",
          gap: resolved,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Grid({
  children,
  columns = 2,
  gap = layout.gridGap,
  style,
}: {
  children: ReactNode;
  columns?: 2 | 3;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", margin: -gap / 2 }, style]}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <View key={index} style={{ width: `${100 / columns}%`, padding: gap / 2 }}>
              {child}
            </View>
          ))
        : children}
    </View>
  );
}

export function Section({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[{ gap: spacing.sm, marginBottom: layout.sectionGap }, style]}>{children}</View>;
}

export function BottomNavSpacer({ extra = 0 }: { extra?: number }) {
  return <View style={{ height: layout.bottomNavHeight + spacing.xl + extra }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}
