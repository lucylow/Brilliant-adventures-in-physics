import type { Achievement } from "@/lib/achievements";
import type { LearningState } from "@/lib/progress-store";

export function filterAchievements<T extends { earned: boolean }>(items: T[], filter: "all" | "earned" | "progress"): T[] { return items.filter((item) => filter === "all" || (filter === "earned" ? item.earned : !item.earned)); }

export function achievementProgress(achievement: Achievement, learning: LearningState): number {
  if (achievement.earned) return 1;
  if (achievement.id === "first-step") return Math.min(1, learning.attempts);
  if (achievement.id === "steady-reasoner") return Math.min(1, learning.attempts / 5);
  if (achievement.id === "topic-builder") return Math.min(1, Object.keys(learning.topics).length / 2);
  if (achievement.id === "lesson-lab-loop") return Math.min(1, (Math.min(learning.lessonsCompleted, 1) + Math.min(learning.labsCompleted, 1)) / 2);
  if (achievement.id === "verified-thinking") return Math.min(1, Object.values(learning.topics).reduce((best, topic) => Math.max(best, topic.attempts >= 3 ? topic.correct / topic.attempts : topic.attempts / 3), 0));
  return 0;
}
