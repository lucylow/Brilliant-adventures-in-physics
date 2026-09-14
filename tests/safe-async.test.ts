import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TimeoutError } from "../shared/errors";
import { createAsyncOperationGuard, createRequestGeneration, executeOnce, runSafely, withRetry, withTimeout } from "../lib/safe-async";
import { muteDiagnostics, setDiagnosticSink } from "../lib/diagnostics";

describe("safe async execution", () => {
  afterEach(() => setDiagnosticSink(null));
  beforeEach(() => muteDiagnostics());
  it("times out a hanging operation", async () => {
    await expect(withTimeout(async () => new Promise(() => undefined), 20, "hang")).rejects.toBeInstanceOf(TimeoutError);
  });

  it("retries retryable failures and then succeeds", async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts += 1;
      if (attempts < 3) throw new Error("network unavailable");
      return "ok";
    }, { policy: { maxAttempts: 4, baseDelayMs: 1, maxDelayMs: 2, jitterRatio: 0, retryableCodes: ["NETWORK"] }, sleep: async () => undefined });
    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("does not retry validation failures", async () => {
    let attempts = 0;
    await expect(withRetry(async () => {
      attempts += 1;
      throw new Error("invalid input");
    }, { policy: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 2, jitterRatio: 0, retryableCodes: ["NETWORK"] }, sleep: async () => undefined })).rejects.toMatchObject({ code: "VALIDATION" });
    expect(attempts).toBe(1);
  });

  it("prevents duplicate in-flight work", async () => {
    const guard = createAsyncOperationGuard();
    const once = executeOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return 1;
    });
    const [first, second] = await Promise.all([guard.run(() => once()), guard.run(() => once())]);
    expect(first).toBe(1);
    expect(second).toBeUndefined();
  });

  it("ignores stale generations", () => {
    const generation = createRequestGeneration();
    const first = generation.next();
    const second = generation.next();
    expect(generation.isCurrent(first)).toBe(false);
    expect(generation.isCurrent(second)).toBe(true);
  });

  it("captures thrown work as Result failures", async () => {
    const result = await runSafely(async () => {
      throw new Error("storage unreadable");
    }, { operation: "load", feature: "settings" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.operation).toBe("load");
  });
});
