import { describe, expect, it } from "vitest";
import { fieldVectors, sampleLine, scaleForWidth, ticks, vectorMagnitude, visualSize, visualStateLabel } from "../lib/visuals";

describe("visual feature contracts", () => {
  it("scales visual sizes for phone and tablet widths", () => {
    expect(scaleForWidth(320)).toBe(0.9);
    expect(visualSize(20, 800)).toBe(22);
  });
  it("generates predictable ticks and line samples", () => {
    expect(ticks(0, 10, 3)).toEqual([0, 5, 10]);
    expect(sampleLine({ x: 0, y: 0 }, { x: 10, y: 20 }, 3)[1]).toEqual({ x: 5, y: 10 });
  });
  it("models vectors, fields, and meaningful state labels", () => {
    expect(vectorMagnitude({ dx: 3, dy: 4 })).toBe(5);
    expect(fieldVectors(2, 3, 10, { dx: 1, dy: 0 })).toHaveLength(6);
    expect(visualStateLabel("paused")).toBe("Simulation paused");
  });
});
