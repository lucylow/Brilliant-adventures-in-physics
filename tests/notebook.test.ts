import { describe, expect, it } from "vitest";
import { filterNotebookEntries, isNotebookEntry, notebookSummary, parseNotebookEntries, sameNotebookEntry, type NotebookEntry } from "../lib/notebook";
import { searchConcepts } from "../lib/concepts";

const validEntry: NotebookEntry = { id: "n1", title: "Reflection", type: "reflection", content: "The evidence changed my prediction.", links: ["kinematics"], createdAt: "2026-08-24T00:00:00.000Z" };

describe("Living Notebook contracts", () => {
  it("accepts valid entries and rejects malformed private data", () => {
    expect(isNotebookEntry(validEntry)).toBe(true);
    expect(isNotebookEntry({ ...validEntry, content: 42 })).toBe(false);
    expect(isNotebookEntry({ ...validEntry, type: "remote" })).toBe(false);
  });

  it("filters malformed entries and bounds the local collection", () => {
    const entries = Array.from({ length: 55 }, (_, index) => ({ ...validEntry, id: `n${index}` }));
    const parsed = parseNotebookEntries(["unexpected", ...entries]);
    expect(parsed).toHaveLength(50);
    expect(parsed[0]?.id).toBe("n0");
  });

  it("deduplicates equivalent artifacts after normalization", () => {
    expect(sameNotebookEntry(validEntry, { ...validEntry, title: " Reflection ", content: " The evidence changed my prediction. ", links: [" kinematics "] })).toBe(true);
    expect(sameNotebookEntry(validEntry, { ...validEntry, type: "mistake" })).toBe(false);
  });

  it("filters entries by type and concept text", () => {
    const experiment = { ...validEntry, id: "n2", type: "experiment" as const, title: "Energy experiment", links: ["energy"] };
    const entries = [validEntry, experiment];
    expect(filterNotebookEntries(entries, "experiment")).toEqual([experiment]);
    expect(filterNotebookEntries(entries, "all", "energy")).toEqual([experiment]);
    expect(filterNotebookEntries(entries, "mistake")).toEqual([]);
  });

  it("searches only verified concepts for selector choices", () => {
    expect(searchConcepts("relativistic energy").map((concept) => concept.id)).toContain("relativistic-energy");
    expect(searchConcepts("thermal").every((concept) => concept.domain === "Thermal")).toBe(true);
    expect(searchConcepts("not-a-real-concept")).toEqual([]);
  });

  it("uses deterministic topic summaries", () => {
    expect(notebookSummary("kinematics", [])).toBe("No local notes yet for kinematics.");
    expect(notebookSummary("kinematics", [validEntry])).toBe("1 local entry connected to kinematics.");
    expect(notebookSummary("kinematics", [validEntry, { ...validEntry, id: "n2" }])).toBe("2 local entries connected to kinematics.");
  });
});
