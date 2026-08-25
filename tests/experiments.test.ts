import { describe, expect, it } from "vitest";
import { DEMO_EXPERIMENT, isSavedExperiment, parseSavedExperiments } from "../lib/experiments";

describe("experiment recovery contracts", () => {
  it("keeps demo fallback data clearly labeled and structurally valid", () => {
    expect(isSavedExperiment(DEMO_EXPERIMENT)).toBe(true);
    expect(DEMO_EXPERIMENT.id).toBe("demo-rolling-object");
    expect(DEMO_EXPERIMENT.title).toContain("[Demo]");
    expect(DEMO_EXPERIMENT.summary).toContain("storage was unavailable");
  });

  it("filters malformed persisted experiments without inventing user records", () => {
    expect(parseSavedExperiments([DEMO_EXPERIMENT, { id: "bad", points: "nope" }, null])).toEqual([DEMO_EXPERIMENT]);
    expect(parseSavedExperiments("invalid")).toEqual([]);
  });
});


