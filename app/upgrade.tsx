import { router } from "expo-router";
import { useState } from "react";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { mapPurchaseError, type PurchaseSession, purchaseReducer, validateCatalog, type Product } from "@/lib/monetization";
import { useColors } from "@/hooks/use-colors";

export default function UpgradeScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const [session, setSession] = useState<PurchaseSession>({ state: "idle" });
  const [message, setMessage] = useState<string | null>(null);
  const catalog: Product[] = validateCatalog([]);
  const benefits = [tr("upgrade.benefitLens"), tr("upgrade.benefitAnalysis")];
  const unavailable = () => { setMessage(tr("upgrade.catalogUnavailable")); setSession((current) => purchaseReducer(current, { type: "ERROR", message: tr("upgrade.catalogUnavailable") })); };
  const restore = () => { if (session.state === "restoring") return; setSession((current) => purchaseReducer(current, { type: "RESTORE" })); setMessage(tr("upgrade.restoreUnavailable")); setSession((current) => purchaseReducer(current, { type: "ERROR", message: mapPurchaseError({ code: "not_allowed" }) })); };
  const manage = () => setMessage(tr("upgrade.manageUnavailable"));
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 30 }}><SectionHeader title={tr("upgrade.title")} subtitle={tr("upgrade.subtitle")} /><Card><Pill label={tr("upgrade.optional")} active /><Text style={{ marginTop: 14, color: colors.foreground, fontSize: 22, fontWeight: "800" }}>{tr("upgrade.heading")}</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>{tr("upgrade.body")}</Text>{benefits.map((benefit) => <View key={benefit} style={{ flexDirection: "row", gap: 10, marginTop: 16 }}><Text style={{ color: colors.success, fontWeight: "800" }}>✓</Text><Text style={{ flex: 1, color: colors.foreground }}>{benefit}</Text></View>)}<View style={{ marginTop: 22 }}><PrimaryButton label={catalog.length ? tr("upgrade.plansAvailable") : tr("upgrade.plansUnavailable")} disabled={!catalog.length || session.state === "loading" || session.state === "restoring"} onPress={unavailable} /></View><Text style={{ marginTop: 10, color: colors.muted, lineHeight: 20 }}>{tr("upgrade.noProducts")}</Text>{message && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning, lineHeight: 20 }}>{message}</Text>}<View style={{ marginTop: 16 }}><SecondaryButton label={session.state === "restoring" ? tr("upgrade.restoring") : tr("upgrade.restore")} onPress={restore} /></View><View style={{ marginTop: 10 }}><SecondaryButton label={tr("upgrade.manage")} onPress={manage} /></View><View style={{ marginTop: 10 }}><SecondaryButton label={tr("upgrade.notNow")} onPress={() => router.back()} /></View><Text style={{ marginTop: 16, color: colors.muted, fontSize: 12, lineHeight: 18 }}>{tr("upgrade.transparency")}</Text></Card></ScrollView></ScreenContainer>;
}
