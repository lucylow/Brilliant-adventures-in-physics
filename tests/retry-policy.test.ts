import { describe, expect, it } from "vitest";
import { retryAsync } from "../lib/retry-policy";

describe("retry policy", () => {
  it("retries a transient failure and returns the later result", async () => {
    let calls = 0;
    const result = await retryAsync(async () => {
      calls += 1;
      if (calls === 1) throw new Error("temporary");
      return "saved";
    }, { maxRetries: 1, delayMs: 0, sleep: async () => undefined });
    expect(result).toBe("saved");
    expect(calls).toBe(2);
  });

  it("preserves the final error after retries are exhausted", async () => {
    let calls = 0;
    await expect(retryAsync(async () => {
      calls += 1;
      throw new Error("storage unavailable");
    }, { maxRetries: 2, delayMs: 0, sleep: async () => undefined })).rejects.toThrow("storage unavailable");
    expect(calls).toBe(3);
  });

  it("rejects invalid retry settings before running the operation", async () => {
    const operation = async () => "never";
    await expect(retryAsync(operation, { maxRetries: -1 })).rejects.toThrow("maxRetries must be a non-negative integer");
    await expect(retryAsync(operation, { delayMs: -1 })).rejects.toThrow("delayMs must be non-negative and finite");
  });
});
