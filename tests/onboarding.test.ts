import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ONBOARDING, firstActionForGoal, learnerGoalLabel, learnerLevelLabel, loadOnboardingWithStatus, mergeOnboarding, recommendationForGoal } from "../lib/onboarding";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn() } }));

describe("onboarding", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(AsyncStorage.getItem).mockResolvedValue(null); });
  it("migrates malformed or partial profiles to safe defaults", () => {
    expect(mergeOnboarding({ completed: "yes", level: "advanced", goal: "unknown" })).toEqual({ completed: false, level: "new", goal: "understand", step: 0 });
    expect(mergeOnboarding({ completed: true, level: "exam", goal: "experiment", step: 2 })).toEqual({ completed: true, level: "exam", goal: "experiment", step: 2 });
  });
  it("routes each learner goal to a useful first action", () => {
    expect(firstActionForGoal("understand")).toBe("/lesson");
    expect(firstActionForGoal("practice")).toBe("/practice");
    expect(firstActionForGoal("experiment")).toBe("/lens");
  });
  it("formats saved choices and personalized recommendations consistently", () => {
    expect(learnerLevelLabel("exam")).toBe("Preparing for an exam");
    expect(learnerGoalLabel("experiment")).toBe("Run experiments");
    expect(recommendationForGoal("practice")).toMatchObject({ label: "Start practice", path: "/practice" });
    expect(recommendationForGoal("experiment")).toMatchObject({ label: "Open Physics Lab", path: "/lens" });
  });
  it("distinguishes missing onboarding storage from malformed storage recovery", async () => {
    await expect(loadOnboardingWithStatus()).resolves.toEqual({ profile: DEFAULT_ONBOARDING, recovered: false });
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    await expect(loadOnboardingWithStatus()).resolves.toEqual({ profile: DEFAULT_ONBOARDING, recovered: true, reason: "malformed" });
  });
  it("classifies a partial onboarding profile as malformed recovery", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ completed: true, level: "exam" }));
    await expect(loadOnboardingWithStatus()).resolves.toEqual({ profile: DEFAULT_ONBOARDING, recovered: true, reason: "malformed" });
  });
  it("reports unavailable onboarding storage without inventing saved choices", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(loadOnboardingWithStatus()).resolves.toEqual({ profile: DEFAULT_ONBOARDING, recovered: true, reason: "unavailable" });
  });
});
