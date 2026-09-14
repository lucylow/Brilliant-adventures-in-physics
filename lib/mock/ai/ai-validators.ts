import { findConcept } from "@/lib/concepts";
import { CATALOG, assertCatalogReferences } from "./ai-catalog";
import { conversationStats, getTutorConversations } from "./datasets/conversations";
import { getAnalogies, getComparisons, getExplanations, getFollowUpPrompts, getHints, getMisconceptions, getStarterPrompts } from "./datasets/libraries";
import { getErrorDiagnoses, getPracticeFeedback, getPracticeTemplates, getSolutions, getUnitCheckScenarios } from "./datasets/practice";
import { getGraphAnalyses, getScanAnalyses, getSimulationRecommendations, getTableAnalyses } from "./datasets/scans-graphs";
import { getConversationSummaries, getDailyCoachMessages, getFlashcards, getLearningPlans, getQuizSets, getRecommendationReasons } from "./datasets/study";
import { INTENT_FIXTURES } from "./datasets/intents-edge";
import { AI_DEMO_SCENARIOS } from "./ai-scenarios";
import { MOCK_AI_ERROR_LIBRARY } from "./ai-errors";
import { parseWith, analogySchema, comparisonSchema, conversationSummarySchema, explanationResponseSchema, hintResponseSchema, learningPlanSchema, misconceptionResponseSchema, practiceFeedbackSchema, problemSolutionSchema, scanAnalysisSchema } from "./ai-schemas";

export function getAIDatasetCounts() {
  const conversations = conversationStats();
  return {
    conversations: conversations.conversations,
    messages: conversations.messages,
    explanations: getExplanations().length,
    hints: getHints().length,
    solutions: getSolutions().length,
    misconceptions: getMisconceptions().length,
    practiceFeedback: getPracticeFeedback().length,
    recommendations: getRecommendationReasons().length,
    plans: getLearningPlans().length,
    graphs: getGraphAnalyses().length,
    scans: getScanAnalyses().length,
    flashcards: getFlashcards().length,
    quizzes: getQuizSets().length,
    followUps: getFollowUpPrompts().length,
    intents: INTENT_FIXTURES.length,
    summaries: getConversationSummaries().length,
    dailyCoach: getDailyCoachMessages().length,
    scenarios: AI_DEMO_SCENARIOS.length,
    errors: Object.keys(MOCK_AI_ERROR_LIBRARY).length + getErrorDiagnoses().length + getUnitCheckScenarios().length,
    analogies: getAnalogies().length,
    comparisons: getComparisons().length,
    starters: getStarterPrompts().length,
    tables: getTableAnalyses().length,
    simulations: getSimulationRecommendations().length,
    templates: getPracticeTemplates().length,
  };
}

export function validateAIDataset(): { ok: true; counts: ReturnType<typeof getAIDatasetCounts> } {
  assertCatalogReferences();
  getAnalogies().forEach((item) => parseWith(analogySchema, item, item.id));
  getComparisons().forEach((item) => parseWith(comparisonSchema, item, item.id));
  getExplanations().slice(0, 12).forEach((item, index) => parseWith(explanationResponseSchema, item, `explanation-${index}`));
  getHints().slice(0, 12).forEach((item, index) => parseWith(hintResponseSchema, item, `hint-${index}`));
  getMisconceptions().slice(0, 12).forEach((item) => parseWith(misconceptionResponseSchema, item, item.id));
  getSolutions().slice(0, 8).forEach((item) => parseWith(problemSolutionSchema, item, item.problemId));
  getScanAnalyses().slice(0, 8).forEach((item) => parseWith(scanAnalysisSchema, item, item.id));
  getPracticeFeedback().slice(0, 8).forEach((item) => parseWith(practiceFeedbackSchema, item, item.id));
  getLearningPlans().slice(0, 6).forEach((item) => parseWith(learningPlanSchema, item, item.id));
  getConversationSummaries().slice(0, 6).forEach((item) => parseWith(conversationSummarySchema, item, item.id));
  for (const conversation of getTutorConversations()) {
    if (!findConcept(conversation.conceptId)) throw new Error(`Conversation ${conversation.id} has unknown concept ${conversation.conceptId}`);
    if (conversation.turns.length < 5 || conversation.turns.length > 20) throw new Error(`Conversation ${conversation.id} has ${conversation.turns.length} turns`);
  }
  for (const topic of CATALOG) {
    if (!findConcept(topic.conceptId)) throw new Error(`Catalog ${topic.id} points at missing concept`);
  }
  const counts = getAIDatasetCounts();
  const required: Array<[keyof typeof counts, number]> = [
    ["conversations", 100],
    ["messages", 1000],
    ["explanations", 200],
    ["hints", 300],
    ["solutions", 150],
    ["misconceptions", 150],
    ["practiceFeedback", 200],
    ["recommendations", 200],
    ["plans", 100],
    ["graphs", 100],
    ["scans", 100],
    ["flashcards", 300],
    ["quizzes", 100],
    ["followUps", 200],
    ["intents", 150],
    ["summaries", 100],
    ["dailyCoach", 90],
    ["scenarios", 25],
  ];
  for (const [key, min] of required) {
    if (counts[key] < min) throw new Error(`AI dataset ${key} is ${counts[key]}, expected at least ${min}`);
  }
  return { ok: true, counts };
}

export function getAIInspectorSnapshot() {
  const counts = getAIDatasetCounts();
  return {
    label: "Demo AI inspector",
    productionSafe: true,
    counts,
  };
}
