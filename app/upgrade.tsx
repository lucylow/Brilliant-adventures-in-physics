import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { buildPaywall, mapPurchaseError, type PurchaseSession, purchaseReducer, validateCatalog, type Product } from "@/lib/monetization";
import { useColors } from "@/hooks/use-colors";

export default function UpgradeScreen() {
  const colors = useColors();
  const model = buildPaywall("lab");
  const [session, setSession] = useState<PurchaseSession>({ state: "idle" });
  const [message, setMessage] = useState<string | null>(null);
  const catalog: Product[] = validateCatalog([]);
  const unavailable = () => setMessage("Plans are not configured on this build. Free Tutor, Practice, and core Lab learning remain available.");
  const restore = () => { if (session.state === "restoring") return; setSession((current) => purchaseReducer(current, { type: "RESTORE" })); setMessage("Restore is unavailable until a billing provider is configured. If you already purchased, use the same store account when billing is enabled."); setSession((current) => purchaseReducer(current, { type: "ERROR", message: mapPurchaseError({ code: "not_allowed" }) })); };
  const manage = () => setMessage("Subscription management will open through your app store once billing is configured.");
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 30 }}><SectionHeader title={model.title} subtitle={model.subtitle} /><Card><Pill label="OPTIONAL PLUS" active /><Text style={{ marginTop: 14, color: colors.foreground, fontSize: 22, fontWeight: "800" }}>Go deeper when you are ready</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>The free Tutor, Practice, and core Lab experiences remain available. Plus adds more room for advanced workflows.</Text>{model.benefits.map((benefit) => <View key={benefit} style={{ flexDirection: "row", gap: 10, marginTop: 16 }}><Text style={{ color: colors.success, fontWeight: "800" }}>✓</Text><Text style={{ flex: 1, color: colors.foreground }}>{benefit}</Text></View>)}<View style={{ marginTop: 22 }}><PrimaryButton label={catalog.length ? "View available plans" : "Plans unavailable"} disabled={!catalog.length || session.state === "loading" || session.state === "restoring"} onPress={unavailable} /></View><Text style={{ marginTop: 10, color: colors.muted, lineHeight: 20 }}>No store products are configured in this build, so no price or purchase option is shown. Your free learning tools remain available.</Text>{message && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning, lineHeight: 20 }}>{message}</Text>}<View style={{ marginTop: 16 }}><SecondaryButton label={session.state === "restoring" ? "Restoring…" : "Restore purchases"} onPress={restore} /></View><View style={{ marginTop: 10 }}><SecondaryButton label="Manage subscription" onPress={manage} /></View><View style={{ marginTop: 10 }}><SecondaryButton label="Not now" onPress={() => router.back()} /></View><Text style={{ marginTop: 16, color: colors.muted, fontSize: 12, lineHeight: 18 }}>Prices and availability are supplied by the billing provider. No countdowns, fake scarcity, or forced purchase flow.</Text></Card></ScrollView></ScreenContainer>;
}
