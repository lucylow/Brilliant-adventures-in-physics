import { describe, expect, it } from "vitest";
import { firstActionForGoal, mergeOnboarding } from "../lib/onboarding";

describe("onboarding", () => {
  it("migrates malformed or partial profiles to safe defaults", () => {
    expect(mergeOnboarding({ completed: "yes", level: "advanced", goal: "unknown" })).toEqual({ completed: false, level: "new", goal: "understand" });
    expect(mergeOnboarding({ completed: true, level: "exam", goal: "experiment" })).toEqual({ completed: true, level: "exam", goal: "experiment" });
  });
  it("routes each learner goal to a useful first action", () => {
    expect(firstActionForGoal("understand")).toBe("/lesson");
    expect(firstActionForGoal("practice")).toBe("/practice");
    expect(firstActionForGoal("experiment")).toBe("/lens");
  });
});
