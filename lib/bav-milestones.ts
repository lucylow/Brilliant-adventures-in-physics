import type { BAVPillar } from "@/lib/bav";
import type { LearningState } from "@/lib/progress-store";

export type BAVMilestoneId = "build-foundation" | "adventure-loop" | "visualize-mastery";

export type BAVMilestone = {
  id: BAVMilestoneId;
  pillar: BAVPillar;
  current: number;
  goal: number;
  earned: boolean;
};

function strongTopicCount(learning: LearningState): number {
  return Object.values(learning.topics).filter((topic) => topic.attempts >= 3 && topic.correct / topic.attempts >= 0.8).length;
}

export function evaluateBAVMilestones(learning: LearningState): BAVMilestone[] {
  const buildCurrent = Math.min(learning.attempts, 5);
  const adventureCurrent = Math.min(learning.lessonsCompleted, learning.labsCompleted, 1);
  const visualizeCurrent = Math.min(strongTopicCount(learning), 1);
  return [
    { id: "build-foundation", pillar: "build", current: buildCurrent, goal: 5, earned: buildCurrent >= 5 },
    { id: "adventure-loop", pillar: "adventure", current: adventureCurrent, goal: 1, earned: adventureCurrent >= 1 },
    { id: "visualize-mastery", pillar: "visualize", current: visualizeCurrent, goal: 1, earned: visualizeCurrent >= 1 },
  ];
}

export function bavMilestoneProgress(milestone: BAVMilestone): number {
  if (!Number.isFinite(milestone.current) || !Number.isFinite(milestone.goal) || milestone.goal <= 0) return 0;
  return Math.max(0, Math.min(1, milestone.current / milestone.goal));
}
