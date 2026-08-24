import { describe, expect, it } from "vitest";
import { DIFFERENTIATORS, EXPERIMENT_LOOP, nextLensStage, safeFeatureRoute, signatureFeatures, teachingPrompt } from "../lib/feature-contracts";

describe("feature contracts", () => {
  it("exposes the attached differentiator registry", () => {
    expect(DIFFERENTIATORS.physicsLens).toBe(true);
    expect(signatureFeatures.map((feature) => feature.id)).toEqual(["physics-lens", "experiment-loop", "living-notebook"]);
  });

  it("advances the experiment loop deterministically", () => {
    expect(EXPERIMENT_LOOP[0]).toBe("observe");
    expect(nextLensStage("observe")).toBe("predict");
    expect(nextLensStage("compare")).toBe("reflect");
    expect(nextLensStage("reflect")).toBeNull();
  });

  it("keeps teaching prompts explicit and bounded", () => {
    expect(teachingPrompt("socratic", "momentum")).toContain("one reasoning question");
    expect(teachingPrompt("analogy", "circuits")).toContain("limits");
  });

  it("routes numerical work away from unverified language output", () => {
    expect(safeFeatureRoute("solve")).toBe("deterministic-physics");
    expect(safeFeatureRoute("practice")).toBe("deterministic-physics");
    expect(safeFeatureRoute("tutor")).toBe("local-teaching");
    expect(safeFeatureRoute("scan", true)).toBe("vision-review");
  });
});
