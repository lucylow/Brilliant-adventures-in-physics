import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { BavButton, BavIconButton, BavTextField, BodySmall, Caption, Heading1 } from "@/components/bav";
import { BavCard } from "@/components/bav/BavCard";
import { BavChip } from "@/components/bav/BavChrome";
import { BavTutorCard, BavTutorMessage } from "@/components/bav/BavTutor";
import { layout, spacing } from "@/lib/design-system";
import { useColors } from "@/hooks/use-colors";
import type { TutorMessageKind, TutorViewModel } from "@/lib/view-models/tutor";

export function TutorHeader({
  subtitle,
  remaining,
  limit,
}: {
  subtitle: string;
  remaining: number;
  limit: number;
}) {
  return (
    <View style={{ paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm, paddingBottom: spacing.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Heading1>Ask Bavi</Heading1>
          <BodySmall tone="secondary">{subtitle}</BodySmall>
        </View>
        <Caption tone={remaining ? "info" : "warning"}>
          {remaining}/{limit}
        </Caption>
      </View>
    </View>
  );
}

export function TutorThread({
  messages,
  onOpenSimulation,
  onOpenPractice,
}: {
  messages: TutorViewModel["messages"];
  onOpenSimulation: () => void;
  onOpenPractice: () => void;
}) {
  return (
    <View style={{ gap: spacing.sm, paddingHorizontal: layout.screenPadding }}>
      {messages.map((message) => {
        if (message.kind === "user" || message.kind === "assistant") {
          return (
            <BavTutorMessage key={message.id} role={message.kind}>
              {message.text}
            </BavTutorMessage>
          );
        }
        return (
          <BavTutorCard
            key={message.id}
            kind={cardKind(message.kind)}
            title={cardTitle(message.kind, message.verified)}
            body={message.text}
            equation={message.equation}
            values={message.values}
            actionLabel={message.kind === "simulation" ? "Open lab" : message.kind === "practice" ? "Practice this" : undefined}
            onAction={message.kind === "simulation" ? onOpenSimulation : message.kind === "practice" ? onOpenPractice : undefined}
          />
        );
      })}
    </View>
  );
}

export function TutorInputBar({
  draft,
  onChange,
  onSend,
  inputState,
  placeholder,
  sendLabel,
  questionLabel,
}: {
  draft: string;
  onChange: (value: string) => void;
  onSend: () => void;
  inputState: TutorViewModel["inputState"];
  placeholder: string;
  sendLabel: string;
  questionLabel: string;
}) {
  const disabled = inputState === "disabled" || inputState === "sending";
  return (
    <View style={{ paddingHorizontal: layout.screenPadding, paddingBottom: spacing.md, gap: spacing.sm }}>
      <BavTextField
        value={draft}
        onChangeText={onChange}
        placeholder={placeholder}
        accessibilityLabel={questionLabel}
        multiline
        editable={!disabled}
        error={inputState === "error" ? "Message could not send. Your draft is unchanged." : undefined}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <BavIconButton icon="camera" accessibilityLabel="Scan a problem" onPress={() => router.push("/scan" as never)} disabled={disabled} />
        <BavIconButton icon="attach" accessibilityLabel="Attach a scan" onPress={() => router.push("/scan" as never)} disabled={disabled} />
        <View style={{ flex: 1 }}>
          <BavButton label={inputState === "sending" ? "Checking…" : sendLabel} disabled={disabled} loading={inputState === "sending"} onPress={onSend} />
        </View>
      </View>
    </View>
  );
}

export function TutorPromptRow({
  prompts,
  onPrompt,
  disabled,
}: {
  prompts: string[];
  onPrompt: (prompt: string) => void;
  disabled: boolean;
}) {
  if (prompts.length === 0) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: layout.screenPadding }}>
      {prompts.map((prompt) => (
        <BavChip key={prompt} label={prompt.slice(0, 32)} disabled={disabled} onPress={() => onPrompt(prompt)} />
      ))}
    </View>
  );
}

export function TutorSessionList({
  sessions,
}: {
  sessions: { id: string; title: string; subtitle: string }[];
}) {
  const colors = useColors();
  if (sessions.length === 0) {
    return (
      <BavCard>
        <Caption tone="muted">No Tutor sessions yet</Caption>
        <BodySmall tone="secondary">Ask a physics question to start a conversation with Bavi.</BodySmall>
      </BavCard>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      {sessions.map((session) => (
        <Pressable key={session.id} accessibilityRole="button" accessibilityLabel={session.title} style={{ minHeight: 44 }}>
          <Caption style={{ color: colors.primary }}>{session.title}</Caption>
          <BodySmall tone="secondary">{session.subtitle}</BodySmall>
        </Pressable>
      ))}
    </View>
  );
}

function cardKind(kind: TutorMessageKind): "verified" | "idea" | "hint" | "try" | "simulation" | "practice" {
  if (kind === "verified") return "verified";
  if (kind === "hint") return "hint";
  if (kind === "simulation") return "simulation";
  if (kind === "practice") return "practice";
  return "idea";
}

function cardTitle(kind: TutorMessageKind, verified: boolean): string {
  if (kind === "verified" && verified) return "Verified calculation";
  if (kind === "hint") return "Hint";
  if (kind === "simulation") return "Related simulation";
  if (kind === "practice") return "Practice this";
  if (kind === "equation") return "Key idea";
  return "Key idea";
}
