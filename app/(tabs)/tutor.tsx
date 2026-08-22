import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, EquationCard, HintPanel, Pill, PrimaryButton, SectionHeader, SolutionStep } from "@/components/physica-ui";
import { createMockTutorAnswer } from "@/lib/ai";
import { consumeTutorUse, loadUsage, remainingTutorUses, type UsageState } from "@/lib/usage-meter";
import { projectile } from "@/lib/physics";
import { useColors } from "@/hooks/use-colors";

type Message = { role: "assistant" | "user"; text: string };

export default function TutorScreen() {
  const colors = useColors();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "I’m PhysicaAI. Give me a physics question and I’ll help you reason through it." }]);
  const [hint, setHint] = useState(0);
  const [usage, setUsage] = useState<UsageState>({ date: "", tutorUsed: 0, tutorLimit: 5 });
  useEffect(() => { void loadUsage().then(setUsage); }, []);
  const remaining = remainingTutorUses(usage);
  const send = async (text = draft) => {
    const clean = text.trim();
    if (!clean || remaining <= 0) return;
    const nextUsage = await consumeTutorUse();
    setUsage(nextUsage);
    const answer = createMockTutorAnswer(clean, []);
    setMessages((current) => [...current, { role: "user", text: clean }, { role: "assistant", text: answer.summary }]);
    setDraft("");
    setHint(0);
  };
  const showVerifiedExample = async () => {
    if (remaining <= 0) return;
    const nextUsage = await consumeTutorUse();
    setUsage(nextUsage);
    const result = projectile({ speed: 18, angleDeg: 42, height: 0 });
    setMessages((current) => [...current, { role: "user", text: "Show me a verified projectile example" }, { role: "assistant", text: `For a launch at 18 m/s and 42°, the deterministic engine verifies a range of ${result.range.toFixed(2)} m.` }]);
  };
  return <ScreenContainer className="p-5"><View style={{ flex: 1 }}><SectionHeader title="Tutor" subtitle="Reason first. Verify the numbers." /><Card style={{ marginBottom: 12, padding: 12 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ color: colors.muted }}>Free tutor uses remaining today</Text><Text style={{ color: remaining ? colors.primary : colors.warning, fontWeight: "800" }}>{remaining}/{usage.tutorLimit}</Text></View>{remaining === 0 && <Pressable accessibilityRole="button" onPress={() => router.push("/upgrade" as never)}><Text style={{ color: colors.primary, fontWeight: "800", marginTop: 8 }}>See optional Plus plans for more AI usage</Text></Pressable>}</Card><ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>{messages.map((message, index) => <View key={`${message.role}-${index}`} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%" }}><View style={{ padding: 14, borderRadius: 18, backgroundColor: message.role === "user" ? colors.primary : colors.surface, borderWidth: message.role === "user" ? 0 : 1, borderColor: colors.border }}><Text style={{ color: message.role === "user" ? "#FFFFFF" : colors.foreground, lineHeight: 22 }}>{message.text}</Text></View></View>)}{messages.length > 1 && <><EquationCard formula="knowns → principle → verified result" caption="Keep the calculation traceable." /><SolutionStep number={1} title="Identify the knowns" body="Write every value with a unit before choosing a formula." /><SolutionStep number={2} title="Choose the principle" body="Match the target quantity to a supported physics relationship." /></>}</ScrollView><Card><Text style={{ color: colors.muted, fontSize: 12 }}>Try a focused prompt</Text><View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}><Pressable onPress={() => void send("Why does mass not change acceleration due to gravity?")}><Pill label="Concept" /></Pressable><Pressable onPress={() => void showVerifiedExample()}><Pill label="Verified example" active /></Pressable><Pressable onPress={() => setHint((value) => Math.min(3, value + 1))}><Pill label={`Hint ${hint || "ladder"}`} /></Pressable></View><View style={{ flexDirection: "row", gap: 8, marginTop: 12, alignItems: "flex-end" }}><TextInput editable={remaining > 0} value={draft} onChangeText={setDraft} onSubmitEditing={() => void send()} returnKeyType="done" multiline placeholder={remaining ? "Ask a physics question…" : "Daily free usage reached"} placeholderTextColor={colors.muted} style={{ flex: 1, minHeight: 46, maxHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, color: colors.foreground }} /><View style={{ width: 86 }}><PrimaryButton label="Send" disabled={remaining <= 0} onPress={() => void send()} /></View></View><HintPanel visible={hint > 0} label={hint === 1 ? "Name the target quantity." : hint === 2 ? "Write the governing equation." : "Substitute values only after checking units."} /></Card></View></ScreenContainer>;
}
