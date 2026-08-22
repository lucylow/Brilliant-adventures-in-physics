import { describe, expect, it } from "vitest";
import { firstActionForGoal, mergeOnboarding } from "../lib/onboarding";

describe("onboarding", () => {
  it("migrates malformed or partial profiles to safe defaults", () => {
    expect(mergeOnboarding({ completed: "yes", level: "advanced", goal: "unknown" })).toEqual({ completed: false, level: "new", goal: "understand", step: 0 });
    expect(mergeOnboarding({ completed: true, level: "exam", goal: "experiment", step: 2 })).toEqual({ completed: true, level: "exam", goal: "experiment", step: 2 });
  });
  it("routes each learner goal to a useful first action", () => {
    expect(firstActionForGoal("understand")).toBe("/lesson");
    expect(firstActionForGoal("practice")).toBe("/practice");
    expect(firstActionForGoal("experiment")).toBe("/lens");
  });
});
