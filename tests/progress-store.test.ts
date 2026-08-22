import { describe, expect, it } from "vitest";
import { updateMastery } from "../lib/education";
import { shouldRestore } from "../lib/ux";

describe("persisted learning rules", () => {
  it("moves mastery upward for correct independent work", () => {
    expect(updateMastery(0.4, true, 0, 4)).toBeGreaterThan(0.4);
  });
  it("penalizes hint dependence without punishing practice itself", () => {
    expect(updateMastery(0.6, true, 3, 3)).toBeLessThan(updateMastery(0.6, true, 0, 3));
    expect(updateMastery(0.6, false, 0, 3)).toBeGreaterThan(0);
  });
  it("restores recent drafts and rejects expired ones", () => {
    const now = Date.now();
    expect(shouldRestore({ id: "practice", data: { index: 1 }, updatedAt: now }, 86_400_000)).toBe(true);
    expect(shouldRestore({ id: "practice", data: { index: 1 }, updatedAt: now - 86_400_001 }, 86_400_000)).toBe(false);
  });
});
