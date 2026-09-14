import {
  buoyantForce,
  deBroglieWavelength,
  hydrostaticPressure,
  massEnergyEquivalent,
  photonEnergyFromWavelength,
  refraction,
  resistanceFromVoltageCurrent,
  springForce,
  weightForce,
} from "@/lib/physics";
import { createMockProblem } from "../factories/problem";
import { roundPhysics } from "../utils/physics-values";
import type { MockDifficulty, MockProblem } from "../types";

type Spec = {
  id: string;
  conceptId: string;
  topicId: string;
  difficulty: MockDifficulty;
  prompt: string;
  given: Record<string, number>;
  unit: string;
  unknown: string;
  answer: number;
  hints: string[];
  steps: string[];
  explanation: string;
  wrong: number[];
  equationId?: string;
};

function xp(difficulty: MockDifficulty): number {
  return { easy: 10, medium: 14, hard: 20, challenge: 28 }[difficulty];
}

function time(difficulty: MockDifficulty): number {
  return { easy: 70, medium: 100, hard: 150, challenge: 210 }[difficulty];
}

function variantsFrom(base: Spec, deltas: Array<Record<string, number>>, recompute: (given: Record<string, number>) => number): Spec[] {
  return deltas.map((delta, index) => {
    const given = { ...base.given, ...delta };
    const answer = roundPhysics(recompute(given));
    return {
      ...base,
      id: `${base.id}-${index + 1}`,
      given,
      answer,
      prompt: base.prompt.replace(/\{(\w+)\}/g, (_, key: string) => String(given[key])),
      steps: [`Substitute the given values.`, `Result: ${answer} ${base.unit}`],
      wrong: base.wrong,
    };
  });
}

export function createExtendedProblemCatalog(): MockProblem[] {
  const specs: Spec[] = [];

  specs.push(...variantsFrom(
    { id: "problem-weight", conceptId: "weight", topicId: "forces", difficulty: "easy", prompt: "What is the weight of a {mass} kg object near Earth? Take g = 9.80665 m/s².", given: { mass: 2 }, unit: "N", unknown: "weight", answer: 0, hints: ["W = mg"], steps: [], explanation: "Weight is gravitational force, not mass.", wrong: [2], equationId: "eq-weight" },
    [{ mass: 2 }, { mass: 5 }, { mass: 0.5 }, { mass: 10 }, { mass: 1.2 }, { mass: 8 }],
    (g) => weightForce(g.mass),
  ));

  specs.push(...variantsFrom(
    { id: "problem-spring-force", conceptId: "hookes-law", topicId: "energy", difficulty: "easy", prompt: "An ideal spring with k = {k} N/m is displaced {x} m. What restoring force magnitude does Hooke's law predict?", given: { k: 50, x: 0.1 }, unit: "N", unknown: "force magnitude", answer: 0, hints: ["F = −kx; report the magnitude"], steps: [], explanation: "The minus sign shows direction toward equilibrium.", wrong: [5], equationId: "eq-hooke" },
    [{ k: 50, x: 0.1 }, { k: 80, x: 0.2 }, { k: 120, x: 0.05 }, { k: 200, x: 0.15 }, { k: 40, x: 0.25 }, { k: 90, x: 0.12 }],
    (g) => roundPhysics(Math.abs(springForce(g.k, g.x))),
  ));

  specs.push(...variantsFrom(
    { id: "problem-pressure", conceptId: "pressure", topicId: "thermodynamics", difficulty: "medium", prompt: "Find the gauge pressure {depth} m under fresh water (ρ = 1000 kg/m³). Take g = 9.80665 m/s².", given: { depth: 2, density: 1000 }, unit: "Pa", unknown: "gauge pressure", answer: 0, hints: ["P_gauge = ρgh"], steps: [], explanation: "Gauge pressure is the extra pressure due to depth.", wrong: [2000], equationId: "eq-hydrostatic" },
    [{ depth: 2 }, { depth: 5 }, { depth: 1.5 }, { depth: 10 }, { depth: 0.8 }, { depth: 3 }],
    (g) => roundPhysics(hydrostaticPressure(1000, g.depth)),
  ));

  specs.push(...variantsFrom(
    { id: "problem-buoyancy", conceptId: "buoyancy", topicId: "biophysics", difficulty: "medium", prompt: "A volume of {volume} m³ is submerged in water (ρ = 1000 kg/m³). What buoyant force acts on it?", given: { volume: 0.02 }, unit: "N", unknown: "buoyant force", answer: 0, hints: ["F_b = ρVg"], steps: [], explanation: "The buoyant force equals the weight of displaced fluid.", wrong: [20], equationId: "eq-buoyancy" },
    [{ volume: 0.02 }, { volume: 0.01 }, { volume: 0.05 }, { volume: 0.004 }, { volume: 0.03 }, { volume: 0.008 }],
    (g) => roundPhysics(buoyantForce(1000, g.volume)),
  ));

  specs.push(...variantsFrom(
    { id: "problem-photon", conceptId: "modern-energy", topicId: "modern-physics", difficulty: "hard", prompt: "What is the energy of a photon with wavelength {nm} nm?", given: { nm: 500 }, unit: "J", unknown: "photon energy", answer: 0, hints: ["E = hc/λ", "Convert nm to meters"], steps: [], explanation: "Shorter wavelength means larger photon energy.", wrong: [500], equationId: "eq-photon-wavelength" },
    [{ nm: 500 }, { nm: 400 }, { nm: 650 }, { nm: 300 }, { nm: 550 }, { nm: 450 }],
    (g) => roundPhysics(photonEnergyFromWavelength(g.nm * 1e-9), 8),
  ));

  specs.push(...variantsFrom(
    { id: "problem-debroglie", conceptId: "de-broglie-wavelength", topicId: "quantum-physics", difficulty: "hard", prompt: "Find the de Broglie wavelength of a {mass} kg object moving at {speed} m/s.", given: { mass: 0.1, speed: 2 }, unit: "m", unknown: "wavelength", answer: 0, hints: ["λ = h/p = h/(mv)"], steps: [], explanation: "Macroscopic momenta make λ far smaller than everyday lengths.", wrong: [0.1], equationId: "eq-debroglie" },
    [{ mass: 0.1, speed: 2 }, { mass: 0.05, speed: 4 }, { mass: 0.2, speed: 1 }, { mass: 0.01, speed: 10 }, { mass: 0.25, speed: 2.5 }, { mass: 0.08, speed: 5 }],
    (g) => roundPhysics(deBroglieWavelength(g.mass, g.speed), 10),
  ));

  specs.push(...variantsFrom(
    { id: "problem-rest-energy", conceptId: "mass-energy", topicId: "relativity", difficulty: "hard", prompt: "What rest energy corresponds to {mass} kg? Use E = mc² with c = 299792458 m/s.", given: { mass: 0.001 }, unit: "J", unknown: "rest energy", answer: 0, hints: ["E = mc²"], steps: [], explanation: "This converts mass to energy; it does not describe a chemical reaction.", wrong: [3e5], equationId: "eq-mass-energy" },
    [{ mass: 0.001 }, { mass: 0.0005 }, { mass: 0.002 }, { mass: 1e-6 }, { mass: 0.01 }, { mass: 5e-4 }],
    (g) => roundPhysics(massEnergyEquivalent(g.mass), 3),
  ));

  specs.push(...variantsFrom(
    { id: "problem-refract", conceptId: "optics", topicId: "optics", difficulty: "medium", prompt: "Light enters glass (n = 1.5) from air (n = 1.0) at {angle}°. What is the refracted angle?", given: { angle: 30 }, unit: "°", unknown: "refracted angle", answer: 0, hints: ["n₁ sinθ₁ = n₂ sinθ₂"], steps: [], explanation: "Light bends toward the normal when entering a higher-index medium.", wrong: [30], equationId: "eq-snell" },
    [{ angle: 30 }, { angle: 20 }, { angle: 40 }, { angle: 15 }, { angle: 35 }, { angle: 25 }],
    (g) => roundPhysics(refraction({ incidentAngleDeg: g.angle, refractiveIndexFrom: 1, refractiveIndexTo: 1.5 }).refractedAngleDeg ?? 0),
  ));

  specs.push(...variantsFrom(
    { id: "problem-resistance", conceptId: "ohms-law", topicId: "circuits", difficulty: "easy", prompt: "A resistor draws {current} A from a {voltage} V source. What is its resistance?", given: { voltage: 12, current: 3 }, unit: "Ω", unknown: "resistance", answer: 0, hints: ["R = V/I"], steps: [], explanation: "Resistance is the ratio V/I for the operating point.", wrong: [36], equationId: "eq-ohm" },
    [{ voltage: 12, current: 3 }, { voltage: 9, current: 1.5 }, { voltage: 6, current: 2 }, { voltage: 24, current: 4 }, { voltage: 18, current: 6 }, { voltage: 5, current: 0.5 }],
    (g) => roundPhysics(resistanceFromVoltageCurrent(g.voltage, g.current)),
  ));

  specs.push(...variantsFrom(
    { id: "problem-period-wave", conceptId: "wave-frequency", topicId: "waves", difficulty: "easy", prompt: "A wave has frequency {frequency} Hz. What is its period?", given: { frequency: 5 }, unit: "s", unknown: "period", answer: 0, hints: ["T = 1/f"], steps: [], explanation: "Period and frequency are reciprocals.", wrong: [5], equationId: "eq-period-freq" },
    [{ frequency: 5 }, { frequency: 2 }, { frequency: 10 }, { frequency: 4 }, { frequency: 8 }, { frequency: 0.5 }],
    (g) => roundPhysics(1 / g.frequency),
  ));

  specs.push(...variantsFrom(
    { id: "problem-wavelength", conceptId: "wavelength", topicId: "waves", difficulty: "easy", prompt: "A {speed} m/s wave has frequency {frequency} Hz. What is its wavelength?", given: { speed: 340, frequency: 170 }, unit: "m", unknown: "wavelength", answer: 0, hints: ["λ = v/f"], steps: [], explanation: "Wavelength is the spatial period of the wave.", wrong: [340], equationId: "eq-wavelength" },
    [{ speed: 340, frequency: 170 }, { speed: 340, frequency: 85 }, { speed: 3, frequency: 6 }, { speed: 1500, frequency: 500 }, { speed: 2, frequency: 4 }, { speed: 10, frequency: 5 }],
    (g) => roundPhysics(g.speed / g.frequency),
  ));

  specs.push(...variantsFrom(
    { id: "problem-friction", conceptId: "friction", topicId: "forces", difficulty: "medium", prompt: "A {mass} kg crate on level ground has μ_s = {mu}. What maximum static friction can act? Take g = 9.80665 m/s² and N = mg.", given: { mass: 5, mu: 0.4 }, unit: "N", unknown: "maximum static friction", answer: 0, hints: ["f_s,max = μ_s N", "N = mg on level ground with no other vertical forces"], steps: [], explanation: "Static friction has a maximum; it is not automatically μN in every problem.", wrong: [2], equationId: "eq-friction-max" },
    [{ mass: 5, mu: 0.4 }, { mass: 2, mu: 0.3 }, { mass: 8, mu: 0.5 }, { mass: 3, mu: 0.2 }, { mass: 10, mu: 0.35 }, { mass: 4, mu: 0.6 }],
    (g) => roundPhysics(g.mu * weightForce(g.mass)),
  ));

  specs.push(...variantsFrom(
    { id: "problem-incline", conceptId: "inclined-plane", topicId: "forces", difficulty: "medium", prompt: "A {mass} kg block sits on a frictionless incline of {angle}°. What is the component of weight down the slope?", given: { mass: 3, angle: 30 }, unit: "N", unknown: "parallel weight component", answer: 0, hints: ["F_∥ = mg sinθ"], steps: [], explanation: "The other component, mg cosθ, is into the surface.", wrong: [30], equationId: "eq-incline" },
    [{ mass: 3, angle: 30 }, { mass: 2, angle: 20 }, { mass: 5, angle: 45 }, { mass: 4, angle: 10 }, { mass: 1.5, angle: 35 }, { mass: 6, angle: 25 }],
    (g) => roundPhysics(weightForce(g.mass) * Math.sin((g.angle * Math.PI) / 180)),
  ));

  specs.push(...variantsFrom(
    { id: "problem-capacitor", conceptId: "capacitance", topicId: "circuits", difficulty: "medium", prompt: "A {capacitance} F capacitor is charged to {voltage} V. How much charge is stored?", given: { capacitance: 0.002, voltage: 12 }, unit: "C", unknown: "charge", answer: 0, hints: ["Q = CV"], steps: [], explanation: "Capacitance is charge per volt.", wrong: [12], equationId: "eq-capacitor" },
    [{ capacitance: 0.002, voltage: 12 }, { capacitance: 0.001, voltage: 9 }, { capacitance: 5e-4, voltage: 20 }, { capacitance: 0.01, voltage: 6 }, { capacitance: 2e-3, voltage: 5 }, { capacitance: 0.004, voltage: 15 }],
    (g) => roundPhysics(g.capacitance * g.voltage),
  ));

  specs.push(...variantsFrom(
    { id: "problem-series", conceptId: "series-parallel", topicId: "circuits", difficulty: "easy", prompt: "What is the equivalent of {r1} Ω in series with {r2} Ω?", given: { r1: 4, r2: 6 }, unit: "Ω", unknown: "equivalent resistance", answer: 0, hints: ["Series resistances add"], steps: [], explanation: "Current is the same through series resistors.", wrong: [2.4], equationId: "eq-series" },
    [{ r1: 4, r2: 6 }, { r1: 10, r2: 2 }, { r1: 3, r2: 3 }, { r1: 8, r2: 12 }, { r1: 1.5, r2: 2.5 }, { r1: 20, r2: 5 }],
    (g) => roundPhysics(g.r1 + g.r2),
  ));

  specs.push(...variantsFrom(
    { id: "problem-parallel", conceptId: "series-parallel", topicId: "circuits", difficulty: "medium", prompt: "What is the equivalent of {r1} Ω in parallel with {r2} Ω?", given: { r1: 6, r2: 3 }, unit: "Ω", unknown: "equivalent resistance", answer: 0, hints: ["1/R_p = 1/R1 + 1/R2"], steps: [], explanation: "Parallel equivalent is smaller than either branch.", wrong: [9], equationId: "eq-parallel" },
    [{ r1: 6, r2: 3 }, { r1: 10, r2: 10 }, { r1: 8, r2: 8 }, { r1: 4, r2: 12 }, { r1: 5, r2: 20 }, { r1: 2, r2: 2 }],
    (g) => roundPhysics(1 / (1 / g.r1 + 1 / g.r2)),
  ));

  specs.push(...variantsFrom(
    { id: "problem-beats", conceptId: "beats", topicId: "sound", difficulty: "easy", prompt: "Two notes at {f1} Hz and {f2} Hz sound together. What beat frequency is heard?", given: { f1: 440, f2: 436 }, unit: "Hz", unknown: "beat frequency", answer: 0, hints: ["f_beat = |f1 − f2|"], steps: [], explanation: "Beats are the audible difference frequency.", wrong: [438], equationId: "eq-beats" },
    [{ f1: 440, f2: 436 }, { f1: 256, f2: 260 }, { f1: 512, f2: 508 }, { f1: 100, f2: 104 }, { f1: 880, f2: 874 }, { f1: 300, f2: 306 }],
    (g) => roundPhysics(Math.abs(g.f1 - g.f2)),
  ));

  specs.push(...variantsFrom(
    { id: "problem-standing", conceptId: "standing-waves", topicId: "waves", difficulty: "medium", prompt: "A string of length {length} m vibrates in its {n}-th harmonic with both ends fixed. What is the wavelength?", given: { length: 2, n: 1 }, unit: "m", unknown: "wavelength", answer: 0, hints: ["L = nλ/2"], steps: [], explanation: "The fundamental has λ = 2L.", wrong: [2], equationId: "eq-standing" },
    [{ length: 2, n: 1 }, { length: 1.5, n: 1 }, { length: 2, n: 2 }, { length: 3, n: 3 }, { length: 0.8, n: 1 }, { length: 1.2, n: 2 }],
    (g) => roundPhysics((2 * g.length) / g.n),
  ));

  specs.push(...variantsFrom(
    { id: "problem-carnot", conceptId: "heat-engines", topicId: "thermodynamics", difficulty: "hard", prompt: "A Carnot engine runs between {hot} K and {cold} K. What is its efficiency?", given: { hot: 600, cold: 300 }, unit: "1", unknown: "efficiency", answer: 0, hints: ["e = 1 − T_C/T_H", "Use absolute temperatures"], steps: [], explanation: "No heat engine between those reservoirs can exceed this value.", wrong: [0.5], equationId: "eq-carnot" },
    [{ hot: 600, cold: 300 }, { hot: 500, cold: 250 }, { hot: 400, cold: 280 }, { hot: 800, cold: 200 }, { hot: 350, cold: 280 }, { hot: 900, cold: 300 }],
    (g) => roundPhysics(1 - g.cold / g.hot),
  ));

  specs.push(...variantsFrom(
    { id: "problem-range-level", conceptId: "projectile-range", topicId: "projectile-motion", difficulty: "medium", prompt: "A projectile is launched at {speed} m/s at {angle}° from level ground. Using R = v² sin(2θ)/g and g = 9.80665 m/s², find the range. Air resistance is neglected.", given: { speed: 20, angle: 45 }, unit: "m", unknown: "range", answer: 0, hints: ["Maximum range at 45° when air is neglected"], steps: [], explanation: "The compact range formula assumes level ground and no drag.", wrong: [20], equationId: "eq-range" },
    [{ speed: 20, angle: 45 }, { speed: 15, angle: 30 }, { speed: 25, angle: 40 }, { speed: 10, angle: 60 }, { speed: 18, angle: 35 }, { speed: 12, angle: 50 }],
    (g) => roundPhysics((g.speed ** 2 * Math.sin((2 * g.angle * Math.PI) / 180)) / 9.80665),
  ));

  specs.push(...variantsFrom(
    { id: "problem-capacitor-energy", conceptId: "capacitance-energy", topicId: "circuits", difficulty: "medium", prompt: "How much energy is stored in a {capacitance} F capacitor at {voltage} V?", given: { capacitance: 0.002, voltage: 10 }, unit: "J", unknown: "energy", answer: 0, hints: ["U = ½CV²"], steps: [], explanation: "Energy lives in the electric field between the plates.", wrong: [0.02], equationId: "eq-capacitor-energy" },
    [{ capacitance: 0.002, voltage: 10 }, { capacitance: 0.001, voltage: 12 }, { capacitance: 5e-4, voltage: 20 }, { capacitance: 0.01, voltage: 5 }, { capacitance: 0.004, voltage: 8 }, { capacitance: 0.003, voltage: 15 }],
    (g) => roundPhysics(0.5 * g.capacitance * g.voltage ** 2),
  ));

  specs.push(...variantsFrom(
    { id: "problem-magnify", conceptId: "magnification", topicId: "optics", difficulty: "medium", prompt: "A thin lens forms an image at {di} m for an object at {do} m. What is the lateral magnification?", given: { do: 0.3, di: 0.6 }, unit: "1", unknown: "magnification", answer: 0, hints: ["m = −d_i/d_o"], steps: [], explanation: "The minus sign marks an inverted real image in the usual sign convention.", wrong: [2], equationId: "eq-magnification" },
    [{ do: 0.3, di: 0.6 }, { do: 0.2, di: 0.4 }, { do: 0.5, di: -0.25 }, { do: 0.4, di: 0.2 }, { do: 0.25, di: 0.75 }, { do: 0.15, di: 0.3 }],
    (g) => roundPhysics(-g.di / g.do),
  ));

  specs.push(...variantsFrom(
    { id: "problem-power-avg", conceptId: "power", topicId: "energy", difficulty: "easy", prompt: "A force does {work} J of work in {time} s. What is the average power?", given: { work: 120, time: 4 }, unit: "W", unknown: "power", answer: 0, hints: ["P = W/t"], steps: [], explanation: "Average power is work per time.", wrong: [480], equationId: "eq-power" },
    [{ work: 120, time: 4 }, { work: 80, time: 2 }, { work: 200, time: 5 }, { work: 45, time: 3 }, { work: 300, time: 10 }, { work: 18, time: 1.5 }],
    (g) => roundPhysics(g.work / g.time),
  ));

  specs.push(...variantsFrom(
    { id: "problem-flow", conceptId: "fluid-flow", topicId: "biophysics", difficulty: "easy", prompt: "Water flows at {speed} m/s through a pipe of area {area} m². What is the volume flow rate?", given: { area: 0.01, speed: 2 }, unit: "m³/s", unknown: "flow rate", answer: 0, hints: ["Q = Av"], steps: [], explanation: "Continuity keeps Av roughly constant for incompressible flow.", wrong: [2], equationId: "eq-flow" },
    [{ area: 0.01, speed: 2 }, { area: 0.02, speed: 1.5 }, { area: 0.005, speed: 4 }, { area: 0.03, speed: 0.8 }, { area: 0.008, speed: 2.5 }, { area: 0.012, speed: 3 }],
    (g) => roundPhysics(g.area * g.speed),
  ));

  return specs.map((spec) => createMockProblem({
    id: spec.id,
    conceptId: spec.conceptId,
    topicId: spec.topicId,
    difficulty: spec.difficulty,
    prompt: spec.prompt,
    givenValues: spec.given,
    unknown: spec.unknown,
    unit: spec.unit,
    hints: spec.hints,
    solutionSteps: spec.steps.length ? spec.steps : [`Compute using the governing relation.`, `${spec.answer} ${spec.unit}`],
    finalAnswer: spec.answer,
    tolerance: spec.unit === "J" && spec.answer < 1e-10 ? 0.05 : 0.02,
    explanation: spec.explanation,
    commonWrongAnswers: spec.wrong,
    estimatedTime: time(spec.difficulty),
    xpReward: xp(spec.difficulty),
    equationId: spec.equationId,
  }));
}
