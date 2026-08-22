import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { buildPaywall } from "@/lib/monetization";
import { useColors } from "@/hooks/use-colors";

export default function UpgradeScreen() {
  const colors = useColors();
  const model = buildPaywall("lab");
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 30 }}><SectionHeader title={model.title} subtitle={model.subtitle} /><Card><Pill label="OPTIONAL PLUS" active /><Text style={{ marginTop: 14, color: colors.foreground, fontSize: 22, fontWeight: "800" }}>Go deeper when you are ready</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>The free Tutor, Practice, and core Lab experiences remain available. Plus adds more room for advanced workflows.</Text>{model.benefits.map((benefit) => <View key={benefit} style={{ flexDirection: "row", gap: 10, marginTop: 16 }}><Text style={{ color: colors.success, fontWeight: "800" }}>✓</Text><Text style={{ flex: 1, color: colors.foreground }}>{benefit}</Text></View>)}<View style={{ marginTop: 22 }}><PrimaryButton label="View available plans" onPress={() => {}} /></View><View style={{ marginTop: 10 }}><SecondaryButton label="Not now" onPress={() => router.back()} /></View><Text style={{ marginTop: 16, color: colors.muted, fontSize: 12, lineHeight: 18 }}>Prices and availability are supplied by the billing provider. No countdowns, fake scarcity, or forced purchase flow.</Text></Card></ScrollView></ScreenContainer>;
}
