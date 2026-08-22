import { describe, expect, it } from "vitest";
import { remainingTutorUses } from "../lib/usage-meter";

describe("usage meter safety", () => {
  it("never reports negative remaining uses", () => {
    expect(remainingTutorUses({ date: "2026-08-22", tutorUsed: 8, tutorLimit: 5 })).toBe(0);
  });

  it("keeps valid usage values bounded by the daily limit", () => {
    expect(remainingTutorUses({ date: "2026-08-22", tutorUsed: 2, tutorLimit: 5 })).toBe(3);
  });
});
