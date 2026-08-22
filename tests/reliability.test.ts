import { describe, expect, it } from "vitest";
import { accessibleCompletionLabel, persistenceMessage, shouldClearDraft } from "../lib/draft-policy";

describe("draft reliability contracts", () => {
  it("clears drafts after completion or discard only", () => {
    expect(shouldClearDraft("completed")).toBe(true);
    expect(shouldClearDraft("discarded")).toBe(true);
    expect(shouldClearDraft("editing")).toBe(false);
  });
  it("communicates retry and offline persistence states", () => {
    expect(persistenceMessage("retrying")).toContain("Retrying");
    expect(persistenceMessage("offline")).toContain("not saved");
  });
  it("creates readable completion labels", () => {
    expect(accessibleCompletionLabel("lab", false)).toBe("Mark lab complete");
    expect(accessibleCompletionLabel("lesson", true)).toBe("lesson completed");
  });
});
