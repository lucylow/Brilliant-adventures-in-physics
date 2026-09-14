import { afterEach, describe, expect, it } from "vitest";
import { resetMockConfig } from "../lib/mock/config";
import { enableMockAIForTests, resetMockAIConfig, isMockAIEnabled } from "../lib/mock/ai/config";
import { buildTutorPayload, resetMockAIProvider } from "../lib/mock/ai/ai-client";
import { createMockAIRequest } from "../lib/mock/ai/ai-factories";
import { resetSessions } from "../lib/mock/ai/ai-session";
import { resetLearnerMemory } from "../lib/mock/ai/ai-memory";
import { projectile } from "../lib/physics";
import {
  allLearnerModels,
  createBeginnerLearnerModel,
  createExamLearnerModel,
  createHighPerformerLearnerModel,
  createStrugglingLearnerModel,
  applyLearnerEvent,
} from "../lib/mock/ai/expansion/learner-model";
import { findPrerequisites, findRelatedConcepts, findCommonMistakes, findSimulationForConcept } from "../lib/mock/ai/expansion/knowledge-graph";
import { buildTutorContext, contextWindowsDemo, scoreRelevance } from "../lib/mock/ai/expansion/context";
import {
  getLongTermMemory,
  retrieveRelevantMemory,
  processMemoryEvent,
  resetAIMemory,
  resetAIUserState,
} from "../lib/mock/ai/expansion/memory-store";
import { personalizeExplanation, personalizeHint, selectTeachingStrategy } from "../lib/mock/ai/expansion/personalize";
import { selectNextDifficulty, DIFFICULTY_SCENARIOS, decideIntervention, calibrationNote } from "../lib/mock/ai/expansion/adaptive";
import { classifyMisconception, getMisconceptionPatterns } from "../lib/mock/ai/expansion/misconceptions";
import { classifyDialogueIntent, getClarificationPrompts, getConversationBranches, getSocraticTrees } from "../lib/mock/ai/expansion/dialogue";
import { extractEntities, normalizeEntity } from "../lib/mock/ai/expansion/entities";
import { getStructuredProblems } from "../lib/mock/ai/expansion/problems";
import { getWhatIfScenarios } from "../lib/mock/ai/expansion/what-if";
import { getHallucinationDemos, getGoldenResponses, GUARDRAIL_LIBRARY } from "../lib/mock/ai/expansion/evaluation";
import { keywordSimilarity, pageStressMessages, searchTutorHistoryV3 } from "../lib/mock/ai/expansion/search";
import {
  setAIDemoShowcase,
  resetAIScenarios,
  getEndToEndFlows,
  learnerIdForTestUser,
} from "../lib/mock/ai/expansion/orchestration";
import { generateTutorJourney, validateJourneyConsistency } from "../lib/mock/ai/expansion/journeys";
import { validateExpansionLayer, getExpansionCounts, expansionTestMatrix } from "../lib/mock/ai/expansion/validators";
import { redactDiagnosticInput } from "../lib/mock/ai/expansion/residuals";
import { rankWhatNext } from "../lib/mock/ai/expansion/study";
import { inspectExpansion } from "../lib/mock/ai/expansion/debug";
import { pickRaceWinner } from "../lib/mock/ai/expansion/race";

describe("Demo AI expansion III", () => {
  afterEach(() => {
    resetMockAIConfig();
    resetMockConfig();
    resetMockAIProvider();
    resetSessions();
    resetLearnerMemory();
    resetAIUserState();
    resetAIScenarios();
  });

  it("does not replace the production-off default", () => {
    expect(isMockAIEnabled()).toBe(false);
    expect(inspectExpansion()).toMatchObject({ enabled: false });
  });

  it("validates the expansion layer volume and references", () => {
    const result = validateExpansionLayer();
    expect(result.ok).toBe(true);
    const counts = result.counts;
    expect(counts.learnerModels).toBe(9);
    expect(counts.intents).toBeGreaterThanOrEqual(500);
    expect(counts.clarifications).toBeGreaterThanOrEqual(250);
    expect(counts.misconceptionPatterns).toBeGreaterThanOrEqual(200);
    expect(counts.socraticTrees).toBeGreaterThanOrEqual(50);
    expect(counts.conversationBranches).toBeGreaterThanOrEqual(50);
    expect(counts.structuredProblems).toBeGreaterThanOrEqual(200);
    expect(counts.whatIfs).toBeGreaterThanOrEqual(300);
    expect(counts.coachingPlans).toBeGreaterThanOrEqual(100);
    expect(counts.progressNarratives).toBeGreaterThanOrEqual(200);
    expect(counts.studyGuides).toBeGreaterThanOrEqual(100);
    expect(counts.examDebriefs).toBeGreaterThanOrEqual(100);
    expect(counts.conversationSummaries).toBeGreaterThanOrEqual(250);
    expect(counts.flashcards).toBeGreaterThanOrEqual(200);
    expect(counts.evaluatedResponses).toBeGreaterThanOrEqual(200);
    expect(counts.simulationCopilots).toBeGreaterThanOrEqual(200);
    expect(counts.endToEndFlows).toBeGreaterThanOrEqual(30);
  });

  it("builds distinct learner models that change tutoring strategy", () => {
    const beginner = createBeginnerLearnerModel();
    const exam = createExamLearnerModel();
    const struggle = createStrugglingLearnerModel();
    const star = createHighPerformerLearnerModel();
    expect(beginner.preference.explanationStyle).not.toBe(star.preference.explanationStyle);
    expect(selectTeachingStrategy(beginner, "kinematics")).not.toBe(selectTeachingStrategy(star, "kinematics"));
    expect(personalizeExplanation("kinematics", "beginner").summary).not.toBe(personalizeExplanation("kinematics", "exam").summary);
    expect(exam.preference.reviewTendency).toBe("over-review");
    expect(struggle.hintDependence).toBeGreaterThan(star.hintDependence);
    expect(allLearnerModels()).toHaveLength(9);
  });

  it("keeps knowledge-graph queries deterministic and curriculum-grounded", () => {
    expect(findPrerequisites("forces")).toEqual(["kinematics"]);
    expect(findRelatedConcepts("kinematics").length).toBeGreaterThan(0);
    expect(findSimulationForConcept("kinematics")[0]).toBeTruthy();
    expect(findCommonMistakes("kinematics").join(" ")).toMatch(/accelerat|speed|velocity/i);
    expect(findPrerequisites("forces")).toEqual(["kinematics"]);
  });

  it("excludes irrelevant Hubble rows from a kinematics tutor context", () => {
    const ctx = buildTutorContext("projectile range with units", "kinematics");
    expect(ctx.records.some((item) => item.conceptId === "kinematics")).toBe(true);
    expect(ctx.excludedIds).toContain("irr-astronomy");
    expect(ctx.records.filter((item) => /hubble/i.test(item.text))).toHaveLength(0);
    const noise = scoreRelevance({ query: "projectile range", conceptId: "kinematics" }, { text: "Hubble expansion is unrelated", conceptId: "relativistic-energy" });
    expect(noise.relevanceScore).toBeLessThan(0.12);
  });

  it("truncates oversized context windows", () => {
    const windows = contextWindowsDemo("range", "kinematics");
    expect(windows.tiny.records.length).toBeLessThanOrEqual(2);
    expect(windows.tiny.truncated).toBe(true);
    expect(windows.tiny.records.length).toBeLessThanOrEqual(windows.normal.records.length);
  });

  it("retrieves a slice of memory instead of dumping the store", () => {
    const userId = createBeginnerLearnerModel().userId;
    const all = getLongTermMemory(userId);
    const relevant = retrieveRelevantMemory(userId, "kinematics", 3);
    expect(relevant.length).toBeLessThanOrEqual(3);
    expect(relevant.length).toBeLessThan(all.length);
  });

  it("updates the learner model from events", () => {
    const model = createBeginnerLearnerModel();
    const before = model.knowledge.find((item) => item.conceptId === "kinematics")?.mastery ?? 0;
    const next = applyLearnerEvent(model, {
      id: "evt-1",
      kind: "problem-success",
      userId: model.userId,
      conceptId: "kinematics",
      at: "2026-09-14T12:00:00.000Z",
      payload: {},
    });
    expect(next.knowledge.find((item) => item.conceptId === "kinematics")?.mastery).toBeGreaterThan(before);
    const tracked = processMemoryEvent({
      id: "evt-2",
      kind: "hint-request",
      userId: model.userId,
      conceptId: "kinematics",
      at: "2026-09-14T12:05:00.000Z",
      payload: {},
    });
    expect(tracked.hintDependence).toBeGreaterThan(model.hintDependence);
  });

  it("adapts hints and difficulty from learner signals", () => {
    const first = personalizeHint("kinematics", "beginner", 0);
    const later = personalizeHint("kinematics", "beginner", 2);
    expect(first.depth).toBe("subtle");
    expect(later.depth).not.toBe("subtle");
    expect(selectNextDifficulty(DIFFICULTY_SCENARIOS.rapidImprovement)).toMatch(/harder|challenge/);
    expect(selectNextDifficulty(DIFFICULTY_SCENARIOS.decline)).toBe("easier");
    expect(decideIntervention(createStrugglingLearnerModel()).type).not.toBe("none");
  });

  it("classifies misconception patterns without generic copy", () => {
    expect(getMisconceptionPatterns().length).toBeGreaterThanOrEqual(200);
    const hit = classifyMisconception({
      answer: "12 m/s",
      expectedAnswer: "12 m/s²",
      conceptId: "kinematics",
    });
    expect(hit?.family).toBe("unit");
    expect(hit?.explanation).not.toMatch(/try again/i);
  });

  it("keeps low-confidence intents on a clarification path", () => {
    const low = classifyDialogueIntent("stuff");
    expect(low.confidence).toBe("low");
    expect(low.clarification?.length).toBeGreaterThan(20);
    expect(getClarificationPrompts()[0]?.question).not.toBe("Can you explain?");
    expect(getSocraticTrees().length).toBeGreaterThanOrEqual(50);
    expect(getConversationBranches().length).toBeGreaterThanOrEqual(50);
  });

  it("normalizes entities and structures problems", () => {
    const kmh = normalizeEntity(72, "km/h", "velocity");
    expect(kmh.siValue).toBe(20);
    const grams = normalizeEntity(500, "g", "mass");
    expect(grams.siValue).toBe(0.5);
    const extracted = extractEntities("A 2 kg block accelerates at 3 m/s²");
    expect(extracted.some((item) => item.kind === "mass")).toBe(true);
    expect(getStructuredProblems().length).toBeGreaterThanOrEqual(200);
    expect(getStructuredProblems().every((item) => item.assumptions.every((row) => row.reason.length > 8))).toBe(true);
  });

  it("recalculates what-if projectile rows with lib/physics", () => {
    const halfG = getWhatIfScenarios().find((item) => item.question === "What if gravity halves?" && item.parameter === "g");
    expect(halfG).toBeTruthy();
    const expected = projectile({ speed: 18, angleDeg: 42, height: 0, gravity: 9.80665 / 2 });
    expect(halfG && Math.abs(halfG.after.value - expected.range) < 0.05).toBe(true);
  });

  it("marks hallucination demos as test data and keeps golden responses clean", () => {
    const hallu = getHallucinationDemos();
    expect(hallu.length).toBeGreaterThan(0);
    expect(hallu.every((item) => item.hallucinationDemo && /TEST DATA/i.test(item.text))).toBe(true);
    expect(getGoldenResponses().every((item) => !item.hallucinationDemo)).toBe(true);
    expect(GUARDRAIL_LIBRARY.some((item) => item.code === "fake-citation")).toBe(true);
  });

  it("does not claim keyword search is an embedding model", () => {
    expect(keywordSimilarity("projectile range", "projectile motion range")).toBeGreaterThan(keywordSimilarity("projectile range", "Hubble constant"));
    const hits = searchTutorHistoryV3("Understanding Projectile Motion");
    expect(hits[0]?.score).toBeGreaterThan(0);
  });

  it("paginates stress messages without materializing 5000 rows", () => {
    const page = pageStressMessages(10, 40, 5000);
    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(5000);
    expect(page.nextOffset).toBe(50);
  });

  it("keeps journeys internally consistent", () => {
    const journey = generateTutorJourney("visual", "kinematics");
    expect(validateJourneyConsistency(journey)).toEqual([]);
    expect(getEndToEndFlows().length).toBeGreaterThanOrEqual(30);
  });

  it("personalizes tutor payloads only for demo learner ids", () => {
    enableMockAIForTests();
    const baseline = buildTutorPayload(createMockAIRequest({ prompt: "What is velocity?", userId: "user-maya" }));
    expect(baseline.summary).toContain("Let’s break down");
    const personalized = buildTutorPayload(createMockAIRequest({ prompt: "What is velocity?", userId: "demo-learner-beginner" }));
    expect(personalized.summary).toContain("Let’s break down");
    expect(personalized.summary).not.toBe(baseline.summary);
  });

  it("does not leak secrets in diagnostics", () => {
    const redacted = redactDiagnosticInput({ authorization: "Bearer secret", token: "abc", conceptId: "kinematics" });
    expect(redacted.authorization).toBe("[redacted]");
    expect(redacted.token).toBe("[redacted]");
    expect(redacted.conceptId).toBe("kinematics");
  });

  it("ranks next actions from weaknesses, not popularity", () => {
    const ranked = rankWhatNext("struggling");
    expect(ranked[0]?.reason).not.toMatch(/popular/i);
    expect(ranked[0]?.reason).toMatch(/weakness|struggling/i);
  });

  it("calibrates confidence instead of inflating certainty", () => {
    expect(calibrationNote(0.9, false)).toMatch(/assumption/i);
    expect(calibrationNote(0.2, true)).toMatch(/calibration/i);
    expect(learnerIdForTestUser("exam")).toBe("exam");
  });

  it("enumerates a feature × user test matrix", () => {
    const cells = expansionTestMatrix();
    expect(cells.length).toBe(6 * 8);
    setAIDemoShowcase("personalization");
    expect(getExpansionCounts().showcases).toBe(10);
  });

  it("uses the same seed path for identical learner models", () => {
    resetAIMemory();
    const a = createBeginnerLearnerModel();
    const b = createBeginnerLearnerModel();
    expect(a.knowledge[0]?.mastery).toBe(b.knowledge[0]?.mastery);
    expect(a.preference.explanationStyle).toBe(b.preference.explanationStyle);
  });

  it("drops stale Tutor completions in a deterministic race", () => {
    const result = pickRaceWinner("ignored");
    expect(result.winnerId).toBeTruthy();
    expect(result.staleIds.includes(result.winnerId)).toBe(false);
  });
});
