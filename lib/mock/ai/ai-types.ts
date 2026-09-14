import type { TutorAnswer, TutorStep } from "@/lib/ai";
import type { EducationLevel } from "@/lib/education";
import type { LearnerGoal, LearnerLevel } from "@/lib/onboarding";
import type { LearningState } from "@/lib/progress-store";
import type { MockDifficulty } from "../types";

export const MOCK_AI_PROVIDER_LABEL = "Demo AI" as const;
export const MOCK_AI_DATA_VERSION = "1.0.0" as const;

export type MockAIMode =
  | "mock-off"
  | "mock-basic"
  | "mock-rich"
  | "mock-streaming"
  | "mock-offline"
  | "mock-error"
  | "mock-slow"
  | "mock-deterministic";

export type MockAIFailureMode =
  | "none"
  | "timeout"
  | "network"
  | "rateLimit"
  | "malformed"
  | "provider"
  | "offline";

export type MockAILatencyProfile = "instant" | "fast" | "realistic" | "slow" | "verySlow";

export type MockAIFeature =
  | "tutor"
  | "explanation"
  | "hint"
  | "problem"
  | "scan"
  | "feedback"
  | "recommendation"
  | "plan"
  | "notebook"
  | "simulation"
  | "quiz"
  | "flashcard"
  | "exam"
  | "review";

export type LearnerPersonaId =
  | "curious-beginner"
  | "confused-learner"
  | "fast-learner"
  | "exam-crammer"
  | "visual-learner"
  | "equation-focused"
  | "intuitive-learner"
  | "simulation-first"
  | "skeptical-learner"
  | "mistake-prone"
  | "advanced-learner";

export type TutorResponseStyle =
  | "concise"
  | "standard"
  | "step-by-step"
  | "socratic"
  | "visual"
  | "analogy-first"
  | "equation-first"
  | "exam-style"
  | "remedial"
  | "advanced";

export type HintDepth = "subtle" | "directional" | "equation" | "substitution" | "near-complete" | "final-check";

export type ExplanationVariant =
  | "kid-friendly"
  | "beginner"
  | "standard"
  | "advanced"
  | "exam-review"
  | "intuition-first"
  | "mathematical";

export type ExplainLikeMode =
  | "one-sentence"
  | "simple"
  | "middle-school"
  | "high-school"
  | "college"
  | "technical"
  | "analogy"
  | "equations-only"
  | "oral-exam";

export type AIConfidenceBand = "veryHigh" | "high" | "medium" | "low" | "failed";
export type VerificationStatus = "verified" | "unverified" | "mismatch" | "not-applicable" | "rounding-difference" | "unit-mismatch" | "sign-mismatch";
export type SourceType = "verifiedCalculation" | "educationalExplanation" | "mockGeneratedText" | "userProvidedContent" | "localFallback";
export type AIRequestState = "idle" | "loading" | "streaming" | "complete" | "error" | "cancelled";
export type AIMessageState = "sending" | "sent" | "failed" | "retrying" | "cancelled";
export type MockAIScenarioId = string;
export type RateLimitPhase = "first-request" | "near-limit" | "limited" | "recovered";
export type CacheStatus = "hit" | "miss" | "stale" | "invalid" | "expired";
export type IntentKind =
  | "conceptQuestion"
  | "problemSolving"
  | "hintRequest"
  | "answerCheck"
  | "simulationRequest"
  | "experimentRequest"
  | "unitQuestion"
  | "definition"
  | "comparison"
  | "examPrep"
  | "casual"
  | "ambiguous"
  | "outOfScope";

export type AnswerCheckKind =
  | "correct"
  | "almostCorrect"
  | "signError"
  | "unitError"
  | "formulaError"
  | "arithmeticError"
  | "conceptualError"
  | "unsupportedAssumption";

export type PracticeQuestionType =
  | "direct-substitution"
  | "multi-step"
  | "conceptual-comparison"
  | "graph-interpretation"
  | "unit-conversion"
  | "estimation"
  | "experimental-reasoning"
  | "what-if"
  | "error-analysis"
  | "equation-selection";

export type DifficultyBand = "intro" | "easy" | "medium" | "hard" | "challenge";

export type StreamEventKind = "start" | "chunk" | "complete" | "error" | "cancel";

export type MockAIResponseMeta = {
  requestId: string;
  scenarioId: MockAIScenarioId;
  providerMode: MockAIMode;
  createdAt: string;
  latencyMs: number;
  confidence: number;
  confidenceBand: AIConfidenceBand;
  responseType: string;
  conceptIds: string[];
  sourceType: SourceType;
  isMock: true;
  modelLabel: typeof MOCK_AI_PROVIDER_LABEL;
  verificationStatus: VerificationStatus;
  personaId?: LearnerPersonaId;
  style?: TutorResponseStyle;
};

export type MockAIRequest = {
  requestId: string;
  userId: string;
  sessionId: string;
  feature: MockAIFeature;
  prompt: string;
  context?: string;
  conceptIds: string[];
  problemId?: string;
  lessonId?: string;
  simulationId?: string;
  imageReference?: string;
  conversationHistory: MockAITurn[];
  personaId?: LearnerPersonaId;
  style?: TutorResponseStyle;
  hintDepth?: HintDepth;
  explainLike?: ExplainLikeMode;
  difficulty?: DifficultyBand;
  scenarioId?: MockAIScenarioId;
};

export type MockAITurn = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: string;
  state?: AIMessageState;
  conceptIds?: string[];
};

export type ReasoningSummary = {
  identifiedQuantities: string[];
  selectedPrinciple: string;
  equationUsed: string;
  unitCheck: string;
  resultCheck: string;
};

export type VisualExplanationMeta = {
  visualType: "diagram" | "graph" | "animation" | "simulation" | "none";
  diagramType?: "free-body" | "circuit" | "ray" | "energy" | "motion" | "wave";
  simulationId?: string;
  animationSuggestion?: string;
  highlightedVariables: string[];
};

export type TutorResponsePayload = TutorAnswer & {
  followUps: string[];
  style: TutorResponseStyle;
  personaId?: LearnerPersonaId;
  reasoning: ReasoningSummary;
  visual?: VisualExplanationMeta;
  sourceLabel: typeof MOCK_AI_PROVIDER_LABEL;
};

export type ExplanationResponse = {
  conceptId: string;
  learnerLevel: EducationLevel | "kid-friendly";
  style: ExplanationVariant;
  summary: string;
  intuition: string;
  formalExplanation: string;
  equations: string[];
  example: string;
  commonMistake: string;
  followUp: string;
};

export type HintResponse = {
  conceptId: string;
  problemId?: string;
  depth: HintDepth;
  text: string;
  revealsAnswer: boolean;
  nextDepth?: HintDepth;
};

export type ProblemAnalysisResponse = {
  problemId: string;
  conceptId: string;
  understanding: string;
  knownValues: Array<{ name: string; value: number; unit: string }>;
  unknown: string;
  principle: string;
  ambiguities: string[];
};

export type ProblemSolutionResponse = {
  problemId: string;
  problem: string;
  understanding: string;
  knownValues: Array<{ name: string; value: number; unit: string }>;
  unknown: string;
  principle: string;
  equation: string;
  substitution: string;
  calculation: string;
  unitCheck: string;
  finalAnswer: { value: number; unit: string };
  reasonablenessCheck: string;
  verificationStatus: VerificationStatus;
  assumptions?: string;
};

export type ConceptExplanationResponse = ExplanationResponse;
export type MisconceptionResponse = {
  id: string;
  conceptId: string;
  misconception: string;
  diagnosticResponse: string;
  correctExplanation: string;
  counterExample: string;
  visualSuggestion: string;
  practiceRecommendation: string;
};

export type RankedRecommendation = {
  targetId: string;
  kind: "lesson" | "practice" | "simulation" | "review" | "tutor" | "experiment";
  title: string;
  reason: string;
  score: number;
  conceptId: string;
};

export type RecommendationResponse = {
  items: RankedRecommendation[];
  learnerSummary: string;
};

export type ScanAnalysisResponse = {
  id: string;
  imageType: "textbook-problem" | "handwritten-equation" | "free-body" | "circuit" | "ray-diagram" | "graph" | "lab-setup" | "whiteboard" | "worksheet";
  mockImageReference: string;
  detectedText: string;
  detectedObjects: string[];
  equations: string[];
  variables: Array<{ name: string; value: number | null; unit: string; ambiguous?: boolean }>;
  units: string[];
  confidence: number;
  confidenceBand: AIConfidenceBand;
  ambiguities: string[];
  suggestedCorrection?: string;
  clarificationQuestion?: string;
  isMock: true;
};

export type SimulationRecommendationResponse = {
  question: string;
  conceptId: string;
  simulationId: string;
  whyHelpful: string;
  suggestedParameters: Record<string, number>;
};

export type LearningPlanResponse = {
  id: string;
  goal: string;
  currentLevel: EducationLevel | LearnerLevel;
  recommendedSequence: string[];
  estimatedDuration: string;
  priorityConcepts: string[];
  reviewSchedule: string[];
  milestones: string[];
};

export type ReviewResponse = {
  conceptId: string;
  explanation: string;
  recommendedProblems: string[];
  nextStep: string;
};

export type ConversationSummary = {
  id: string;
  sessionId: string;
  title: string;
  summary: string;
  concepts: string[];
  unresolvedQuestions: string[];
  recommendedNextStep: string;
  confidence: number;
};

export type ConversationTitle = {
  sessionId: string;
  title: string;
};

export type FollowUpSuggestions = {
  conceptId: string;
  prompts: string[];
};

export type ErrorResponse = {
  code: MockAIErrorCode;
  userMessage: string;
  developerMessage: string;
  retryable: boolean;
  fallbackAvailable: boolean;
  suggestedAction: string;
};

export type MockAIErrorCode =
  | "timeout"
  | "offline"
  | "rateLimited"
  | "serviceUnavailable"
  | "badRequest"
  | "unauthorized"
  | "providerError"
  | "malformedResponse"
  | "contentUnavailable"
  | "contextTooLarge"
  | "cancelled"
  | "emptyResponse"
  | "unsupported";

export type PracticeFeedbackResponse = {
  id: string;
  conceptId: string;
  whatWasRight: string;
  whatNeedsWork: string;
  concept: string;
  nextStep: string;
  recommendedHint: string;
  recommendedProblem: string;
  checkKind: AnswerCheckKind;
};

export type GeneratedPracticeItem = {
  id: string;
  conceptId: string;
  difficulty: DifficultyBand;
  questionType: PracticeQuestionType;
  learnerLevel: EducationLevel;
  problem: string;
  answer: { value: number; unit: string };
  solution: string;
  hints: string[];
  metadata: { seed: string; templateId: string; isMock: true };
};

export type AnalogyRecord = {
  id: string;
  conceptId: string;
  concept: string;
  analogy: string;
  mapping: string;
  limitation: string;
};

export type ComparisonRecord = {
  id: string;
  left: string;
  right: string;
  leftConceptId: string;
  rightConceptId: string;
  difference: string;
  relationship: string;
  example: string;
  commonConfusion: string;
};

export type GraphAnalysisResponse = {
  id: string;
  conceptId: string;
  graphType: "position-time" | "velocity-time" | "force-extension" | "iv" | "wave" | "energy" | "cooling";
  task: "describe-trend" | "identify-slope" | "identify-intercept" | "find-maximum" | "find-period" | "find-threshold" | "detect-outlier" | "compare-curves";
  description: string;
  result: string;
  caution: string;
};

export type TableAnalysisResponse = {
  id: string;
  conceptId: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  interpretation: string;
  missingUnits?: string;
  outlierNote?: string;
};

export type FlashcardRecord = {
  id: string;
  conceptId: string;
  type: "definition" | "equation" | "application" | "misconception" | "unit" | "visual" | "compare-contrast";
  front: string;
  back: string;
  lessonId?: string;
};

export type QuizSet = {
  id: string;
  title: string;
  conceptId: string;
  difficulty: DifficultyBand;
  estimatedTime: string;
  questions: Array<{ prompt: string; choices?: string[]; answer: string; explanation: string }>;
  answerKey: string[];
};

export type DailyCoachMessage = {
  day: number;
  kind: "streak" | "review" | "concept" | "experiment" | "reflection" | "challenge";
  title: string;
  body: string;
};

export type ExamAnalysisResponse = {
  id: string;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  timeManagement: string;
  conceptGaps: string[];
  recommendedReview: string[];
  recommendedProblems: string[];
};

export type ProgressNarrative = {
  userId: string;
  narrative: string;
  strongConcepts: string[];
  weakConcepts: string[];
  nextFocus: string;
};

export type LearnerMemory = {
  userId: string;
  preferredStyle: TutorResponseStyle;
  recentConceptIds: string[];
  recurringMistakes: string[];
  knownStrengths: string[];
  recentQuestions: string[];
  savedInterests: string[];
  preferredDifficulty: DifficultyBand;
};

export type ParsedPhysicsQuestion = {
  text: string;
  conceptId: string;
  entities: Array<{ name: string; value: number; unit: string }>;
  unknown?: string;
  derived?: Array<{ name: string; value: number; unit: string; principle: string }>;
};

export type IntentRecord = {
  id: string;
  prompt: string;
  intent: IntentKind;
  conceptId?: string;
  entities?: ParsedPhysicsQuestion["entities"];
};

export type StreamChunk = {
  kind: StreamEventKind;
  index?: number;
  text?: string;
  error?: ErrorResponse;
};

export type MockAIWrapped<T> = {
  data: T;
  meta: MockAIResponseMeta;
};

export type TutorConversation = {
  id: string;
  userId: string;
  conceptId: string;
  topic: string;
  personaId: LearnerPersonaId;
  style: TutorResponseStyle;
  learnerLevel: EducationLevel;
  difficulty: MockDifficulty;
  outcome: "resolved" | "needs-practice" | "clarification" | "misconception-corrected";
  misconception?: string;
  title: string;
  startedAt: string;
  updatedAt: string;
  turns: MockAITurn[];
};

export type MockAIDemoUser = {
  id: string;
  displayName: string;
  personaId: LearnerPersonaId;
  learnerLevel: LearnerLevel;
  goal: LearnerGoal;
  memory: LearnerMemory;
  learning: Partial<LearningState>;
  conversationIds: string[];
};

export type SocraticStage =
  | "identify-knowns"
  | "identify-unknown"
  | "choose-principle"
  | "choose-equation"
  | "substitute"
  | "check-units"
  | "evaluate-answer";

export type AIProvider = {
  sendMessage(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<TutorResponsePayload>>;
  generateExplanation(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<ExplanationResponse>>;
  generateHint(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<HintResponse>>;
  analyzeProblem(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<ProblemAnalysisResponse>>;
  analyzeImage(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<ScanAnalysisResponse>>;
  generatePracticeFeedback(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<PracticeFeedbackResponse>>;
  generateRecommendations(request: MockAIRequest, signal?: AbortSignal): Promise<MockAIWrapped<RecommendationResponse>>;
  streamMessage(request: MockAIRequest, onChunk: (chunk: StreamChunk) => void, signal?: AbortSignal): Promise<MockAIWrapped<TutorResponsePayload>>;
};

export type { TutorAnswer, TutorStep };
