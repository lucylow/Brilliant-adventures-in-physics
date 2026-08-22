import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, PrimaryButton, SectionHeader } from "@/components/physica-ui";
import { createMockTutorAnswer } from "@/lib/ai";
import { projectile } from "@/lib/physics";
import { useColors } from "@/hooks/use-colors";

type Message = { role: "assistant" | "user"; text: string };

export default function TutorScreen() {
  const colors = useColors();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "I’m PhysicaAI. Give me a physics question and I’ll help you reason through it." }]);
  const [hint, setHint] = useState(0);
  const send = (text = draft) => {
    const clean = text.trim();
    if (!clean) return;
    const answer = createMockTutorAnswer(clean, []);
    setMessages((current) => [...current, { role: "user", text: clean }, { role: "assistant", text: answer.summary }]);
    setDraft("");
    setHint(0);
  };
  const showVerifiedExample = () => {
    const result = projectile({ speed: 18, angleDeg: 42, height: 0 });
    const answer = createMockTutorAnswer("How far does a ball travel when launched at 18 m/s and 42°?", [{ name: "range", value: Number(result.range.toFixed(2)), unit: "m" }]);
    setMessages((current) => [...current, { role: "user", text: "Show me a verified projectile example" }, { role: "assistant", text: `${answer.summary} Verified range: ${result.range.toFixed(2)} m using the deterministic engine.` }]);
  };
  return <ScreenContainer className="p-5"><View style={{ flex: 1 }}><SectionHeader title="Tutor" subtitle="Reason first. Verify the numbers." /><ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>{messages.map((message, index) => <View key={`${message.role}-${index}`} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%" }}><View style={{ padding: 14, borderRadius: 18, backgroundColor: message.role === "user" ? colors.primary : colors.surface, borderWidth: message.role === "user" ? 0 : 1, borderColor: colors.border }}><Text style={{ color: message.role === "user" ? "#FFFFFF" : colors.foreground, lineHeight: 22 }}>{message.text}</Text></View></View>)}</ScrollView><Card><Text style={{ color: colors.muted, fontSize: 12 }}>Try a focused prompt</Text><View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}><Pressable onPress={() => send("Why does mass not change acceleration due to gravity?")}><Pill label="Concept" /></Pressable><Pressable onPress={showVerifiedExample}><Pill label="Verified example" active /></Pressable><Pressable onPress={() => setHint((value) => Math.min(3, value + 1))}><Pill label={`Hint ${hint || "ladder"}`} /></Pressable></View><View style={{ flexDirection: "row", gap: 8, marginTop: 12, alignItems: "flex-end" }}><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={() => send()} returnKeyType="done" multiline placeholder="Ask a physics question…" placeholderTextColor={colors.muted} style={{ flex: 1, minHeight: 46, maxHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, color: colors.foreground }} /><View style={{ width: 86 }}><PrimaryButton label="Send" onPress={() => send()} /></View></View>{hint > 0 && <Text style={{ marginTop: 10, color: colors.primary }}>Hint {hint}: {hint === 1 ? "Name the target quantity." : hint === 2 ? "Write the governing equation." : "Substitute values only after checking units."}</Text>}</Card></View></ScreenContainer>;
}
