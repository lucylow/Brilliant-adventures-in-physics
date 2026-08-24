import { describe, expect, it } from "vitest";
import { advanceLens, canAdvanceLens, emptyLensSession, lensProgress } from "../lib/lens";

describe("Physics Lens workflow", () => {
  it("requires an observation before advancing", () => {
    const session = emptyLensSession();
    expect(canAdvanceLens(session)).toBe(false);
    expect(canAdvanceLens({ ...session, scene: "A ball rolls" })).toBe(true);
    expect(advanceLens({ ...session, scene: "A ball rolls" }).stage).toBe("predict");
  });

  it("progresses through prediction and measurement in order", () => {
    let session = advanceLens({ ...emptyLensSession(), scene: "A ball rolls" });
    session = advanceLens({ ...session, prediction: "It will speed up" });
    expect(session.stage).toBe("measure");
    expect(advanceLens({ ...session, measurement: "1.8 m" }).stage).toBe("model");
  });

  it("reports bounded loop progress", () => {
    expect(lensProgress("observe")).toBeGreaterThan(0);
    expect(lensProgress("reflect")).toBe(1);
  });
});
