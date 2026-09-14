import { Pressable, View } from "react-native";
import { BavTextField } from "@/components/bav/BavInputs";
import { Caption } from "@/components/bav/BavText";
import { BavChip } from "@/components/bav/BavChrome";
import { useColors } from "@/hooks/use-colors";
import { SEARCH_FILTERS, type SearchFilter } from "@/lib/assets";

export type { SearchFilter };

export function SearchField({
  value,
  onChange,
  onClear,
  placeholder,
  accessibilityLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  accessibilityLabel: string;
}) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ flex: 1 }}>
        <BavTextField value={value} onChangeText={onChange} placeholder={placeholder} accessibilityLabel={accessibilityLabel} />
      </View>
      {value.length > 0 ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={onClear} style={{ minHeight: 44, justifyContent: "center" }}>
          <Caption style={{ color: colors.primary }}>Clear</Caption>
        </Pressable>
      ) : null}
    </View>
  );
}

export function FilterChipRow({
  selected,
  onSelect,
}: {
  selected: SearchFilter | "all";
  onSelect: (value: SearchFilter | "all") => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <BavChip label="All" selected={selected === "all"} onPress={() => onSelect("all")} />
      {SEARCH_FILTERS.map((filter) => (
        <BavChip key={filter} label={filter} selected={selected === filter} onPress={() => onSelect(filter)} />
      ))}
    </View>
  );
}
