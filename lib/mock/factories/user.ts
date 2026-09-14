import { clone } from "../utils/clone";
import { initialsFromName } from "../utils/ids";
import { isoDaysAgo } from "../clock";
import type { EducationLevel } from "@/lib/education";
import type { LearnerGoal, LearnerLevel } from "@/lib/onboarding";
import type { MockAvatar, MockLearnerProfile } from "../types";

const ACCENTS = ["#2563EB", "#7C3AED", "#EA580C", "#0891B2", "#16A34A", "#DB2777", "#CA8A04"] as const;

function avatarFor(name: string, accent = ACCENTS[name.length % ACCENTS.length]): MockAvatar {
  return { initials: initialsFromName(name), motif: "learner", accent };
}

export function createMockUser(overrides: Partial<MockLearnerProfile> = {}): MockLearnerProfile {
  const displayName = overrides.displayName ?? "Alex Rivera";
  return clone({
    id: "user-alex",
    displayName,
    avatar: avatarFor(displayName),
    learningLevel: "high-school" as EducationLevel,
    learnerLevel: "school" as LearnerLevel,
    goal: "understand" as LearnerGoal,
    goals: ["Build intuition for motion", "Connect equations to experiments"],
    favoriteTopics: ["kinematics", "energy"],
    createdAt: isoDaysAgo(120, 8),
    lastActiveAt: isoDaysAgo(0, 2),
    xp: 420,
    level: 4,
    streak: 3,
    longestStreak: 7,
    totalLessons: 6,
    totalProblems: 18,
    totalExperiments: 2,
    masterySummary: { kinematics: 0.62, energy: 0.41 },
    bio: "A curious beginner mapping everyday motion to physics models.",
    ...overrides,
  });
}
