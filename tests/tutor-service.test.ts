import { describe, expect, it } from "vitest";
import { createDeterministicTutorService, requestTutorAnswer, validateTutorRequest } from "../lib/tutor-service";

describe("Tutor service boundary", () => {
  it("rejects blank questions with a non-retryable validation error", () => {
    const result = validateTutorRequest({ question: "   " });
    expect(result).toEqual({ ok: false, error: { code: "VALIDATION_ERROR", message: "Ask a physics question before sending.", retryable: false } });
  });
  it("returns a structured deterministic answer for a valid question", async () => {
    const result = await requestTutorAnswer(createDeterministicTutorService(), { question: "Why does an object accelerate?" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.steps.length).toBeGreaterThan(0);
      expect(result.data.summary).not.toContain("<script>");
    }
  });
  it("trims surrounding whitespace before execution", async () => {
    const result = await requestTutorAnswer(createDeterministicTutorService(), { question: "  Explain force  " });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.summary).toContain("Explain force");
  });
});
