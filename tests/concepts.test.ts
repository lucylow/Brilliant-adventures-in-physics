import { describe, expect, it } from "vitest";
import { conceptState, detectMisconception, missingPrerequisites, searchConcepts } from "../lib/concepts";

describe("physics concept intelligence", () => {
  it("searches grounded concepts", () => {
    expect(searchConcepts("Newton").length).toBe(0);
    expect(searchConcepts("kinematics")[0]?.id).toBe("kinematics");
    expect(searchConcepts("electric")[0]?.domain).toBe("Electricity");
  });
  it("checks prerequisites and mastery state", () => {
    expect(missingPrerequisites("forces", {})).toEqual(["kinematics"]);
    expect(missingPrerequisites("forces", { kinematics: 0.8 })).toEqual([]);
    expect(conceptState(0.2)).toBe("unknown");
    expect(conceptState(0.9)).toBe("secure");
  });
  it("detects targeted kinematics misconceptions", () => {
    expect(detectMisconception("Acceleration is speed")).toContain("acceleration is speed");
    expect(detectMisconception("I need help with vectors")).toBeNull();
  });
});
