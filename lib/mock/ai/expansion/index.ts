export { MOCK_AI_EXPANSION_VERSION, MOCK_AI_EXPANSION_LABEL } from "./types";
export type {
  LearnerModel,
  LearnerModelId,
  LearnerSignal,
  LearnerPreference,
  LearnerInsight,
  AssembledContext,
  MemoryRecord,
  TeachingStrategy,
  AIDemoShowcaseId,
  TestUserState,
} from "./types";

export {
  getLearnerModel,
  allLearnerModels,
  createBeginnerLearnerModel,
  createIntermediateLearnerModel,
  createAdvancedLearnerModel,
  createExamLearnerModel,
  createVisualLearnerModel,
  createSimulationLearnerModel,
  createReturningLearnerModel,
  createStrugglingLearnerModel,
  createHighPerformerLearnerModel,
  LEARNER_MODEL_FACTORIES,
  applyLearnerEvent,
  weakConceptsOf,
  strongConceptsOf,
  resetLearnerModelCache,
  learnerModelByUserId,
} from "./learner-model";

export {
  getPhysicsKnowledgeGraph,
  findPrerequisites,
  findRelatedConcepts,
  findRemediationConcepts,
  findPracticeForConcept,
  findSimulationForConcept,
  findExperimentsForConcept,
  findCommonMistakes,
  graphStats,
} from "./knowledge-graph";

export {
  scoreRelevance,
  prioritizeContext,
  buildTutorContext,
  buildProblemContext,
  buildScanContext,
  buildExperimentContext,
  buildProgressContext,
  buildRecommendationContext,
  contextWindowsDemo,
} from "./context";

export {
  getLongTermMemory,
  retrieveRelevantMemory,
  retrieveRecentMemory,
  retrieveConceptMemory,
  retrieveMistakeMemory,
  retrievePreferenceMemory,
  processMemoryEvent,
  resetAIMemory,
  resetAIUserState,
  getTrackedLearner,
  seedExpansionMemories,
  memoryCount,
} from "./memory-store";

export {
  selectTeachingStrategy,
  personalizeExplanation,
  personalizeHint,
  personalizeProblem,
  personalizeRecommendation,
  personalizeSimulation,
  personalizeStudyPlan,
  personalizeTutorPayload,
  explanationAdaptations,
} from "./personalize";

export {
  selectNextDifficulty,
  DIFFICULTY_SCENARIOS,
  nextHintDepth,
  decideIntervention,
  calibrationNote,
} from "./adaptive";

export { getMisconceptionPatterns, classifyMisconception, errorAwareTutorLine } from "./misconceptions";
export {
  getDialogueIntents,
  classifyDialogueIntent,
  getClarificationPrompts,
  getSocraticTrees,
  getConversationBranches,
  getInterruptionFixtures,
} from "./dialogue";
export { extractEntities, normalizeEntity, entityFixtures } from "./entities";
export { getStructuredProblems, getAssumptionLibrary, getAssumptionConflicts, reasoningSummaryFor } from "./problems";
export { getWhatIfScenarios, getPredictionFixtures } from "./what-if";
export {
  getSimulationCopilotTurns,
  getExperimentAnalyses,
  getLabReportReviews,
  getExperimentCopilotStages,
  experimentConclusion,
} from "./copilots";
export {
  getCoachingPlans,
  getPlateauScenarios,
  getProgressNarrativesV3,
  getWeeklyReviews,
  getMonthlyReviews,
  getStudyGuides,
  getExamDebriefs,
  getConversationDigests,
  rankWhatNext,
  planPracticeSession,
} from "./study";
export { getMultimodalSessions, getLengthProfiles, getUiStressResponses } from "./multimodal";
export { getEvaluatedResponses, getGoldenResponses, getHallucinationDemos, evaluateText, diffResponses, GUARDRAIL_LIBRARY } from "./evaluation";
export { searchTutorHistoryV3, keywordSimilarity, pageStressMessages, paginateSearch } from "./search";
export {
  SHOWCASES,
  setAIDemoShowcase,
  getAIDemoShowcase,
  setAITestUserState,
  getAITestUserState,
  learnerIdForTestUser,
  getEndToEndFlows,
  getDemoTimeline,
  resetAIScenarios,
  resetAIRecommendations,
  resetAIConversation,
  getDemoAnalytics,
  exportShowcaseConfig,
} from "./orchestration";
export {
  generateTutorJourney,
  generateStudyJourney,
  generateExamJourney,
  generateSimulationJourney,
  generateExperimentJourney,
  generateRecoveryJourney,
  generateAllJourneys,
} from "./journeys";
export { getGeneratedFlashcards, getGeneratedQuizzes, getConfidenceAccuracyCases, AI_MESSAGE_KEYS } from "./materials";
export { getResidualDatasets, redactDiagnosticInput } from "./residuals";
export { getExpansionCounts, getExpansionCatalog, validateExpansionLayer, expansionTestMatrix } from "./validators";
export { inspectExpansion } from "./debug";
export { getDemoReplays, replayForShowcase } from "./replay";
export { getRaceCases, pickRaceWinner, retryPreservesContext } from "./race";
