import { describe, expect, it } from "vitest";
import { createDeterministicTutorService, requestTutorAnswer, requestTutorAnswerWithFallback, validateTutorRequest } from "../lib/tutor-service";
import { serviceFailure, type Service } from "../lib/service-result";
import type { TutorAnswer } from "../lib/ai";

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
  it("uses a clearly labeled local mock fallback for retryable failures", async () => {
    const unavailable: Service<{ question: string }, TutorAnswer> = { execute: async () => serviceFailure("OFFLINE", "offline") };
    const result = await requestTutorAnswerWithFallback(unavailable, { question: "  Explain force  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.usedFallback).toBe(true);
      expect(result.data.summary).toContain("Explain force");
    }
  });

  it("does not replace validation failures with mock content", async () => {
    const unavailable: Service<{ question: string }, TutorAnswer> = { execute: async () => serviceFailure("OFFLINE", "offline") };
    const result = await requestTutorAnswerWithFallback(unavailable, { question: "   " });
    expect(result).toEqual({ ok: false, error: { code: "VALIDATION_ERROR", message: "Ask a physics question before sending.", retryable: false } });
  });

  it("trims surrounding whitespace before execution", async () => {
    const result = await requestTutorAnswer(createDeterministicTutorService(), { question: "  Explain force  " });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.summary).toContain("Explain force");
  });
});
