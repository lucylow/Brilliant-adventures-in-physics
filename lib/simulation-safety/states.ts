import { SimulationError, err, ok, type Result } from "../../shared/errors";

export const SIMULATION_STATES = ["idle", "running", "paused", "complete", "error", "empty"] as const;
export type SimulationRuntimeState = (typeof SIMULATION_STATES)[number];

const ALLOWED: Record<SimulationRuntimeState, readonly SimulationRuntimeState[]> = {
  idle: ["running", "empty", "error"],
  running: ["paused", "complete", "error", "idle"],
  paused: ["running", "idle", "error"],
  complete: ["idle", "running"],
  error: ["idle"],
  empty: ["idle", "running"],
};

export function canTransition(from: SimulationRuntimeState, to: SimulationRuntimeState): boolean {
  return ALLOWED[from].includes(to);
}

export function transitionSimulation(from: SimulationRuntimeState, to: SimulationRuntimeState): Result<SimulationRuntimeState, SimulationError> {
  if (from === to) return ok(from);
  if (!canTransition(from, to)) {
    return err(new SimulationError({
      message: `Cannot move simulation from ${from} to ${to}`,
      userMessage: "The simulation could not change state. Reset the experiment and try again.",
      operation: "transitionSimulation",
      safeMetadata: { from, to },
    }));
  }
  return ok(to);
}

export type SimulationControllerState = {
  status: SimulationRuntimeState;
  focused: boolean;
  disposed: boolean;
};

export function createSimulationController(initial: SimulationRuntimeState = "idle"): {
  state: () => SimulationControllerState;
  play: () => Result<SimulationRuntimeState, SimulationError>;
  pause: () => Result<SimulationRuntimeState, SimulationError>;
  reset: () => Result<SimulationRuntimeState, SimulationError>;
  complete: () => Result<SimulationRuntimeState, SimulationError>;
  fail: () => Result<SimulationRuntimeState, SimulationError>;
  setFocused: (focused: boolean) => void;
  dispose: () => void;
  shouldTick: () => boolean;
} {
  const state: SimulationControllerState = { status: initial, focused: true, disposed: false };
  const move = (to: SimulationRuntimeState) => {
    if (state.disposed) {
      return err(new SimulationError({ message: "Simulation has been disposed", operation: "simulation" }));
    }
    const next = transitionSimulation(state.status, to);
    if (next.ok) state.status = next.data;
    return next;
  };
  return {
    state: () => ({ ...state }),
    play: () => move("running"),
    pause: () => move("paused"),
    reset: () => move("idle"),
    complete: () => move("complete"),
    fail: () => move("error"),
    setFocused: (focused) => {
      state.focused = focused;
    },
    dispose: () => {
      state.disposed = true;
      state.status = "idle";
      state.focused = false;
    },
    shouldTick: () => !state.disposed && state.focused && state.status === "running",
  };
}

export function isFiniteSample(value: { x: number; y: number; t?: number }): boolean {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && (value.t === undefined || Number.isFinite(value.t));
}

export function haltIfUnstable(samples: Array<{ x: number; y: number }>): Result<true, SimulationError> {
  if (samples.some((sample) => !Number.isFinite(sample.x) || !Number.isFinite(sample.y))) {
    return err(new SimulationError({
      message: "NaN propagation detected",
      userMessage: "The simulation paused because a value became unstable. Reset and try smaller inputs.",
      operation: "haltIfUnstable",
    }));
  }
  return ok(true);
}
