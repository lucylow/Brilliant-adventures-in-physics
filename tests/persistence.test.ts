import { describe, expect, it } from "vitest";
import { loadRecoveryMessage, persistSafely, persistenceRecoveryMessage, persistenceRecoveryMessageKey } from "../lib/persistence";

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
    expect(persistenceRecoveryMessageKey(result)).toBe("persistence.offlineSave");
  });
  it("maps non-offline failures to the generic localized save key", () => {
    const result = { ok: false as const, error: { code: "UNEXPECTED_ERROR" as const, message: "storage failed", retryable: true } };
    expect(persistenceRecoveryMessageKey(result)).toBe("persistence.saveFailed");
  });
  it("keeps loading recovery copy stable by data scope", () => {
    expect(loadRecoveryMessage("profile")).toContain("learning path");
    expect(loadRecoveryMessage("progress")).toContain("progress");
    expect(loadRecoveryMessage("progress")).toContain("try again");
    expect(loadRecoveryMessage("draft")).toContain("saved session");
  });
});
