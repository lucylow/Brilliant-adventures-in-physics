import { SimulationError, err, ok, type Result } from "../../shared/errors";

export const MIN_TIMESTEP_S = 1 / 240;
export const MAX_TIMESTEP_S = 1 / 20;
export const MAX_DELTA_S = 0.05;
export const DEFAULT_FIXED_TIMESTEP_S = 1 / 60;
export const MAX_PARTICLES = 250;
export const LOW_END_PARTICLES = 80;
export const MAX_STEPS_PER_FRAME = 5;

export function validateTimestep(deltaSeconds: unknown): Result<number, SimulationError> {
  if (typeof deltaSeconds !== "number" || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
    return err(new SimulationError({
      message: "timestep must be a positive finite number",
      userMessage: "The simulation paused because the time step was invalid. Reset and try again.",
      operation: "validateTimestep",
    }));
  }
  if (deltaSeconds > MAX_DELTA_S) return ok(MAX_DELTA_S);
  return ok(deltaSeconds);
}

export function clampFixedTimestep(timestep: number): Result<number, SimulationError> {
  if (!Number.isFinite(timestep) || timestep <= 0) {
    return err(new SimulationError({
      message: "fixed timestep must be positive",
      operation: "clampFixedTimestep",
    }));
  }
  return ok(Math.min(MAX_TIMESTEP_S, Math.max(MIN_TIMESTEP_S, timestep)));
}

export function stepsForFrame(deltaSeconds: number, timestep = DEFAULT_FIXED_TIMESTEP_S): Result<number, SimulationError> {
  const delta = validateTimestep(deltaSeconds);
  if (!delta.ok) return delta;
  const step = clampFixedTimestep(timestep);
  if (!step.ok) return step;
  const count = Math.min(MAX_STEPS_PER_FRAME, Math.max(1, Math.round(delta.data / step.data)));
  return ok(count);
}

export function particleLimit(lowEndDevice: boolean, requested: number): Result<number, SimulationError> {
  if (!Number.isInteger(requested) || requested < 0) {
    return err(new SimulationError({
      message: "particle count must be a non-negative integer",
      operation: "particleLimit",
    }));
  }
  const cap = lowEndDevice ? LOW_END_PARTICLES : MAX_PARTICLES;
  return ok(Math.min(requested, cap));
}
