export {
  MOCK_AI_PROVIDER_LABEL,
  MOCK_AI_DATA_VERSION,
  type MockAIMode,
  type MockAIFailureMode,
  type AIProvider,
  type MockAIRequest,
  type TutorResponsePayload,
} from "./ai-types";
export {
  isMockAIEnabled,
  getMockAIConfig,
  setMockAIScenario,
  setMockAIConfig,
  setAIFailureMode,
  resetMockAIConfig,
  enableMockAIForTests,
  assertMockAIOnly,
} from "./config";
export { getMockAIProvider, MockAIProvider, buildTutorPayload, toTutorAnswer, resetMockAIProvider } from "./ai-client";
export { createMockAIRequest, createMockAIResponse, createMockAITurn, createMockAIMeta, wrapMockAI } from "./ai-factories";
export { CATALOG, assertCatalogReferences } from "./ai-catalog";
export { PERSONAS } from "./ai-personas";
export { validateAIDataset, getAIDatasetCounts, getAIInspectorSnapshot } from "./ai-validators";
export { AI_DEMO_SCENARIOS, getAIDemoScenario, createAIDemoUser, createAITutorJourney, createAIStudyJourney, createAIPracticeJourney, createAISimulationJourney, createAIExamJourney, createShowcaseRequest, projectileShowcaseTurns, allDemoUsers } from "./ai-scenarios";
export {
  selectTutorStarterPrompts,
  selectRecommendedQuestion,
  selectRelevantConversation,
  selectHint,
  selectExplanation,
  selectPracticeFeedback,
  selectSimulationRecommendation,
  selectLearningPlan,
  selectReviewCoachMessage,
  selectRankedRecommendations,
  searchTutorHistory,
} from "./ai-selectors";
export {
  MockTutorRepository,
  MockAIExplanationRepository,
  MockAIRecommendationRepository,
  MockAIScanRepository,
  MockAIFeedbackRepository,
  MockAIPlanRepository,
} from "./ai-repositories";
export { routeMockAI } from "./ai-router";
export { MOCK_AI_ERROR_LIBRARY, MockAIError, mockAIError, mockAIErrorToServiceResult } from "./ai-errors";
export { streamTutorPayload, chunkText } from "./ai-streaming";
export { canTransitionRequest, canTransitionMessage, transitionRequest, transitionMessage } from "./ai-state";
export { getLearnerMemory, getRecentTutorContext, getLearnerWeakConcepts, getPreferredExplanationStyle, getRecentMistakes, getSavedInterests, resetLearnerMemory, seedDemoMemories } from "./ai-memory";
export { localFallbackExplanation } from "./ai-fallback";
export { contentFilter } from "./ai-safety";
export { verifyTopicCalculation, compareNumeric, runVerifiedCalc } from "./ai-verification";
export { classifyIntent, parsePhysicsQuestion, truncateHistory, INTENT_FIXTURES } from "./datasets/intents-edge";
export { varyProjectile, varyOhms } from "./ai-generators";
export { inspectMockAI } from "./ai-inspector";
