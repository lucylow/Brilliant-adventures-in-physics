import { describe, expect, it } from "vitest";
import { orbitSummary, prerequisiteTrail, recommendNextConcept, verifiedConceptId } from "../lib/concept-orbit";
import type { LearningState } from "../lib/progress-store";
import { practiceQuestionIndexForConcept } from "../lib/practice";

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

  it("recommends a foundation when no local mastery exists", () => {
    const state: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 };
    expect(recommendNextConcept(state).concept.id).toBe("kinematics");
  });

  it("gates advanced concepts behind mastered prerequisites", () => {
    const state: LearningState = { attempts: 4, correct: 4, savedQuestions: [], topics: { "wave-motion": { attempts: 10, correct: 10, hints: 0, confidenceTotal: 30 }, energy: { attempts: 10, correct: 10, hints: 0, confidenceTotal: 30 } }, streak: 1, lessonsCompleted: 0, labsCompleted: 0 };
    expect(recommendNextConcept(state).concept.id).toBe("kinematics");
    const progressed: LearningState = { ...state, topics: { ...state.topics, kinematics: { attempts: 10, correct: 10, hints: 0, confidenceTotal: 30 } } };
    expect(recommendNextConcept(progressed).concept.id).toBe("oscillation");
  });

  it("keeps recommendation practice routes deterministic", () => {
    const state: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 };
    const recommendation = recommendNextConcept(state);
    expect(recommendation.concept.id).toBe("kinematics");
    expect(practiceQuestionIndexForConcept(recommendation.concept.id)).toBe(0);
    expect(practiceQuestionIndexForConcept("not-a-concept")).toBeNull();
  });

  it("accepts only registered concept ids", () => {
    expect(verifiedConceptId("kinematics")).toBe("kinematics");
    expect(verifiedConceptId("KINEMATICS")).toBeNull();
  });
});
