import { afterEach, describe, expect, it } from "vitest";
import {
  createSeededRandom,
  randomBoolean,
  randomChoice,
  randomDateBetween,
  randomFloat,
  randomInt,
  shuffleSeeded,
  weightedChoice,
} from "../lib/mock/utils/rng";
import { getMockNow, MOCK_EPOCH_ISO, relativeMockDate, resetMockNow, setMockNow } from "../lib/mock/clock";
import { createMockProblem, createMockUser } from "../lib/mock/factories";

describe("seeded mock RNG", () => {
  it("repeats the same sequence for the same seed", () => {
    const left = createSeededRandom("bav-demo");
    const right = createSeededRandom("bav-demo");
    expect([left.next(), left.randomInt(1, 10), left.randomChoice(["a", "b", "c"])]).toEqual([
      right.next(),
      right.randomInt(1, 10),
      right.randomChoice(["a", "b", "c"]),
    ]);
  });

  it("diverges for different seeds", () => {
    expect(createSeededRandom("alpha").next()).not.toBe(createSeededRandom("beta").next());
  });

  it("exposes helper wrappers without Math.random", () => {
    const rng = createSeededRandom(42);
    expect(randomInt(rng, 2, 2)).toBe(2);
    expect(randomFloat(rng, 1, 2)).toBeGreaterThanOrEqual(1);
    expect(["x", "y"]).toContain(randomChoice(rng, ["x", "y"]));
    expect(typeof randomBoolean(rng)).toBe("boolean");
    expect(shuffleSeeded(rng, [1, 2, 3]).sort()).toEqual([1, 2, 3]);
    expect(weightedChoice(rng, [{ item: "keep", weight: 1 }])).toBe("keep");
    const date = randomDateBetween(rng, Date.parse("2026-01-01T00:00:00.000Z"), Date.parse("2026-01-02T00:00:00.000Z"));
    expect(date.toISOString().startsWith("2026-01")).toBe(true);
  });
});

describe("mock clock", () => {
  afterEach(() => {
    resetMockNow();
  });

  it("uses a fixed UTC epoch until set", () => {
    expect(getMockNow().toISOString()).toBe(MOCK_EPOCH_ISO);
    setMockNow("2026-01-01T00:00:00.000Z");
    expect(getMockNow().toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(relativeMockDate("yesterday").getTime()).toBeLessThan(getMockNow().getTime());
  });
});

describe("mock factories", () => {
  it("accepts overrides without mutating defaults", () => {
    const first = createMockProblem({ difficulty: "hard", conceptId: "momentum" });
    const second = createMockProblem();
    expect(first.difficulty).toBe("hard");
    expect(first.conceptId).toBe("momentum");
    expect(second.difficulty).toBe("easy");
    expect(second.conceptId).toBe("energy");
  });

  it("clones learner overrides", () => {
    const user = createMockUser({ displayName: "Alex Rivera", id: "user-alex" });
    expect(user.displayName).toBe("Alex Rivera");
    expect(createMockUser().id).not.toBe("user-alex");
  });
});
