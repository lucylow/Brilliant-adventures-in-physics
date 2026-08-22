import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, MasteryRing, Pill, PrimaryButton, ProgressBar, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();
  return <ScreenContainer className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
    <View style={{ gap: 22 }}>
      <View><Text style={{ fontSize: 30, fontWeight: "800", color: colors.foreground }}>Hi, physicist</Text><Text style={{ marginTop: 5, color: colors.muted, fontSize: 16 }}>Let’s understand some physics today.</Text></View>
      <Card><Pill label="TODAY’S PLAN" active /><Text style={{ marginTop: 12, fontSize: 22, fontWeight: "800", color: colors.foreground }}>Master projectile motion</Text><Text style={{ marginTop: 7, color: colors.muted, lineHeight: 21 }}>One concept, one simulation, one practice set.</Text><View style={{ marginTop: 16 }}><PrimaryButton label="Start today’s plan" onPress={() => router.push("/lab" as never)} /></View></Card>
      <View><SectionHeader title="Quick actions" subtitle="Choose a focused way to learn." /><View style={{ flexDirection: "row", gap: 10 }}><Card style={{ flex: 1 }} onPress={() => router.push("/tutor" as never)}><Text style={{ fontSize: 24 }}>✦</Text><Text style={{ marginTop: 8, fontWeight: "800", color: colors.foreground }}>Ask Tutor</Text><Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>Work it out</Text></Card><Card style={{ flex: 1 }} onPress={() => router.push("/practice" as never)}><Text style={{ fontSize: 24 }}>✓</Text><Text style={{ marginTop: 8, fontWeight: "800", color: colors.foreground }}>Practice</Text><Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>Build mastery</Text></Card><Card style={{ flex: 1 }} onPress={() => router.push("/lab" as never)}><Text style={{ fontSize: 24 }}>◌</Text><Text style={{ marginTop: 8, fontWeight: "800", color: colors.foreground }}>Physics Lab</Text><Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>Test a model</Text></Card><Card style={{ flex: 1 }} onPress={() => router.push("/scan" as never)}><Text style={{ fontSize: 24 }}>⌁</Text><Text style={{ marginTop: 8, fontWeight: "800", color: colors.foreground }}>Scan</Text><Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>Check a problem</Text></Card></View></View>
      <Card><View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}><MasteryRing value={0.62} /><View style={{ flex: 1 }}><Text style={{ fontSize: 18, fontWeight: "800", color: colors.foreground }}>Your physics map</Text><Text style={{ marginTop: 4, color: colors.muted }}>Kinematics is your next best opportunity.</Text><View style={{ marginTop: 12 }}><ProgressBar value={0.62} /></View></View></View></Card>
      <View><SectionHeader title="Recent activity" action="View all" onAction={() => router.push("/progress" as never)} /><Card onPress={() => router.push("/practice" as never)}><Text style={{ fontWeight: "800", color: colors.foreground }}>Projectile motion practice</Text><Text style={{ marginTop: 5, color: colors.muted }}>2 of 5 questions completed · Continue where you left off.</Text></Card></View>
    </View>
  </ScrollView></ScreenContainer>;
}
