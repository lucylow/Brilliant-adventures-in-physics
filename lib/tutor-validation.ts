import { z } from "zod";
import { TutorServiceError, ValidationError, err, ok, type Result } from "../shared/errors";
import type { TutorAnswer, TutorStep } from "./ai";
import { sanitizeText } from "./ai";

export const tutorStepSchema = z.object({
  label: z.string().min(1).max(200),
  detail: z.string().min(1).max(4000),
});

export const tutorVerifiedValueSchema = z.object({
  name: z.string().min(1).max(80),
  value: z.number().finite(),
  unit: z.string().min(1).max(24),
});

export const tutorAnswerSchema = z.object({
  summary: z.string().min(1).max(4000),
  concept: z.string().min(1).max(160),
  steps: z.array(tutorStepSchema).min(1).max(12),
  equations: z.array(z.string().max(400)).max(12),
  verifiedValues: z.array(tutorVerifiedValueSchema).max(20),
  hint: z.string().max(1000),
  nextAction: z.string().max(400),
  confidence: z.number().finite().min(0).max(1),
  warnings: z.array(z.string().max(400)).max(8).optional(),
  variables: z.array(z.string().max(80)).max(20).optional(),
  units: z.array(z.string().max(24)).max(20).optional(),
  questions: z.array(z.string().max(400)).max(6).optional(),
});

export const tutorRequestSchema = z.object({
  question: z.string().trim().min(1).max(20000),
  verifiedValues: z.array(tutorVerifiedValueSchema).max(20).optional(),
});

export type StructuredTutorAnswer = z.infer<typeof tutorAnswerSchema>;

export function parseTutorRequest(input: unknown): Result<{ question: string; verifiedValues?: TutorAnswer["verifiedValues"] }, ValidationError> {
  const parsed = tutorRequestSchema.safeParse(input);
  if (!parsed.success) {
    return err(new ValidationError({
      message: "Ask a physics question before sending.",
      operation: "parseTutorRequest",
      feature: "tutor",
    }));
  }
  return ok({
    question: sanitizeText(parsed.data.question),
    verifiedValues: parsed.data.verifiedValues,
  });
}

export function parseTutorAnswer(input: unknown): Result<StructuredTutorAnswer, TutorServiceError> {
  if (input == null || (typeof input === "object" && Object.keys(input as object).length === 0)) {
    return err(new TutorServiceError({
      message: "Tutor returned an empty response",
      operation: "parseTutorAnswer",
      feature: "tutor",
    }));
  }
  const parsed = tutorAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return err(new TutorServiceError({
      message: "Tutor response was malformed",
      operation: "parseTutorAnswer",
      feature: "tutor",
      retryable: false,
      safeMetadata: { issues: parsed.error.issues.slice(0, 6).map((issue) => issue.path.join(".")) },
    }));
  }
  const data = parsed.data;
  return ok({
    ...data,
    summary: sanitizeText(data.summary),
    concept: sanitizeText(data.concept),
    hint: sanitizeText(data.hint),
    nextAction: sanitizeText(data.nextAction),
    steps: data.steps.map((step: TutorStep) => ({ label: sanitizeText(step.label), detail: sanitizeText(step.detail) })),
    equations: data.equations.map(sanitizeText),
    warnings: data.warnings?.map(sanitizeText),
  });
}

export function labeledLocalFallback(question: string, verifiedValues: TutorAnswer["verifiedValues"] = []): StructuredTutorAnswer {
  const clean = sanitizeText(question);
  return {
    summary: `[Local fallback] Let’s break down “${clean || "this physics question"}” using known values, a governing equation, and a unit check. This is not a live AI response.`,
    concept: "Problem decomposition",
    steps: [
      { label: "Identify the knowns", detail: "Write each value with its unit before choosing a formula." },
      { label: "Choose the principle", detail: "Match the quantities to a supported physics relationship." },
      { label: "Verify the result", detail: "Use the deterministic calculator for numbers. This fallback does not invent a calculation." },
    ],
    equations: ["known values → governing equation → verified result"],
    verifiedValues,
    hint: "What quantity is the problem asking you to find?",
    nextAction: "Use Lab or Practice for a verified calculation.",
    confidence: 0,
    warnings: ["Local fallback only. Deterministic physics was not replaced by this explanation."],
  };
}

export function isLabeledFallback(answer: Pick<StructuredTutorAnswer, "summary" | "warnings">): boolean {
  return answer.summary.startsWith("[Local fallback]") || Boolean(answer.warnings?.some((warning) => warning.includes("Local fallback")));
}
