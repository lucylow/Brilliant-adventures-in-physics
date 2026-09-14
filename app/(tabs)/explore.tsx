import { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout";
import { BavEmptyState, BavListItem, BavSectionHeader, Body, Heading1 } from "@/components/bav";
import { AdventureJourney } from "@/components/adventure/AdventureJourney";
import { FilterChipRow, type SearchFilter } from "@/components/search/SearchField";
import { createTopicCatalog } from "@/lib/mock/datasets/topics";
import { emptyAdventureState } from "@/lib/adventure";
import { buildAdventureViewModel } from "@/lib/view-models/adventure";

export default function ExploreScreen() {
  const featured = createTopicCatalog().filter((topic) => topic.featured).slice(0, 8);
  const [filter, setFilter] = useState<SearchFilter | "all">("all");
  const adventure = buildAdventureViewModel({ level: 3, adventure: emptyAdventureState("orbit") });
  const topics = filter === "completed" ? [] : featured;
  return (
    <ScrollScreen>
      <View>
        <Heading1>Explore</Heading1>
        <Body tone="secondary">Astronomy, quantum models, concept maps, and your mastery journey — one scientific atlas.</Body>
      </View>
      <FilterChipRow selected={filter} onSelect={setFilter} />
      <BavSectionHeader title="Adventure" subtitle={adventure.worldTitle} />
      <AdventureJourney model={adventure} />
      <BavSectionHeader title="Featured topics" />
      {topics.length === 0 ? (
        <BavEmptyState title="No completed topics yet" body="Finish a lesson or practice item and it will appear in this filter." />
      ) : (
      <View style={{ gap: 10 }}>
        {topics.map((topic) => (
          <BavListItem
            key={topic.id}
            title={topic.name}
            subtitle={topic.shortDescription}
            onPress={() => router.push({ pathname: "/concepts", params: { query: topic.id } })}
          />
        ))}
      </View>
      )}
      <BavSectionHeader title="Laboratories" />
      <View style={{ gap: 10 }}>
        <BavListItem icon="explore" title="Astronomy" subtitle="Stars, orbits, and cosmic models" onPress={() => router.push("/astronomy" as never)} />
        <BavListItem icon="simulation" title="Quantum" subtitle="States, spectra, and tunneling" onPress={() => router.push("/quantum" as never)} />
        <BavListItem icon="mastery" title="Progress" subtitle="Mastery, streaks, and review" onPress={() => router.push("/progress" as never)} />
        <BavListItem icon="equation" title="Concepts" subtitle="Search the local physics map" onPress={() => router.push("/concepts" as never)} />
        <BavListItem icon="bookmark" title="Notebook" subtitle="Saved reflections" onPress={() => router.push("/notebook" as never)} />
        <BavListItem icon="search" title="Search" subtitle="Lessons, simulations, and Tutor history" onPress={() => router.push("/concepts" as never)} />
      </View>
    </ScrollScreen>
  );
}
