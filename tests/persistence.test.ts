import { describe, expect, it } from "vitest";
import { persistSafely, persistenceRecoveryMessage } from "../lib/persistence";

describe("safe persistence", () => {
  it("returns successful persistence values", async () => {
    const result = await persistSafely(Promise.resolve({ saved: true }));
    expect(result).toEqual({ ok: true, data: { saved: true } });
    expect(persistenceRecoveryMessage(result)).toBeNull();
  });
  it("converts storage/network failures into retryable results", async () => {
    const result = await persistSafely(Promise.reject(new Error("network unavailable")));
    expect(result).toMatchObject({ ok: false, error: { code: "OFFLINE", retryable: true } });
    expect(persistenceRecoveryMessage(result)).toContain("try again");
  });
});
