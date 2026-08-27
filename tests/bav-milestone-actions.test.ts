import { describe, expect, it } from "vitest";
import { nextBAVMilestoneAction } from "../lib/bav-milestone-actions";
import type { LearningState } from "../lib/progress-store";

const base: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 };

describe("B.A.V. milestone next actions", () => {
  it("routes Build and Visualize to Practice with a stable topic fallback", () => {
    expect(nextBAVMilestoneAction("build-foundation", base)).toEqual({ target: "practice", labelKey: "bavMilestone.continuePractice", concept: "kinematics" });
    expect(nextBAVMilestoneAction("visualize-mastery", { ...base, lastTopic: "projectile-motion" })).toEqual({ target: "practice", labelKey: "bavMilestone.continuePractice", concept: "projectile-motion" });
  });

  it("starts Adventure in Lesson until lesson evidence exists, then opens Lab", () => {
    expect(nextBAVMilestoneAction("adventure-loop", base)).toEqual({ target: "lesson", labelKey: "bavMilestone.startLesson" });
    expect(nextBAVMilestoneAction("adventure-loop", { ...base, lessonsCompleted: 1 })).toEqual({ target: "lab", labelKey: "bavMilestone.openLab" });
  });
});
