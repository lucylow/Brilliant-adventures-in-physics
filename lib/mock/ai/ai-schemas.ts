import { z } from "zod";
import { tutorAnswerSchema } from "@/lib/tutor-validation";

export const mockAIModeSchema = z.enum([
  "mock-off",
  "mock-basic",
  "mock-rich",
  "mock-streaming",
  "mock-offline",
  "mock-error",
  "mock-slow",
  "mock-deterministic",
]);

export const sourceTypeSchema = z.enum([
  "verifiedCalculation",
  "educationalExplanation",
  "mockGeneratedText",
  "userProvidedContent",
  "localFallback",
]);

export const verificationStatusSchema = z.enum([
  "verified",
  "unverified",
  "mismatch",
  "not-applicable",
  "rounding-difference",
  "unit-mismatch",
  "sign-mismatch",
]);

export const confidenceBandSchema = z.enum(["veryHigh", "high", "medium", "low", "failed"]);

export const mockAIMetaSchema = z.object({
  requestId: z.string().min(1).max(120),
  scenarioId: z.string().min(1).max(120),
  providerMode: mockAIModeSchema,
  createdAt: z.string().min(10).max(40),
  latencyMs: z.number().finite().min(0).max(120_000),
  confidence: z.number().finite().min(0).max(1),
  confidenceBand: confidenceBandSchema,
  responseType: z.string().min(1).max(80),
  conceptIds: z.array(z.string().min(1).max(80)).max(20),
  sourceType: sourceTypeSchema,
  isMock: z.literal(true),
  modelLabel: z.literal("Demo AI"),
  verificationStatus: verificationStatusSchema,
  personaId: z.string().max(80).optional(),
  style: z.string().max(40).optional(),
});

export const reasoningSummarySchema = z.object({
  identifiedQuantities: z.array(z.string().max(200)).max(12),
  selectedPrinciple: z.string().min(1).max(400),
  equationUsed: z.string().max(400),
  unitCheck: z.string().max(400),
  resultCheck: z.string().max(400),
});

export const tutorResponsePayloadSchema = tutorAnswerSchema.extend({
  followUps: z.array(z.string().min(1).max(240)).max(8),
  style: z.string().min(1).max(40),
  personaId: z.string().max(80).optional(),
  reasoning: reasoningSummarySchema,
  visual: z.object({
    visualType: z.enum(["diagram", "graph", "animation", "simulation", "none"]),
    diagramType: z.enum(["free-body", "circuit", "ray", "energy", "motion", "wave"]).optional(),
    simulationId: z.string().max(80).optional(),
    animationSuggestion: z.string().max(400).optional(),
    highlightedVariables: z.array(z.string().max(40)).max(12),
  }).optional(),
  sourceLabel: z.literal("Demo AI"),
});

export const explanationResponseSchema = z.object({
  conceptId: z.string().min(1).max(80),
  learnerLevel: z.string().min(1).max(40),
  style: z.string().min(1).max(40),
  summary: z.string().min(1).max(4000),
  intuition: z.string().min(1).max(4000),
  formalExplanation: z.string().min(1).max(8000),
  equations: z.array(z.string().max(400)).max(12),
  example: z.string().min(1).max(4000),
  commonMistake: z.string().min(1).max(2000),
  followUp: z.string().min(1).max(400),
});

export const hintResponseSchema = z.object({
  conceptId: z.string().min(1).max(80),
  problemId: z.string().max(80).optional(),
  depth: z.enum(["subtle", "directional", "equation", "substitution", "near-complete", "final-check"]),
  text: z.string().min(1).max(2000),
  revealsAnswer: z.boolean(),
  nextDepth: z.enum(["subtle", "directional", "equation", "substitution", "near-complete", "final-check"]).optional(),
});

export const knownValueSchema = z.object({
  name: z.string().min(1).max(80),
  value: z.number().finite(),
  unit: z.string().min(1).max(24),
});

export const problemSolutionSchema = z.object({
  problemId: z.string().min(1).max(80),
  problem: z.string().min(1).max(2000),
  understanding: z.string().min(1).max(2000),
  knownValues: z.array(knownValueSchema).max(12),
  unknown: z.string().min(1).max(120),
  principle: z.string().min(1).max(400),
  equation: z.string().min(1).max(400),
  substitution: z.string().min(1).max(1000),
  calculation: z.string().min(1).max(1000),
  unitCheck: z.string().min(1).max(400),
  finalAnswer: z.object({ value: z.number().finite(), unit: z.string().min(1).max(24) }),
  reasonablenessCheck: z.string().min(1).max(800),
  verificationStatus: verificationStatusSchema,
  assumptions: z.string().max(800).optional(),
});

export const misconceptionResponseSchema = z.object({
  id: z.string().min(1).max(80),
  conceptId: z.string().min(1).max(80),
  misconception: z.string().min(1).max(800),
  diagnosticResponse: z.string().min(1).max(2000),
  correctExplanation: z.string().min(1).max(4000),
  counterExample: z.string().min(1).max(2000),
  visualSuggestion: z.string().min(1).max(800),
  practiceRecommendation: z.string().min(1).max(800),
});

export const scanAnalysisSchema = z.object({
  id: z.string().min(1).max(80),
  imageType: z.enum(["textbook-problem", "handwritten-equation", "free-body", "circuit", "ray-diagram", "graph", "lab-setup", "whiteboard", "worksheet"]),
  mockImageReference: z.string().min(1).max(160),
  detectedText: z.string().max(4000),
  detectedObjects: z.array(z.string().max(80)).max(20),
  equations: z.array(z.string().max(400)).max(12),
  variables: z.array(z.object({
    name: z.string().min(1).max(80),
    value: z.number().finite().nullable(),
    unit: z.string().max(24),
    ambiguous: z.boolean().optional(),
  })).max(20),
  units: z.array(z.string().max(24)).max(20),
  confidence: z.number().finite().min(0).max(1),
  confidenceBand: confidenceBandSchema,
  ambiguities: z.array(z.string().max(400)).max(12),
  suggestedCorrection: z.string().max(800).optional(),
  clarificationQuestion: z.string().max(800).optional(),
  isMock: z.literal(true),
});

export const recommendationResponseSchema = z.object({
  items: z.array(z.object({
    targetId: z.string().min(1).max(80),
    kind: z.enum(["lesson", "practice", "simulation", "review", "tutor", "experiment"]),
    title: z.string().min(1).max(200),
    reason: z.string().min(1).max(600),
    score: z.number().finite().min(0).max(1),
    conceptId: z.string().min(1).max(80),
  })).max(20),
  learnerSummary: z.string().min(1).max(2000),
});

export const learningPlanSchema = z.object({
  id: z.string().min(1).max(80),
  goal: z.string().min(1).max(400),
  currentLevel: z.string().min(1).max(40),
  recommendedSequence: z.array(z.string().min(1).max(120)).max(20),
  estimatedDuration: z.string().min(1).max(80),
  priorityConcepts: z.array(z.string().min(1).max(80)).max(20),
  reviewSchedule: z.array(z.string().max(200)).max(14),
  milestones: z.array(z.string().max(200)).max(12),
});

export const conversationSummarySchema = z.object({
  id: z.string().min(1).max(80),
  sessionId: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(4000),
  concepts: z.array(z.string().min(1).max(80)).max(12),
  unresolvedQuestions: z.array(z.string().max(400)).max(8),
  recommendedNextStep: z.string().min(1).max(400),
  confidence: z.number().finite().min(0).max(1),
});

export const mockAIRequestSchema = z.object({
  requestId: z.string().min(1).max(120),
  userId: z.string().min(1).max(80),
  sessionId: z.string().min(1).max(80),
  feature: z.string().min(1).max(40),
  prompt: z.string().trim().min(1).max(20000),
  context: z.string().max(8000).optional(),
  conceptIds: z.array(z.string().max(80)).max(20),
  problemId: z.string().max(80).optional(),
  lessonId: z.string().max(80).optional(),
  simulationId: z.string().max(80).optional(),
  imageReference: z.string().max(200).optional(),
  conversationHistory: z.array(z.object({
    id: z.string().min(1).max(80),
    role: z.enum(["user", "assistant", "system"]),
    text: z.string().max(8000),
    createdAt: z.string().min(10).max(40),
  })).max(40),
});

export const practiceFeedbackSchema = z.object({
  id: z.string().min(1).max(80),
  conceptId: z.string().min(1).max(80),
  whatWasRight: z.string().min(1).max(2000),
  whatNeedsWork: z.string().min(1).max(2000),
  concept: z.string().min(1).max(160),
  nextStep: z.string().min(1).max(800),
  recommendedHint: z.string().min(1).max(800),
  recommendedProblem: z.string().min(1).max(800),
  checkKind: z.enum(["correct", "almostCorrect", "signError", "unitError", "formulaError", "arithmeticError", "conceptualError", "unsupportedAssumption"]),
});

export const analogySchema = z.object({
  id: z.string().min(1).max(80),
  conceptId: z.string().min(1).max(80),
  concept: z.string().min(1).max(160),
  analogy: z.string().min(1).max(800),
  mapping: z.string().min(1).max(2000),
  limitation: z.string().min(1).max(2000),
});

export const comparisonSchema = z.object({
  id: z.string().min(1).max(80),
  left: z.string().min(1).max(80),
  right: z.string().min(1).max(80),
  leftConceptId: z.string().min(1).max(80),
  rightConceptId: z.string().min(1).max(80),
  difference: z.string().min(1).max(2000),
  relationship: z.string().min(1).max(2000),
  example: z.string().min(1).max(2000),
  commonConfusion: z.string().min(1).max(2000),
});

export function parseWith<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 6).map((issue) => issue.path.join(".") || issue.message).join("; ");
    throw new Error(`${label} failed schema validation: ${issues}`);
  }
  return parsed.data;
}
