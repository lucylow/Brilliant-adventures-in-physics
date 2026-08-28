import { router } from "expo-router";
import { useState } from "react";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { getEntitlementStatus, type PurchaseSession, purchaseReducer, validateCatalog, type Product } from "@/lib/monetization";
import { useColors } from "@/hooks/use-colors";

export default function UpgradeScreen() {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const [session, setSession] = useState<PurchaseSession>({ state: "idle" });
  const [message, setMessage] = useState<string | null>(null);
  const catalog: Product[] = validateCatalog([]);
  const benefits = [tr("upgrade.benefitLens"), tr("upgrade.benefitAnalysis")];
  const entitlement = getEntitlementStatus({ providerAvailable: false });
  const entitlementMessage = entitlement.status === "unavailable" ? tr("upgrade.entitlementUnavailable") : entitlement.status === "free" ? tr("upgrade.entitlementFree") : entitlement.status === "active" ? tr("upgrade.entitlementActive") : entitlement.status === "trial" ? tr("upgrade.entitlementTrial") : entitlement.status === "grace" ? tr("upgrade.entitlementGrace") : entitlement.status === "pending" ? tr("upgrade.entitlementPending") : entitlement.status === "expired" ? tr("upgrade.entitlementExpired") : tr("upgrade.entitlementCanceled");
  const unavailable = () => { setMessage(tr("upgrade.catalogUnavailable")); setSession((current) => purchaseReducer(current, { type: "ERROR", message: tr("upgrade.catalogUnavailable") })); };
  const restore = () => { if (entitlement.status === "unavailable" || session.state === "restoring") return; setSession((current) => purchaseReducer(current, { type: "RESTORE" })); setMessage(tr("upgrade.restoreUnavailable")); setSession((current) => purchaseReducer(current, { type: "ERROR", message: tr("upgrade.restoreUnavailable") })); };
  const manage = () => setMessage(tr("upgrade.manageUnavailable"));
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 30 }}><SectionHeader title={tr("upgrade.title")} subtitle={tr("upgrade.subtitle")} /><Card style={{ marginBottom: 12 }}><Pill label={tr("upgrade.entitlementLabel")} active /><Text accessibilityLiveRegion="polite" style={{ marginTop: 10, color: entitlement.status === "unavailable" ? colors.warning : colors.foreground, lineHeight: 21 }}>{entitlementMessage}</Text></Card><Card style={{ marginBottom: 12 }}><Pill label={tr("upgrade.freeAccess")} active /><Text style={{ marginTop: 10, color: colors.foreground, lineHeight: 21 }}>{tr("upgrade.freeAccessBody")}</Text></Card><Card><Pill label={tr("upgrade.optional")} active /><Text style={{ marginTop: 14, color: colors.foreground, fontSize: 22, fontWeight: "800" }}>{tr("upgrade.heading")}</Text><Text style={{ marginTop: 8, color: colors.muted, lineHeight: 21 }}>{tr("upgrade.body")}</Text>{benefits.map((benefit) => <View key={benefit} style={{ flexDirection: "row", gap: 10, marginTop: 16 }}><Text style={{ color: colors.success, fontWeight: "800" }}>✓</Text><Text style={{ flex: 1, color: colors.foreground }}>{benefit}</Text></View>)}<View style={{ marginTop: 22 }}><PrimaryButton label={catalog.length ? tr("upgrade.plansAvailable") : tr("upgrade.plansUnavailable")} disabled={!catalog.length || session.state === "loading" || session.state === "restoring"} onPress={unavailable} /></View><Text style={{ marginTop: 10, color: colors.muted, lineHeight: 20 }}>{tr("upgrade.noProducts")}</Text>{message && <Text accessibilityLiveRegion="assertive" style={{ marginTop: 12, color: colors.warning, lineHeight: 20 }}>{message}</Text>}<View style={{ marginTop: 16 }}><SecondaryButton label={session.state === "restoring" ? tr("upgrade.restoring") : tr("upgrade.restore")} disabled={entitlement.status === "unavailable" || session.state === "restoring"} onPress={restore} /></View><View style={{ marginTop: 10 }}><SecondaryButton label={tr("upgrade.manage")} onPress={manage} /></View><View style={{ marginTop: 10 }}><SecondaryButton label={tr("upgrade.notNow")} onPress={() => router.back()} /></View><Text style={{ marginTop: 16, color: colors.muted, fontSize: 12, lineHeight: 18 }}>{tr("upgrade.transparency")}</Text></Card></ScrollView></ScreenContainer>;
}
