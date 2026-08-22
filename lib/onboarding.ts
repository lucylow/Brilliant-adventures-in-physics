import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "physicaai.onboarding.v1";
export type LearnerLevel = "new" | "school" | "exam";
export type LearnerGoal = "understand" | "practice" | "experiment";
export type OnboardingProfile = { completed: boolean; level: LearnerLevel; goal: LearnerGoal };

export const DEFAULT_ONBOARDING: OnboardingProfile = { completed: false, level: "new", goal: "understand" };

export function mergeOnboarding(input: unknown): OnboardingProfile {
  const stored = input && typeof input === "object" ? input as Partial<OnboardingProfile> : {};
  const level: LearnerLevel = stored.level === "school" || stored.level === "exam" ? stored.level : "new";
  const goal: LearnerGoal = stored.goal === "practice" || stored.goal === "experiment" ? stored.goal : "understand";
  return { completed: stored.completed === true, level, goal };
}

export async function loadOnboarding(): Promise<OnboardingProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return mergeOnboarding(raw ? JSON.parse(raw) : {});
  } catch {
    return DEFAULT_ONBOARDING;
  }
}

export async function saveOnboarding(profile: OnboardingProfile): Promise<OnboardingProfile> {
  const next = mergeOnboarding(profile);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function firstActionForGoal(goal: LearnerGoal): "/lesson" | "/practice" | "/lens" {
  return goal === "practice" ? "/practice" : goal === "experiment" ? "/lens" : "/lesson";
}
