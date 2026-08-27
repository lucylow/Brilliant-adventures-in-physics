import { describe, expect, it } from "vitest";
import { bavMilestoneProgress, countStrongTopicEvidence, evaluateBAVMilestones } from "../lib/bav-milestones";
import type { LearningState } from "../lib/progress-store";

const emptyLearning: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 };

describe("B.A.V. milestones", () => {
  it("starts all milestones at zero without fabricated progress", () => {
    expect(evaluateBAVMilestones(emptyLearning)).toEqual([
      { id: "build-foundation", pillar: "build", current: 0, goal: 5, earned: false },
      { id: "adventure-loop", pillar: "adventure", current: 0, goal: 1, earned: false },
      { id: "visualize-mastery", pillar: "visualize", current: 0, goal: 1, earned: false },
    ]);
  });

  it("earns each pillar only from its corresponding local evidence", () => {
    const learning: LearningState = {
      ...emptyLearning,
      attempts: 7,
      lessonsCompleted: 1,
      labsCompleted: 2,
      topics: { kinematics: { attempts: 3, correct: 3, hints: 0, confidenceTotal: 9 } },
    };
    expect(evaluateBAVMilestones(learning).map((item) => item.earned)).toEqual([true, true, true]);
  });

  it("keeps progress bounded and does not treat one strong topic as multiple badges", () => {
    const milestones = evaluateBAVMilestones({ ...emptyLearning, attempts: 100, topics: { one: { attempts: 10, correct: 10, hints: 1, confidenceTotal: 30 }, two: { attempts: 10, correct: 9, hints: 0, confidenceTotal: 27 } } });
    expect(milestones[0].current).toBe(5);
    expect(milestones[2].current).toBe(1);
    expect(countStrongTopicEvidence({ ...emptyLearning, topics: { one: { attempts: 10, correct: 10, hints: 0, confidenceTotal: 30 }, two: { attempts: 2, correct: 2, hints: 0, confidenceTotal: 6 } } })).toBe(1);
    expect(bavMilestoneProgress(milestones[0])).toBe(1);
    expect(bavMilestoneProgress({ ...milestones[0], current: 0, goal: 0 })).toBe(0);
  });
});
