import { describe, expect, it } from "vitest";
import { accessibilityActionLabel, responsiveGutter, safeKeyboardOffset, uiTokens } from "../lib/ui-system";
import { clampStepValue, isSliderAtMax, isSliderAtMin, sliderAccessibilityValue, sliderStepHint, sliderValueLabel } from "../lib/ui-logic";

describe("UI system contracts", () => {
  it("keeps touch targets accessible and responsive gutters predictable", () => {
    expect(uiTokens.touch.minimum).toBeGreaterThanOrEqual(44);
    expect(responsiveGutter(375)).toBe(20);
    expect(responsiveGutter(768)).toBe(28);
  });
  it("uses platform-aware keyboard offsets", () => {
    expect(safeKeyboardOffset("ios")).toBe(12);
    expect(safeKeyboardOffset("android")).toBe(8);
  });
  it("creates readable accessibility actions", () => {
    expect(accessibilityActionLabel("Resume", "physics draft")).toBe("Resume physics draft");
  });
  it("keeps Lab slider steps bounded and accessible", () => {
    expect(clampStepValue(0.9, 0.3, 0, 1)).toBe(1);
    expect(clampStepValue(0, -0.2, 0, 1)).toBe(0);
    expect(isSliderAtMin(0, 0)).toBe(true);
    expect(isSliderAtMax(1, 0.5)).toBe(true);
    expect(sliderAccessibilityValue(2, 0, 1)).toEqual({ min: 0, max: 1, now: 1 });
    expect(sliderValueLabel("Frequency (Hz)", 4)).toBe("Frequency (Hz): 4");
    expect(sliderStepHint("increase", "Frequency (Hz)", 1)).toContain("Increases");
  });
});
