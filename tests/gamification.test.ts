import { describe, expect, it } from "vitest";
import { badgeTier, generateMission, isStreakMilestone, levelFromXp, missionProgress, RewardDeduper, updateStreak } from "../lib/gamification";

describe("learning-first gamification", () => {
  it("progresses levels from earned XP", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(300)).toBeGreaterThan(1);
  });
  it("generates bounded daily missions", () => {
    const mission = generateMission(1);
    expect(mission.goal).toBeGreaterThan(0);
    expect(missionProgress(mission.goal, mission.goal + 2)).toBe(1);
  });
  it("keeps streaks gentle and milestone-based", () => {
    expect(updateStreak(null, "2026-08-22", 0)).toBe(1);
    expect(updateStreak("2026-08-21", "2026-08-22", 3)).toBe(4);
    expect(isStreakMilestone(7)).toBe(true);
  });
  it("protects reward claims from duplicates", () => {
    const deduper = new RewardDeduper();
    expect(deduper.claim("reward-1")).toBe(true);
    expect(deduper.claim("reward-1")).toBe(false);
    expect(badgeTier(0.9)).toBe("gold");
  });
});
