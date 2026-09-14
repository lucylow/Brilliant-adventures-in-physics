import { describe, expect, it } from "vitest";
import { RECOVERY_FEATURES, recoveryCopy, type RecoveryKind } from "../lib/screen-recovery";

const KINDS: RecoveryKind[] = ["offline", "error", "empty", "timeout", "permission", "persistence"];
const FEATURES = ["tutor", "practice", "lab", "lens", "scan", "lesson", "progress", "concepts", "settings", "notebook", "onboarding", "upgrade"];

describe("feature recovery matrix", () => {
  it("covers every core feature", () => {
    expect(RECOVERY_FEATURES.sort()).toEqual([...FEATURES].sort());
  });

  it("provides non-generic recovery copy for success-path alternatives", () => {
    for (const feature of FEATURES) {
      for (const kind of KINDS) {
        const copy = recoveryCopy(feature, kind);
        expect(copy.length).toBeGreaterThan(20);
        expect(copy.toLowerCase()).not.toBe("error.");
        expect(copy.toLowerCase()).not.toBe("network error.");
        expect(copy.toLowerCase()).not.toBe("something went wrong.");
      }
    }
  });

  it("keeps offline copy local-first and never claims a false success", () => {
    expect(recoveryCopy("tutor", "offline")).toMatch(/offline/i);
    expect(recoveryCopy("upgrade", "empty")).toMatch(/available/i);
    expect(recoveryCopy("upgrade", "persistence")).not.toMatch(/entitled|purchased/i);
    expect(recoveryCopy("lens", "error")).toMatch(/other experiments are unaffected/i);
  });
});
