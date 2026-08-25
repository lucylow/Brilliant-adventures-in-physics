import { describe, expect, it } from "vitest";
import { completionTimelineEntries, formatCompletionDate, isValidDraft, parseCompletionEvents, parseLearningState, summarizeCompletionEvents } from "../lib/progress-store";

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
  it("sorts timeline entries newest-first, filters by kind, and falls back for invalid dates", () => {
    const events = [
      { id: "lesson:one", kind: "lesson" as const, contentId: "one", topic: "kinematics", completedAt: "2026-01-01T00:00:00.000Z" },
      { id: "lab:one", kind: "lab" as const, contentId: "one", topic: "kinematics", completedAt: "2026-01-03T00:00:00.000Z" },
      { id: "lesson:two", kind: "lesson" as const, contentId: "two", topic: "energy", completedAt: "2026-01-02T00:00:00.000Z" },
    ];
    expect(completionTimelineEntries(events, "all", 2).map((event) => event.id)).toEqual(["lab:one", "lesson:two"]);
    expect(completionTimelineEntries(events, "lesson").map((event) => event.id)).toEqual(["lesson:two", "lesson:one"]);
    expect(completionTimelineEntries(events, "lab", 0)).toEqual([]);
    expect(formatCompletionDate("2026-01-02T00:00:00.000Z", "fr")).not.toBe("—");
    expect(formatCompletionDate("invalid", "en")).toBe("—");
  });
});
