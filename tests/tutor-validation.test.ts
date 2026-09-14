import { describe, expect, it } from "vitest";
import { isLabeledFallback, labeledLocalFallback, parseTutorAnswer, parseTutorRequest } from "../lib/tutor-validation";
import { requestTutorAnswerWithFallback } from "../lib/tutor-service";
import { serviceFailure, type Service } from "../lib/service-result";
import type { TutorAnswer } from "../lib/ai";

describe("tutor validation and fallback", () => {
  it("rejects blank and oversized questions", () => {
    expect(parseTutorRequest({ question: "   " }).ok).toBe(false);
    expect(parseTutorRequest({ question: "Why does ice float?" }).ok).toBe(true);
  });

  it("rejects empty and malformed provider responses", () => {
    expect(parseTutorAnswer(null).ok).toBe(false);
    expect(parseTutorAnswer({}).ok).toBe(false);
    expect(parseTutorAnswer({ summary: "ok" }).ok).toBe(false);
  });

  it("accepts a complete structured answer", () => {
    const parsed = parseTutorAnswer(labeledLocalFallback("Explain force"));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(isLabeledFallback(parsed.data)).toBe(true);
      expect(parsed.data.confidence).toBe(0);
      expect(parsed.data.warnings?.[0]).toMatch(/fallback/i);
    }
  });

  it("labels local fallback and does not invent a calculation", async () => {
    const unavailable: Service<{ question: string }, TutorAnswer> = { execute: async () => serviceFailure("TIMEOUT", "timed out") };
    const result = await requestTutorAnswerWithFallback(unavailable, { question: "Find the range" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.usedFallback).toBe(true);
      expect(result.data.summary).toContain("[Local fallback]");
      expect(result.data.summary).not.toMatch(/\d+\.\d+ m/);
    }
  });
});
