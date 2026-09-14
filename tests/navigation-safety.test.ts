import { describe, expect, it } from "vitest";
import { backSafely, navigateSafely, parseRouteParams, practiceParamsSchema, requireId, safeHref } from "../lib/navigation";

describe("navigation validation", () => {
  it("rejects malformed identifiers", () => {
    expect(requireId(" ", "achievement").ok).toBe(false);
    expect(requireId("../secret", "achievement").ok).toBe(false);
    expect(requireId("first-steps", "achievement").ok).toBe(true);
  });

  it("parses practice query params", () => {
    expect(parseRouteParams(practiceParamsSchema, { concept: "kinematics" }, "practice").ok).toBe(true);
    expect(parseRouteParams(practiceParamsSchema, { concept: "???" }, "practice").ok).toBe(true);
    expect(safeHref("/tutor").ok).toBe(true);
    expect(safeHref("https://evil.example").ok).toBe(false);
  });

  it("does not throw when router.back fails", () => {
    let fellBack = false;
    backSafely({ back: () => { throw new Error("no history"); } }, () => { fellBack = true; });
    expect(fellBack).toBe(true);
  });

  it("returns a Result when push throws", () => {
    const result = navigateSafely({
      push: () => { throw new Error("navigation failed"); },
      replace: () => undefined,
      back: () => undefined,
    }, "/tutor");
    expect(result.ok).toBe(false);
  });
});
