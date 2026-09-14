import { describe, expect, it } from "vitest";
import { checksumFor, safeJsonParse, safeJsonStringify } from "../lib/storage/safe-json";
import { migrateDraft, migrateLearningState, migrateNotebookEntry, migrateOnboarding, migratePreferences } from "../lib/storage/migrations";
import { learningStateSchema, notebookEntrySchema, parseWithSchema, preferencesSchema, retryQueueItemSchema } from "../lib/storage/schemas";

describe("persistence schemas and migrations", () => {
  it("parses complete preferences with safeParse semantics", () => {
    const parsed = preferencesSchema.safeParse({ streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" });
    expect(parsed.success).toBe(true);
    expect(preferencesSchema.safeParse({ locale: "xx" }).success).toBe(false);
  });

  it("migrates older preferences without inventing locale codes", () => {
    const migrated = migratePreferences({ streakEnabled: false, reducedMotion: true });
    expect(migrated.ok).toBe(true);
    if (migrated.ok) {
      expect(migrated.data.hapticsEnabled).toBe(true);
      expect(migrated.data.locale).toBe("en");
    }
  });

  it("refuses to migrate malformed learning state into defaults", () => {
    const migrated = migrateLearningState("not-json-object");
    expect(migrated.ok).toBe(false);
  });

  it("accepts a complete learning-state record", () => {
    const parsed = parseWithSchema(learningStateSchema, {
      attempts: 1,
      correct: 1,
      savedQuestions: ["q"],
      topics: { kinematics: { attempts: 1, correct: 1, hints: 0, confidenceTotal: 3 } },
      streak: 1,
      lessonsCompleted: 0,
      labsCompleted: 0,
    }, "learning");
    expect(parsed.ok).toBe(true);
  });

  it("rejects a notebook entry that is missing content", () => {
    expect(notebookEntrySchema.safeParse({ id: "1", title: "t", type: "experiment", links: [], createdAt: "2026-01-01T00:00:00.000Z" }).success).toBe(false);
    const migrated = migrateNotebookEntry({ id: "1", title: "t", type: "experiment", content: "ok", links: ["kinematics"], createdAt: "2026-01-01T00:00:00.000Z" });
    expect(migrated.ok).toBe(true);
  });

  it("migrates onboarding and draft records", () => {
    expect(migrateOnboarding({ completed: true, level: "exam" }).ok).toBe(true);
    expect(migrateDraft({ id: "tutor", data: { question: "Why?" }, updatedAt: 10 }).ok).toBe(true);
    expect(migrateDraft({ id: "", data: {}, updatedAt: -1 }).ok).toBe(false);
  });

  it("parses JSON safely and checksums payloads", () => {
    expect(safeJsonParse("{").ok).toBe(false);
    expect(safeJsonParse("{\"a\":1}").ok).toBe(true);
    expect(safeJsonStringify({ a: 1 }).ok).toBe(true);
    expect(checksumFor({ a: 1 })).toEqual(checksumFor({ a: 1 }));
    expect(checksumFor({ a: 1 })).not.toEqual(checksumFor({ a: 2 }));
  });

  it("rejects oversized or invalid retry queue items through the schema", () => {
    expect(retryQueueItemSchema.safeParse({ id: "", payload: {}, queuedAt: 1 }).success).toBe(false);
    expect(retryQueueItemSchema.safeParse({ id: "draft", payload: { question: "ok" }, queuedAt: 1 }).success).toBe(true);
  });
});
