import { describe, expect, it } from "vitest";
import { executeService, isServiceSuccess, normalizeServiceError, serviceFailure } from "../lib/service-result";
import { mergePreferences } from "../lib/preferences";

describe("service result contracts", () => {
  it("returns injected service data without changing it", async () => {
    const result = await executeService({ execute: async (input: number) => ({ ok: true as const, data: input * 2 }) }, 3);
    expect(result).toEqual({ ok: true, data: 6 });
    expect(isServiceSuccess(result) && result.data).toBe(6);
  });
  it("normalizes thrown errors into retryable typed failures", async () => {
    const result = await executeService({ execute: async () => { throw new Error("network unavailable"); } }, undefined);
    expect(result).toEqual({ ok: false, error: { code: "OFFLINE", message: "The network is unavailable. Please reconnect and try again.", retryable: true } });
  });
  it("normalizes transport and cancellation errors into retryable codes", () => {
    expect(normalizeServiceError(new Error("Network request failed"))).toMatchObject({ code: "OFFLINE", retryable: true });
    expect(normalizeServiceError(new Error("request timed out"))).toMatchObject({ code: "TIMEOUT", retryable: true });
    expect(normalizeServiceError({ message: "unknown" })).toMatchObject({ code: "UNEXPECTED_ERROR", retryable: true });
  });
  it("migrates older preferences with haptics enabled by default", () => {
    expect(mergePreferences({ streakEnabled: false, reducedMotion: true })).toEqual({ streakEnabled: false, reducedMotion: true, hapticsEnabled: true });
    expect(mergePreferences({ hapticsEnabled: false }).hapticsEnabled).toBe(false);
  });
  it("keeps validation failures non-retryable and transport failures retryable", () => {
    const validation = serviceFailure("VALIDATION_ERROR", "Speed is required");
    const offline = serviceFailure("OFFLINE", "No connection");
    expect(validation).toEqual({ ok: false, error: { code: "VALIDATION_ERROR", message: "Speed is required", retryable: false } });
    if (!offline.ok) expect(offline.error.retryable).toBe(true);
  });
});
