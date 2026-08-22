import { describe, expect, it } from "vitest";
import { isValidDraft, parseLearningState } from "../lib/progress-store";

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
});
