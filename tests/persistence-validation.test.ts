import { describe, expect, it } from "vitest";
import { isValidDraft, parseCompletionEvents, parseLearningState, summarizeCompletionEvents } from "../lib/progress-store";

describe("persistence validation", () => {
  it("falls back safely for malformed learning state and clamps impossible counts", () => {
    const parsed = parseLearningState({ attempts: 2, correct: 9, savedQuestions: ["Q", 4], topics: { Motion: { attempts: 3, correct: 8, hints: 1, confidenceTotal: 6 }, Broken: null }, streak: -1 });
    expect(parsed.attempts).toBe(2);
    expect(parsed.correct).toBe(2);
    expect(parsed.savedQuestions).toEqual(["Q"]);
    expect(parsed.topics.Motion.correct).toBe(3);
    expect(parsed.topics.Broken).toBeUndefined();
    expect(parsed.streak).toBe(0);
  });
  it("rejects malformed and expired-shape drafts before restoration", () => {
    expect(isValidDraft({ id: "practice", updatedAt: Date.now(), data: {} })).toBe(true);
    expect(isValidDraft({ id: "", updatedAt: Date.now(), data: {} })).toBe(false);
    expect(isValidDraft({ id: "practice", updatedAt: 0, data: {} })).toBe(false);
    expect(isValidDraft({ id: "practice", updatedAt: Date.now() })).toBe(false);
  });
  it("filters invalid completion events, removes duplicate ids, and keeps the newest bound", () => {
    const parsed = parseCompletionEvents([
      { id: "lesson:projectile-motion", kind: "lesson", topic: "projectile-motion", completedAt: "2026-01-01T00:00:00.000Z" },
      { id: "lesson:projectile-motion", kind: "lesson", topic: "projectile-motion", completedAt: "2026-01-02T00:00:00.000Z" },
      { id: "bad", kind: "lesson", topic: "", completedAt: "not-a-date" },
    ]);
    expect(parsed).toEqual([{ id: "lesson:projectile-motion", kind: "lesson", contentId: "projectile-motion", topic: "projectile-motion", completedAt: "2026-01-01T00:00:00.000Z" }]);
    expect(summarizeCompletionEvents(parsed)).toEqual({ total: 1, lessons: 1, labs: 0, topics: ["projectile-motion"] });
    expect(summarizeCompletionEvents([
      ...parsed,
      { id: "lab:projectile-motion", kind: "lab", contentId: "projectile-motion", topic: "projectile-motion", completedAt: "2026-01-03T00:00:00.000Z" },
    ])).toEqual({ total: 2, lessons: 1, labs: 1, topics: ["projectile-motion"] });
  });
});
