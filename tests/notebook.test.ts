import { describe, expect, it } from "vitest";
import { isNotebookEntry, notebookSummary, parseNotebookEntries, sameNotebookEntry, type NotebookEntry } from "../lib/notebook";

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

  it("uses deterministic topic summaries", () => {
    expect(notebookSummary("kinematics", [])).toBe("No local notes yet for kinematics.");
    expect(notebookSummary("kinematics", [validEntry])).toBe("1 local entry connected to kinematics.");
    expect(notebookSummary("kinematics", [validEntry, { ...validEntry, id: "n2" }])).toBe("2 local entries connected to kinematics.");
  });
});
