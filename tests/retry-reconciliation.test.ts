import { describe, expect, it } from "vitest";
import { shouldReconcileOnForeground } from "../lib/retry-reconciliation";

describe("foreground retry reconciliation", () => {
  it("reconciles only when returning to active from an inactive state", () => {
    expect(shouldReconcileOnForeground("background", "active")).toBe(true);
    expect(shouldReconcileOnForeground("inactive", "active")).toBe(true);
    expect(shouldReconcileOnForeground("active", "active")).toBe(false);
    expect(shouldReconcileOnForeground("background", "inactive")).toBe(false);
  });
});
