import { z } from "zod";
import { SerializationError, err, ok, type Result } from "../../shared/errors";

const finiteNonNegative = z.number().finite().nonnegative();
const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "timestamp");

export const preferencesSchema = z.object({
  streakEnabled: z.boolean(),
  reducedMotion: z.boolean(),
  hapticsEnabled: z.boolean(),
  locale: z.enum(["en", "fr", "es"]),
  schemaVersion: z.number().int().positive().optional(),
});

export const onboardingSchema = z.object({
  completed: z.boolean(),
  level: z.enum(["new", "school", "exam"]),
  goal: z.enum(["understand", "practice", "experiment"]),
  step: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  schemaVersion: z.number().int().positive().optional(),
});

export const topicMasterySchema = z.object({
  attempts: finiteNonNegative,
  correct: finiteNonNegative,
  hints: finiteNonNegative,
  confidenceTotal: finiteNonNegative,
});

export const completionEventSchema = z.object({
  id: z.string().min(1).max(160),
  kind: z.enum(["lesson", "lab"]),
  contentId: z.string().min(1).max(160),
  topic: z.string().min(1).max(160),
  completedAt: isoDate,
});

export const learningStateSchema = z.object({
  attempts: finiteNonNegative,
  correct: finiteNonNegative,
  lastTopic: z.string().max(160).optional(),
  savedQuestions: z.array(z.string().max(20000)).max(100),
  topics: z.record(z.string(), topicMasterySchema),
  lastStudyDate: z.string().optional(),
  streak: finiteNonNegative,
  lessonsCompleted: finiteNonNegative,
  labsCompleted: finiteNonNegative,
  completionEvents: z.array(completionEventSchema).max(200).optional(),
  schemaVersion: z.number().int().positive().optional(),
});

export const sessionDraftSchema = z.object({
  id: z.string().min(1).max(80),
  data: z.unknown(),
  updatedAt: z.number().finite().positive(),
  schemaVersion: z.number().int().positive().optional(),
});

export const tutorDraftDataSchema = z.object({
  question: z.string().max(20000).optional(),
  answerSummary: z.string().max(20000).optional(),
});

export const practiceDraftDataSchema = z.object({
  answer: z.string().max(200).optional(),
  index: z.number().int().nonnegative().optional(),
});

export const lensDraftDataSchema = z.object({
  measurements: z.array(z.unknown()).max(100).optional(),
  notes: z.string().max(4000).optional(),
  media: z.unknown().optional(),
});

export const notebookEntrySchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  type: z.enum(["experiment", "reflection", "mistake"]),
  content: z.string().min(1).max(8000),
  links: z.array(z.string().max(80)).max(20),
  createdAt: isoDate,
  media: z.object({
    uri: z.string().max(4096).optional(),
    caption: z.string().max(160).optional(),
    capturedAt: isoDate.optional(),
  }).optional(),
  schemaVersion: z.number().int().positive().optional(),
});

export const savedExperimentSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  points: z.array(z.object({ time: z.number().finite(), distance: z.number().finite() })).min(1).max(200),
  summary: z.string().min(1).max(2000),
  createdAt: isoDate,
  schemaVersion: z.number().int().positive().optional(),
});

export const achievementRecordSchema = z.object({
  id: z.string().min(1).max(80),
  earnedAt: isoDate,
  evidenceCount: finiteNonNegative.optional(),
});

export const retryQueueItemSchema = z.object({
  id: z.string().min(1).max(80),
  payload: z.unknown(),
  queuedAt: z.number().finite().nonnegative(),
  type: z.string().min(1).max(40).optional(),
  createdAt: z.number().finite().nonnegative().optional(),
  updatedAt: z.number().finite().nonnegative().optional(),
  attempts: z.number().int().nonnegative().optional(),
  nextAttemptAt: z.number().finite().nonnegative().optional(),
  checksum: z.string().max(64).optional(),
  version: z.number().int().positive().optional(),
});

export const privacyActivitySchema = z.object({
  id: z.string().min(1).max(128),
  kind: z.enum(["share", "clear"]),
  outcome: z.enum(["success", "unavailable", "failure"]),
  occurredAt: isoDate,
});

export const usageStateSchema = z.object({
  date: z.string().min(8).max(32),
  tutorUsed: finiteNonNegative,
  tutorLimit: z.number().finite().positive(),
});

export function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown, operation: string): Result<T, SerializationError> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return err(new SerializationError({
      message: `${operation} record is malformed`,
      operation,
      safeMetadata: { issues: parsed.error.issues.slice(0, 6).map((issue) => issue.path.join(".") || issue.code) },
    }));
  }
  return ok(parsed.data);
}

export type PreferencesRecord = z.infer<typeof preferencesSchema>;
export type OnboardingRecord = z.infer<typeof onboardingSchema>;
export type LearningStateRecord = z.infer<typeof learningStateSchema>;
export type SessionDraftRecord = z.infer<typeof sessionDraftSchema>;
export type NotebookEntryRecord = z.infer<typeof notebookEntrySchema>;
export type SavedExperimentRecord = z.infer<typeof savedExperimentSchema>;
export type RetryQueueItemRecord = z.infer<typeof retryQueueItemSchema>;
export type PrivacyActivityRecord = z.infer<typeof privacyActivitySchema>;
