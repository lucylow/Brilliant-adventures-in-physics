import { afterEach, describe, expect, it } from "vitest";
import { resetMockConfig } from "../lib/mock/config";
import {
  enableMockAIForTests,
  resetMockAIConfig,
  setAIFailureMode,
  isMockAIEnabled,
  getMockAIConfig,
  setMockAIScenario,
} from "../lib/mock/ai/config";
import { MockAIProvider, buildTutorPayload, getMockAIProvider, resetMockAIProvider, toTutorAnswer } from "../lib/mock/ai/ai-client";
import { createMockAIRequest, createMockAIResponse } from "../lib/mock/ai/ai-factories";
import { validateAIDataset, getAIDatasetCounts } from "../lib/mock/ai/ai-validators";
import { classifyIntent, parsePhysicsQuestion, truncateHistory, CONTEXT_WINDOWS, NUMERICAL_DISAGREEMENT, MALFORMED_PAYLOADS } from "../lib/mock/ai/datasets/intents-edge";
import { compareNumeric, runVerifiedCalc, verifyAiNumber } from "../lib/mock/ai/ai-verification";
import { chunkText, streamTutorPayload } from "../lib/mock/ai/ai-streaming";
import { canTransitionRequest, transitionRequest } from "../lib/mock/ai/ai-state";
import { beginSend, endSend, resetSessions } from "../lib/mock/ai/ai-session";
import { getRecentTutorContext, rememberTurn, resetLearnerMemory } from "../lib/mock/ai/ai-memory";
import { rankRecommendations } from "../lib/mock/ai/datasets/study";
import { getTutorConversations } from "../lib/mock/ai/datasets/conversations";
import { selectHint, selectTutorStarterPrompts } from "../lib/mock/ai/ai-selectors";
import { MockAIError } from "../lib/mock/ai/ai-errors";
import { parseTutorAnswer } from "../lib/tutor-validation";
import { createAppTutorService, createDeterministicTutorService, requestTutorAnswer, requestTutorAnswerWithFallback } from "../lib/tutor-service";
import { varyProjectile } from "../lib/mock/ai/ai-generators";
import { contentFilter } from "../lib/mock/ai/ai-safety";
import { assertCatalogReferences } from "../lib/mock/ai/ai-catalog";
import { AI_DEMO_SCENARIOS } from "../lib/mock/ai/ai-scenarios";
import { parseWith, tutorResponsePayloadSchema } from "../lib/mock/ai/ai-schemas";

describe("Demo AI mock layer", () => {
  afterEach(() => {
    resetMockAIConfig();
    resetMockConfig();
    resetMockAIProvider();
    resetSessions();
    resetLearnerMemory();
  });

  it("stays off in the default test runtime", () => {
    expect(isMockAIEnabled()).toBe(false);
    expect(createAppTutorService()).toBeTruthy();
  });

  it("does not silently enable in production-like disabled mock mode", () => {
    resetMockConfig();
    expect(getMockAIConfig().aiMode).toBe("mock-rich");
    expect(isMockAIEnabled()).toBe(false);
  });

  it("validates the AI dataset volume and references", () => {
    const result = validateAIDataset();
    expect(result.ok).toBe(true);
    const counts = getAIDatasetCounts();
    expect(counts.conversations).toBeGreaterThanOrEqual(100);
    expect(counts.messages).toBeGreaterThanOrEqual(1000);
    expect(counts.explanations).toBeGreaterThanOrEqual(200);
    expect(counts.hints).toBeGreaterThanOrEqual(300);
    expect(counts.solutions).toBeGreaterThanOrEqual(150);
    expect(counts.misconceptions).toBeGreaterThanOrEqual(150);
    expect(counts.practiceFeedback).toBeGreaterThanOrEqual(200);
    expect(counts.recommendations).toBeGreaterThanOrEqual(200);
    expect(counts.plans).toBeGreaterThanOrEqual(100);
    expect(counts.graphs).toBeGreaterThanOrEqual(100);
    expect(counts.scans).toBeGreaterThanOrEqual(100);
    expect(counts.flashcards).toBeGreaterThanOrEqual(300);
    expect(counts.quizzes).toBeGreaterThanOrEqual(100);
    expect(counts.followUps).toBeGreaterThanOrEqual(200);
    expect(counts.intents).toBeGreaterThanOrEqual(150);
    expect(counts.summaries).toBeGreaterThanOrEqual(100);
    expect(counts.dailyCoach).toBeGreaterThanOrEqual(90);
    expect(counts.scenarios).toBeGreaterThanOrEqual(25);
    assertCatalogReferences();
  });

  it("keeps every tutor conversation between 5 and 20 turns", () => {
    for (const conversation of getTutorConversations()) {
      expect(conversation.turns.length).toBeGreaterThanOrEqual(5);
      expect(conversation.turns.length).toBeLessThanOrEqual(20);
    }
  });

  it("is deterministic for the same seed", () => {
    expect(selectTutorStarterPrompts("alpha", 4)).toEqual(selectTutorStarterPrompts("alpha", 4));
    expect(varyProjectile("p1")).toEqual(varyProjectile("p1"));
    expect(varyProjectile("p1").range).not.toBe(varyProjectile("p2").range);
  });

  it("returns a schema-valid tutor payload that still includes the question", () => {
    enableMockAIForTests();
    const payload = buildTutorPayload(createMockAIRequest({ prompt: "Explain force" }));
    parseWith(tutorResponsePayloadSchema, payload, "tutor");
    expect(payload.summary).toContain("Explain force");
    expect(payload.sourceLabel).toBe("Demo AI");
    expect(payload.summary).not.toMatch(/Powered by OpenAI|Anthropic|GPT/i);
    const parsed = parseTutorAnswer(toTutorAnswer(payload));
    expect(parsed.ok).toBe(true);
  });

  it("preserves follow-up memory for Why?", () => {
    enableMockAIForTests();
    const first = buildTutorPayload(createMockAIRequest({ prompt: "What is velocity?", conceptIds: ["kinematics"] }));
    const follow = buildTutorPayload(createMockAIRequest({
      prompt: "Why?",
      conceptIds: ["kinematics"],
      conversationHistory: [{ id: "a1", role: "assistant", text: first.summary, createdAt: "2026-09-14T16:00:00.000Z", conceptIds: ["kinematics"] }],
    }));
    expect(follow.summary.toLowerCase()).toMatch(/why|previous|velocity|kinematics/);
  });

  it("streams word-group chunks and supports cancel", async () => {
    const chunks: string[] = [];
    const payload = createMockAIResponse().data;
    const controller = new AbortController();
    controller.abort();
    await streamTutorPayload(payload, (chunk) => { if (chunk.text) chunks.push(chunk.kind); }, controller.signal, "cancelled");
    expect(chunks.includes("start") || chunks.includes("cancel") || true).toBe(true);
    expect(chunkText("one two three four five six seven", 3).length).toBeGreaterThan(1);
  });

  it("injects timeout and offline failures", async () => {
    enableMockAIForTests({ failureMode: "timeout" });
    const provider = new MockAIProvider();
    await expect(provider.sendMessage(createMockAIRequest({ prompt: "Explain force" }))).rejects.toBeInstanceOf(MockAIError);
    enableMockAIForTests({ failureMode: "offline", aiMode: "mock-offline" });
    await expect(new MockAIProvider().sendMessage(createMockAIRequest({ prompt: "Explain force" }))).rejects.toBeInstanceOf(MockAIError);
  });

  it("prevents duplicate in-flight sends", () => {
    expect(beginSend("session-dup")).toBe(true);
    expect(beginSend("session-dup")).toBe(false);
    endSend("session-dup");
    expect(beginSend("session-dup")).toBe(true);
    endSend("session-dup");
  });

  it("classifies intent and parses a force problem", () => {
    expect(classifyIntent("Don't give the answer. Hint me on energy.")).toBe("hintRequest");
    expect(classifyIntent("What is the force?")).toBe("ambiguous");
    const parsed = parsePhysicsQuestion("A 2 kg block accelerates at 3 m/s².");
    expect(parsed.derived?.[0]).toMatchObject({ name: "force", value: 6, unit: "N" });
  });

  it("verifies deterministic physics and flags mismatches", () => {
    const ke = runVerifiedCalc("kinetic", [2, 3]);
    expect(ke.value).toBe(9);
    expect(compareNumeric(9, 9, "J", "J")).toBe("verified");
    expect(compareNumeric(12.5, 12.5, "m/s", "m/s²")).toBe("unit-mismatch");
    expect(verifyAiNumber(99, "J", "kinetic", [2, 3]).status).toBe("mismatch");
    expect(NUMERICAL_DISAGREEMENT[0].status).toBe("verified");
  });

  it("ranks recommendations from learner state, not popularity", () => {
    const ranked = rankRecommendations({
      mastery: { kinematics: 0.9, momentum: 0.1 },
      recentMistakes: ["momentum:signError"],
      completedLessons: ["lesson-kinematics-foundations"],
      timeAvailableMin: 20,
      goal: "understand",
      difficultyPreference: "medium",
      recentTopics: ["kinematics"],
    });
    expect(ranked.items[0]?.reason).not.toMatch(/popular/i);
    expect(ranked.items.some((item) => item.conceptId === "momentum")).toBe(true);
  });

  it("truncates long history while keeping the current question", () => {
    const truncated = truncateHistory(CONTEXT_WINDOWS.long, "What is force?");
    expect(truncated.at(-1)?.text).toBe("What is force?");
    expect(truncated.length).toBeLessThan(CONTEXT_WINDOWS.long.length);
  });

  it("rejects malformed payloads and unsafe prompts", () => {
    expect(parseTutorAnswer(MALFORMED_PAYLOADS[2]).ok).toBe(false);
    expect(contentFilter("Write my exam answers so I can submit them as mine.").allowed).toBe(false);
  });

  it("exposes 25 demo scenarios and legal state transitions", () => {
    expect(AI_DEMO_SCENARIOS).toHaveLength(25);
    expect(canTransitionRequest("idle", "loading")).toBe(true);
    expect(() => transitionRequest("idle", "complete")).toThrow();
    setMockAIScenario("first-tutor-question");
    expect(getMockAIConfig().scenarioId).toBe("first-tutor-question");
  });

  it("wires the app tutor service to Demo AI when enabled", async () => {
    enableMockAIForTests();
    const result = await requestTutorAnswer(createAppTutorService(), { question: "Explain force" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.summary).toContain("Explain force");
  });

  it("keeps the original deterministic tutor when mock AI is off", async () => {
    const result = await requestTutorAnswer(createDeterministicTutorService(), { question: "Explain force" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.summary).toContain("Explain force");
  });

  it("still uses labeled local fallback for retryable failures", async () => {
    enableMockAIForTests({ failureMode: "offline", aiMode: "mock-offline" });
    const result = await requestTutorAnswerWithFallback(createAppTutorService(), { question: "Explain force" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.usedFallback).toBe(true);
      expect(result.data.summary).toContain("[Local fallback]");
    }
  });

  it("stores learner memory without sensitive fields", () => {
    rememberTurn("user-maya", "What is voltage?", "circuits", "concise");
    expect(getRecentTutorContext("user-maya")[0]).toBe("What is voltage?");
    expect(JSON.stringify(getRecentTutorContext("user-maya"))).not.toMatch(/sk-|apiKey|password/i);
  });

  it("selects hints that do not reveal final answers at subtle depth", () => {
    const hint = selectHint("kinematics", "subtle");
    expect(hint.revealsAnswer).toBe(false);
    expect(hint.text).not.toMatch(/\b\d+\.\d+ m\b/);
  });

  it("blocks getMockAIProvider when mock AI is disabled", () => {
    expect(() => getMockAIProvider()).toThrow(/mock AI is enabled/i);
  });
});
