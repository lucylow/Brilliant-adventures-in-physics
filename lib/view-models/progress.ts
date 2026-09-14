import type { LearningState } from "@/lib/progress-store";
import { isMockModeEnabled, getMockConfig } from "@/lib/mock/config";
import { learnerForScenario } from "@/lib/mock/catalog";
import { getMockDataset } from "@/lib/mock/registry";
import { createTopicCatalog } from "@/lib/mock/datasets/topics";
import type { ScreenStatus } from "@/lib/screen-recovery";

export type ProgressTopicRow = { id: string; name: string; percent: number; color: string };
export type WeeklyPoint = { day: string; minutes: number; problems: number; lessons: number; simulations: number };
export type AchievementCard = { id: string; name: string; state: "earned" | "in-progress" | "locked"; description: string };

export const GUIDANCE_TOPICS = [
  { name: "Kinematics", detail: "Review motion graphs and units." },
  { name: "Projectile motion", detail: "Practice launch angle and range." },
  { name: "Newton’s laws", detail: "Focus on free-body diagrams." },
  { name: "Circuits", detail: "Start with Ohm’s law." },
] as const;

export type ProgressViewModel = {
  status: ScreenStatus;
  mastery: number;
  xp: number;
  level: number;
  streak: number;
  accuracy: number;
  topics: ProgressTopicRow[];
  weekly: WeeklyPoint[];
  strongest: string;
  needsReview: string;
  recentImprovement: string;
  achievements: AchievementCard[];
};

const TOPIC_COLORS = ["#2563EB", "#7C3AED", "#D97706", "#E11D48", "#059669", "#0891B2"];

export function buildProgressViewModel(learning: LearningState, status: ScreenStatus = "success"): ProgressViewModel {
  if (status !== "success") {
    return {
      status,
      mastery: 0,
      xp: 0,
      level: 1,
      streak: 0,
      accuracy: 0,
      topics: [],
      weekly: emptyWeek(),
      strongest: "Not enough data yet",
      needsReview: "Not enough data yet",
      recentImprovement: "Keep a short study session going.",
      achievements: [],
    };
  }
  if (isMockModeEnabled()) {
    const learner = learnerForScenario(getMockConfig().scenario, getMockConfig().learnerId);
    const topics = Object.entries(learner.masterySummary)
      .map(([id, percent], index) => ({
        id,
        name: titleCase(id),
        percent,
        color: TOPIC_COLORS[index % TOPIC_COLORS.length],
      }))
      .sort((left, right) => right.percent - left.percent);
    const dataset = getMockDataset();
    const strongest = topics[0];
    const weakest = [...topics].sort((left, right) => left.percent - right.percent)[0];
    const weeklyFromDataset = dataset.dailyActivity.slice(-7).map((day, index) => ({
      day: ["M", "T", "W", "T", "F", "S", "S"][index] ?? day.date.slice(5),
      minutes: day.minutes,
      problems: day.problems,
      lessons: day.lessons,
      simulations: index === 5 ? 2 : index % 3 === 0 ? 1 : 0,
    }));
    return {
      status: "success",
      mastery: average(topics.map((topic) => topic.percent)),
      xp: learner.xp,
      level: learner.level,
      streak: learner.streak,
      accuracy: learner.totalProblems ? Math.min(0.97, 0.55 + learner.xp / 8000) : 0,
      topics,
      weekly: weeklyFromDataset.length === 7 ? weeklyFromDataset : mockWeek(learner.streak),
      strongest: strongest ? strongest.name : "Not enough data yet",
      needsReview: weakest && weakest.percent < 0.5 ? weakest.name : "No urgent review",
      recentImprovement: strongest ? `${strongest.name} is leading your map.` : "Complete a lesson to see change.",
      achievements: [
        { id: "builder", name: "Experiment Builder", state: learner.totalExperiments > 0 ? "earned" : "locked", description: "Save a lab snapshot." },
        { id: "explorer", name: "Physics Explorer", state: learner.totalLessons >= 5 ? "earned" : "in-progress", description: "Finish five lessons." },
        { id: "wave", name: "Wave Master", state: (learner.masterySummary["wave-motion"] ?? 0) >= 0.8 ? "earned" : "locked", description: "Reach 80% wave mastery." },
        { id: "quantum", name: "Quantum Navigator", state: (learner.masterySummary["quantum-physics"] ?? 0) >= 0.6 ? "in-progress" : "locked", description: "Build a quantum model habit." },
      ],
    };
  }
  const accuracy = learning.attempts ? learning.correct / learning.attempts : 0;
  const catalog = createTopicCatalog().slice(0, 6);
  const topics = catalog.map((topic, index) => {
    const local = learning.topics[topic.id];
    const percent = local && local.attempts ? local.correct / local.attempts : 0;
    return { id: topic.id, name: topic.name, percent, color: TOPIC_COLORS[index % TOPIC_COLORS.length] };
  });
  const ranked = [...topics].sort((left, right) => right.percent - left.percent);
  return {
    status: learning.attempts === 0 ? "empty" : "success",
    mastery: accuracy,
    xp: learning.correct * 10,
    level: Math.max(1, Math.floor(Math.sqrt(Math.max(0, learning.correct * 10) / 100)) + 1),
    streak: learning.streak,
    accuracy,
    topics,
    weekly: emptyWeek(),
    strongest: ranked[0] && ranked[0].percent > 0 ? ranked[0].name : "Not enough data yet",
    needsReview: ranked[ranked.length - 1] && ranked[ranked.length - 1].percent < 0.5 ? ranked[ranked.length - 1].name : "No urgent review",
    recentImprovement: `${learning.lessonsCompleted} lessons and ${learning.labsCompleted} labs completed.`,
    achievements: [
      { id: "first-practice", name: "First measurement", state: learning.attempts > 0 ? "earned" : "locked", description: "Submit a practice answer." },
      { id: "streak-3", name: "Three-day orbit", state: learning.streak >= 3 ? "earned" : learning.streak > 0 ? "in-progress" : "locked", description: "Keep a three-day streak." },
    ],
  };
}

function titleCase(value: string): string {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function emptyWeek(): WeeklyPoint[] {
  return ["M", "T", "W", "T", "F", "S", "S"].map((day) => ({ day, minutes: 0, problems: 0, lessons: 0, simulations: 0 }));
}

function mockWeek(streak: number): WeeklyPoint[] {
  const minutes = [45, 60, 30, 75, 55, 85, 40];
  return ["M", "T", "W", "T", "F", "S", "S"].map((day, index) => ({
    day,
    minutes: streak > 0 ? minutes[index] : 0,
    problems: Math.round(minutes[index] / 12),
    lessons: index % 2,
    simulations: index === 5 ? 2 : index % 3 === 0 ? 1 : 0,
  }));
}
