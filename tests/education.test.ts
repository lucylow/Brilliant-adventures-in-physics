import { describe, expect, it } from "vitest";
import { hintFor, masteryState, nextHintLevel, unmetPrereqs, updateMastery } from "../lib/education";

describe("education rules", () => {
  it("identifies prerequisites below the mastery threshold", () => {
    expect(unmetPrereqs("projectile-motion", { kinematics: 0.4 })).toEqual(["kinematics"]);
    expect(unmetPrereqs("projectile-motion", { kinematics: 0.8 })).toEqual([]);
  });
  it("updates mastery with correct work and hint cost", () => {
    const next = updateMastery(0.5, true, 1, 0.8);
    expect(next).toBeGreaterThan(0.5);
    expect(masteryState(next)).toBe("practicing");
  });
  it("keeps progressive hints ordered", () => {
    expect(nextHintLevel("concept")).toBe("representation");
    expect(hintFor("equation")).toContain("equation");
  });
});
