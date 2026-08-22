import { describe, expect, it } from "vitest";
import { formatRetryResult } from "../lib/retry-queue";

describe("retry queue copy", () => {
  it("describes recovered, pending, and empty queue outcomes", () => {
    expect(formatRetryResult(1, 0)).toBe("Recovered 1 offline save.");
    expect(formatRetryResult(2, 0)).toBe("Recovered 2 offline saves.");
    expect(formatRetryResult(1, 2)).toBe("Recovered 1; 2 still waiting.");
    expect(formatRetryResult(0, 0)).toBe("No pending offline saves.");
  });

  it("rejects malformed queue counts", () => {
    expect(() => formatRetryResult(-1, 0)).toThrow("retry counts must be non-negative integers");
    expect(() => formatRetryResult(0, 1.5)).toThrow("retry counts must be non-negative integers");
  });
});
