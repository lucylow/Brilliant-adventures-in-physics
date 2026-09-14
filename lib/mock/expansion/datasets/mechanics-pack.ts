import {
  centripetalAcceleration,
  elasticPotentialEnergy,
  gravitationalPotentialEnergy,
  impulse,
  kineticEnergy,
  momentum,
  projectile,
  workFromForce,
} from "@/lib/physics";
import { createMockProblem } from "../../factories/problem";
import { roundPhysics } from "../../utils/physics-values";
import { gammaFromBeta } from "../physics";
import type { MockProblem } from "../../types";

type Spec = {
  id: string;
  conceptId: string;
  topicId: string;
  difficulty: MockProblem["difficulty"];
  prompt: string;
  given: Record<string, number>;
  unknown: string;
  unit: string;
  answer: number;
  explanation: string;
};

function problem(spec: Spec): MockProblem {
  return createMockProblem({
    id: spec.id,
    conceptId: spec.conceptId,
    topicId: spec.topicId,
    difficulty: spec.difficulty,
    prompt: spec.prompt,
    givenValues: spec.given,
    unknown: spec.unknown,
    unit: spec.unit,
    finalAnswer: spec.answer,
    explanation: spec.explanation,
    hints: [
      `Identify ${spec.unknown} and its SI unit (${spec.unit}).`,
      "Write the governing relation before substituting.",
      "Check that dependent values were calculated, not guessed.",
    ],
  });
}

function kinematicsPack(): Spec[] {
  const specs: Spec[] = [];
  const starts = [0, 2, 4, 6, 8];
  const accels = [0.5, 1, 1.5, 2, 2.5];
  const times = [2, 3, 4, 5];
  let n = 0;
  for (const v0 of starts) {
    for (const a of accels.slice(0, 2)) {
      const t = times[n % times.length];
      n += 1;
      const v = roundPhysics(v0 + a * t);
      const x = roundPhysics(v0 * t + 0.5 * a * t * t);
      specs.push({
        id: `problem-exp2-1d-${n}`,
        conceptId: "kinematics",
        topicId: "kinematics",
        difficulty: a >= 2 ? "medium" : "easy",
        prompt: `1D motion: v₀ = ${v0} m/s, a = ${a} m/s², t = ${t} s. Find the final speed.`,
        given: { v0, a, t },
        unknown: "final speed",
        unit: "m/s",
        answer: v,
        explanation: `v = v₀ + at = ${v0} + ${a}×${t} = ${v} m/s (constant a).`,
      });
      specs.push({
        id: `problem-exp2-x-${n}`,
        conceptId: "kinematics",
        topicId: "kinematics",
        difficulty: "medium",
        prompt: `Same cart: find displacement from rest origin if x₀ = 0.`,
        given: { v0, a, t },
        unknown: "displacement",
        unit: "m",
        answer: x,
        explanation: `x = v₀t + ½at² = ${x} m.`,
      });
    }
  }
  const heights = [5, 8, 12, 20];
  heights.forEach((h, index) => {
    const t = roundPhysics(Math.sqrt((2 * h) / 9.8), 3);
    specs.push({
      id: `problem-exp2-fall-${index + 1}`,
      conceptId: "free-fall",
      topicId: "kinematics",
      difficulty: "easy",
      prompt: `Dropped from rest, h = ${h} m. Find fall time if air resistance is neglected and g = 9.8 m/s².`,
      given: { h, g: 9.8 },
      unknown: "time",
      unit: "s",
      answer: t,
      explanation: `h = ½gt² ⇒ t = √(2h/g) = ${t} s.`,
    });
  });
  return specs;
}

function projectilePack(): Spec[] {
  return [20, 30, 40, 45, 50, 60].map((angle, index) => {
    const speed = 12 + index * 2;
    const result = projectile({ speed, angleDeg: angle, height: 0 });
    return {
      id: `problem-exp2-proj-${index + 1}`,
      conceptId: "projectile-motion",
      topicId: "projectile-motion",
      difficulty: angle === 45 ? "easy" : "medium",
      prompt: `A ball is launched at ${speed} m/s at ${angle}° from level ground. Find the range. Air resistance neglected.`,
      given: { speed, angle },
      unknown: "range",
      unit: "m",
      answer: roundPhysics(result.range),
      explanation: "Horizontal and vertical motion stay independent; range uses t from vy = 0 at landing.",
    };
  });
}

function forcePack(): Spec[] {
  const specs: Spec[] = [];
  [0.2, 0.3, 0.4].forEach((mu, index) => {
    const n = 20 + index * 10;
    specs.push({
      id: `problem-exp2-fk-${index + 1}`,
      conceptId: "friction",
      topicId: "forces",
      difficulty: "easy",
      prompt: `Kinetic friction: μ_k = ${mu}, N = ${n} N. Find f_k if sliding at constant speed on the level.`,
      given: { mu, N: n },
      unknown: "kinetic friction",
      unit: "N",
      answer: roundPhysics(mu * n),
      explanation: "f_k = μ_k N for kinetic friction once slipping.",
    });
  });
  [15, 30, 45].forEach((deg, index) => {
    const m = 2;
    const g = 9.8;
    const parallel = roundPhysics(m * g * Math.sin((deg * Math.PI) / 180));
    specs.push({
      id: `problem-exp2-incline-${index + 1}`,
      conceptId: "inclined-plane",
      topicId: "forces",
      difficulty: "medium",
      prompt: `A ${m} kg block rests on a ${deg}° frictionless incline. Find the component of weight down the slope.`,
      given: { m, g, deg },
      unknown: "parallel weight",
      unit: "N",
      answer: parallel,
      explanation: "F_∥ = mg sinθ along the surface.",
    });
  });
  specs.push({
    id: "problem-exp2-atwood-2",
    conceptId: "atwood",
    topicId: "dynamics",
    difficulty: "hard",
    prompt: "Ideal Atwood: 2.4 kg and 1.6 kg. Find a.",
    given: { m1: 2.4, m2: 1.6, g: 9.8 },
    unknown: "acceleration",
    unit: "m/s²",
    answer: roundPhysics((0.8 * 9.8) / 4),
    explanation: "a = (m1−m2)g/(m1+m2).",
  });
  return specs;
}

function energyPack(): Spec[] {
  const specs: Spec[] = [];
  [1, 2, 4].forEach((m, index) => {
    const v = 3 + index;
    specs.push({
      id: `problem-exp2-k-${index + 1}`,
      conceptId: "kinetic-energy",
      topicId: "energy",
      difficulty: "easy",
      prompt: `Find K for m = ${m} kg at ${v} m/s.`,
      given: { m, v },
      unknown: "kinetic energy",
      unit: "J",
      answer: roundPhysics(kineticEnergy(m, v)),
      explanation: "K = ½mv².",
    });
    const h = 2 + index;
    specs.push({
      id: `problem-exp2-u-${index + 1}`,
      conceptId: "gravitational-energy",
      topicId: "energy",
      difficulty: "easy",
      prompt: `Near Earth, m = ${m} kg, h = ${h} m. Find U_g using g = 9.8 m/s².`,
      given: { m, h, g: 9.8 },
      unknown: "gravitational energy",
      unit: "J",
        answer: roundPhysics(gravitationalPotentialEnergy(m, h, 9.8)),
      explanation: "U = mgh near Earth’s surface.",
    });
  });
  specs.push({
    id: "problem-exp2-spring-u",
    conceptId: "elasticity",
    topicId: "energy",
    difficulty: "medium",
    prompt: "A spring with k = 200 N/m is compressed 0.05 m. Find U_s.",
    given: { k: 200, x: 0.05 },
    unknown: "elastic energy",
    unit: "J",
    answer: roundPhysics(elasticPotentialEnergy(200, 0.05)),
    explanation: "U = ½kx² for an ideal spring.",
  });
  specs.push({
    id: "problem-exp2-work",
    conceptId: "work",
    topicId: "energy",
    difficulty: "easy",
    prompt: "A 12 N force pushes 3 m along the displacement. Find W.",
    given: { F: 12, d: 3 },
    unknown: "work",
    unit: "J",
    answer: roundPhysics(workFromForce(12, 3, 0)),
    explanation: "W = Fd when force and displacement are parallel.",
  });
  specs.push({
    id: "problem-exp2-power",
    conceptId: "work",
    topicId: "energy",
    difficulty: "medium",
    prompt: "A 400 N lift rises 2.5 m in 5 s at constant speed. Find average power.",
    given: { F: 400, d: 2.5, t: 5 },
    unknown: "power",
    unit: "W",
    answer: roundPhysics((400 * 2.5) / 5),
    explanation: "P = W/t = Fd/t for constant speed lifting.",
  });
  return specs;
}

function momentumPack(): Spec[] {
  const specs: Spec[] = [];
  [0.5, 1, 2].forEach((m, index) => {
    const v = 4 + index;
    specs.push({
      id: `problem-exp2-p-${index + 1}`,
      conceptId: "momentum",
      topicId: "momentum",
      difficulty: "easy",
      prompt: `Find p for m = ${m} kg at ${v} m/s.`,
      given: { m, v },
      unknown: "momentum",
      unit: "kg·m/s",
      answer: roundPhysics(momentum(m, v)),
      explanation: "p = mv.",
    });
  });
  specs.push({
    id: "problem-exp2-impulse",
    conceptId: "impulse",
    topicId: "momentum",
    difficulty: "medium",
    prompt: "A 25 N average force acts for 0.08 s. Find impulse magnitude.",
    given: { F: 25, dt: 0.08 },
    unknown: "impulse",
    unit: "N·s",
    answer: roundPhysics(impulse(25, 0.08)),
    explanation: "J = FΔt = Δp.",
  });
  specs.push({
    id: "problem-exp2-inelastic",
    conceptId: "inelastic-collisions",
    topicId: "momentum",
    difficulty: "medium",
    prompt: "0.4 kg at 3 m/s sticks to 0.6 kg at rest. Find shared speed.",
    given: { m1: 0.4, v1: 3, m2: 0.6, v2: 0 },
    unknown: "final speed",
    unit: "m/s",
    answer: roundPhysics((0.4 * 3) / 1),
    explanation: "m1v1 = (m1+m2)v for a 1D perfectly inelastic catch.",
  });
  specs.push({
    id: "problem-exp2-elastic",
    conceptId: "elastic-collisions",
    topicId: "momentum",
    difficulty: "hard",
    prompt: "Equal-mass 1D elastic: 2 kg at 5 m/s hits 2 kg at rest. Find the target’s speed.",
    given: { m: 2, v: 5 },
    unknown: "target speed",
    unit: "m/s",
    answer: 5,
    explanation: "Equal-mass 1D elastic exchange of velocities.",
  });
  return specs;
}

function rotationPack(): Spec[] {
  const specs: Spec[] = [];
  specs.push({
    id: "problem-exp2-ac",
    conceptId: "centripetal-acceleration",
    topicId: "rotation",
    difficulty: "medium",
    prompt: "Uniform circular motion: v = 8 m/s, r = 2 m. Find a_c.",
    given: { v: 8, r: 2 },
    unknown: "centripetal acceleration",
    unit: "m/s²",
    answer: roundPhysics(centripetalAcceleration(8, 2)),
    explanation: "a_c = v²/r toward the center.",
  });
  specs.push({
    id: "problem-exp2-torque",
    conceptId: "torque",
    topicId: "rotation",
    difficulty: "easy",
    prompt: "A 12 N force is perpendicular at 0.25 m from the axis. Find τ.",
    given: { r: 0.25, F: 12 },
    unknown: "torque",
    unit: "N·m",
    answer: roundPhysics(0.25 * 12),
    explanation: "τ = rF sinθ with θ = 90°.",
  });
  specs.push({
    id: "problem-exp2-roll-k",
    conceptId: "rolling",
    topicId: "rotation",
    difficulty: "hard",
    prompt: "A solid cylinder (I = ½MR²) rolls without slip at 3 m/s, M = 4 kg. Find total K.",
    given: { M: 4, v: 3 },
    unknown: "kinetic energy",
    unit: "J",
    answer: roundPhysics(0.5 * 4 * 9 + 0.5 * (0.5 * 4) * (3 * 3)),
    explanation: "K = ½Mv² + ½Iω² with ω = v/R, I = ½MR² ⇒ K = ¾Mv².",
  });
  specs.push({
    id: "problem-exp2-l",
    conceptId: "angular-momentum",
    topicId: "rotation",
    difficulty: "medium",
    prompt: "A disk with I = 0.08 kg·m² spins at 12 rad/s. Find L.",
    given: { I: 0.08, omega: 12 },
    unknown: "angular momentum",
    unit: "kg·m²/s",
    answer: roundPhysics(0.08 * 12),
    explanation: "L = Iω about the principal axis.",
  });
  return specs;
}

function literacyDrills(): Spec[] {
  return [
    {
      id: "problem-exp2-sci-not",
      conceptId: "kinematics",
      topicId: "kinematics",
      difficulty: "easy",
      prompt: "Write 3.2 × 10³ as an ordinary number (scientific-notation drill).",
      given: { mantissa: 3.2, exponent: 3 },
      unknown: "value",
      unit: "1",
      answer: 3200,
      explanation: "3.2 × 10³ = 3200.",
    },
    {
      id: "problem-exp2-sigfig-add",
      conceptId: "kinematics",
      topicId: "kinematics",
      difficulty: "medium",
      prompt: "Add 12.11 m + 0.3 m and report with correct decimal-place precision (educational rounding).",
      given: { a: 12.11, b: 0.3 },
      unknown: "sum",
      unit: "m",
      answer: 12.4,
      explanation: "Addition tracks decimal places: 0.3 has one decimal place.",
    },
    {
      id: "problem-exp2-dim",
      conceptId: "newtons-laws",
      topicId: "dynamics",
      difficulty: "medium",
      prompt: "Is F = mv dimensionally consistent? Answer 1 if yes, 0 if no.",
      given: { dummy: 0 },
      unknown: "consistency",
      unit: "1",
      answer: 0,
      explanation: "mv is momentum, not force. Force is kg·m/s².",
    },
    {
      id: "problem-exp2-gamma-ok",
      conceptId: "time-dilation",
      topicId: "relativity",
      difficulty: "hard",
      prompt: "Find γ at 0.8c. Do not use v ≥ c.",
      given: { beta: 0.8 },
      unknown: "gamma",
      unit: "1",
      answer: gammaFromBeta(0.8),
      explanation: "γ = 1/√(1−0.64) = 1/0.6.",
    },
  ];
}

export function createMechanicsProblems(): MockProblem[] {
  const specs = [
    ...kinematicsPack(),
    ...projectilePack(),
    ...forcePack(),
    ...energyPack(),
    ...momentumPack(),
    ...rotationPack(),
    ...literacyDrills(),
  ];
  return specs.map(problem);
}

export function mechanicsExampleCount(): number {
  return createMechanicsProblems().length;
}
