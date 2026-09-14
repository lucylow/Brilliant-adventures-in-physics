import { projectile } from "@/lib/physics";
import { roundPhysics } from "../utils/physics-values";
import { createSeededRandom } from "../utils/rng";

export function varyProjectile(seed: string) {
  const rng = createSeededRandom(seed);
  const speed = rng.randomFloat(8, 28, 1);
  const angle = rng.randomFloat(20, 70, 0);
  const height = rng.randomChoice([0, 0, 2, 5]);
  const result = projectile({ speed, angleDeg: angle, height });
  return {
    speed,
    angle,
    height,
    gravity: 9.80665,
    range: roundPhysics(result.range),
    flightTime: roundPhysics(result.flightTime),
    peakHeight: roundPhysics(result.peakHeight),
    prompt: `A ball is launched at ${speed} m/s at ${angle}° from a height of ${height} m. Find its range.`,
  };
}

export function varyOhms(seed: string) {
  const rng = createSeededRandom(seed);
  const voltage = rng.randomChoice([1.5, 3, 6, 9, 12]);
  const resistance = rng.randomChoice([1, 2, 3, 4, 6, 10]);
  return { voltage, resistance, current: voltage / resistance, prompt: `A ${voltage} V source is connected to a ${resistance} Ω resistor. What current flows?` };
}
