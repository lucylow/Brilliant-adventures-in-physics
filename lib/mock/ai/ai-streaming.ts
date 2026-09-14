import { MOCK_AI_PROVIDER_LABEL, type StreamChunk, type TutorResponsePayload } from "./ai-types";

export type StreamHandlers = {
  onChunk?: (chunk: StreamChunk) => void;
};

const STREAM_SCENARIOS = ["fast", "normal", "slow", "stalled", "partial", "cancelled", "provider-error", "malformed"] as const;
export type StreamScenarioId = (typeof STREAM_SCENARIOS)[number];

export function chunkText(text: string, wordsPerChunk = 6): string[] {
  const tokens = text.split(/(\s+)/).filter((token) => token.length > 0);
  const chunks: string[] = [];
  for (let index = 0; index < tokens.length; index += wordsPerChunk) {
    chunks.push(tokens.slice(index, index + wordsPerChunk).join(""));
  }
  return chunks.length ? chunks : [text];
}

export async function streamTutorPayload(
  payload: TutorResponsePayload,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal,
  scenario: StreamScenarioId = "normal",
): Promise<void> {
  if (signal?.aborted) {
    onChunk({ kind: "cancel" });
    return;
  }
  onChunk({ kind: "start", text: MOCK_AI_PROVIDER_LABEL });
  if (scenario === "provider-error") {
    onChunk({ kind: "error", error: { code: "providerError", userMessage: "Demo AI stream failed.", developerMessage: "Injected stream error", retryable: true, fallbackAvailable: true, suggestedAction: "Retry" } });
    return;
  }
  if (scenario === "malformed") {
    onChunk({ kind: "chunk", index: 0, text: "{" });
    onChunk({ kind: "complete", text: "{" });
    return;
  }
  const pieces = chunkText(payload.summary, scenario === "fast" ? 12 : 6);
  const limit = scenario === "partial" ? Math.max(1, Math.floor(pieces.length / 2)) : pieces.length;
  for (let index = 0; index < limit; index += 1) {
    if (signal?.aborted || scenario === "cancelled") {
      onChunk({ kind: "cancel" });
      return;
    }
    if (scenario === "stalled" && index === 1) {
      continue;
    }
    onChunk({ kind: "chunk", index, text: pieces[index] });
  }
  if (scenario === "partial") return;
  onChunk({ kind: "complete", text: payload.summary });
}

export { STREAM_SCENARIOS };
