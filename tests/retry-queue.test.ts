import { describe, expect, it } from "vitest";
import { formatLastSave, formatRetryItemAge, formatRetryItemResult, formatRetryProgress, formatRetryResult, parseRetryQueue, removeRetryItem, RETRY_ITEM_DISCARD_COPY, RETRY_ITEM_DISCARDED_COPY, RETRY_QUEUE_DISCARD_COPY, RETRY_QUEUE_DISCARDED_COPY } from "../lib/retry-queue";

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

  it("filters malformed and duplicate records while bounding the queue", () => {
    const parsed = parseRetryQueue([{ id: "valid", payload: "latest", queuedAt: 2 }, { id: "valid", payload: "duplicate", queuedAt: 3 }, { id: "", payload: "bad", queuedAt: 1 }, { id: "no-time", payload: "bad", queuedAt: Number.NaN }]);
    expect(parsed).toEqual([{ id: "valid", payload: "latest", queuedAt: 2 }]);
    expect(parseRetryQueue(null)).toEqual([]);
  });

  it("falls back when last-save metadata is invalid", () => {
    expect(formatLastSave("not-a-date")).toBe("No successful local save recorded yet.");
    expect(formatLastSave(null)).toBe("No successful local save recorded yet.");
  });

  it("keeps queue discard copy scoped to autosaves", () => {
    expect(RETRY_QUEUE_DISCARD_COPY).toContain("only queued autosaves");
    expect(RETRY_QUEUE_DISCARD_COPY).toContain("learning history");
    expect(RETRY_QUEUE_DISCARDED_COPY).toContain("Learning history was kept");
  });

  it("formats queued-draft ages deterministically", () => {
    const now = 10 * 60 * 60 * 1000;
    expect(formatRetryItemAge(now - 30_000, now)).toBe("just now");
    expect(formatRetryItemAge(now - 2 * 60 * 60 * 1000, now)).toBe("2 hours ago");
    expect(formatRetryItemAge(Number.NaN, now)).toBe("age unavailable");
  });

  it("validates individual discard requests and copy", async () => {
    await expect(removeRetryItem(" ")).rejects.toThrow("retry item id is required");
    expect(RETRY_ITEM_DISCARD_COPY).toContain("selected queued autosave");
    expect(RETRY_ITEM_DISCARDED_COPY).toContain("Other local data was kept");
    expect(RETRY_QUEUE_DISCARDED_COPY).toContain("Learning history was kept");
  });

  it("formats per-draft retry outcomes without hiding retained work", () => {
    expect(formatRetryItemResult(0, true, 2)).toBe("Recovered draft 1. 2 still waiting.");
    expect(formatRetryItemResult(1, false, 2)).toBe("Draft 2 is still waiting. Your queued work was kept.");
    expect(() => formatRetryItemResult(-1, true, 0)).toThrow("invalid retry item result");
  });

  it("formats retry progress for accessible live feedback", () => {
    expect(formatRetryProgress({ processed: 1, total: 3, saved: 1 })).toBe("Recovering offline saves: 1 of 3 checked; 1 saved.");
    expect(() => formatRetryProgress({ processed: 4, total: 3, saved: 1 })).toThrow("invalid retry progress");
  });
});
