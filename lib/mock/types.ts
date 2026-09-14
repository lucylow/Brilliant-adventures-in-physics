import type { PhysicsConcept } from "@/lib/concepts";
import type { EducationLevel, Lesson, LessonBlock, MasteryState } from "@/lib/education";
import type { Achievement } from "@/lib/achievements";
import type { AdventureMission, WorldId } from "@/lib/adventure";
import type { CompletionEvent, LearningState, TopicMastery } from "@/lib/progress-store";
import type { SavedExperiment } from "@/lib/experiments";
import type { NotebookEntry } from "@/lib/notebook";
import type { TutorAnswer, TutorStep } from "@/lib/ai";
import type { Entitlement, Subscription, Tier } from "@/lib/monetization";
import type { PracticeQuestion } from "@/lib/practice";
import type { RewardAction } from "@/lib/gamification";
import type { LearnerGoal, LearnerLevel } from "@/lib/onboarding";
import type { RetryItem } from "@/lib/retry-queue";
import type { BAVExperiment, BAVQuest, BAVVisualization } from "@/lib/bav";

export type MockScenarioId =
  | "fresh-user"
  | "beginner"
  | "active-learner"
  | "advanced-learner"
  | "power-user"
  | "exam-prep"
  | "explorer"
  | "offline-user"
  | "returning-user"
  | "empty-state"
  | "error-state";

export type MockLatencyProfile = "instant" | "fast" | "realistic" | "slow";
export type MockNetworkState = "online" | "offline" | "degraded";
export type MockDifficulty = "easy" | "medium" | "hard" | "challenge";
export type MockAuthState = "loggedOut" | "newUser" | "returningUser" | "expiredSession";
export type MockRecognitionKind = "MOCK_RECOGNITION";
export type MockTutorSource = "MOCK_TUTOR" | "AI_EXPLANATION" | "VERIFIED_CALCULATION";
export type ActivityKind =
  | "lesson-completed"
  | "problem-solved"
  | "simulation-run"
  | "achievement-unlocked"
  | "review"
  | "simulation-saved"
  | "tutor-asked"
  | "mission-completed"
  | "module-started"
  | "experiment-saved"
  | "notebook-saved";

export type MockAvatar = {
  initials: string;
  motif: string;
  accent: string;
};

export type MockLearnerProfile = {
  id: string;
  displayName: string;
  avatar: MockAvatar;
  learningLevel: EducationLevel;
  learnerLevel: LearnerLevel;
  goal: LearnerGoal;
  goals: string[];
  favoriteTopics: string[];
  createdAt: string;
  lastActiveAt: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalLessons: number;
  totalProblems: number;
  totalExperiments: number;
  masterySummary: Record<string, number>;
  bio: string;
};

export type MockTopic = {
  id: string;
  name: string;
  shortDescription: string;
  domain: string;
  difficulty: MockDifficulty;
  estimatedMinutes: number;
  prerequisites: string[];
  conceptIds: string[];
  simulationIds: string[];
  lessonIds: string[];
  practiceProblemIds: string[];
  icon: string;
  accent: string;
  featured?: boolean;
};

export type MockConcept = PhysicsConcept & {
  topicId: string;
  summary: string;
  equationIds: string[];
  exampleIds: string[];
  lessonIds: string[];
  simulationIds: string[];
  difficulty: MockDifficulty;
  masteryThresholds: { developing: number; practicing: number; strong: number };
  estimatedMinutes: number;
};

export type MockLesson = Lesson & {
  conceptId: string;
  subtitle: string;
  difficulty: MockDifficulty;
  learningObjectives: string[];
  introduction: string;
  sections: Array<{ heading: string; body: string }>;
  equations: string[];
  workedExample: { prompt: string; steps: string[]; answer: string };
  checkpointQuestions: Array<{ prompt: string; answer: string }>;
  simulationReference?: string;
  commonMistakes: string[];
  summary: string;
  nextLessonId?: string;
};

export type MockEquationVariable = {
  symbol: string;
  name: string;
  unit: string;
};

export type MockEquation = {
  id: string;
  latex: string;
  plainText: string;
  variables: MockEquationVariable[];
  units: string;
  topicId: string;
  conceptId: string;
  description: string;
  exampleProblemIds: string[];
};

export type MockProblem = {
  id: string;
  conceptId: string;
  topicId: string;
  difficulty: MockDifficulty;
  prompt: string;
  givenValues: Record<string, number>;
  unknown: string;
  unit: string;
  hints: string[];
  solutionSteps: string[];
  finalAnswer: number;
  tolerance: number;
  explanation: string;
  commonWrongAnswers: number[];
  estimatedTime: number;
  xpReward: number;
  equationId?: string;
};

export type MockAttempt = {
  id: string;
  problemId: string;
  userId: string;
  submittedAt: string;
  answer: number | null;
  isCorrect: boolean;
  durationSeconds: number;
  hintsUsed: number;
  attemptNumber: number;
  xpEarned: number;
  abandoned?: boolean;
  timed?: boolean;
};

export type MasteryTrend = "up" | "steady" | "down";
export type RecommendedAction = "review" | "practice" | "advance" | "revisit-prereq";

export type MockMastery = {
  id: string;
  userId: string;
  conceptId: string;
  topicId: string;
  masteryPercent: number;
  confidence: number;
  attemptCount: number;
  correctCount: number;
  lastPracticedAt: string;
  nextReviewAt: string;
  trend: MasteryTrend;
  misconceptions: string[];
  recommendedAction: RecommendedAction;
  state: MasteryState;
};

export type MockAchievementDefinition = {
  id: string;
  name: string;
  description: string;
  category: "practice" | "streak" | "lab" | "adventure" | "tutor" | "exploration";
  icon: string;
  criteria: { kind: string; threshold: number; topicId?: string };
  xpReward: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
};

export type MockAchievementState = Achievement & {
  definitionId: string;
  earnedAt?: string;
  xpReward: number;
  rarity: MockAchievementDefinition["rarity"];
  category: MockAchievementDefinition["category"];
};

export type MockMissionStep = {
  id: string;
  title: string;
  action: "lesson" | "practice" | "simulation" | "tutor" | "experiment";
  referenceId: string;
  complete: boolean;
};

export type MockMission = AdventureMission & {
  missionId: string;
  hook: string;
  conceptIds: string[];
  steps: MockMissionStep[];
  requiredActions: string[];
  rewardBadge?: string;
  difficulty: MockDifficulty;
  estimatedMinutes: number;
  completionPercent: number;
};

export type MockSimulationParameter = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type MockSimulation = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: MockDifficulty;
  thumbnail: { motif: string; accent: string };
  parameters: MockSimulationParameter[];
  defaultParameters: Record<string, number>;
  observableQuantities: string[];
  equations: string[];
  learningGoals: string[];
  controls: string[];
  duration: number;
  featured: boolean;
  tags: string[];
  conceptIds: string[];
  topicId: string;
};

export type MockSimulationSnapshot = {
  id: string;
  simulationId: string;
  parameters: Record<string, number>;
  observables: Record<string, number>;
  capturedAt: string;
  notes: string;
};

export type MockExperiment = SavedExperiment & {
  category: string;
  description: string;
  components: string[];
  variables: Record<string, number>;
  initialConditions: Record<string, number>;
  expectedObservation: string;
  status: "draft" | "completed" | "failed" | "saved";
  updatedAt: string;
  conceptId: string;
};

export type MockTutorMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  source: MockTutorSource;
  createdAt: string;
  equationCard?: string;
  verifiedValues?: TutorAnswer["verifiedValues"];
  simulationId?: string;
};

export type MockTutorSession = {
  id: string;
  userId: string;
  topicId: string;
  conceptId: string;
  title: string;
  startedAt: string;
  updatedAt: string;
  messages: MockTutorMessage[];
  suggestedQuestions: string[];
  answer?: TutorAnswer;
};

export type MockNotebookRecord = NotebookEntry & {
  userId: string;
  conceptId?: string;
  favorite?: boolean;
  bookmark?: boolean;
};

export type MockNotification = {
  id: string;
  userId: string;
  kind: "practice" | "streak" | "achievement" | "mission" | "simulation" | "review" | "experiment" | "milestone";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  route?: string;
};

export type MockActivity = {
  id: string;
  userId: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  occurredAt: string;
  xp?: number;
  referenceId?: string;
};

export type MockDailyActivity = {
  date: string;
  minutes: number;
  problems: number;
  lessons: number;
  xp: number;
};

export type MockReviewItem = {
  id: string;
  userId: string;
  conceptId: string;
  dueAt: string;
  priority: number;
  reason: string;
  lastScore: number;
};

export type MockMistake = {
  id: string;
  userId: string;
  conceptId: string;
  title: string;
  detail: string;
  lastSeenAt: string;
  count: number;
};

export type MockLensRecord = {
  id: string;
  imageReference: string;
  recognizedText: string;
  detectedVariables: Array<{ name: string; value: number; unit: string }>;
  detectedUnits: string[];
  confidence: number;
  physicsTopic: string;
  parsedProblem: string;
  verificationStatus: "unverified" | "verified" | "needs-review";
  createdAt: string;
  recognitionKind: MockRecognitionKind;
};

export type MockScanResult = {
  id: string;
  rawText: string;
  recognizedEquation: string;
  variables: Array<{ name: string; value: number; unit: string }>;
  values: Record<string, number>;
  units: string[];
  confidence: number;
  ambiguities: string[];
  normalizedProblem: string;
  suggestedConcept: string;
  reviewRequired: boolean;
  kind: "high" | "medium" | "ambiguous" | "failed";
  recognitionKind: MockRecognitionKind;
};

export type MockOfflineState = {
  mode: "online" | "cached" | "pending-saves" | "failed-tutor" | "failed-experiment";
  retryQueue: RetryItem[];
};

export type MockErrorScenarioId =
  | "emptyHome"
  | "networkFailure"
  | "malformedLesson"
  | "missingSimulation"
  | "tutorUnavailable"
  | "scanFailed"
  | "cameraDenied"
  | "saveFailed"
  | "corruptProgress"
  | "expiredSession"
  | "rateLimited"
  | "timeout";

export type MockDataset = {
  users: MockLearnerProfile[];
  topics: MockTopic[];
  concepts: MockConcept[];
  lessons: MockLesson[];
  equations: MockEquation[];
  problems: MockProblem[];
  attempts: MockAttempt[];
  mastery: MockMastery[];
  achievements: MockAchievementDefinition[];
  achievementStates: MockAchievementState[];
  missions: MockMission[];
  simulations: MockSimulation[];
  snapshots: MockSimulationSnapshot[];
  experiments: MockExperiment[];
  tutorSessions: MockTutorSession[];
  notebook: MockNotebookRecord[];
  notifications: MockNotification[];
  activity: MockActivity[];
  dailyActivity: MockDailyActivity[];
  reviewQueue: MockReviewItem[];
  mistakes: MockMistake[];
  lensRecords: MockLensRecord[];
  scanResults: MockScanResult[];
  recommendations: MockRecommendationSet;
  learningState: LearningState;
  subscription?: Subscription;
  entitlements: Entitlement[];
  offline: MockOfflineState;
  auth: MockAuthState;
  bavExperiments: BAVExperiment[];
  bavQuests: BAVQuest[];
  bavVisualizations: BAVVisualization[];
  worlds: WorldId[];
};

export type MockRecommendationSet = {
  lessons: string[];
  problems: string[];
  simulations: string[];
  missions: string[];
  reasons: Record<string, string>;
};

export type MockDatasetStats = {
  scenario: MockScenarioId;
  version: string;
  entityCounts: Record<string, number>;
  topicCounts: Record<string, number>;
  difficultyCounts: Record<string, number>;
  completion: { lessons: number; labs: number; missions: number };
  masteryAverage: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  nextOffset: number | null;
  nextCursor: string | null;
};

export type ListQuery = {
  limit?: number;
  offset?: number;
  cursor?: string;
  query?: string;
  topicId?: string;
  difficulty?: MockDifficulty;
  featured?: boolean;
  category?: string;
  sort?: "recent" | "popular" | "difficulty" | "mastery" | "recommended";
};

export type MockRuntimeState = {
  scenario: MockScenarioId;
  learnerId: string;
  latency: MockLatencyProfile;
  network: MockNetworkState;
  failOperations: string[];
  errorScenario?: MockErrorScenarioId;
};

export type { PracticeQuestion, TopicMastery, CompletionEvent, TutorStep, LessonBlock, RewardAction, Tier, EducationLevel };
