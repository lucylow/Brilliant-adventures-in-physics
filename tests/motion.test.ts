import { describe, expect, it } from "vitest";
import { clampProgress, motionDuration, pressScale, progressPercent, shouldAutoPlay } from "../lib/motion";

describe("motion contracts", () => {
  it("removes durations when reduced motion is enabled", () => {
    expect(motionDuration(240, { reducedMotion: true })).toBe(0);
    expect(motionDuration(240, { reducedMotion: false })).toBe(240);
  });
  it("clamps animation progress and formats percentages", () => {
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(1.4)).toBe(1);
    expect(progressPercent(0.536)).toBe("54%");
  });
  it("does not autoplay motion for reduced-motion or explicit opt-out users", () => {
    expect(shouldAutoPlay({ reducedMotion: true })).toBe(false);
    expect(shouldAutoPlay({ reducedMotion: false, autoPlay: false })).toBe(false);
    expect(shouldAutoPlay({ reducedMotion: false, autoPlay: true })).toBe(true);
    expect(pressScale(false)).toBe(0.97);
    expect(pressScale(true)).toBe(1);
  });
});
