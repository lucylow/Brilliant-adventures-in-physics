import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, SectionHeader } from "@/components/physica-ui";
import { conceptWhyItMatters, type PhysicsConcept } from "@/lib/concepts";
import { searchActiveConcepts, getActivePracticeQuestions, searchActiveContent } from "@/lib/mock/adapters/catalog";
import { isMockModeEnabled } from "@/lib/mock/config";
import { useColors } from "@/hooks/use-colors";
import { SearchField } from "@/components/search/SearchField";
import { useAppTranslations } from "@/hooks/use-app-translations";

export default function ConceptsScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const { query: initialQuery } = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(typeof initialQuery === "string" ? initialQuery : "");
  const results = useMemo(() => searchActiveConcepts(query), [query]);
  const extra = useMemo(() => (isMockModeEnabled() ? searchActiveContent(query) : null), [query]);
  const practiceIds = useMemo(() => new Set(getActivePracticeQuestions().map((question) => question.conceptId)), []);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title={tr("concepts.title")} subtitle={tr("concepts.subtitle")} /><View style={{ marginBottom: 14 }}><SearchField value={query} onChange={(value) => { setQuery(value); }} onClear={() => setQuery("")} placeholder={tr("concepts.searchPlaceholder")} accessibilityLabel={tr("concepts.searchLabel")} /></View>{results.length === 0 ? <Card><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("concepts.noneTitle")}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>{tr("concepts.noneBody")}</Text></Card> : results.map((concept: PhysicsConcept) => <Card key={concept.id} style={{ marginBottom: 10 }}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", flex: 1 }}>{concept.title}</Text><Pill label={concept.domain} active /></View><Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>{concept.intuition}</Text><View accessibilityLabel={`Why ${concept.title} matters: ${conceptWhyItMatters(concept)}`} style={{ marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{tr("concepts.whyMatters")}</Text><Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{conceptWhyItMatters(concept)}</Text></View>{concept.equation && <Text style={{ color: colors.primary, marginTop: 10, fontWeight: "800" }}>{concept.equation}</Text>}<Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}>{tr("concepts.prerequisites", { values: concept.prerequisites.length ? concept.prerequisites.join(", ") : tr("common.none") })}</Text>{practiceIds.has(concept.id) && <Pressable accessibilityRole="button" accessibilityLabel={`Practice ${concept.title}`} onPress={() => router.push({ pathname: "/(tabs)/practice", params: { concept: concept.id } })} style={({ pressed }) => [{ marginTop: 12, paddingVertical: 8 }, pressed && { opacity: 0.65 }]}><Text style={{ color: colors.primary, fontWeight: "800" }}>{tr("concepts.practice")}</Text></Pressable>}</Card>)}{extra?.discovery?.length ? extra.discovery.map((card) => <Card key={card.id} style={{ marginBottom: 10 }}><Text style={{ color: colors.primary, fontWeight: "800" }}>Demo discovery</Text><Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 6 }}>{card.title}</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{card.hook}</Text></Card>) : null}</ScrollView></ScreenContainer>;
}
