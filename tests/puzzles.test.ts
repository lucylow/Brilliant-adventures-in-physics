import { describe, expect, it } from "vitest";
import { createPhysicsPuzzle, getPhysicsHints, puzzleRewardXp, scorePuzzleAnswer } from "../lib/puzzles";

describe("deterministic physics puzzles", () => {
  it("creates stable topic-aware puzzles without timestamps", () => {
    const first = createPhysicsPuzzle("wave motion", 3, 7);
    const second = createPhysicsPuzzle("wave motion", 3, 7);
    expect(first).toEqual(second);
    expect(first.id).toBe("puzzle-wave-motion-3-7");
    expect(first.correctChoice).toBe("Wave behavior");
    expect(first.xp).toBe(30);
  });

  it("provides a bounded hint ladder", () => {
    const hints = getPhysicsHints("energy");
    expect(hints).toHaveLength(3);
    expect(hints[0].costXp).toBe(0);
    expect(hints[2].text).toContain("units");
  });

  it("distinguishes independent, assisted, and incorrect outcomes", () => {
    const puzzle = createPhysicsPuzzle("energy", 2, 1);
    expect(scorePuzzleAnswer(puzzle, puzzle.correctChoice)).toBe("correct");
    expect(scorePuzzleAnswer(puzzle, puzzle.correctChoice, 1)).toBe("assisted-correct");
    expect(scorePuzzleAnswer(puzzle, "Wave behavior")).toBe("incorrect");
    expect(puzzleRewardXp(puzzle, "correct")).toBe(25);
    expect(puzzleRewardXp(puzzle, "assisted-correct")).toBe(20);
    expect(puzzleRewardXp(puzzle, "incorrect")).toBe(0);
  });
});
