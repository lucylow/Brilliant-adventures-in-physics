import { ADVENTURE_WORLDS, generateAdventureMissions, worldForLevel } from "@/lib/adventure";
import { levelFromXp, levelProgress } from "@/lib/gamification";
import { recommendationForGoal, type OnboardingProfile } from "@/lib/onboarding";
import { practiceQuestions } from "@/lib/practice";
import type { LearningState } from "@/lib/progress-store";
import { isMockModeEnabled, getMockConfig } from "@/lib/mock/config";
import { getMockNow } from "@/lib/mock/clock";
import { FIGMA_HOME_FIXTURE, learnerForScenario } from "@/lib/mock/catalog";
import { getActivePracticeQuestions } from "@/lib/mock/adapters/catalog";
import { createSimulationCatalog } from "@/lib/mock/datasets/simulations";
import type { ScreenStatus } from "@/lib/screen-recovery";

export type HomeQuickActionId = "tutor" | "scan" | "lens" | "simulations";

export type HomeQuickAction = {
  id: HomeQuickActionId;
  title: string;
  subtitle: string;
  route: "/tutor" | "/scan" | "/lens" | "/play";
};

export type HomeActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
};

export type HomeViewModel = {
  status: ScreenStatus;
  dateLabel: string;
  salutation: string;
  displayName: string;
  initials: string;
  streakDays: number;
  streakEnabled: boolean;
  xp: number;
  level: number;
  mastery: number;
  continueAdventure: {
    title: string;
    chapter: string;
    progress: number;
    route: "/lesson" | "/lab" | "/practice";
  } | null;
  quickActions: HomeQuickAction[];
  dailyChallenge: {
    prompt: string;
    topic: string;
    xp: number;
    minutes: number;
    route: "/practice";
  } | null;
  recentActivity: HomeActivityItem[];
  recommendations: HomeActivityItem[];
};

export const HOME_QUICK_ACTIONS: HomeQuickAction[] = [
  { id: "tutor", title: "Ask Bavi", subtitle: "AI Physics Tutor", route: "/tutor" },
  { id: "scan", title: "Scan Problem", subtitle: "Camera solver", route: "/scan" },
  { id: "lens", title: "Physics Lens", subtitle: "Live experiments", route: "/lens" },
  { id: "simulations", title: "Simulations", subtitle: "Interactive labs", route: "/play" },
];

export function greetingForHour(hour: number): "Good morning" | "Good afternoon" | "Good evening" {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatHomeDate(date: Date, locale = "en"): string {
  const tag = locale.startsWith("fr") ? "fr-FR" : locale.startsWith("es") ? "es-ES" : "en-US";
  return new Intl.DateTimeFormat(tag, { weekday: "long", month: "long", day: "numeric" }).format(date);
}

export function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/)[0];
  return part.length > 0 ? part : "physicist";
}

export function initialsFrom(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BA";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function masteryFromLearning(learning: LearningState): number {
  if (learning.attempts > 0) return learning.correct / learning.attempts;
  const topics = Object.values(learning.topics);
  if (topics.length === 0) return 0;
  const sum = topics.reduce((total, topic) => total + (topic.attempts ? topic.correct / topic.attempts : 0), 0);
  return sum / topics.length;
}

export function xpFromLearning(learning: LearningState): number {
  return learning.correct * 10 + learning.lessonsCompleted * 20 + learning.labsCompleted * 30;
}

export type HomeAdapterInput = {
  learning: LearningState;
  onboarding: OnboardingProfile;
  streakEnabled: boolean;
  now?: Date;
  locale?: string;
  useVisualFixture?: boolean;
  status?: ScreenStatus;
};

export function buildHomeViewModel(input: HomeAdapterInput): HomeViewModel {
  const now = input.now ?? (isMockModeEnabled() ? getMockNow() : new Date());
  const locale = input.locale ?? "en";
  if (input.status && input.status !== "success") {
    return emptyHomeViewModel(input.status, now, locale);
  }
  if (input.useVisualFixture) {
    return homeFromFixture(now, locale, input.streakEnabled);
  }
  if (isMockModeEnabled()) {
    return homeFromMock(input, now, locale);
  }
  return homeFromLearning(input, now, locale);
}

function emptyHomeViewModel(status: ScreenStatus, now: Date, locale: string): HomeViewModel {
  return {
    status,
    dateLabel: formatHomeDate(now, locale),
    salutation: greetingForHour(now.getHours()),
    displayName: "physicist",
    initials: "BA",
    streakDays: 0,
    streakEnabled: true,
    xp: 0,
    level: 1,
    mastery: 0,
    continueAdventure: null,
    quickActions: HOME_QUICK_ACTIONS,
    dailyChallenge: null,
    recentActivity: [],
    recommendations: [],
  };
}

function homeFromFixture(now: Date, locale: string, streakEnabled: boolean): HomeViewModel {
  const fixture = FIGMA_HOME_FIXTURE;
  return {
    status: "success",
    dateLabel: formatHomeDate(now, locale),
    salutation: greetingForHour(now.getHours()),
    displayName: firstName(fixture.displayName),
    initials: fixture.initials,
    streakDays: fixture.streak,
    streakEnabled,
    xp: fixture.xp,
    level: fixture.level,
    mastery: fixture.masteryPercent / 100,
    continueAdventure: {
      title: fixture.adventureTitle,
      chapter: fixture.adventureChapter,
      progress: fixture.adventureProgress,
      route: "/lesson",
    },
    quickActions: HOME_QUICK_ACTIONS,
    dailyChallenge: {
      prompt: fixture.challengePrompt,
      topic: fixture.challengeTopic,
      xp: fixture.challengeXp,
      minutes: fixture.challengeMinutes,
      route: "/practice",
    },
    recentActivity: [
      { id: "recent-practice", title: "Coulomb's Law", subtitle: "Practice · 3 correct", route: "/practice" },
      { id: "recent-sim", title: "Wave Interference", subtitle: "Simulation · 12 min", route: "/play" },
      { id: "recent-scan", title: "Projectile Motion", subtitle: "Scanned & solved", route: "/scan" },
    ],
    recommendations: [
      { id: "rec-orbit", title: "Kepler’s third law", subtitle: "Because you are mid-orbit chapter", route: "/lesson" },
      { id: "rec-practice", title: "Circular orbit speed", subtitle: "Daily challenge concept", route: "/practice" },
    ],
  };
}

function homeFromMock(input: HomeAdapterInput, now: Date, locale: string): HomeViewModel {
  const config = getMockConfig();
  const learner = learnerForScenario(config.scenario, config.learnerId);
  const masteryValues = Object.values(learner.masterySummary);
  const mastery = masteryValues.length ? masteryValues.reduce((sum, value) => sum + value, 0) / masteryValues.length : 0;
  const featured = createSimulationCatalog().find((item) => item.featured) ?? createSimulationCatalog()[0];
  const world = worldForLevel(learner.level);
  const mission = generateAdventureMissions(world.id)[0];
  const catalog = getActivePracticeQuestions();
  const challenge = catalog[now.getUTCDate() % Math.max(1, catalog.length)] ?? practiceQuestions[0];
  const recommendation = recommendationForGoal(input.onboarding.goal);
  return {
    status: "success",
    dateLabel: formatHomeDate(now, locale),
    salutation: greetingForHour(now.getHours()),
    displayName: firstName(learner.displayName),
    initials: learner.avatar.initials,
    streakDays: learner.streak,
    streakEnabled: input.streakEnabled,
    xp: learner.xp,
    level: learner.level,
    mastery,
    continueAdventure: featured
      ? {
          title: featured.title,
          chapter: `${world.title} · ${mission.title}`,
          progress: Math.max(0.12, Math.min(0.92, mastery)),
          route: "/lab",
        }
      : null,
    quickActions: HOME_QUICK_ACTIONS,
    dailyChallenge: {
      prompt: challenge.prompt,
      topic: challenge.concept,
      xp: 150,
      minutes: 3,
      route: "/practice",
    },
    recentActivity: recentFromLearning(input.learning),
    recommendations: [
      { id: "goal", title: recommendation.title, subtitle: recommendation.body, route: recommendation.path },
      { id: "mission", title: mission.title, subtitle: mission.objective, route: "/practice" },
    ],
  };
}

function homeFromLearning(input: HomeAdapterInput, now: Date, locale: string): HomeViewModel {
  const xp = xpFromLearning(input.learning);
  const level = levelFromXp(xp);
  const mastery = masteryFromLearning(input.learning);
  const recommendation = recommendationForGoal(input.onboarding.goal);
  const challenge = practiceQuestions[now.getDate() % practiceQuestions.length];
  const world = worldForLevel(level);
  const mission = generateAdventureMissions(world.id)[0];
  const progress = levelProgress(xp).progress;
  const empty = input.learning.attempts === 0 && input.learning.lessonsCompleted === 0 && input.learning.labsCompleted === 0;
  return {
    status: empty ? "empty" : "success",
    dateLabel: formatHomeDate(now, locale),
    salutation: greetingForHour(now.getHours()),
    displayName: "physicist",
    initials: "BA",
    streakDays: input.learning.streak,
    streakEnabled: input.streakEnabled,
    xp,
    level,
    mastery,
    continueAdventure: {
      title: mission.title,
      chapter: `${world.title} · ${mission.story}`,
      progress: Math.max(progress, mastery),
      route: recommendation.path === "/lens" ? "/lab" : recommendation.path === "/practice" ? "/practice" : "/lesson",
    },
    quickActions: HOME_QUICK_ACTIONS,
    dailyChallenge: {
      prompt: challenge.prompt,
      topic: challenge.concept,
      xp: 40,
      minutes: 3,
      route: "/practice",
    },
    recentActivity: recentFromLearning(input.learning),
    recommendations: [{ id: "goal", title: recommendation.title, subtitle: recommendation.body, route: recommendation.path }],
  };
}

function recentFromLearning(learning: LearningState): HomeActivityItem[] {
  const events = [...(learning.completionEvents ?? [])].reverse().slice(0, 4);
  const fromEvents = events.map((event) => ({
    id: event.id,
    title: event.topic.replace(/-/g, " "),
    subtitle: event.kind === "lab" ? "Simulation" : "Lesson",
    route: event.kind === "lab" ? "/lab" : "/lesson",
  }));
  if (fromEvents.length > 0) return fromEvents;
  if (learning.lastTopic) {
    return [{ id: "last-topic", title: learning.lastTopic, subtitle: "Recent practice", route: "/practice" }];
  }
  return [];
}

export const ADVENTURE_WORLDS_COUNT = ADVENTURE_WORLDS.length;
