import { describe, expect, it } from "vitest";
import {
  canTransition,
  createSimulationController,
  haltIfUnstable,
  particleLimit,
  stepsForFrame,
  transitionSimulation,
  validateTimestep,
} from "../lib/simulation-safety";

describe("simulation safety", () => {
  it("rejects non-positive timesteps and caps large deltas", () => {
    expect(validateTimestep(0).ok).toBe(false);
    expect(validateTimestep(-1).ok).toBe(false);
    expect(validateTimestep(Number.NaN).ok).toBe(false);
    const capped = validateTimestep(1);
    expect(capped.ok).toBe(true);
    if (capped.ok) expect(capped.data).toBeLessThanOrEqual(0.05);
  });

  it("limits steps per frame and particle counts", () => {
    const steps = stepsForFrame(0.2);
    expect(steps.ok).toBe(true);
    if (steps.ok) expect(steps.data).toBeLessThanOrEqual(5);
    const particles = particleLimit(true, 10_000);
    expect(particles.ok).toBe(true);
    if (particles.ok) expect(particles.data).toBe(80);
  });

  it("allows only documented state transitions", () => {
    expect(canTransition("idle", "running")).toBe(true);
    expect(canTransition("running", "paused")).toBe(true);
    expect(canTransition("error", "running")).toBe(false);
    expect(transitionSimulation("complete", "idle").ok).toBe(true);
    expect(transitionSimulation("empty", "paused").ok).toBe(false);
  });

  it("does not tick when unfocused, paused, or disposed", () => {
    const controller = createSimulationController();
    expect(controller.play().ok).toBe(true);
    expect(controller.shouldTick()).toBe(true);
    controller.setFocused(false);
    expect(controller.shouldTick()).toBe(false);
    controller.setFocused(true);
    expect(controller.pause().ok).toBe(true);
    expect(controller.shouldTick()).toBe(false);
    controller.dispose();
    expect(controller.play().ok).toBe(false);
    expect(controller.shouldTick()).toBe(false);
  });

  it("halts when NaN appears in samples", () => {
    expect(haltIfUnstable([{ x: 1, y: 2 }]).ok).toBe(true);
    expect(haltIfUnstable([{ x: Number.NaN, y: 2 }]).ok).toBe(false);
  });
});
