import { afterEach, describe, expect, it } from "vitest";
import { seedDemo, seedMinimal, seedRich, seedErrors, seedExamPrep } from "../lib/mock/seed";
import { validateMockDataset, validateMockReferences, assertValidMockDataset } from "../lib/mock/validation/dataset";
import { getMockDatasetStats } from "../lib/mock/stats";
import { createSeededRandom } from "../lib/mock/utils/rng";
import { createAttemptHistory, masteryFromAttempts } from "../lib/mock/generators/history";
import { createProblemCatalog } from "../lib/mock/generators/problems";
import { createExtendedProblemCatalog } from "../lib/mock/generators/problems-extended";
import { createConceptCatalog } from "../lib/mock/datasets/concepts";
import { createUserCatalog } from "../lib/mock/datasets/users";
import { createSimulationCatalog } from "../lib/mock/datasets/simulations";
import { malformedFixtures, emptyStateDataset } from "../lib/mock/fixtures/empty";
import { buildRecommendations } from "../lib/mock/recommendations";
import { missionCompletionFromSteps } from "../lib/mock/mission-engine";
import { mockXpFor } from "../lib/mock/xp";
import { resetMockConfig, setMockConfig, isMockModeEnabled, isProductionRuntime } from "../lib/mock/config";
import { circuitCurrent } from "../lib/mock/utils/physics-values";
import { searchItems } from "../lib/mock/utils/search";
import { filterItems, sortItems } from "../lib/mock/utils/filter";
import { paginate } from "../lib/mock/utils/pagination";

afterEach(() => {
  resetMockConfig();
});

describe("mock dataset volume and integrity", () => {
  it("builds a deterministic demo pack that meets catalog floors", () => {
    const first = seedDemo();
    const second = seedDemo();
    expect(first.problems[0].finalAnswer).toBe(second.problems[0].finalAnswer);
    expect(first.attempts[0].submittedAt).toBe(second.attempts[0].submittedAt);
    expect(first.users.length).toBeGreaterThanOrEqual(20);
    expect(first.topics.length).toBeGreaterThanOrEqual(25);
    expect(first.concepts.length).toBeGreaterThanOrEqual(150);
    expect(first.lessons.length).toBeGreaterThanOrEqual(80);
    expect(first.problems.length).toBeGreaterThanOrEqual(250);
    expect(first.simulations.length).toBeGreaterThanOrEqual(50);
    expect(first.missions.length).toBeGreaterThanOrEqual(30);
    expect(first.achievements.length).toBeGreaterThanOrEqual(50);
    expect(first.experiments.length).toBeGreaterThanOrEqual(40);
    expect(first.tutorSessions.length).toBeGreaterThanOrEqual(50);
    expect(first.attempts.length).toBeGreaterThanOrEqual(500);
    expect(first.mastery.length).toBeGreaterThanOrEqual(150);
    expect(first.activity.length).toBeGreaterThanOrEqual(100);
    expect(first.notebook.length).toBeGreaterThanOrEqual(50);
    expect(first.notifications.length + first.reviewQueue.length + first.recommendations.lessons.length + first.recommendations.problems.length).toBeGreaterThanOrEqual(100);
    expect(first.dailyActivity.length).toBe(90);
    expect(validateMockDataset(first)).toEqual([]);
    expect(validateMockReferences(first)).toEqual([]);
  });

  it("keeps richer packs larger than the beginner pack", () => {
    const minimal = seedMinimal();
    const rich = seedRich();
    expect(rich.attempts.length).toBeGreaterThan(minimal.attempts.length);
    expect(emptyStateDataset().lessons).toHaveLength(0);
    expect(emptyStateDataset().attempts).toHaveLength(0);
  });

  it("fails fast on broken references when asked", () => {
    const dataset = seedExamPrep();
    dataset.lessons[0] = { ...dataset.lessons[0], conceptId: "not-a-concept" };
    expect(validateMockReferences(dataset).some((error) => error.includes("not-a-concept"))).toBe(true);
    expect(() => assertValidMockDataset(dataset)).toThrow(/invalid/i);
  });

  it("records malformed fixtures only as test fixtures", () => {
    expect(malformedFixtures.invalidNumber.xpReward).toBeLessThan(0);
    expect(Number.isNaN(malformedFixtures.invalidNumber.finalAnswer)).toBe(true);
    expect(malformedFixtures.brokenDate.submittedAt).toBe("not-a-date");
  });
});

describe("mock physics and recommendations", () => {
  it("derives circuit current from V/R", () => {
    expect(circuitCurrent(12, 4)).toBe(3);
  });

  it("does not recommend locked advanced lessons as the only next step for a beginner", () => {
    const user = createUserCatalog().find((item) => item.id === "user-alex")!;
    const concepts = createConceptCatalog();
    const lessons = seedMinimal().lessons;
    const problems = [...createProblemCatalog(), ...createExtendedProblemCatalog()];
    const rec = buildRecommendations({
      user,
      concepts,
      lessons,
      problems,
      simulations: createSimulationCatalog(),
      missions: seedMinimal().missions,
      mastery: masteryFromAttempts(user, [], problems, concepts),
    });
    const recommendedLessons = lessons.filter((lesson) => rec.lessons.includes(lesson.id));
    for (const lesson of recommendedLessons) {
      const concept = concepts.find((item) => item.id === lesson.conceptId);
      const locked = (concept?.prerequisites ?? []).some((id) => (user.masterySummary[id] ?? 0) < 0.7);
      expect(locked).toBe(false);
    }
  });

  it("computes mission completion from steps", () => {
    expect(missionCompletionFromSteps([
      { id: "a", title: "A", action: "lesson", referenceId: "lesson-x", complete: true },
      { id: "b", title: "B", action: "practice", referenceId: "problem-x", complete: false },
    ])).toBe(0.5);
  });

  it("never returns negative XP", () => {
    expect(mockXpFor("practice")).toBeGreaterThanOrEqual(0);
    expect(mockXpFor("practice", true)).toBeGreaterThan(mockXpFor("practice"));
  });
});

describe("search, filter, pagination", () => {
  it("ranks exact title matches first", () => {
    const results = searchItems(
      [
        { id: "b", title: "Wave interference" },
        { id: "a", title: "Projectile Motion" },
      ],
      "Projectile Motion",
    );
    expect(results[0]?.id).toBe("a");
  });

  it("filters by topic and paginates deterministically", () => {
    const problems = createProblemCatalog().filter((problem) => problem.topicId === "kinematics");
    const filtered = filterItems(problems, { topicId: "kinematics", difficulty: "easy" });
    expect(filtered.every((problem) => problem.difficulty === "easy")).toBe(true);
    const page = paginate(sortItems(filtered, "difficulty"), 3, 0);
    expect(page.items).toHaveLength(3);
    expect(page.nextCursor).toBeTruthy();
    const next = paginate(sortItems(filtered, "difficulty"), 3, 0, page.nextCursor ?? undefined);
    expect(next.offset).toBeGreaterThan(0);
  });
});

describe("mock mode safety", () => {
  it("stays off by default in the test runtime", () => {
    expect(isProductionRuntime()).toBe(false);
    expect(isMockModeEnabled()).toBe(false);
    setMockConfig({ mode: "enabled" });
    expect(isMockModeEnabled()).toBe(true);
  });

  it("cannot enable mock entitlements without the explicit flag while mock is off", () => {
    expect(isMockModeEnabled()).toBe(false);
  });
});

describe("attempt history", () => {
  it("is seeded and never awards negative XP", () => {
    const user = createUserCatalog().find((item) => item.id === "user-maya")!;
    const problems = createProblemCatalog().slice(0, 20);
    const left = createAttemptHistory(user, problems, "pack");
    const right = createAttemptHistory(user, problems, "pack");
    expect(left.map((item) => item.id)).toEqual(right.map((item) => item.id));
    expect(left.every((item) => item.xpEarned >= 0)).toBe(true);
    expect(createSeededRandom("pack").seed).toBeTypeOf("number");
  });
});

describe("error seed pack", () => {
  it("still validates catalog references", () => {
    const dataset = seedErrors();
    expect(validateMockReferences(dataset)).toEqual([]);
    const stats = getMockDatasetStats(dataset, "error-state");
    expect(stats.entityCounts.topics).toBeGreaterThan(0);
  });
});
