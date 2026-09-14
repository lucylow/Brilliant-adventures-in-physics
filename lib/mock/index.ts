export {
  MOCK_DATA_VERSION,
  MOCK_STORAGE_KEYS,
} from "./version";
export {
  isMockModeEnabled,
  isMockEntitlementsEnabled,
  isProductionRuntime,
  getMockConfig,
  setMockConfig,
  setMockScenario,
  getMockScenario,
  setMockLearner,
  resetMockConfig,
  assertMockOnly,
} from "./config";
export { getMockNow, getMockNowIso, setMockNow, resetMockNow, daysAgo, relativeMockDate } from "./clock";
export {
  createSeededRandom,
  randomInt,
  randomFloat,
  randomChoice,
  shuffleSeeded,
  weightedChoice,
  randomDateBetween,
  randomBoolean,
} from "./utils/rng";
export {
  createMockUser,
  createMockTopic,
  createMockConcept,
  createMockLesson,
  createMockEquation,
  createMockProblem,
  createMockAttempt,
  createMockMastery,
  createMockAchievement,
  createMockMission,
  createMockSimulation,
  createMockExperiment,
  createMockTutorSession,
  createMockNotebookEntry,
  createMockNotification,
} from "./factories";
export {
  getMockDataset,
  invalidateMockDataset,
  replaceMockDataset,
  copyMockDataset,
} from "./registry";
export {
  buildMockDataset,
  seedMinimal,
  seedDemo,
  seedRich,
  seedAdvanced,
  seedExamPrep,
  seedExplorer,
  seedOffline,
  seedErrors,
} from "./seed";
export { validateMockDataset, validateMockReferences, assertValidMockDataset } from "./validation/dataset";
export { getMockDatasetStats } from "./stats";
export { hydrateMockPersistence, resetMockData, switchMockLearner } from "./persistence";
export { mockRepositories } from "./adapters/repositories";
export {
  getActiveConceptRegistry,
  searchActiveConcepts,
  findActiveConcept,
  getActivePracticeQuestions,
  activePracticeIndexForConcept,
  getActiveLesson,
  getActiveLessons,
  getActiveAchievements,
  getActiveMissions,
  getActiveSimulations,
  getActiveTutorSessions,
  getRecommendedLessons,
  getRecommendedProblems,
  getRecommendedSimulations,
  getRecommendedMissions,
} from "./adapters/catalog";
export { MOCK_SCENARIOS, SCREEN_COVERAGE } from "./scenarios/definitions";
export { selectHomeDemoState, selectPracticeDemoState, selectProgressDemoState, selectLabDemoState, selectTutorDemoState, selectSettingsDemoState, selectInspectorStats } from "./selectors/screens";
export { evaluateMockAchievements } from "./achievements-engine";
export { missionCompletionFromSteps } from "./mission-engine";
export { recordMockAnalytics, getMockAnalyticsEvents, clearMockAnalytics } from "./analytics";
export { inspectMockAI } from "./ai/ai-inspector";
export { isMockAIEnabled, getMockAIConfig, setMockAIScenario } from "./ai/config";
export { getMockAIProvider } from "./ai/ai-client";
export { validateAIDataset, getAIDatasetCounts } from "./ai/ai-validators";
