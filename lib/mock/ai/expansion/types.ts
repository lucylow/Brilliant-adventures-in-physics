import type { HintDepth, TutorResponseStyle, VerificationStatus } from "../ai-types";

export const MOCK_AI_EXPANSION_VERSION = "3.0.0" as const;
export const MOCK_AI_EXPANSION_LABEL = "Demo AI expansion" as const;

export type LearnerModelId =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "exam"
  | "visual"
  | "simulation"
  | "returning"
  | "struggling"
  | "high-performer";

export type PreferredModality = "text" | "visual" | "equation" | "simulation" | "experiment" | "mixed";
export type ChallengeTolerance = "low" | "moderate" | "high";
export type ReviewTendency = "avoidant" | "balanced" | "over-review";
export type StreakBehavior = "fragile" | "steady" | "resilient";
export type TeachingStrategy =
  | "direct-explanation"
  | "socratic"
  | "worked-example"
  | "analogy"
  | "counterexample"
  | "visual"
  | "practice-first"
  | "simulation-first";
export type DialogueIntentId =
  | "askDefinition"
  | "askWhy"
  | "askHow"
  | "askExample"
  | "askCounterexample"
  | "askApplication"
  | "askComparison"
  | "askCalculation"
  | "askVerification"
  | "askHint"
  | "askSimplification"
  | "askDeepDive"
  | "askSimulation"
  | "askExperiment"
  | "askStudyPlan"
  | "askReview";
export type IntentConfidence = "high" | "medium" | "low";
export type EntityKind =
  | "mass"
  | "force"
  | "velocity"
  | "acceleration"
  | "distance"
  | "time"
  | "angle"
  | "charge"
  | "voltage"
  | "current"
  | "resistance"
  | "frequency"
  | "wavelength"
  | "temperature"
  | "pressure"
  | "volume"
  | "energy";
export type EntityConfidence = "explicit" | "inferred" | "ambiguous" | "missing";
export type DifficultyMove = "easier" | "same" | "harder" | "challenge";
export type InterventionType =
  | "repeated-mistake"
  | "long-inactivity"
  | "rapid-guessing"
  | "high-hint-dependency"
  | "streak-break"
  | "mastery-plateau"
  | "none";
export type GraphNodeKind = "topic" | "concept" | "equation" | "lesson" | "problem" | "simulation" | "experiment" | "misconception";
export type GraphEdgeKind =
  | "prerequisite"
  | "related"
  | "exampleOf"
  | "testedBy"
  | "visualizedBy"
  | "experimentedWith"
  | "commonMistakeFor";
export type MemoryKind =
  | "recent-concept"
  | "misconception"
  | "style"
  | "question"
  | "explanation"
  | "success"
  | "failure"
  | "preference";
export type ProvenanceKind = "derived" | "retrieved" | "generated" | "verified" | "user-provided" | "mock";
export type SourceKind = "lesson" | "equation-library" | "deterministic-calculator" | "mock-dataset" | "user-input";
export type ResponseLengthProfile = "micro" | "short" | "medium" | "long" | "deepDive";
export type ContentBlockKind =
  | "paragraph"
  | "equation"
  | "bullet-list"
  | "warning"
  | "tip"
  | "example"
  | "callout"
  | "chart"
  | "simulation"
  | "practice"
  | "source";
export type AIDemoShowcaseId =
  | "tutor"
  | "scan"
  | "experiment"
  | "exam"
  | "simulation"
  | "personalization"
  | "recovery"
  | "streaming"
  | "verification"
  | "multimodal";
export type TestUserState = "fresh" | "active" | "struggling" | "mastery" | "exam" | "offline" | "error" | "returning";
export type StudySessionState = "planned" | "started" | "inProgress" | "paused" | "completed" | "abandoned";
export type ReviewPriority = "urgent" | "high" | "normal" | "low";
export type CacheFreshness = "fresh" | "stale" | "expired" | "corrupt" | "missing";
export type SyncState = "local-only" | "synced" | "pending" | "conflicted";
export type PredictionVerdict = "correct" | "partiallyCorrect" | "wrongReasonable" | "wrongConceptual";
export type TrendKind = "linear" | "quadratic" | "inverse" | "exponential" | "oscillatory" | "piecewise" | "none";
export type LanguageRegister = "student-friendly" | "formal" | "technical" | "exam-ready" | "flashcard-ready" | "lab-report-ready";
export type NextActionKind = "review" | "practice" | "lesson" | "simulation" | "mission" | "tutor";
export type DifficultyScenarioId =
  | "rapidImprovement"
  | "steadyProgress"
  | "plateau"
  | "decline"
  | "overconfidence"
  | "underconfidence"
  | "highAccuracySlow"
  | "lowAccuracyFast";

export type KnowledgeStateBand = "unknown" | "emerging" | "developing" | "secure";

export type LearnerSignal = {
  id: string;
  kind: "accuracy" | "hint" | "time" | "confidence" | "engagement" | "fatigue";
  conceptId: string;
  value: number;
  observedAt: string;
  note: string;
};

export type LearnerPreference = {
  explanationStyle: TutorResponseStyle;
  problemDifficulty: "intro" | "easy" | "medium" | "hard" | "challenge";
  modality: PreferredModality;
  simulationAffinity: number;
  challengeTolerance: ChallengeTolerance;
  reviewTendency: ReviewTendency;
  timeAvailabilityMin: number;
};

export type LearnerInsight = {
  id: string;
  conceptId: string;
  headline: string;
  evidence: string;
  nextAction: NextActionKind;
  confidence: number;
  isMock: true;
};

export type ConceptKnowledge = {
  conceptId: string;
  mastery: number;
  confidence: number;
  knowledgeState: KnowledgeStateBand;
  lastReviewedAt: string | null;
  mistakeCount: number;
  hintCount: number;
  fatigue: number;
};

export type LearnerModel = {
  id: LearnerModelId;
  userId: string;
  displayLabel: string;
  knowledge: ConceptKnowledge[];
  signals: LearnerSignal[];
  preference: LearnerPreference;
  insights: LearnerInsight[];
  learningVelocity: number;
  hintDependence: number;
  streakDays: number;
  streakBehavior: StreakBehavior;
  recentEngagement: number;
  conceptFatigue: Record<string, number>;
  recentMistakeIds: string[];
  version: typeof MOCK_AI_EXPANSION_VERSION;
  isMock: true;
};

export type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  label: string;
  conceptId?: string;
  refId?: string;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  kind: GraphEdgeKind;
  reason: string;
};

export type PhysicsKnowledgeGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type ContextRecord = {
  id: string;
  kind: "question" | "history" | "concept" | "lesson" | "mistake" | "simulation" | "weakness";
  text: string;
  conceptId?: string;
  relevanceScore: number;
  reason: string;
};

export type AssembledContext = {
  feature: string;
  query: string;
  records: ContextRecord[];
  truncated: boolean;
  window: "tiny" | "small" | "normal" | "large" | "oversized";
  excludedIds: string[];
};

export type MemoryRecord = {
  id: string;
  userId: string;
  kind: MemoryKind;
  conceptId?: string;
  text: string;
  createdAt: string;
  expiresAt: string;
  weight: number;
};

export type LearnerEventKind =
  | "lesson-completion"
  | "problem-failure"
  | "problem-success"
  | "hint-request"
  | "tutor-request"
  | "simulation-completion"
  | "mission-completion"
  | "review-completion";

export type LearnerEvent = {
  id: string;
  kind: LearnerEventKind;
  userId: string;
  conceptId: string;
  at: string;
  payload: Record<string, string | number | boolean>;
};

export type Intervention = {
  type: InterventionType;
  message: string;
  reason: string;
  recommendedAction: NextActionKind;
  isMock: true;
};

export type CoachingPlan = {
  id: string;
  trigger: InterventionType | "goal" | "review" | "curiosity";
  learnerState: LearnerModelId;
  recommendation: string;
  message: string;
  action: NextActionKind;
  expectedOutcome: string;
  conceptId: string;
};

export type MisconceptionPattern = {
  id: string;
  family:
    | "sign"
    | "unit"
    | "formula"
    | "variable"
    | "concept"
    | "graph"
    | "direction"
    | "vector"
    | "rounding"
    | "premature-rounding"
    | "assumption";
  conceptId: string;
  pattern: string;
  diagnostic: string;
  correctExplanation: string;
};

export type MisconceptionHit = {
  misconceptionId: string;
  confidence: number;
  explanation: string;
  family: MisconceptionPattern["family"];
};

export type SocraticNodeKind = "question" | "hint" | "counterquestion" | "equation" | "check" | "reflection";

export type SocraticNode = {
  id: string;
  kind: SocraticNodeKind;
  text: string;
  nextIds: string[];
};

export type SocraticTree = {
  id: string;
  conceptId: string;
  learnerBand: "beginner" | "intermediate" | "advanced" | "confident-but-wrong" | "uncertain" | "stuck";
  rootId: string;
  nodes: SocraticNode[];
};

export type DialogueIntentFixture = {
  id: string;
  prompt: string;
  intent: DialogueIntentId;
  confidence: IntentConfidence;
  conceptId: string;
  clarification?: string;
};

export type ExtractedEntity = {
  kind: EntityKind;
  raw: string;
  value: number | null;
  unit: string | null;
  siValue: number | null;
  siUnit: string | null;
  confidence: EntityConfidence;
};

export type StructuredProblem = {
  id: string;
  prompt: string;
  conceptId: string;
  knowns: Array<{ name: string; value: number; unit: string }>;
  unknowns: string[];
  constraints: string[];
  assumptions: Array<{ statement: string; reason: string }>;
  equations: string[];
  requiredSteps: string[];
  verified?: { name: string; value: number; unit: string };
};

export type AssumptionConflict = {
  id: string;
  conceptId: string;
  assumption: string;
  failureMode: string;
  flag: string;
};

export type WhatIfScenario = {
  id: string;
  question: string;
  conceptId: string;
  parameter: string;
  before: { name: string; value: number; unit: string };
  after: { name: string; value: number; unit: string };
  principle: string;
  assumption: string;
};

export type SimulationCopilotTurn = {
  id: string;
  simulationId: string;
  conceptId: string;
  user: string;
  assistant: string;
  provenance: ProvenanceKind;
};

export type ExperimentAnalysis = {
  id: string;
  conceptId: string;
  task: "slope" | "trend" | "outlier" | "uncertainty" | "theory" | "residuals";
  trend: TrendKind;
  observed: string;
  inferred: string;
  expected: string;
  uncertaintyNote: string;
};

export type EvaluationScores = {
  correctness: number;
  relevance: number;
  clarity: number;
  completeness: number;
  pedagogy: number;
  verification: number;
};

export type EvaluatedResponse = {
  id: string;
  conceptId: string;
  text: string;
  scores: EvaluationScores;
  provenance: ProvenanceKind;
  golden: boolean;
  hallucinationDemo: boolean;
  notes: string;
};

export type RankedNextAction = {
  kind: NextActionKind;
  title: string;
  reason: string;
  score: number;
  targetId: string;
  conceptId: string;
};

export type GoalRecord = {
  id: string;
  goal: string;
  baseline: string;
  target: string;
  progress: number;
  deadline: string;
  nextAction: string;
  conceptIds: string[];
};

export type WeeklyReview = {
  id: string;
  week: number;
  wins: string;
  weaknesses: string;
  mostPracticed: string;
  leastPracticed: string;
  newConcepts: string[];
  recommendations: string[];
  isDemoAnalytics: true;
};

export type MonthlyReview = {
  id: string;
  month: number;
  summary: string;
  wins: string;
  weaknesses: string;
  recommendations: string[];
  isDemoAnalytics: true;
};

export type StudyGuide = {
  id: string;
  conceptId: string;
  audience: LanguageRegister;
  keyIdea: string;
  equation: string;
  example: string;
  mistake: string;
  visual: string;
  reviewQuestion: string;
};

export type ExamDebrief = {
  id: string;
  conceptId: string;
  topic: string;
  difficulty: string;
  requiredEquations: string[];
  likelyTrap: string;
  recommendedApproach: string;
  timeManagement: string;
  overall: string;
};

export type ConversationDigest = {
  id: string;
  title: string;
  tags: { topic: string; difficulty: string; intent: DialogueIntentId; outcome: string };
  summary: string;
  conceptId: string;
  unresolved: string[];
};

export type EndToEndFlow = {
  id: string;
  title: string;
  steps: Array<{ feature: string; action: string; expected: string }>;
  learnerId: LearnerModelId;
  showcase: AIDemoShowcaseId;
};

export type DemoTimelineEvent = {
  id: string;
  at: string;
  kind: LearnerEventKind | "practice" | "scan";
  label: string;
  conceptId: string;
};

export type QualityVector = EvaluationScores & { overall: number };

export type GuardrailHit = {
  id: string;
  code:
    | "unsupported-domain"
    | "insufficient-data"
    | "unsafe-assumption"
    | "misleading-certainty"
    | "fake-citation"
    | "fabricated-observation"
    | "invalid-calculation";
  userMessage: string;
  retry: boolean;
  fallback: string;
  diagnosticId: string;
  recoveryAction: string;
};

export type ContentBlock = {
  kind: ContentBlockKind;
  text: string;
  equation?: string;
  items?: string[];
};

export type LengthProfiledResponse = {
  id: string;
  profile: ResponseLengthProfile;
  conceptId: string;
  blocks: ContentBlock[];
};
