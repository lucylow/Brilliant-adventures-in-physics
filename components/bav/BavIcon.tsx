import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { iconSize, materialIconName, type BavIconName } from "@/lib/design-system";
import { useColors } from "@/hooks/use-colors";

export function BavIcon({
  name,
  size = "md",
  color,
  accessibilityLabel,
}: {
  name: BavIconName;
  size?: keyof typeof iconSize | number;
  color?: string;
  accessibilityLabel?: string;
}) {
  const colors = useColors();
  const resolved = typeof size === "number" ? size : iconSize[size];
  return (
    <MaterialIcons
      name={materialIconName(name)}
      size={resolved}
      color={color ?? colors.foreground}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
