import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "physicaai.onboarding.v1";
export type LearnerLevel = "new" | "school" | "exam";
export type LearnerGoal = "understand" | "practice" | "experiment";
export type OnboardingProfile = { completed: boolean; level: LearnerLevel; goal: LearnerGoal; step: 0 | 1 | 2 };

export const DEFAULT_ONBOARDING: OnboardingProfile = { completed: false, level: "new", goal: "understand", step: 0 };

export function mergeOnboarding(input: unknown): OnboardingProfile {
  const stored = input && typeof input === "object" ? input as Partial<OnboardingProfile> : {};
  const level: LearnerLevel = stored.level === "school" || stored.level === "exam" ? stored.level : "new";
  const goal: LearnerGoal = stored.goal === "practice" || stored.goal === "experiment" ? stored.goal : "understand";
  const step = stored.step === 1 || stored.step === 2 ? stored.step : 0;
  return { completed: stored.completed === true, level, goal, step };
}

export type OnboardingLoadResult = { profile: OnboardingProfile; recovered: boolean; reason?: "malformed" | "unavailable" };
export async function loadOnboardingWithStatus(): Promise<OnboardingLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { profile: DEFAULT_ONBOARDING, recovered: false };
    try {
      return { profile: mergeOnboarding(JSON.parse(raw)), recovered: false };
    } catch {
      return { profile: DEFAULT_ONBOARDING, recovered: true, reason: "malformed" };
    }
  } catch {
    return { profile: DEFAULT_ONBOARDING, recovered: true, reason: "unavailable" };
  }
}
export async function loadOnboarding(): Promise<OnboardingProfile> { return (await loadOnboardingWithStatus()).profile; }

export function resetOnboarding(): OnboardingProfile { return DEFAULT_ONBOARDING; }

export async function saveOnboarding(profile: OnboardingProfile): Promise<OnboardingProfile> {
  const current = await loadOnboardingWithStatus();
  if (current.recovered) throw new Error("Onboarding storage is unreadable; refusing to overwrite it");
  const next = mergeOnboarding(profile);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function firstActionForGoal(goal: LearnerGoal): "/lesson" | "/practice" | "/lens" {
  return goal === "practice" ? "/practice" : goal === "experiment" ? "/lens" : "/lesson";
}

export function learnerLevelLabel(level: LearnerLevel): string {
  return level === "school" ? "Studying physics" : level === "exam" ? "Preparing for an exam" : "New to physics";
}

export function learnerGoalLabel(goal: LearnerGoal): string {
  return goal === "practice" ? "Practice problems" : goal === "experiment" ? "Run experiments" : "Understand the ideas";
}

export function recommendationForGoal(goal: LearnerGoal): { title: string; body: string; label: string; path: "/lesson" | "/practice" | "/lens" } {
  if (goal === "practice") return { title: "Build confidence with practice", body: "Try a short set of questions with immediate feedback.", label: "Start practice", path: "/practice" };
  if (goal === "experiment") return { title: "Explore motion in the Lab", body: "Change one variable and see the physics respond.", label: "Open Physics Lab", path: "/lens" };
  return { title: "Understand projectile motion", body: "Start with one concept, then connect it to an experiment.", label: "Start the lesson", path: "/lesson" };
}
