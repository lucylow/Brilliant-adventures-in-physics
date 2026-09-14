import { createUserCatalog } from "./datasets/users";
import { createTopicCatalog } from "./datasets/topics";
import { createSimulationCatalog } from "./datasets/simulations";
import { getMockConfig } from "./config";
import type { MockLearnerProfile, MockScenarioId, MockSimulation, MockTopic } from "./types";

export type HomeVisualFixture = {
  displayName: string;
  initials: string;
  streak: number;
  xp: number;
  level: number;
  masteryPercent: number;
  adventureTitle: string;
  adventureChapter: string;
  adventureProgress: number;
  challengePrompt: string;
  challengeTopic: string;
  challengeXp: number;
  challengeMinutes: number;
};

export const FIGMA_HOME_FIXTURE: HomeVisualFixture = {
  displayName: "Maya Chen",
  initials: "MC",
  streak: 12,
  xp: 2840,
  level: 6,
  masteryPercent: 64,
  adventureTitle: "Orbital Mechanics",
  adventureChapter: "Chapter 4 · Kepler's Laws of Planetary Motion",
  adventureProgress: 0.68,
  challengePrompt: "A satellite orbits Earth at height h = 400 km. Find its orbital speed.",
  challengeTopic: "Mechanics · Circular Orbits",
  challengeXp: 150,
  challengeMinutes: 3,
};

export function learnerForScenario(scenario: MockScenarioId, learnerId?: string): MockLearnerProfile {
  const users = createUserCatalog();
  const requested = users.find((user) => user.id === (learnerId ?? getMockConfig().learnerId));
  if (scenario === "fresh-user" || scenario === "empty-state") {
    return users.find((user) => user.id === "user-cameron") ?? users[0];
  }
  if (scenario === "beginner") return users.find((user) => user.id === "user-alex") ?? users[0];
  if (scenario === "advanced-learner" || scenario === "power-user") return users.find((user) => user.id === "user-jordan") ?? users[0];
  if (scenario === "exam-prep") return users.find((user) => user.id === "user-taylor") ?? users[0];
  if (scenario === "explorer") return users.find((user) => user.id === "user-morgan") ?? users[0];
  if (scenario === "returning-user") return users.find((user) => user.id === "user-sam") ?? users[0];
  return requested ?? users.find((user) => user.id === "user-maya") ?? users[0];
}

export function featuredSimulations(): MockSimulation[] {
  return createSimulationCatalog().filter((item) => item.featured);
}

export function featuredTopics(): MockTopic[] {
  return createTopicCatalog().filter((topic) => topic.featured);
}
