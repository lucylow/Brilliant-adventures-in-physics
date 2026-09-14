import { getMockNowIso, isoDaysAgo } from "../clock";
import { clone } from "../utils/clone";
import { stableId } from "../utils/ids";
import { createSeededRandom } from "../utils/rng";
import { CATALOG, type CatalogTopic } from "./ai-catalog";
import { MOCK_AI_PROVIDER_LABEL, type AIConfidenceBand, type DifficultyBand, type MockAIFeature, type MockAIRequest, type MockAIResponseMeta, type MockAITurn, type MockAIWrapped, type SourceType, type TutorResponsePayload, type TutorResponseStyle, type VerificationStatus } from "./ai-types";
import { getMockAIConfig } from "./config";

let requestCounter = 0;

export function nextRequestId(prefix = "req"): string {
  requestCounter += 1;
  return stableId(prefix, `${getMockAIConfig().seed}-${requestCounter}`);
}

export function resetRequestCounter(): void {
  requestCounter = 0;
}

export function createMockAIRequest(overrides: Partial<MockAIRequest> = {}): MockAIRequest {
  const prompt = overrides.prompt ?? "Explain projectile motion using knowns, a principle, and a unit check.";
  return clone({
    requestId: overrides.requestId ?? nextRequestId("aireq"),
    userId: overrides.userId ?? "user-maya",
    sessionId: overrides.sessionId ?? "session-demo-tutor",
    feature: (overrides.feature ?? "tutor") as MockAIFeature,
    prompt,
    context: overrides.context,
    conceptIds: overrides.conceptIds ?? ["kinematics"],
    problemId: overrides.problemId,
    lessonId: overrides.lessonId,
    simulationId: overrides.simulationId,
    imageReference: overrides.imageReference,
    conversationHistory: overrides.conversationHistory ?? [],
    personaId: overrides.personaId,
    style: overrides.style,
    hintDepth: overrides.hintDepth,
    explainLike: overrides.explainLike,
    difficulty: overrides.difficulty,
    scenarioId: overrides.scenarioId,
  });
}

export function createMockAITurn(overrides: Partial<MockAITurn> = {}): MockAITurn {
  return clone({
    id: overrides.id ?? stableId("turn", overrides.text ?? "blank"),
    role: overrides.role ?? "user",
    text: overrides.text ?? "Why?",
    createdAt: overrides.createdAt ?? getMockNowIso(),
    state: overrides.state ?? "sent",
    conceptIds: overrides.conceptIds,
  });
}

export function bandFromConfidence(confidence: number): AIConfidenceBand {
  if (confidence >= 0.92) return "veryHigh";
  if (confidence >= 0.8) return "high";
  if (confidence >= 0.55) return "medium";
  if (confidence > 0) return "low";
  return "failed";
}

export function createMockAIMeta(overrides: Partial<MockAIResponseMeta> = {}): MockAIResponseMeta {
  const confidence = overrides.confidence ?? 0.84;
  const config = getMockAIConfig();
  return {
    requestId: overrides.requestId ?? nextRequestId("meta"),
    scenarioId: overrides.scenarioId ?? config.scenarioId,
    providerMode: overrides.providerMode ?? config.aiMode,
    createdAt: overrides.createdAt ?? getMockNowIso(),
    latencyMs: overrides.latencyMs ?? 0,
    confidence,
    confidenceBand: overrides.confidenceBand ?? bandFromConfidence(confidence),
    responseType: overrides.responseType ?? "tutor",
    conceptIds: overrides.conceptIds ?? ["kinematics"],
    sourceType: (overrides.sourceType ?? "mockGeneratedText") as SourceType,
    isMock: true,
    modelLabel: MOCK_AI_PROVIDER_LABEL,
    verificationStatus: (overrides.verificationStatus ?? "not-applicable") as VerificationStatus,
    personaId: overrides.personaId,
    style: overrides.style,
  };
}

export function wrapMockAI<T>(data: T, meta: Partial<MockAIResponseMeta> = {}): MockAIWrapped<T> {
  return { data: clone(data), meta: createMockAIMeta(meta) };
}

export function createMockAIResponse(overrides: {
  type?: "hint" | "tutor" | "explanation";
  confidence?: number;
  conceptId?: string;
  summary?: string;
  style?: TutorResponseStyle;
} = {}): MockAIWrapped<TutorResponsePayload> {
  const topic: CatalogTopic = CATALOG.find((item) => item.conceptId === (overrides.conceptId ?? "kinematics")) ?? CATALOG[0];
  const summary = overrides.summary ?? `Let’s break down “${topic.title}” into knowns, an equation, and a check.`;
  const payload: TutorResponsePayload = {
    summary,
    concept: topic.title,
    steps: [
      { label: "Identify the knowns", detail: `Start from the quantities in ${topic.example.prompt}` },
      { label: "Choose the principle", detail: topic.example.principle },
      { label: "Verify the result", detail: "Check units, sign, and whether the magnitude is physically reasonable." },
    ],
    equations: [topic.equation],
    verifiedValues: topic.example.known,
    hint: topic.followUps[0] ?? "What quantity is unknown?",
    nextAction: `Open ${topic.simulationId} or try a related practice item.`,
    confidence: overrides.confidence ?? 0.86,
    followUps: topic.followUps,
    style: overrides.style ?? "standard",
    reasoning: {
      identifiedQuantities: topic.example.known.map((item) => `${item.name} = ${item.value} ${item.unit}`),
      selectedPrinciple: topic.example.principle,
      equationUsed: topic.equation,
      unitCheck: `The unknown ${topic.example.unknown} must carry a unit consistent with ${topic.equation}.`,
      resultCheck: "Compare the magnitude with everyday scale and with a deterministic calculation when numbers exist.",
    },
    visual: {
      visualType: "simulation",
      simulationId: topic.simulationId,
      highlightedVariables: topic.example.known.map((item) => item.name),
      animationSuggestion: `Watch ${topic.title} in ${topic.simulationId}.`,
    },
    sourceLabel: MOCK_AI_PROVIDER_LABEL,
  };
  return wrapMockAI(payload, {
    confidence: payload.confidence,
    responseType: overrides.type ?? "tutor",
    conceptIds: [topic.conceptId],
    sourceType: "educationalExplanation",
  });
}

export function pickCatalog(seed: string | number): CatalogTopic {
  const rng = createSeededRandom(seed);
  return rng.randomChoice(CATALOG);
}

export function isoForTurn(index: number): string {
  return isoDaysAgo(0, Math.max(0, 8 - index * 0.15));
}

export type DifficultyProfile = {
  id: DifficultyBand;
  steps: number;
  scaffolding: "full" | "partial" | "minimal";
  distractions: number;
  extraConcepts: number;
  numericComplexity: "simple" | "mixed" | "messy";
};

export const DIFFICULTY_PROFILES: DifficultyProfile[] = [
  { id: "intro", steps: 2, scaffolding: "full", distractions: 0, extraConcepts: 0, numericComplexity: "simple" },
  { id: "easy", steps: 3, scaffolding: "full", distractions: 0, extraConcepts: 0, numericComplexity: "simple" },
  { id: "medium", steps: 4, scaffolding: "partial", distractions: 1, extraConcepts: 1, numericComplexity: "mixed" },
  { id: "hard", steps: 6, scaffolding: "minimal", distractions: 2, extraConcepts: 2, numericComplexity: "mixed" },
  { id: "challenge", steps: 8, scaffolding: "minimal", distractions: 3, extraConcepts: 2, numericComplexity: "messy" },
];
