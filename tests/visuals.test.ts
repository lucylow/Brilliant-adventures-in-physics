import { describe, expect, it } from "vitest";
import { fieldVectors, mapPointToViewport, sampleLine, scaleForWidth, ticks, vectorMagnitude, visualSize, visualStateLabel } from "../lib/visuals";

describe("visual feature contracts", () => {
  it("scales visual sizes for phone and tablet widths", () => {
    expect(scaleForWidth(320)).toBe(0.9);
    expect(visualSize(20, 800)).toBe(22);
  });
  it("generates predictable ticks and line samples", () => {
    expect(ticks(0, 10, 3)).toEqual([0, 5, 10]);
    expect(sampleLine({ x: 0, y: 0 }, { x: 10, y: 20 }, 3)[1]).toEqual({ x: 5, y: 10 });
  });
  it("maps trajectory points into a padded viewport deterministically", () => {
    expect(mapPointToViewport({ x: 5, y: 2.5 }, { maxX: 10, maxY: 5, width: 200, height: 100, padding: 10 })).toEqual({ left: 100, bottom: 50 });
    expect(mapPointToViewport({ x: 0, y: 0 }, { maxX: 0, maxY: 0, width: 100, height: 50 })).toEqual({ left: 0, bottom: 0 });
  });
  it("models vectors, fields, and meaningful state labels", () => {
    expect(vectorMagnitude({ dx: 3, dy: 4 })).toBe(5);
    expect(fieldVectors(2, 3, 10, { dx: 1, dy: 0 })).toHaveLength(6);
    expect(visualStateLabel("paused")).toBe("Simulation paused");
  });
});
