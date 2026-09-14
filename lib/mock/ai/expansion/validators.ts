import { findConcept } from "@/lib/concepts";
import { CATALOG } from "../ai-catalog";
import { parseWith } from "../ai-schemas";
import { assembledContextSchema, assertContentBlocks, evaluatedResponseSchema } from "./schemas";
import { allLearnerModels } from "./learner-model";
import { getPhysicsKnowledgeGraph } from "./knowledge-graph";
import { buildTutorContext, contextWindowsDemo } from "./context";
import { memoryCount } from "./memory-store";
import { getDialogueIntents, getClarificationPrompts, getSocraticTrees, getConversationBranches } from "./dialogue";
import { getMisconceptionPatterns } from "./misconceptions";
import { entityFixtures } from "./entities";
import { getStructuredProblems } from "./problems";
import { getWhatIfScenarios } from "./what-if";
import { getSimulationCopilotTurns, getExperimentAnalyses, getLabReportReviews } from "./copilots";
import {
  getCoachingPlans,
  getPlateauScenarios,
  getProgressNarrativesV3,
  getWeeklyReviews,
  getMonthlyReviews,
  getStudyGuides,
  getExamDebriefs,
  getConversationDigests,
  getDocumentSummaries,
} from "./study";
import { getEvaluatedResponses, getHallucinationDemos, GUARDRAIL_LIBRARY } from "./evaluation";
import { getGeneratedFlashcards, getGeneratedQuizzes } from "./materials";
import { getMultimodalSessions, getLengthProfiles } from "./multimodal";
import { getEndToEndFlows, SHOWCASES } from "./orchestration";
import { generateAllJourneys, validateJourneyConsistency } from "./journeys";
import { getResidualDatasets, redactDiagnosticInput } from "./residuals";
import { getDemoReplays } from "./replay";
import { MOCK_AI_EXPANSION_VERSION } from "./types";

export function getExpansionCounts() {
  return {
    version: MOCK_AI_EXPANSION_VERSION,
    learnerModels: allLearnerModels().length,
    memories: memoryCount(),
    graphNodes: getPhysicsKnowledgeGraph().nodes.length,
    graphEdges: getPhysicsKnowledgeGraph().edges.length,
    intents: getDialogueIntents().length,
    clarifications: getClarificationPrompts().length,
    socraticTrees: getSocraticTrees().length,
    conversationBranches: getConversationBranches().length,
    misconceptionPatterns: getMisconceptionPatterns().length,
    entityFixtures: entityFixtures().length,
    structuredProblems: getStructuredProblems().length,
    whatIfs: getWhatIfScenarios().length,
    simulationCopilots: getSimulationCopilotTurns().length,
    experimentAnalyses: getExperimentAnalyses().length,
    labReportReviews: getLabReportReviews().length,
    coachingPlans: getCoachingPlans().length,
    plateauScenarios: getPlateauScenarios().length,
    progressNarratives: getProgressNarrativesV3().length,
    weeklyReviews: getWeeklyReviews().length,
    monthlyReviews: getMonthlyReviews().length,
    studyGuides: getStudyGuides().length,
    examDebriefs: getExamDebriefs().length,
    conversationSummaries: getConversationDigests().length,
    documentSummaries: getDocumentSummaries().length,
    flashcards: getGeneratedFlashcards().length,
    quizzes: getGeneratedQuizzes().length,
    evaluatedResponses: getEvaluatedResponses().length,
    goldenResponses: getEvaluatedResponses().filter((item) => item.golden).length,
    hallucinationDemos: getHallucinationDemos().length,
    multimodalSessions: getMultimodalSessions().length,
    residualDatasets: getResidualDatasets().length,
    endToEndFlows: getEndToEndFlows().length,
    showcases: SHOWCASES.length,
    journeys: generateAllJourneys().length,
    guardrails: GUARDRAIL_LIBRARY.length,
    demoReplays: getDemoReplays().length,
  };
}

export function getExpansionCatalog() {
  const counts = getExpansionCounts();
  return {
    version: MOCK_AI_EXPANSION_VERSION,
    label: "Demo AI expansion III — not a live provider",
    entities: Object.entries(counts)
      .filter(([, value]) => typeof value === "number")
      .map(([entity, count]) => ({
        entity,
        count,
        source: "lib/mock/ai/expansion",
        scenario: "expansion-iii",
        dependencies: ["lib/mock/ai/ai-catalog.ts", "lib/concepts.ts", "lib/physics.ts"],
        schema: entity,
      })),
  };
}

function uniqueIds(ids: string[], label: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (!id) throw new Error(`${label} has an empty id`);
    if (seen.has(id)) throw new Error(`${label} duplicate id ${id}`);
    seen.add(id);
  }
}

export function validateExpansionLayer(): { ok: true; counts: ReturnType<typeof getExpansionCounts> } {
  const models = allLearnerModels();
  if (models.length !== 9) throw new Error("expected 9 learner models");
  uniqueIds(models.map((item) => item.id), "learner-models");
  uniqueIds(models.map((item) => item.userId), "learner-userIds");
  for (const model of models) {
    for (const row of model.knowledge) {
      if (!findConcept(row.conceptId)) throw new Error(`learner ${model.id} unknown concept ${row.conceptId}`);
    }
    if (model.isMock !== true) throw new Error("learner model must be marked mock");
  }

  const graph = getPhysicsKnowledgeGraph();
  const nodeIds = new Set(graph.nodes.map((item) => item.id));
  uniqueIds(graph.nodes.map((item) => item.id), "graph-nodes");
  uniqueIds(graph.edges.map((item) => item.id), "graph-edges");
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new Error(`graph edge ${edge.id} is orphaned`);
  }

  const ctx = buildTutorContext("projectile range with units", "kinematics");
  parseWith(assembledContextSchema, ctx, "tutor-context");
  if (ctx.records.some((item) => /hubble/i.test(item.text) && item.relevanceScore >= 0.12 && item.conceptId !== "kinematics")) {
    const leftover = ctx.records.filter((item) => /hubble/i.test(item.text));
    if (leftover.some((item) => item.relevanceScore >= 0.45)) {
      throw new Error("Hubble noise should not rank as a primary tutor context record");
    }
  }
  const windows = contextWindowsDemo("range", "kinematics");
  if (windows.tiny.records.length > windows.small.records.length) throw new Error("tiny window larger than small");
  if (!windows.oversized.truncated && windows.tiny.records.length === windows.oversized.records.length) {
    throw new Error("expected truncation across context windows");
  }

  for (const problem of getStructuredProblems()) {
    if (!findConcept(problem.conceptId)) throw new Error(`problem ${problem.id} unknown concept`);
    if (!problem.prompt.trim()) throw new Error(`empty problem ${problem.id}`);
    if (!problem.equations[0]) throw new Error(`problem ${problem.id} missing equation`);
    if (problem.assumptions.some((item) => !item.reason)) throw new Error(`problem ${problem.id} assumption missing reason`);
  }
  uniqueIds(getStructuredProblems().map((item) => item.id), "structured-problems");

  for (const item of getWhatIfScenarios()) {
    if (!Number.isFinite(item.before.value) || !Number.isFinite(item.after.value)) {
      throw new Error(`what-if ${item.id} has a non-finite value`);
    }
    if (!item.before.unit || !item.after.unit) throw new Error(`what-if ${item.id} missing unit`);
  }

  getEvaluatedResponses().slice(0, 24).forEach((item) => parseWith(evaluatedResponseSchema, item, item.id));
  for (const hallu of getHallucinationDemos()) {
    if (!hallu.hallucinationDemo) throw new Error(`${hallu.id} must be marked hallucinationDemo`);
    if (!/TEST DATA/i.test(hallu.text)) throw new Error(`${hallu.id} must be labeled TEST DATA`);
    if (hallu.golden) throw new Error("hallucination fixtures cannot be golden");
  }

  for (const session of getMultimodalSessions()) {
    if (!session.references.simulationId || !session.references.lessonId) {
      throw new Error(`multimodal ${session.id} missing references`);
    }
  }

  getLengthProfiles().slice(0, 8).forEach((item) => assertContentBlocks(item.blocks, item.id));

  for (const rec of getStudyGuides()) {
    if (!findConcept(rec.conceptId)) throw new Error(`study guide ${rec.id} unknown concept`);
  }

  for (const journey of generateAllJourneys().slice(0, 12)) {
    const errors = validateJourneyConsistency(journey);
    if (errors.length) throw new Error(`journey ${journey.id}: ${errors.join(", ")}`);
  }

  const leaked = redactDiagnosticInput({ authorization: "secret-token", apiKey: "abc", conceptId: "kinematics" });
  if (leaked.authorization !== "[redacted]" || leaked.apiKey !== "[redacted]") {
    throw new Error("diagnostics must redact secrets");
  }

  uniqueIds(getDialogueIntents().map((item) => item.id), "intents");
  uniqueIds(getMisconceptionPatterns().map((item) => item.id), "misconceptions");
  uniqueIds(getGeneratedFlashcards().map((item) => item.id), "flashcards");
  uniqueIds(getCoachingPlans().map((item) => item.id), "coaching");

  const counts = getExpansionCounts();
  const required: Array<[keyof typeof counts, number]> = [
    ["learnerModels", 9],
    ["intents", 500],
    ["clarifications", 250],
    ["misconceptionPatterns", 200],
    ["socraticTrees", 50],
    ["conversationBranches", 50],
    ["structuredProblems", 200],
    ["whatIfs", 300],
    ["coachingPlans", 100],
    ["plateauScenarios", 30],
    ["progressNarratives", 200],
    ["weeklyReviews", 52],
    ["monthlyReviews", 12],
    ["studyGuides", 100],
    ["examDebriefs", 100],
    ["conversationSummaries", 250],
    ["documentSummaries", 100],
    ["flashcards", 200],
    ["evaluatedResponses", 200],
    ["simulationCopilots", 200],
    ["labReportReviews", 100],
    ["endToEndFlows", 30],
  ];
  for (const [key, min] of required) {
    const value = counts[key];
    if (typeof value !== "number" || value < min) {
      throw new Error(`expansion count ${key}=${String(value)} is below ${min}`);
    }
  }

  for (const topic of CATALOG) {
    if (!findConcept(topic.conceptId)) throw new Error(`catalog ${topic.id} unknown concept`);
  }

  return { ok: true, counts };
}

export function expansionTestMatrix() {
  const features = ["tutor", "scan", "practice", "simulation", "experiment", "exam"] as const;
  const users = ["fresh", "active", "struggling", "mastery", "exam", "offline", "error", "returning"] as const;
  const networks = ["online", "offline"] as const;
  const data = ["fresh", "stale", "missing"] as const;
  const errors = ["none", "timeout", "provider"] as const;
  const difficulties = ["easy", "medium", "hard"] as const;
  const cells = [];
  for (const feature of features) {
    for (const user of users) {
      cells.push({
        id: `${feature}-${user}-online-fresh-none-medium`,
        feature,
        user,
        network: networks[0],
        data: data[0],
        error: errors[0],
        difficulty: difficulties[1],
      });
    }
  }
  return cells;
}
