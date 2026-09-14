import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { BavChip, BavLabCard, BavSectionHeader } from "@/components/bav";
import { buildLabViewModel, LAB_CATEGORIES, type LabCategory } from "@/lib/view-models/lab";

export function LabCatalog({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [category, setCategory] = useState<LabCategory>("All");
  const model = buildLabViewModel(category);
  return (
    <View style={{ marginBottom: 18 }}>
      <BavSectionHeader title="Build" subtitle={model.countLabel} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {LAB_CATEGORIES.map((item) => (
          <BavChip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
        ))}
      </View>
      <View style={{ gap: 12 }}>
        {model.items.slice(0, 6).map((item) => (
          <BavLabCard
            key={item.id}
            title={item.title}
            concept={item.concept}
            difficulty={item.difficulty}
            duration={item.duration}
            motif={item.motif}
            accent={item.accent}
            variant="compact"
            reducedMotion={reducedMotion}
            onPress={() => router.push({ pathname: "/simulation", params: { id: item.id } })}
          />
        ))}
      </View>
    </View>
  );
}
