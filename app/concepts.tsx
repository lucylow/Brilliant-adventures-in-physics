import { useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, SectionHeader } from "@/components/physica-ui";
import { searchConcepts, type PhysicsConcept } from "@/lib/concepts";
import { useColors } from "@/hooks/use-colors";

export default function ConceptsScreen() {
  const colors = useColors();
  const { query: initialQuery } = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(typeof initialQuery === "string" ? initialQuery : "");
  const results = useMemo(() => searchConcepts(query), [query]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Concept library" subtitle="Search grounded explanations before reaching for a formula." /><View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 14 }}><TextInput accessibilityLabel="Search physics concepts" value={query} onChangeText={setQuery} onSubmitEditing={Keyboard.dismiss} returnKeyType="search" placeholder="Search kinematics, energy…" placeholderTextColor={colors.muted} style={{ flex: 1, minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, color: colors.foreground }} />{query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Clear concept search" onPress={() => setQuery("")}><Text style={{ color: colors.primary, fontWeight: "800" }}>Clear</Text></Pressable>}</View>{results.length === 0 ? <Card><Text style={{ color: colors.foreground, fontWeight: "800" }}>No matching concepts</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Try a broader term such as motion, force, energy, or waves.</Text></Card> : results.map((concept: PhysicsConcept) => <Card key={concept.id} style={{ marginBottom: 10 }}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", flex: 1 }}>{concept.title}</Text><Pill label={concept.domain} active /></View><Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>{concept.intuition}</Text>{concept.equation && <Text style={{ color: colors.primary, marginTop: 10, fontWeight: "800" }}>{concept.equation}</Text>}<Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}>Prerequisites: {concept.prerequisites.length ? concept.prerequisites.join(", ") : "none"}</Text></Card>)}</ScrollView></ScreenContainer>;
}
