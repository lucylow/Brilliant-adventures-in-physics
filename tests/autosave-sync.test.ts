import { describe, expect, it, vi } from "vitest";
import { publishAutosaveSync, subscribeAutosaveSync } from "../lib/autosave-sync";

describe("autosave sync events", () => {
  it("publishes valid saved counts and preserves the supplied timestamp", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAutosaveSync(listener);
    publishAutosaveSync(3, 1234);
    unsubscribe();
    expect(listener).toHaveBeenCalledWith({ saved: 3, occurredAt: 1234 });
  });

  it("ignores invalid counts and does not notify after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAutosaveSync(listener);
    publishAutosaveSync(0);
    publishAutosaveSync(-1);
    publishAutosaveSync(1.5);
    publishAutosaveSync(1, Number.NaN);
    unsubscribe();
    publishAutosaveSync(2);
    expect(listener).not.toHaveBeenCalled();
  });

  it("isolates subscriber failures from other listeners", () => {
    const failing = vi.fn(() => { throw new Error("notification failure"); });
    const healthy = vi.fn();
    const removeFailing = subscribeAutosaveSync(failing);
    const removeHealthy = subscribeAutosaveSync(healthy);
    publishAutosaveSync(2, 99);
    removeFailing();
    removeHealthy();
    expect(failing).toHaveBeenCalledOnce();
    expect(healthy).toHaveBeenCalledWith({ saved: 2, occurredAt: 99 });
  });
});
