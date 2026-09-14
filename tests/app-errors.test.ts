import { afterEach, describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ERROR_CODES,
  NetworkError,
  PhysicsDomainError,
  ValidationError,
  assertNever,
  err,
  getFriendlyErrorMessage,
  isRetryableError,
  normalizeError,
  ok,
  sanitizeMetadata,
  shouldRetryError,
} from "../shared/errors";
import { setDiagnosticSink } from "../lib/diagnostics";

describe("typed application errors", () => {
  afterEach(() => setDiagnosticSink(null));

  it("keeps validation errors non-retryable", () => {
    const error = new ValidationError({ message: "Speed is required", operation: "scan" });
    expect(error.code).toBe(ERROR_CODES.VALIDATION);
    expect(error.retryable).toBe(false);
    expect(error.userMessage.toLowerCase()).not.toContain("something went wrong");
  });

  it("marks network and timeout failures retryable", () => {
    expect(isRetryableError(new Error("failed to fetch"))).toBe(true);
    expect(isRetryableError(new Error("request timed out"))).toBe(true);
    expect(shouldRetryError(new NetworkError({ message: "offline" }), undefined, 0)).toBe(true);
  });

  it("does not retry authentication or physics domain errors", () => {
    expect(isRetryableError(new AuthenticationError({ message: "not signed in" }))).toBe(false);
    expect(isRetryableError(new PhysicsDomainError({ message: "mass must be positive" }))).toBe(false);
    expect(shouldRetryError(new ValidationError({ message: "invalid" }), undefined, 0)).toBe(false);
  });

  it("redacts secrets from metadata and friendly copy", () => {
    const error = normalizeError(new Error("Bearer eyJhbGci.abc.def failed"), {
      safeMetadata: { Authorization: "Bearer secret-token", question: "ok" },
    });
    expect(JSON.stringify(error.safeMetadata)).not.toMatch(/secret-token/i);
    expect(error.safeMetadata.Authorization).toBe("[redacted]");
    expect(sanitizeMetadata({ apiKey: "sk-test", nested: { password: "p" } })).toEqual({ apiKey: "[redacted]", nested: { password: "[redacted]" } });
  });

  it("returns Result helpers without throwing", () => {
    expect(ok(3)).toEqual({ ok: true, data: 3 });
    expect(err("no").ok).toBe(false);
    expect(getFriendlyErrorMessage(new Error("offline"))).toMatch(/offline|reconnect|device/i);
  });

  it("assertNever throws for exhausted unions", () => {
    expect(() => assertNever("nope" as never)).toThrow("Unexpected value");
  });
});
