import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { projectile } from "@/lib/physics";
import { useColors } from "@/hooks/use-colors";

export default function ScanProblemScreen() {
  const colors = useColors();
  const [question, setQuestion] = useState("A ball is launched at 18 m/s at 42° from level ground. Find its range.");
  const [speed, setSpeed] = useState("18");
  const [angle, setAngle] = useState("42");
  const [solved, setSolved] = useState(false);
  const solve = () => setSolved(true);
  const result = projectile({ speed: Number(speed) || 0, angleDeg: Number(angle) || 0, height: 0 });
  return <ScreenContainer className="p-5"><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><SectionHeader title="Scan Problem" subtitle="Review the extracted values before solving." /><Card><Pill label="MANUAL REVIEW" active /><Text style={{ marginTop: 14, color: colors.muted, lineHeight: 20 }}>Camera recognition can be uncertain. Editing the values keeps you in control.</Text><TextInput value={question} onChangeText={setQuestion} multiline placeholder="Type or paste a physics problem" placeholderTextColor={colors.muted} style={{ marginTop: 14, minHeight: 84, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, color: colors.foreground, textAlignVertical: "top" }} /><View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}><View style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>Speed · m/s</Text><TextInput value={speed} onChangeText={setSpeed} keyboardType="decimal-pad" style={{ marginTop: 5, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.foreground }} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>Angle · °</Text><TextInput value={angle} onChangeText={setAngle} keyboardType="decimal-pad" style={{ marginTop: 5, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.foreground }} /></View></View><View style={{ marginTop: 14 }}><Text style={{ color: colors.warning, fontWeight: "700" }}>Medium confidence · please verify highlighted values</Text></View><View style={{ marginTop: 16 }}><PrimaryButton label="Solve with verified engine" onPress={solve} /></View><View style={{ marginTop: 10 }}><SecondaryButton label="Back to tutor" onPress={() => router.push("/tutor" as never)} /></View>{solved && <View style={{ marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: colors.success + "14" }}><Text style={{ color: colors.success, fontWeight: "800" }}>Verified result</Text><Text style={{ marginTop: 5, color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{result.range.toFixed(2)} m range</Text><Text style={{ marginTop: 5, color: colors.muted }}>Flight time {result.flightTime.toFixed(2)} s · peak height {result.peakHeight.toFixed(2)} m</Text></View>}</Card></ScrollView></ScreenContainer>;
}
