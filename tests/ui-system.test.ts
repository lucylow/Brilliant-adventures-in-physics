import { describe, expect, it } from "vitest";
import { accessibilityActionLabel, responsiveGutter, safeKeyboardOffset, uiTokens } from "../lib/ui-system";

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
});
