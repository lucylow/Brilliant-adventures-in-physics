import { afterEach, describe, expect, it } from "vitest";
import { seedDemo, seedShowcase, buildMockDataset } from "../lib/mock/seed";
import { resetMockConfig, setMockConfig, isMockModeEnabled, isProductionRuntime } from "../lib/mock/config";
import { copyMockDataset, getMockDataset, invalidateMockDataset } from "../lib/mock/registry";
import { validateMockDataset, validateMockReferences } from "../lib/mock/validation/dataset";
import { buildMockExpansion, composeMockDataset, mechanicsPack, wavesPack, opticsPack, invalidateMockExpansion } from "../lib/mock/expansion/compose";
import { createPositionSeries, createVoltageSeries, createCurrentSeries } from "../lib/mock/expansion/generators/series";
import { fromCsv, malformedCsvFixtures, toCsv, validateCsvDataset } from "../lib/mock/expansion/generators/csv";
import { gammaFromBeta } from "../lib/mock/expansion/physics";
import { createActivityTimeline, createLearnerJourney, createPracticeSession } from "../lib/mock/expansion/factories";
import { selectDailyChallenge, selectFeaturedSimulation, selectNextBestAction, selectWeakConcepts } from "../lib/mock/expansion/selectors";
import { diagnoseExpansion, validateRelationshipGraph } from "../lib/mock/expansion/diagnostics";
import { generateMockDataReport } from "../lib/mock/expansion/report";
import { createLabExperimentCatalog } from "../lib/mock/expansion/datasets/lab-experiments";
import { createFreeBodyCatalog } from "../lib/mock/expansion/datasets/circuits-fields";
import { createDiscoveryCards, createMisconceptionCatalog } from "../lib/mock/expansion/datasets/discovery";
import { createDailyChallenges, createExpansionFlashcards, createQuestionsOfTheDay, createScienceFacts } from "../lib/mock/expansion/datasets/calendar";
import { createMechanicsProblems } from "../lib/mock/expansion/datasets/mechanics-pack";
import { createSpaceMissions } from "../lib/mock/expansion/datasets/campaigns";
import { buildHomeViewModel } from "../lib/view-models/home";
import { buildPracticeViewModel } from "../lib/view-models/practice";

afterEach(() => {
  resetMockConfig();
  invalidateMockDataset();
  invalidateMockExpansion();
});

describe("expansion II catalogs", () => {
  it("meets content floors without copying the first-generation seed", () => {
    const expansion = buildMockExpansion();
    expect(expansion.version).toBe("1.1.0");
    expect(createLabExperimentCatalog().length).toBeGreaterThanOrEqual(75);
    expect(createFreeBodyCatalog().length).toBeGreaterThanOrEqual(50);
    expect(createDiscoveryCards().length).toBeGreaterThanOrEqual(100);
    expect(createMisconceptionCatalog().length).toBeGreaterThanOrEqual(100);
    expect(createDailyChallenges().length).toBe(90);
    expect(createQuestionsOfTheDay().length).toBe(365);
    expect(createScienceFacts().length).toBeGreaterThanOrEqual(300);
    expect(createExpansionFlashcards().length).toBeGreaterThanOrEqual(300);
    expect(createSpaceMissions().length).toBeGreaterThanOrEqual(40);
    expect(createMechanicsProblems().length).toBeGreaterThanOrEqual(50);
    expect(expansion.graphs.length).toBeGreaterThanOrEqual(8);
    expect(expansion.microLessons.length).toBeGreaterThanOrEqual(100);
    expect(expansion.exams.map((exam) => exam.questionCount)).toEqual([10, 20, 40, 60]);
    expect(expansion.journeys.length).toBeGreaterThanOrEqual(15);
  });

  it("keeps dependent physics values internally consistent", () => {
    expect(gammaFromBeta(0.6)).toBeCloseTo(1.25, 5);
    expect(() => gammaFromBeta(1)).toThrow(/beta/);
    const ohm = createCurrentSeries({ seed: "ohm-det", sampleCount: 8, offset: 0, amplitude: 12, trend: "linear" });
    const volts = createVoltageSeries({ seed: "ohm-det", sampleCount: 8, offset: 0, amplitude: 12, trend: "linear" });
    ohm.values.forEach((current, index) => {
      expect(current).toBeCloseTo(volts.values[index] / 4, 5);
    });
  });

  it("is deterministic for the same seed and different for another seed", () => {
    const a = createPositionSeries({ seed: "track-a", sampleCount: 10, noiseLevel: 0.05 });
    const b = createPositionSeries({ seed: "track-a", sampleCount: 10, noiseLevel: 0.05 });
    const c = createPositionSeries({ seed: "track-b", sampleCount: 10, noiseLevel: 0.05 });
    expect(a.values).toEqual(b.values);
    expect(a.values).not.toEqual(c.values);
    const first = buildMockExpansion();
    invalidateMockExpansion();
    const second = buildMockExpansion();
    expect(first.labExperiments[0].id).toBe(second.labExperiments[0].id);
    expect(first.extraProblems[0].finalAnswer).toBe(second.extraProblems[0].finalAnswer);
  });
});

describe("csv, composition, factories", () => {
  it("round-trips CSV and flags malformed fixtures", () => {
    const table = createLabExperimentCatalog()[0].data;
    const text = toCsv(table);
    const parsed = fromCsv(text, table.id);
    expect(parsed.rows).toEqual(table.rows);
    expect(validateCsvDataset(parsed)).toEqual([]);
    expect(malformedCsvFixtures().empty).toBe("");
    expect(() => fromCsv(malformedCsvFixtures().nonNumeric)).toThrow(/Non-numeric/);
  });

  it("composes packs without mutating sources", () => {
    const mechanics = mechanicsPack();
    const originalPrompt = mechanics.extraProblems?.[0]?.prompt;
    const originalCount = mechanics.labExperiments?.length ?? 0;
    const composed = composeMockDataset([mechanics, wavesPack(), opticsPack()], ["mechanics", "waves", "optics"]);
    expect(composed.labExperiments.length).toBeGreaterThan(originalCount);
    if (mechanics.extraProblems?.[0]) mechanics.extraProblems[0].prompt = "mutated locally";
    expect(composed.extraProblems[0].prompt).toBe(originalPrompt);
  });

  it("builds higher-level factories from lower-level records", () => {
    const journey = createLearnerJourney({ learnerId: "user-maya" });
    expect(journey.currentTopic).toBe("projectile-motion");
    const session = createPracticeSession(createMechanicsProblems(), 5);
    expect(session).toHaveLength(5);
    expect(createActivityTimeline("user-maya").length).toBe(180);
  });
});

describe("seed wiring and selectors", () => {
  it("merges expansion content into the demo dataset", () => {
    const demo = seedDemo();
    expect(demo.expansion.labExperiments.length).toBeGreaterThanOrEqual(75);
    expect(demo.experiments.length).toBeGreaterThan(demo.expansion.labExperiments.length);
    expect(demo.missions.some((mission) => mission.id.startsWith("mission-space-"))).toBe(true);
    expect(demo.problems.some((problem) => problem.id.startsWith("problem-exp2-"))).toBe(true);
    expect(demo.tutorSessions.some((session) => session.id.startsWith("tutor-x-"))).toBe(true);
    expect(demo.activity.length).toBeGreaterThanOrEqual(140);
    expect(validateMockDataset(demo)).toEqual([]);
    expect(validateMockReferences(demo)).toEqual([]);
    expect(validateRelationshipGraph(demo).filter((error) => error.includes("missing concept") && error.startsWith("problem"))).toEqual([]);
  });

  it("does not let repository clones mutate canonical fixtures", () => {
    setMockConfig({ mode: "enabled", scenario: "active-learner" });
    const copy = copyMockDataset();
    copy.problems[0].prompt = "mutated";
    copy.expansion.discoveryCards[0].title = "mutated";
    const canonical = getMockDataset();
    expect(canonical.problems[0].prompt).not.toBe("mutated");
    expect(canonical.expansion.discoveryCards[0].title).not.toBe("mutated");
  });

  it("derives home and practice from expansion rather than Math.random", () => {
    setMockConfig({ mode: "enabled", scenario: "showcase", learnerId: "user-jordan" });
    const dataset = getMockDataset("showcase", "user-jordan");
    const challenge = selectDailyChallenge(dataset);
    expect(challenge?.prompt.length).toBeGreaterThan(10);
    expect(selectFeaturedSimulation(dataset).id).toBeTruthy();
    expect(selectNextBestAction(dataset).route).toMatch(/^\/(practice|lesson|lab|tutor)$/);
    expect(selectWeakConcepts(dataset).length).toBeGreaterThan(0);
    const home = buildHomeViewModel({
      learning: dataset.learningState,
      onboarding: { completed: true, level: "school", goal: "practice", step: 2 },
      streakEnabled: true,
    });
    expect(home.dailyChallenge?.prompt).toBe(challenge?.prompt);
    const practice = buildPracticeViewModel({ index: 0, feedback: "idle" });
    expect(practice.total).toBeGreaterThan(10);
  });

  it("keeps production mock mode off", () => {
    expect(isProductionRuntime() ? isMockModeEnabled() : true).toBe(true);
    const report = generateMockDataReport(seedShowcase(), "showcase");
    expect(report.notes.some((note) => note.includes("DEVELOPMENT CONTENT LAYER"))).toBe(true);
    const diagnostic = diagnoseExpansion(seedDemo());
    expect(diagnostic.entityCounts.discoveryCards).toBeGreaterThanOrEqual(100);
  });
});

describe("showcase scenario", () => {
  it("exists as a first-class seed", () => {
    const showcase = buildMockDataset("showcase");
    expect(showcase.users.some((user) => user.id === "user-jordan")).toBe(true);
    expect(showcase.expansion.socialProof.every((item) => item.mockLabel === "DEMO_AGGREGATE_NOT_PRODUCTION")).toBe(true);
    expect(showcase.expansion.leaderboard.every((item) => item.fictional)).toBe(true);
  });
});
