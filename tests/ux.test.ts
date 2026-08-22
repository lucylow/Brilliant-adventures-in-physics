import { describe, expect, it } from "vitest";
import { emptyState, fieldState, friendlyError, nextAction, pendingCount, recognitionWarning, shouldRestore } from "../lib/ux";

describe("UX rules", () => {
  it("restores only recent drafts", () => {
    expect(shouldRestore({ id: "draft", data: {}, updatedAt: Date.now() })).toBe(true);
    expect(shouldRestore({ id: "draft", data: {}, updatedAt: Date.now() - 90000000 })).toBe(false);
  });
  it("prioritizes the highest scored next action", () => {
    expect(nextAction([{ score: 0.2, id: "a" }, { score: 0.9, id: "b" }])?.id).toBe("b");
  });
  it("provides recoverable copy and validation state", () => {
    expect(friendlyError("NETWORK")).toContain("work is safe");
    expect(fieldState("", false, false)).toBe("empty");
    expect(recognitionWarning(0.5)).toBeDefined();
    expect(emptyState("history").cta).toContain("first question");
    expect(pendingCount([{ id: "1", label: "save", status: "queued" }, { id: "2", label: "sync", status: "done" }])).toBe(1);
  });
});
