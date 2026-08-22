import { describe, expect, it } from "vitest";
import { filterAchievements } from "../lib/achievement-progress";

describe("achievement filters", () => {
  const items = [{ id: "a", earned: true }, { id: "b", earned: false }];
  it("returns all, earned, or in-progress items", () => {
    expect(filterAchievements(items, "all")).toHaveLength(2);
    expect(filterAchievements(items, "earned").map((item) => item.id)).toEqual(["a"]);
    expect(filterAchievements(items, "progress").map((item) => item.id)).toEqual(["b"]);
  });
});
