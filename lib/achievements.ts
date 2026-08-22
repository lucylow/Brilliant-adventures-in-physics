import type { LearningState } from "@/lib/progress-store";

export type Achievement = { id: string; title: string; description: string; icon: string; earned: boolean };

export function evaluateAchievements(learning: LearningState): Achievement[] {
  const topicCount = Object.keys(learning.topics).length;
  const strongTopics = Object.values(learning.topics).filter((topic) => topic.attempts >= 3 && topic.correct / topic.attempts >= 0.8).length;
  return [
    { id: "first-step", title: "First step", description: "Complete your first practice attempt.", icon: "◇", earned: learning.attempts >= 1 },
    { id: "steady-reasoner", title: "Steady reasoner", description: "Complete five practice attempts.", icon: "◆", earned: learning.attempts >= 5 },
    { id: "topic-builder", title: "Topic builder", description: "Work across two physics topics.", icon: "◈", earned: topicCount >= 2 },
    { id: "verified-thinking", title: "Verified thinking", description: "Reach 80% accuracy in a topic after three attempts.", icon: "✦", earned: strongTopics >= 1 },
  ];
}
