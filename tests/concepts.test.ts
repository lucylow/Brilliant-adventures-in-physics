import { describe, expect, it } from "vitest";
import { conceptState, detectMisconception, missingPrerequisites, searchConcepts } from "../lib/concepts";

describe("physics concept intelligence", () => {
  it("searches grounded concepts", () => {
    expect(searchConcepts("Newton").length).toBe(0);
    expect(searchConcepts("kinematics")[0]?.id).toBe("kinematics");
    expect(searchConcepts("electric")[0]?.domain).toBe("Electricity");
  });
  it("finds the modern-energy concept with grounded prerequisites", () => {
    const result = searchConcepts("photons");
    expect(result[0]?.id).toBe("modern-energy");
    expect(missingPrerequisites("modern-energy", {})).toEqual(["wave-motion", "energy"]);
  });
  it("finds relativistic energy with mechanics prerequisites", () => {
    expect(searchConcepts("relativistic")[0]?.id).toBe("relativistic-energy");
    expect(missingPrerequisites("relativistic-energy", { kinematics: 0.8, energy: 0.8 })).toEqual([]);
  });
  it("links the photoelectric effect to photon prerequisites", () => {
    expect(searchConcepts("photoelectric")[0]?.id).toBe("photoelectric-effect");
    expect(missingPrerequisites("photoelectric-effect", { "modern-energy": 0.8 })).toEqual([]);
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
