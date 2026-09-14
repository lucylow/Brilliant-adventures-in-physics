import { CURRENT_SCHEMA_VERSION } from "./storage-keys";
import {
  learningStateSchema,
  notebookEntrySchema,
  onboardingSchema,
  preferencesSchema,
  sessionDraftSchema,
  type LearningStateRecord,
  type NotebookEntryRecord,
  type OnboardingRecord,
  type PreferencesRecord,
  type SessionDraftRecord,
} from "./schemas";
import { SerializationError, err, ok, type Result } from "../../shared/errors";

export { CURRENT_SCHEMA_VERSION } from "./storage-keys";

function withVersion<T extends { schemaVersion?: number }>(value: T): T & { schemaVersion: number } {
  return { ...value, schemaVersion: CURRENT_SCHEMA_VERSION };
}

export function migratePreferences(input: unknown): Result<PreferencesRecord, SerializationError> {
  const parsed = preferencesSchema.safeParse(input);
  if (parsed.success) return ok(withVersion(parsed.data));
  if (!input || typeof input !== "object") {
    return err(new SerializationError({ message: "Preferences record is malformed", operation: "migratePreferences" }));
  }
  const stored = input as Record<string, unknown>;
  const candidate = {
    streakEnabled: typeof stored.streakEnabled === "boolean" ? stored.streakEnabled : true,
    reducedMotion: typeof stored.reducedMotion === "boolean" ? stored.reducedMotion : false,
    hapticsEnabled: typeof stored.hapticsEnabled === "boolean" ? stored.hapticsEnabled : true,
    locale: stored.locale === "fr" || stored.locale === "es" || stored.locale === "en" ? stored.locale : "en",
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
  const migrated = preferencesSchema.safeParse(candidate);
  return migrated.success
    ? ok(migrated.data)
    : err(new SerializationError({ message: "Preferences record is malformed", operation: "migratePreferences" }));
}

export function migrateOnboarding(input: unknown): Result<OnboardingRecord, SerializationError> {
  const parsed = onboardingSchema.safeParse(input);
  if (parsed.success) return ok(withVersion(parsed.data));
  if (!input || typeof input !== "object") {
    return err(new SerializationError({ message: "Onboarding record is malformed", operation: "migrateOnboarding" }));
  }
  const stored = input as Record<string, unknown>;
  const candidate = {
    completed: stored.completed === true,
    level: stored.level === "school" || stored.level === "exam" ? stored.level : "new",
    goal: stored.goal === "practice" || stored.goal === "experiment" ? stored.goal : "understand",
    step: stored.step === 1 || stored.step === 2 ? stored.step : 0,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
  const migrated = onboardingSchema.safeParse(candidate);
  return migrated.success
    ? ok(migrated.data)
    : err(new SerializationError({ message: "Onboarding record is malformed", operation: "migrateOnboarding" }));
}

export function migrateLearningState(input: unknown): Result<LearningStateRecord, SerializationError> {
  const parsed = learningStateSchema.safeParse(input);
  if (parsed.success) return ok(withVersion(parsed.data));
  return err(new SerializationError({ message: "Learning state is malformed", operation: "migrateLearningState" }));
}

export function migrateDraft(input: unknown): Result<SessionDraftRecord, SerializationError> {
  const parsed = sessionDraftSchema.safeParse(input);
  if (parsed.success) return ok(withVersion(parsed.data));
  return err(new SerializationError({ message: "Draft record is malformed", operation: "migrateDraft" }));
}

export function migrateNotebookEntry(input: unknown): Result<NotebookEntryRecord, SerializationError> {
  const parsed = notebookEntrySchema.safeParse(input);
  if (parsed.success) return ok(withVersion(parsed.data));
  return err(new SerializationError({ message: "Notebook entry is malformed", operation: "migrateNotebookEntry" }));
}
