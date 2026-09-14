import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ScrollScreen } from "@/components/layout";
import { BavChip, BavLabCard, BavSectionHeader, Body, Heading1 } from "@/components/bav";
import { EmptyState } from "@/components/states";
import { buildLabViewModel, LAB_CATEGORIES, type LabCategory } from "@/lib/view-models/lab";
import { loadPreferences } from "@/lib/preferences";

export default function PlayScreen() {
  const [category, setCategory] = useState<LabCategory>("All");
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    let active = true;
    void loadPreferences().then((preferences) => {
      if (active) setReducedMotion(preferences.reducedMotion);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const model = buildLabViewModel(category);
  return (
    <ScrollScreen>
      <View>
        <Heading1>Play</Heading1>
        <Body tone="secondary">Interactive labs with a dark scientific canvas. Pick an experiment, then run the verified engine.</Body>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {LAB_CATEGORIES.map((item) => (
          <BavChip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
        ))}
      </View>
      <BavSectionHeader title="Simulations" subtitle={model.countLabel} />
      {model.items.length === 0 ? (
        <EmptyState title="No saved experiments" body="This category has no interactive labs yet. Try All or Mechanics." />
      ) : (
        <View style={{ gap: 12 }}>
          {model.items.map((item) => (
            <BavLabCard
              key={item.id}
              title={item.title}
              concept={item.concept}
              difficulty={item.difficulty}
              duration={item.duration}
              motif={item.motif}
              accent={item.accent}
              variant={item.featured ? "featured" : "standard"}
              reducedMotion={reducedMotion}
              onPress={() => router.push({ pathname: "/simulation", params: { id: item.id } })}
            />
          ))}
        </View>
      )}
    </ScrollScreen>
  );
}
