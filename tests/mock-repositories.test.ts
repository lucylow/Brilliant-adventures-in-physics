import { afterEach, describe, expect, it } from "vitest";
import { MockLessonRepository, MockPracticeRepository, mockRepositories } from "../lib/mock/adapters/repositories";
import { applyMockLatency } from "../lib/mock/adapters/latency";
import { shouldFailOperation } from "../lib/mock/adapters/failures";
import { resetMockConfig, setMockConfig } from "../lib/mock/config";
import { invalidateMockDataset } from "../lib/mock/registry";
import { createMockAttempt } from "../lib/mock/factories";
import { ERROR_CODES } from "../shared/errors/error-codes";
import { AppError } from "../shared/errors/app-error";
import { evaluateMockAchievements } from "../lib/mock/achievements-engine";
import { recordMockAnalytics, getMockAnalyticsEvents, clearMockAnalytics } from "../lib/mock/analytics";
import { getMockEntitlementSnapshot } from "../lib/mock/entitlements";

afterEach(() => {
  resetMockConfig();
  invalidateMockDataset();
  clearMockAnalytics();
});

describe("mock repositories", () => {
  it("lists, pages, and fetches lessons", async () => {
    setMockConfig({ mode: "enabled", latency: "instant" });
    const repo = new MockLessonRepository();
    const page = await repo.list({ limit: 5, offset: 0, query: "energy" });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.length).toBeLessThanOrEqual(5);
    const found = await repo.getById(page.items[0].id);
    expect(found?.id).toBe(page.items[0].id);
    expect(found).not.toBe(page.items[0]);
  });

  it("records practice attempts immutably", async () => {
    setMockConfig({ mode: "enabled", latency: "instant" });
    const repo = new MockPracticeRepository();
    const first = await repo.list({ limit: 1 });
    const attempt = createMockAttempt({ problemId: first.items[0].id, userId: "user-maya" });
    const saved = await repo.recordAttempt(attempt);
    expect(saved.problemId).toBe(first.items[0].id);
  });

  it("supports abortable latency", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(applyMockLatency("fast", controller.signal)).rejects.toBeInstanceOf(AppError);
  });

  it("injects only the requested failures", () => {
    const tutor = shouldFailOperation("tutor.get", 0, ["tutor.get"], "online", "seed");
    expect(tutor?.code).toBe(ERROR_CODES.TUTOR_SERVICE);
    const unrelated = shouldFailOperation("lesson.list", 0, ["tutor.get"], "online", "seed");
    expect(unrelated).toBeNull();
    const offline = shouldFailOperation("tutor.list", 0, [], "offline", "seed");
    expect(offline?.code).toBe(ERROR_CODES.NETWORK);
  });

  it("uses seeded failure rates", () => {
    const first = shouldFailOperation("practice.list", 1, [], "online", "same-seed");
    const second = shouldFailOperation("practice.list", 1, [], "online", "same-seed");
    expect(first?.message).toBe(second?.message);
  });

  it("exposes a repository map", () => {
    expect(mockRepositories.users).toBeTruthy();
    expect(mockRepositories.simulations).toBeTruthy();
  });
});

describe("mock achievements, analytics, entitlements", () => {
  it("evaluates achievements from learning state", () => {
    setMockConfig({ mode: "enabled" });
    const earned = evaluateMockAchievements({
      attempts: 12,
      correct: 9,
      savedQuestions: [],
      topics: { kinematics: { attempts: 4, correct: 4, hints: 0, confidenceTotal: 3 } },
      streak: 8,
      lessonsCompleted: 3,
      labsCompleted: 1,
    });
    expect(earned.some((item) => item.id === "first-step" && item.earned)).toBe(true);
  });

  it("records analytics only while mock mode is on", () => {
    recordMockAnalytics("lesson_started");
    expect(getMockAnalyticsEvents()).toHaveLength(0);
    setMockConfig({ mode: "enabled" });
    recordMockAnalytics("lesson_completed", { id: "lesson-kinematics" });
    expect(getMockAnalyticsEvents()[0]?.event).toBe("lesson_completed");
  });

  it("does not treat mock entitlements as purchases by default", () => {
    expect(getMockEntitlementSnapshot().providerAvailable).toBe(false);
  });
});
