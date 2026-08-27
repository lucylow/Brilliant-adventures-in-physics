import type { BAVMilestoneId } from "@/lib/bav-milestones";
import type { LearningState } from "@/lib/progress-store";

export type BAVMilestoneActionTarget = "practice" | "lesson" | "lab";

export type BAVMilestoneAction = {
  target: BAVMilestoneActionTarget;
  labelKey: "bavMilestone.continuePractice" | "bavMilestone.startLesson" | "bavMilestone.openLab";
  concept?: string;
};

export function nextBAVMilestoneAction(id: BAVMilestoneId, learning: LearningState): BAVMilestoneAction {
  if (id === "build-foundation") return { target: "practice", labelKey: "bavMilestone.continuePractice", concept: learning.lastTopic || "kinematics" };
  if (id === "adventure-loop") return learning.lessonsCompleted < 1 ? { target: "lesson", labelKey: "bavMilestone.startLesson" } : { target: "lab", labelKey: "bavMilestone.openLab" };
  return { target: "practice", labelKey: "bavMilestone.continuePractice", concept: learning.lastTopic || "kinematics" };
}
