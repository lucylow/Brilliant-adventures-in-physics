import {
  centripetalAcceleration,
  elasticPotentialEnergy,
  gravitationalPotentialEnergy,
  impulse,
  kineticEnergy,
  momentum,
  ohmsLaw,
  projectile,
  thermalEnergy,
  wave,
  workFromForce,
} from "@/lib/physics";
import { createMockProblem } from "../factories/problem";
import { createSeededRandom } from "../utils/rng";
import { roundPhysics } from "../utils/physics-values";
import type { MockDifficulty, MockProblem } from "../types";

type Template = {
  key: string;
  conceptId: string;
  topicId: string;
  difficulty: MockDifficulty;
  unit: string;
  unknown: string;
  equationId: string;
  variants: number;
  build: (index: number, seed: number) => { prompt: string; given: Record<string, number>; answer: number; hints: string[]; steps: string[]; explanation: string; wrong: number[] };
};

function pick(index: number, values: number[]): number {
  return values[index % values.length];
}

const TEMPLATES: Template[] = [
  {
    key: "final-velocity", conceptId: "kinematics", topicId: "kinematics", difficulty: "easy", unit: "m/s", unknown: "final velocity", equationId: "eq-velocity-const-a", variants: 10,
    build: (i) => {
      const v0 = pick(i, [2, 3, 4, 5, 6, 1.5, 0, 8]);
      const a = pick(i + 1, [1, 1.5, 2, 2.5, 0.5, 3]);
      const t = pick(i + 2, [3, 4, 5, 6, 2]);
      const answer = roundPhysics(v0 + a * t);
      return { prompt: `A cart starts at ${v0} m/s and accelerates at ${a} m/s² for ${t} s. What is its final velocity?`, given: { v0, a, t }, answer, hints: ["Use v = v₀ + at.", "Keep m/s visible."], steps: [`v = ${v0} + ${a}×${t}`, `v = ${answer} m/s`], explanation: "Constant acceleration means velocity changes linearly with time.", wrong: [v0 * t, a * t] };
    },
  },
  {
    key: "position", conceptId: "kinematics", topicId: "kinematics", difficulty: "medium", unit: "m", unknown: "position", equationId: "eq-position-const-a", variants: 10,
    build: (i) => {
      const x0 = pick(i, [0, 2, 5]);
      const v0 = pick(i + 1, [3, 4, 0, 6]);
      const a = pick(i + 2, [2, 1, -1, 1.5]);
      const t = pick(i + 3, [2, 3, 4]);
      const answer = roundPhysics(x0 + v0 * t + 0.5 * a * t * t);
      return { prompt: `An object starts at x = ${x0} m with v₀ = ${v0} m/s and a = ${a} m/s². Find x after ${t} s.`, given: { x0, v0, a, t }, answer, hints: ["x = x₀ + v₀t + ½at²"], steps: [`x = ${x0} + ${v0}×${t} + ½(${a})(${t})²`, `x = ${answer} m`], explanation: "The quadratic term is required whenever acceleration is not zero.", wrong: [x0 + v0 * t, v0 * t] };
    },
  },
  {
    key: "projectile-range", conceptId: "kinematics", topicId: "projectile-motion", difficulty: "medium", unit: "m", unknown: "range", equationId: "eq-range", variants: 10,
    build: (i) => {
      const speed = pick(i, [12, 15, 18, 20, 22, 16, 25, 14]);
      const angleDeg = pick(i + 3, [30, 35, 40, 42, 45, 50, 28, 38]);
      const answer = roundPhysics(projectile({ speed, angleDeg, height: 0 }).range);
      return { prompt: `A ball is launched at ${speed} m/s at ${angleDeg}° from level ground. What is its horizontal range? Neglect air resistance.`, given: { speed, angleDeg, height: 0 }, answer, hints: ["Split into vₓ = v cosθ and vᵧ = v sinθ.", "Range is vₓ times flight time."], steps: ["Compute flight time from vertical motion.", `Range = ${answer} m`], explanation: "Horizontal and vertical motions are independent; g acts only vertically. Air resistance is neglected.", wrong: [speed * angleDeg / 10, speed] };
    },
  },
  {
    key: "kinetic", conceptId: "energy", topicId: "energy", difficulty: "easy", unit: "J", unknown: "kinetic energy", equationId: "eq-kinetic", variants: 10,
    build: (i) => {
      const mass = pick(i, [1, 2, 3, 0.5, 4, 5, 1.5, 2.5]);
      const speed = pick(i + 2, [2, 3, 4, 5, 6, 1, 8, 3.5]);
      const answer = roundPhysics(kineticEnergy(mass, speed));
      return { prompt: `A ${mass} kg object moves at ${speed} m/s. What is its kinetic energy?`, given: { mass, speed }, answer, hints: ["K = ½mv²"], steps: [`K = ½(${mass})(${speed})²`, `K = ${answer} J`], explanation: "Doubling speed quadruples kinetic energy.", wrong: [mass * speed, mass * speed * speed] };
    },
  },
  {
    key: "ug", conceptId: "gravitational-energy", topicId: "energy", difficulty: "easy", unit: "J", unknown: "gravitational potential energy", equationId: "eq-ug", variants: 6,
    build: (i) => {
      const mass = pick(i, [1, 2, 3, 5, 0.8, 4]);
      const height = pick(i + 1, [2, 3, 5, 10, 1.5, 8]);
      const answer = roundPhysics(gravitationalPotentialEnergy(mass, height));
      return { prompt: `How much gravitational potential energy does a ${mass} kg object gain when lifted ${height} m? Take g = 9.80665 m/s² and U = 0 at the lower level.`, given: { mass, height }, answer, hints: ["U = mgh near Earth's surface"], steps: [`U = ${mass} × g × ${height}`, `U = ${answer} J`], explanation: "Near Earth, ΔU = mgΔh. The zero of U is a choice.", wrong: [mass * height, mass * 10 * height] };
    },
  },
  {
    key: "work", conceptId: "work", topicId: "energy", difficulty: "medium", unit: "J", unknown: "work", equationId: "eq-work", variants: 6,
    build: (i) => {
      const force = pick(i, [10, 12, 15, 20, 8, 25]);
      const distance = pick(i + 1, [2, 3, 4, 5, 1.5, 6]);
      const angleDeg = pick(i + 2, [0, 0, 30, 60, 0, 45]);
      const answer = roundPhysics(workFromForce(force, distance, angleDeg));
      return { prompt: `A ${force} N force acts through ${distance} m at ${angleDeg}° to the displacement. How much work does it do?`, given: { force, distance, angleDeg }, answer, hints: ["W = Fd cosθ"], steps: [`W = ${force} × ${distance} × cos(${angleDeg}°)`, `W = ${answer} J`], explanation: "Only the component of force along the displacement does work.", wrong: [force * distance, force] };
    },
  },
  {
    key: "spring", conceptId: "elasticity", topicId: "energy", difficulty: "medium", unit: "J", unknown: "elastic potential energy", equationId: "eq-spring-energy", variants: 6,
    build: (i) => {
      const k = pick(i, [80, 100, 120, 200, 50, 150]);
      const x = pick(i + 1, [0.1, 0.2, 0.15, 0.25, 0.08, 0.3]);
      const answer = roundPhysics(elasticPotentialEnergy(k, x));
      return { prompt: `A spring with k = ${k} N/m is stretched ${x} m from equilibrium. How much energy does it store? Assume an ideal spring.`, given: { k, x }, answer, hints: ["U = ½kx²"], steps: [`U = ½(${k})(${x})²`, `U = ${answer} J`], explanation: "Ideal springs store energy that depends on the square of displacement.", wrong: [k * x, k * x * x] };
    },
  },
  {
    key: "momentum", conceptId: "momentum", topicId: "momentum", difficulty: "easy", unit: "kg·m/s", unknown: "momentum", equationId: "eq-momentum", variants: 6,
    build: (i) => {
      const mass = pick(i, [1, 2, 3, 4, 0.5, 5]);
      const speed = pick(i + 2, [2, 3, 4, 5, 6, 8]);
      const answer = roundPhysics(momentum(mass, speed));
      return { prompt: `What momentum does a ${mass} kg object have while moving at ${speed} m/s?`, given: { mass, speed }, answer, hints: ["p = mv"], steps: [`p = ${mass} × ${speed}`, `p = ${answer} kg·m/s`], explanation: "Momentum is a vector; this question asks for the magnitude along the motion.", wrong: [mass + speed, kineticEnergy(mass, speed)] };
    },
  },
  {
    key: "impulse", conceptId: "impulse", topicId: "momentum", difficulty: "medium", unit: "N·s", unknown: "impulse", equationId: "eq-impulse-ft", variants: 6,
    build: (i) => {
      const force = pick(i, [8, 10, 12, 15, 20, 6]);
      const time = pick(i + 1, [0.2, 0.5, 0.4, 0.25, 1, 0.1]);
      const answer = roundPhysics(impulse(force, time));
      return { prompt: `A constant ${force} N force acts for ${time} s. What impulse does it deliver?`, given: { force, time }, answer, hints: ["J = FΔt = Δp"], steps: [`J = ${force} × ${time}`, `J = ${answer} N·s`], explanation: "Impulse is the area under an F(t) graph.", wrong: [force / time, force] };
    },
  },
  {
    key: "wave", conceptId: "wave-motion", topicId: "waves", difficulty: "easy", unit: "m/s", unknown: "wave speed", equationId: "eq-wave", variants: 6,
    build: (i) => {
      const frequencyHz = pick(i, [2, 4, 5, 8, 10, 3]);
      const wavelengthM = pick(i + 1, [0.5, 0.4, 2, 0.25, 1.5, 0.8]);
      const answer = roundPhysics(wave({ frequencyHz, wavelengthM }).speedMps);
      return { prompt: `A wave has frequency ${frequencyHz} Hz and wavelength ${wavelengthM} m. What is its speed?`, given: { frequencyHz, wavelengthM }, answer, hints: ["v = fλ"], steps: [`v = ${frequencyHz} × ${wavelengthM}`, `v = ${answer} m/s`], explanation: "Speed, frequency, and wavelength are not independent.", wrong: [frequencyHz / wavelengthM, frequencyHz] };
    },
  },
  {
    key: "ohm", conceptId: "circuits", topicId: "circuits", difficulty: "easy", unit: "A", unknown: "current", equationId: "eq-ohm", variants: 10,
    build: (i) => {
      const voltage = pick(i, [6, 9, 12, 18, 3, 24, 5, 15]);
      const resistance = pick(i + 1, [2, 3, 4, 6, 1.5, 8, 5, 10]);
      const answer = roundPhysics(ohmsLaw(voltage, resistance).current);
      return { prompt: `A ${voltage} V source is connected to a ${resistance} Ω resistor. What current flows? Assume an ohmic resistor.`, given: { voltage, resistance }, answer, hints: ["I = V/R"], steps: [`I = ${voltage}/${resistance}`, `I = ${answer} A`], explanation: "Ohm's law applies to ohmic resistors; it is not a universal law of nature for all devices.", wrong: [voltage * resistance, resistance / voltage] };
    },
  },
  {
    key: "power-circuit", conceptId: "electric-power", topicId: "circuits", difficulty: "medium", unit: "W", unknown: "power", equationId: "eq-electric-power", variants: 6,
    build: (i) => {
      const voltage = pick(i, [12, 9, 6, 18, 24, 5]);
      const resistance = pick(i + 2, [3, 4, 2, 6, 8, 5]);
      const answer = roundPhysics(ohmsLaw(voltage, resistance).power);
      return { prompt: `How much power is dissipated in a ${resistance} Ω resistor connected to ${voltage} V?`, given: { voltage, resistance }, answer, hints: ["P = V²/R = IV"], steps: [`I = ${voltage}/${resistance}`, `P = ${answer} W`], explanation: "Electrical power in a resistor is also I²R.", wrong: [voltage / resistance, voltage * resistance] };
    },
  },
  {
    key: "heat", conceptId: "heat", topicId: "thermodynamics", difficulty: "medium", unit: "J", unknown: "thermal energy", equationId: "eq-heat", variants: 6,
    build: (i) => {
      const massKg = pick(i, [0.25, 0.5, 1, 0.8, 2, 0.4]);
      const temperatureChangeK = pick(i + 1, [5, 10, 8, 12, 15, 6]);
      const specificHeatJPerKgK = 4186;
      const answer = roundPhysics(thermalEnergy({ massKg, specificHeatJPerKgK, temperatureChangeK }));
      return { prompt: `How much energy warms ${massKg} kg of water by ${temperatureChangeK} K? Use c = 4186 J/(kg·K) and assume no phase change.`, given: { massKg, specificHeatJPerKgK, temperatureChangeK }, answer, hints: ["Q = mcΔT"], steps: [`Q = ${massKg} × 4186 × ${temperatureChangeK}`, `Q = ${answer} J`], explanation: "This is sensible heat only; boiling would require latent heat as well.", wrong: [massKg * temperatureChangeK, massKg * 4186] };
    },
  },
  {
    key: "centripetal", conceptId: "centripetal-acceleration", topicId: "rotation", difficulty: "medium", unit: "m/s²", unknown: "centripetal acceleration", equationId: "eq-centripetal", variants: 6,
    build: (i) => {
      const speed = pick(i, [4, 5, 6, 8, 10, 3]);
      const radius = pick(i + 1, [1, 2, 0.5, 1.5, 2.5, 4]);
      const answer = roundPhysics(centripetalAcceleration(speed, radius));
      return { prompt: `An object moves at ${speed} m/s in a circle of radius ${radius} m. What is its centripetal acceleration?`, given: { speed, radius }, answer, hints: ["a_c = v²/r toward the center"], steps: [`a_c = (${speed})² / ${radius}`, `a_c = ${answer} m/s²`], explanation: "Changing direction is an acceleration even if speed is constant.", wrong: [speed / radius, speed * radius] };
    },
  },
  {
    key: "pendulum", conceptId: "pendulum", topicId: "oscillations", difficulty: "medium", unit: "s", unknown: "period", equationId: "eq-pendulum", variants: 6,
    build: (i) => {
      const length = pick(i, [0.25, 0.5, 1, 1.2, 0.8, 2]);
      const answer = roundPhysics(2 * Math.PI * Math.sqrt(length / 9.80665));
      return { prompt: `A simple pendulum of length ${length} m oscillates at small amplitude. Estimate the period. Take g = 9.80665 m/s². The small-angle assumption is required.`, given: { length }, answer, hints: ["T = 2π√(L/g)", "Mass cancels."], steps: [`T = 2π√(${length}/g)`, `T = ${answer} s`], explanation: "The result is independent of mass and amplitude only for small angles.", wrong: [length, 2 * length] };
    },
  },
  {
    key: "net-force", conceptId: "forces", topicId: "forces", difficulty: "easy", unit: "m/s²", unknown: "acceleration", equationId: "eq-newton", variants: 8,
    build: (i) => {
      const mass = pick(i, [1, 2, 4, 0.5, 5, 3, 8, 1.5]);
      const force = pick(i + 1, [6, 8, 12, 4, 10, 9, 16, 3]);
      const answer = roundPhysics(force / mass);
      return { prompt: `A ${mass} kg object feels a net force of ${force} N. What is its acceleration?`, given: { mass, force }, answer, hints: ["a = F_net / m"], steps: [`a = ${force} / ${mass}`, `a = ${answer} m/s²`], explanation: "The net force, not any single labeled arrow, determines acceleration.", wrong: [force * mass, force] };
    },
  },
  {
    key: "free-fall-time", conceptId: "free-fall", topicId: "kinematics", difficulty: "medium", unit: "s", unknown: "fall time", equationId: "eq-free-fall", variants: 6,
    build: (i) => {
      const height = pick(i, [5, 10, 20, 8, 12, 45]);
      const answer = roundPhysics(Math.sqrt((2 * height) / 9.80665));
      return { prompt: `An object is dropped from rest from ${height} m. How long does it take to reach the ground? Take g = 9.80665 m/s² and neglect air resistance.`, given: { height }, answer, hints: ["y = ½gt² from rest", "t = √(2h/g)"], steps: [`t = √(2×${height}/g)`, `t = ${answer} s`], explanation: "Dropped from rest means v₀ = 0. Air resistance is neglected.", wrong: [height / 9.8, height] };
    },
  },
];

function xpForDifficulty(difficulty: MockDifficulty): number {
  return { easy: 10, medium: 14, hard: 20, challenge: 28 }[difficulty];
}

function timeForDifficulty(difficulty: MockDifficulty): number {
  return { easy: 60, medium: 90, hard: 140, challenge: 200 }[difficulty];
}

export function createProblemCatalog(seed = "bav-problems"): MockProblem[] {
  const rng = createSeededRandom(seed);
  const problems: MockProblem[] = [];
  for (const template of TEMPLATES) {
    for (let index = 0; index < template.variants; index += 1) {
      const built = template.build(index, rng.randomInt(1, 10_000));
      problems.push(createMockProblem({
        id: `problem-${template.key}-${index + 1}`,
        conceptId: template.conceptId,
        topicId: template.topicId,
        difficulty: template.difficulty,
        prompt: built.prompt,
        givenValues: built.given,
        unknown: template.unknown,
        unit: template.unit,
        hints: built.hints,
        solutionSteps: built.steps,
        finalAnswer: built.answer,
        tolerance: 0.02,
        explanation: built.explanation,
        commonWrongAnswers: built.wrong.map((value) => roundPhysics(value)),
        estimatedTime: timeForDifficulty(template.difficulty),
        xpReward: xpForDifficulty(template.difficulty),
        equationId: template.equationId,
      }));
    }
  }
  return problems;
}

export function toPracticeQuestion(problem: MockProblem) {
  return {
    id: problem.id,
    prompt: problem.prompt,
    unit: problem.unit,
    solve: () => problem.finalAnswer,
    concept: problem.unknown,
    conceptId: problem.conceptId,
  };
}
