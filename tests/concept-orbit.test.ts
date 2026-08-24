import { describe, expect, it } from "vitest";
import { orbitSummary, prerequisiteTrail, verifiedConceptId } from "../lib/concept-orbit";

describe("Concept Orbit", () => {
  it("resolves prerequisites in learning order", () => {
    expect(prerequisiteTrail("photoelectric-effect").map((concept) => concept.id)).toEqual(["oscillation", "wave-motion", "kinematics", "energy", "modern-energy", "photoelectric-effect"]);
    expect(orbitSummary("relativistic-momentum")).toContain("Momentum");
  });

  it("rejects unknown concept identifiers without inventing nodes", () => {
    expect(prerequisiteTrail("not-a-concept")).toEqual([]);
    expect(verifiedConceptId("not-a-concept")).toBeNull();
    expect(orbitSummary("not-a-concept")).toBe("No verified concept path is available yet.");
  });

  it("accepts only registered concept ids", () => {
    expect(verifiedConceptId("kinematics")).toBe("kinematics");
    expect(verifiedConceptId("KINEMATICS")).toBeNull();
  });
});
