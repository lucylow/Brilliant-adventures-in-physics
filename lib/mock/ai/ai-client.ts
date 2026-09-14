import { sanitizeText, type TutorAnswer } from "@/lib/ai";
import { CATALOG, EXPLAIN_VARIANTS, explanationText, type CatalogTopic } from "./ai-catalog";
import { MockAIError } from "./ai-errors";
import { createMockAIMeta, wrapMockAI } from "./ai-factories";
import { waitMockAILatency } from "./ai-latency";
import { getPreferredExplanationStyle, rememberTurn } from "./ai-memory";
import { contentFilter } from "./ai-safety";
import { parseWith, tutorResponsePayloadSchema } from "./ai-schemas";
import { beginSend, boundedSessionContext, endSend, appendSessionTurn, getSessionTurns } from "./ai-session";
import { streamTutorPayload, type StreamScenarioId } from "./ai-streaming";
import { verifyTopicCalculation } from "./ai-verification";
import { getMockAIConfig, isMockAIEnabled } from "./config";
import { AMBIGUOUS_QUESTIONS, classifyIntent, parsePhysicsQuestion } from "./datasets/intents-edge";
import { getHints } from "./datasets/libraries";
import { getPracticeFeedback } from "./datasets/practice";
import { getScanAnalyses } from "./datasets/scans-graphs";
import { rankRecommendations } from "./datasets/study";
import { styleById } from "./ai-styles";
import { MOCK_AI_PROVIDER_LABEL, type AIProvider, type ExplanationResponse, type HintResponse, type MockAIRequest, type MockAIWrapped, type PracticeFeedbackResponse, type ProblemAnalysisResponse, type RecommendationResponse, type ScanAnalysisResponse, type StreamChunk, type TutorResponsePayload } from "./ai-types";
import { validatePromptInput } from "./ai-cache";

function topicFromRequest(request: MockAIRequest): CatalogTopic {
  const hinted = request.conceptIds[0];
  const byId = CATALOG.find((item) => item.conceptId === hinted || item.id === hinted);
  if (byId) return byId;
  const text = request.prompt.toLowerCase();
  const hit = CATALOG.find((item) => text.includes(item.title.toLowerCase()) || text.includes(item.conceptId) || item.starters.some((starter) => text.includes(starter.toLowerCase().slice(0, 18))));
  return hit ?? CATALOG.find((item) => item.id === "projectile-split") ?? CATALOG[0];
}

function applyFailure(signal?: AbortSignal): void {
  if (signal?.aborted) throw new MockAIError("cancelled");
  if (!isMockAIEnabled()) throw new MockAIError("unauthorized");
  const config = getMockAIConfig();
  if (config.aiMode === "mock-offline" || config.failureMode === "offline") throw new MockAIError("offline");
  if (config.failureMode === "timeout") throw new MockAIError("timeout");
  if (config.failureMode === "network") throw new MockAIError("offline");
  if (config.failureMode === "rateLimit") throw new MockAIError("rateLimited");
  if (config.failureMode === "malformed") throw new MockAIError("malformedResponse");
  if (config.failureMode === "provider" || config.aiMode === "mock-error") throw new MockAIError("providerError");
}

function lastUserConcept(request: MockAIRequest, topic: CatalogTopic): string {
  const previous = [...request.conversationHistory].reverse().find((turn) => turn.role === "assistant");
  if (!previous) return topic.title;
  return previous.conceptIds?.[0] ? CATALOG.find((item) => item.conceptId === previous.conceptIds?.[0])?.title ?? topic.title : topic.title;
}

export function buildTutorPayload(request: MockAIRequest): TutorResponsePayload {
  const valid = validatePromptInput(request.prompt);
  if (!valid.ok) throw new MockAIError("badRequest");
  const filter = contentFilter(valid.prompt);
  if (!filter.allowed) {
    return {
      summary: `${filter.reason} Demo AI only supports physics learning questions.`,
      concept: "Out of scope",
      steps: [{ label: "Stay in the curriculum", detail: "Ask about a concept, problem, graph, scan, or experiment." }],
      equations: [],
      verifiedValues: [],
      hint: "Which physics quantity are you asking about?",
      nextAction: "Open Tutor with a kinematics, energy, or circuits question.",
      confidence: 0.2,
      followUps: ["What is velocity?", "A ball is launched at 18 m/s at 42°. What is the range?"],
      style: "concise",
      reasoning: { identifiedQuantities: [], selectedPrinciple: "safety boundary", equationUsed: "n/a", unitCheck: "n/a", resultCheck: "n/a" },
      sourceLabel: MOCK_AI_PROVIDER_LABEL,
    };
  }
  const intent = classifyIntent(valid.prompt);
  if (intent === "ambiguous" || AMBIGUOUS_QUESTIONS.some((item) => item.prompt.toLowerCase() === valid.prompt.toLowerCase())) {
    const clarification = AMBIGUOUS_QUESTIONS.find((item) => item.prompt.toLowerCase() === valid.prompt.toLowerCase())?.clarification
      ?? "Add the system, the unknown, and at least one known with a unit.";
    return {
      summary: `I need a clearer physics question. ${clarification}`,
      concept: "Clarification",
      steps: [{ label: "Add context", detail: clarification }],
      equations: [],
      verifiedValues: [],
      hint: "Name the unknown and one known with its unit.",
      nextAction: "Resend with a complete problem or concept name.",
      confidence: 0.4,
      followUps: ["A 2 kg block accelerates at 3 m/s². What is the net force?", "What is the difference between speed and velocity?"],
      style: "socratic",
      reasoning: { identifiedQuantities: [], selectedPrinciple: "insufficient context", equationUsed: "n/a", unitCheck: "n/a", resultCheck: "asked for clarification" },
      sourceLabel: MOCK_AI_PROVIDER_LABEL,
    };
  }
  const topic = topicFromRequest({ ...request, prompt: valid.prompt });
  const followUp = /^(why\??|can you show me\??|what changes if mass doubles\??)$/i.test(valid.prompt.trim());
  const previousTitle = lastUserConcept(request, topic);
  const style = styleById(request.style ?? getPreferredExplanationStyle(request.userId));
  const verified = verifyTopicCalculation(topic);
  const parsed = parsePhysicsQuestion(valid.prompt);
  const verifiedValues = parsed.entities.length ? parsed.entities : topic.example.known;
  const summaryCore = followUp
    ? `You asked “${sanitizeText(valid.prompt)}” about the previous idea (${previousTitle} / ${topic.title}). ${topic.intuitionFirst}`
    : `Let’s break down “${sanitizeText(valid.prompt)}” using ${topic.title}. ${style.render(topic, "Keep knowns, principle, and a unit check visible.")}`;
  const payload: TutorResponsePayload = {
    summary: `${summaryCore} ${verified ? `Verified ${verified.name} = ${verified.value} ${verified.unit}.` : ""}`.trim(),
    concept: topic.title,
    steps: [
      { label: "Identify the knowns", detail: verifiedValues.map((item) => `${item.name} = ${item.value} ${item.unit}`).join("; ") || "Write each value with its unit." },
      { label: "Choose the principle", detail: topic.example.principle },
      { label: "Verify the result", detail: verified ? `${verified.principle} via the deterministic engine.` : "No numerical claim is being treated as a live provider result." },
    ],
    equations: [topic.equation],
    verifiedValues,
    hint: topic.followUps[0] ?? "What quantity is unknown?",
    nextAction: `Try ${topic.simulationId} or a related practice item.`,
    confidence: verified ? 0.93 : 0.8,
    followUps: topic.followUps,
    style: style.id,
    reasoning: {
      identifiedQuantities: verifiedValues.map((item) => `${item.name} = ${item.value} ${item.unit}`),
      selectedPrinciple: topic.example.principle,
      equationUsed: topic.equation,
      unitCheck: `Unknown ${topic.example.unknown} must match ${topic.equation}.`,
      resultCheck: verified ? `Deterministic value ${verified.value} ${verified.unit}.` : "Explanation only.",
    },
    visual: {
      visualType: "simulation",
      simulationId: topic.simulationId,
      highlightedVariables: topic.example.known.map((item) => item.name),
      animationSuggestion: topic.experiment.name,
    },
    sourceLabel: MOCK_AI_PROVIDER_LABEL,
  };
  return parseWith(tutorResponsePayloadSchema, payload, "TutorResponse") as TutorResponsePayload;
}

export function toTutorAnswer(payload: TutorResponsePayload): TutorAnswer {
  return {
    summary: payload.summary,
    concept: payload.concept,
    steps: payload.steps,
    equations: payload.equations,
    verifiedValues: payload.verifiedValues,
    hint: payload.hint,
    nextAction: payload.nextAction,
    confidence: payload.confidence,
  };
}

export class MockAIProvider implements AIProvider {
  async sendMessage(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<TutorResponsePayload>> {
    if (!beginSend(request.sessionId)) throw new MockAIError("badRequest");
    try {
      applyFailure(signal);
      await waitMockAILatency(signal);
      const payload = buildTutorPayload({ ...request, conversationHistory: boundedSessionContext(request.sessionId, request.prompt) });
      appendSessionTurn(request.sessionId, { id: `${request.requestId}-u`, role: "user", text: request.prompt, createdAt: createMockAIMeta().createdAt, conceptIds: request.conceptIds });
      appendSessionTurn(request.sessionId, { id: `${request.requestId}-a`, role: "assistant", text: payload.summary, createdAt: createMockAIMeta().createdAt, conceptIds: [topicFromRequest(request).conceptId] });
      rememberTurn(request.userId, request.prompt, topicFromRequest(request).conceptId, payload.style);
      return wrapMockAI(payload, {
        requestId: request.requestId,
        responseType: "tutor",
        conceptIds: [topicFromRequest(request).conceptId],
        confidence: payload.confidence,
        sourceType: payload.verifiedValues.length ? "verifiedCalculation" : "educationalExplanation",
        verificationStatus: verifyTopicCalculation(topicFromRequest(request)) ? "verified" : "not-applicable",
        style: payload.style,
      });
    } finally {
      endSend(request.sessionId);
    }
  }

  async generateExplanation(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<ExplanationResponse>> {
    applyFailure(signal);
    await waitMockAILatency(signal);
    const topic = topicFromRequest(request);
    const variant = EXPLAIN_VARIANTS[Math.abs(request.prompt.length) % EXPLAIN_VARIANTS.length];
    const data: ExplanationResponse = {
      conceptId: topic.conceptId,
      learnerLevel: variant === "kid-friendly" ? "kid-friendly" : "high-school",
      style: variant,
      summary: topic.oneSentence,
      intuition: topic.intuitionFirst,
      formalExplanation: explanationText(topic, variant),
      equations: [topic.equation],
      example: topic.example.prompt,
      commonMistake: topic.commonMistake,
      followUp: topic.followUps[0],
    };
    return wrapMockAI(data, { requestId: request.requestId, responseType: "explanation", conceptIds: [topic.conceptId] });
  }

  async generateHint(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<HintResponse>> {
    applyFailure(signal);
    await waitMockAILatency(signal);
    const topic = topicFromRequest(request);
    const depth = request.hintDepth ?? "subtle";
    const hint = getHints().find((item) => item.conceptId === topic.conceptId && item.depth === depth) ?? getHints()[0];
    return wrapMockAI(hint, { requestId: request.requestId, responseType: "hint", conceptIds: [topic.conceptId] });
  }

  async analyzeProblem(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<ProblemAnalysisResponse>> {
    applyFailure(signal);
    await waitMockAILatency(signal);
    const topic = topicFromRequest(request);
    return wrapMockAI({
      problemId: request.problemId ?? topic.id,
      conceptId: topic.conceptId,
      understanding: topic.beginner,
      knownValues: topic.example.known,
      unknown: topic.example.unknown,
      principle: topic.example.principle,
      ambiguities: [],
    }, { requestId: request.requestId, responseType: "problem", conceptIds: [topic.conceptId] });
  }

  async analyzeImage(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<ScanAnalysisResponse>> {
    applyFailure(signal);
    await waitMockAILatency(signal);
    const scans = getScanAnalyses();
    const match = scans.find((item) => item.mockImageReference === request.imageReference) ?? scans[0];
    return wrapMockAI(match, { requestId: request.requestId, responseType: "scan", conceptIds: request.conceptIds, confidence: match.confidence, confidenceBand: match.confidenceBand });
  }

  async generatePracticeFeedback(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<PracticeFeedbackResponse>> {
    applyFailure(signal);
    await waitMockAILatency(signal);
    const topic = topicFromRequest(request);
    const feedback = getPracticeFeedback().find((item) => item.conceptId === topic.conceptId) ?? getPracticeFeedback()[0];
    return wrapMockAI(feedback, { requestId: request.requestId, responseType: "feedback", conceptIds: [topic.conceptId] });
  }

  async generateRecommendations(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<RecommendationResponse>> {
    applyFailure(signal);
    await waitMockAILatency(signal);
    const ranked = rankRecommendations({
      mastery: { kinematics: 0.8, momentum: 0.3 },
      recentMistakes: ["momentum:signError"],
      completedLessons: ["lesson-kinematics-foundations"],
      timeAvailableMin: 25,
      goal: "understand",
      difficultyPreference: "medium",
      recentTopics: ["kinematics"],
    });
    return wrapMockAI(ranked, { requestId: request.requestId, responseType: "recommendation", conceptIds: ranked.items.map((item) => item.conceptId) });
  }

  async streamMessage(request: MockAIRequest, onChunk: (chunk: StreamChunk) => void, signal?: AbortSignal): Promise<MockAIWrapped<TutorResponsePayload>> {
    applyFailure(signal);
    const payload = buildTutorPayload(request);
    const scenario: StreamScenarioId = getMockAIConfig().aiMode === "mock-streaming" ? "normal" : "fast";
    await streamTutorPayload(payload, onChunk, signal, scenario);
    return wrapMockAI(payload, { requestId: request.requestId, responseType: "tutor-stream", conceptIds: [topicFromRequest(request).conceptId] });
  }
}

let singleton: MockAIProvider | null = null;

export function getMockAIProvider(): MockAIProvider {
  if (!isMockAIEnabled()) {
    throw new Error("getMockAIProvider() is blocked unless mock AI is enabled");
  }
  singleton ??= new MockAIProvider();
  return singleton;
}

export function resetMockAIProvider(): void {
  singleton = null;
}

export { getSessionTurns };
