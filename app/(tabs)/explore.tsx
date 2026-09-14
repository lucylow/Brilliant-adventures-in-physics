import { router } from "expo-router";
import { View } from "react-native";
import { ScrollScreen } from "@/components/layout";
import { BavListItem, BavSectionHeader, Body, Heading1 } from "@/components/bav";
import { createTopicCatalog } from "@/lib/mock/datasets/topics";
import { ADVENTURE_WORLDS } from "@/lib/adventure";

export default function ExploreScreen() {
  const featured = createTopicCatalog().filter((topic) => topic.featured).slice(0, 8);
  return (
    <ScrollScreen>
      <View>
        <Heading1>Explore</Heading1>
        <Body tone="secondary">Astronomy, quantum models, concept maps, and your mastery journey — one scientific atlas.</Body>
      </View>
      <BavSectionHeader title="Worlds" />
      <View style={{ gap: 10 }}>
        {ADVENTURE_WORLDS.map((world) => (
          <BavListItem
            key={world.id}
            icon="explore"
            title={world.title}
            subtitle={world.description}
            onPress={() => router.push("/progress" as never)}
          />
        ))}
      </View>
      <BavSectionHeader title="Featured topics" />
      <View style={{ gap: 10 }}>
        {featured.map((topic) => (
          <BavListItem
            key={topic.id}
            title={topic.name}
            subtitle={topic.shortDescription}
            onPress={() => router.push({ pathname: "/concepts", params: { query: topic.id } })}
          />
        ))}
      </View>
      <BavSectionHeader title="Laboratories" />
      <View style={{ gap: 10 }}>
        <BavListItem icon="explore" title="Astronomy" subtitle="Stars, orbits, and cosmic models" onPress={() => router.push("/astronomy" as never)} />
        <BavListItem icon="simulation" title="Quantum" subtitle="States, spectra, and tunneling" onPress={() => router.push("/quantum" as never)} />
        <BavListItem icon="mastery" title="Progress" subtitle="Mastery, streaks, and review" onPress={() => router.push("/progress" as never)} />
        <BavListItem icon="equation" title="Concepts" subtitle="Search the local physics map" onPress={() => router.push("/concepts" as never)} />
        <BavListItem icon="bookmark" title="Notebook" subtitle="Saved reflections" onPress={() => router.push("/notebook" as never)} />
      </View>
    </ScrollScreen>
  );
}
