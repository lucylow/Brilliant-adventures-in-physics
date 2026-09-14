import { createMockMission } from "../factories/mission";
import type { MockDifficulty, MockMission, MockMissionStep } from "../types";
import type { WorldId } from "@/lib/adventure";

type Seed = {
  id: string;
  worldId: WorldId;
  title: string;
  hook: string;
  story: string;
  objective: string;
  topic: string;
  conceptIds: string[];
  difficulty: MockDifficulty;
  estimatedMinutes: number;
  rewardXp: number;
  requiredLevel: number;
  rewardBadge?: string;
  steps: Array<Omit<MockMissionStep, "complete">>;
};

const SEEDS: Seed[] = [
  { id: "mission-falling-satellite", worldId: "orbit", title: "Catch a Falling Satellite", hook: "The predicted landing ellipse is only as good as the split into vₓ and vᵧ.", story: "A training satellite is on a ballistic return. Reconstruct its path before the next pass.", objective: "Predict range and flight time from launch speed and angle.", topic: "projectile-motion", conceptIds: ["kinematics", "projectile-motion"], difficulty: "medium", estimatedMinutes: 18, rewardXp: 40, requiredLevel: 1, rewardBadge: "gravity-explorer", steps: [{ id: "s1", title: "Study projectile independence", action: "lesson", referenceId: "lesson-projectile-motion" }, { id: "s2", title: "Solve a range problem", action: "practice", referenceId: "problem-projectile-range-1" }, { id: "s3", title: "Run Projectile Lab", action: "simulation", referenceId: "sim-projectile" }] },
  { id: "mission-stable-bridge", worldId: "mars", title: "Build a Stable Bridge", hook: "If net force and net torque are not both zero, the span will rotate or slide.", story: "A rover crossing needs a truss that stays put under its own weight.", objective: "Use equilibrium and torque on a simple span.", topic: "rotation", conceptIds: ["torque", "equilibrium"], difficulty: "hard", estimatedMinutes: 22, rewardXp: 55, requiredLevel: 7, rewardBadge: "newtons-apprentice", steps: [{ id: "s1", title: "Review torque", action: "lesson", referenceId: "lesson-torque" }, { id: "s2", title: "Balance a torque problem", action: "practice", referenceId: "problem-work-1" }, { id: "s3", title: "Open the torque lab", action: "simulation", referenceId: "sim-torque" }] },
  { id: "mission-hidden-wave", worldId: "ocean", title: "Decode the Hidden Wave", hook: "A repeating beacon is only a mystery until v = fλ is checked.", story: "A coastal sensor records a pulse train. Frequency and wavelength are both readable.", objective: "Verify wave speed from frequency and wavelength.", topic: "wave-motion", conceptIds: ["wave-motion", "wavelength"], difficulty: "easy", estimatedMinutes: 14, rewardXp: 30, requiredLevel: 1, rewardBadge: "wave-rider", steps: [{ id: "s1", title: "Read the wave lesson", action: "lesson", referenceId: "lesson-wave-motion" }, { id: "s2", title: "Compute v = fλ", action: "practice", referenceId: "problem-wave-1" }, { id: "s3", title: "Inspect interference", action: "simulation", referenceId: "sim-wave-interfere" }] },
  { id: "mission-escape-velocity", worldId: "orbit", title: "Escape Velocity", hook: "Leaving a gravity well is an energy problem, not a slogan.", story: "A probe must reach the speed that makes total mechanical energy non-negative.", objective: "Compute Newtonian escape speed and state the 1/r potential assumption.", topic: "gravitation", conceptIds: ["escape-velocity", "gravitation"], difficulty: "hard", estimatedMinutes: 20, rewardXp: 50, requiredLevel: 4, rewardBadge: "gravity-explorer", steps: [{ id: "s1", title: "Study escape speed", action: "lesson", referenceId: "lesson-escape-velocity" }, { id: "s2", title: "Run the orbit lab", action: "simulation", referenceId: "sim-orbit" }, { id: "s3", title: "Ask why mass cancels", action: "tutor", referenceId: "tutor-session-mass-cancels" }] },
  { id: "mission-circuit-rescue", worldId: "quantum", title: "The Circuit Rescue", hook: "The habitat lights fail until V = IR is treated as a measurement, not a guess.", story: "A lab loop is drawing the wrong current. Voltage and resistance are both labeled.", objective: "Predict current and power in a single-loop circuit.", topic: "circuits", conceptIds: ["ohms-law", "electric-power"], difficulty: "easy", estimatedMinutes: 12, rewardXp: 32, requiredLevel: 1, rewardBadge: "circuit-builder", steps: [{ id: "s1", title: "Review Ohm’s law", action: "lesson", referenceId: "lesson-ohms-law" }, { id: "s2", title: "Solve for current", action: "practice", referenceId: "problem-ohm-1" }, { id: "s3", title: "Build the circuit sim", action: "simulation", referenceId: "sim-circuit" }] },
  { id: "mission-light-lab", worldId: "ocean", title: "Light Through the Lab", hook: "The beam only makes sense after Snell’s law is applied at the boundary.", story: "An optics bench is misaligned. Air-to-glass angles are written on the page.", objective: "Predict the refracted angle and check the normal.", topic: "optics", conceptIds: ["snells-law", "optics"], difficulty: "medium", estimatedMinutes: 16, rewardXp: 36, requiredLevel: 4, rewardBadge: "optics-explorer", steps: [{ id: "s1", title: "Study refraction", action: "lesson", referenceId: "lesson-snells-law" }, { id: "s2", title: "Compute a refracted angle", action: "practice", referenceId: "problem-refract-1" }, { id: "s3", title: "Run ray optics", action: "simulation", referenceId: "sim-optics" }] },
  { id: "mission-quantum-mystery", worldId: "quantum", title: "The Quantum Mystery", hook: "Intensity cannot replace threshold frequency in the photoelectric effect.", story: "A metal surface refuses to emit until the color of the lamp changes.", objective: "Use K_max = hf − φ and name the work function as a material property.", topic: "modern-physics", conceptIds: ["photoelectric-effect", "photons"], difficulty: "hard", estimatedMinutes: 24, rewardXp: 60, requiredLevel: 8, rewardBadge: "quantum-curious", steps: [{ id: "s1", title: "Photoelectric lesson", action: "lesson", referenceId: "lesson-photoelectric-effect" }, { id: "s2", title: "Photon energy check", action: "practice", referenceId: "problem-photon-1" }, { id: "s3", title: "Photoelectric bench", action: "simulation", referenceId: "sim-photoelectric" }] },
  { id: "mission-energy-ledger", worldId: "mars", title: "The Energy Ledger", hook: "The rover battery report does not balance until every joule has a unit.", story: "Kinetic and gravitational terms must be written before any cancellation.", objective: "Solve an energy problem with units visible.", topic: "energy", conceptIds: ["energy", "kinetic-energy"], difficulty: "medium", estimatedMinutes: 15, rewardXp: 34, requiredLevel: 1, steps: [{ id: "s1", title: "Energy lesson", action: "lesson", referenceId: "lesson-energy" }, { id: "s2", title: "Compute K", action: "practice", referenceId: "problem-kinetic-1" }, { id: "s3", title: "Save a notebook note", action: "experiment", referenceId: "experiment-energy-1" }] },
  { id: "mission-first-trajectory", worldId: "orbit", title: "The First Trajectory", hook: "A training probe needs a predictable path before launch.", story: "Mission control wants one verified projectile prediction.", objective: "Complete a projectile lesson or practice question.", topic: "projectile-motion", conceptIds: ["projectile-motion"], difficulty: "easy", estimatedMinutes: 10, rewardXp: 20, requiredLevel: 1, steps: [{ id: "s1", title: "Read the path", action: "lesson", referenceId: "lesson-projectile-motion" }, { id: "s2", title: "Check one range", action: "practice", referenceId: "problem-projectile-range-1" }] },
  { id: "mission-wave-beacon", worldId: "ocean", title: "The Wave Beacon", hook: "A distant beacon repeats across the water.", story: "Speed, frequency, and wavelength must agree.", objective: "Verify v = fλ.", topic: "wave-motion", conceptIds: ["wave-motion"], difficulty: "easy", estimatedMinutes: 10, rewardXp: 30, requiredLevel: 1, steps: [{ id: "s1", title: "Wave lesson", action: "lesson", referenceId: "lesson-wave-motion" }, { id: "s2", title: "Practice speed", action: "practice", referenceId: "problem-wave-1" }] },
];

const MORE: Array<[string, WorldId, string, string, string, MockDifficulty, number]> = [
  ["mission-friction-crate", "mars", "The Stubborn Crate", "forces", "friction", "medium", 3],
  ["mission-momentum-dock", "orbit", "Docking Impulse", "momentum", "impulse", "medium", 4],
  ["mission-shm-clock", "timelab", "The Quiet Clock", "oscillations", "simple-harmonic-motion", "medium", 5],
  ["mission-lens-focus", "ocean", "Bring the Image In", "optics", "thin-lenses", "medium", 6],
  ["mission-gas-tank", "mars", "Pressure in the Tank", "thermodynamics", "ideal-gas-law", "medium", 4],
  ["mission-relativity-clock", "timelab", "The Fast Clock", "relativity", "time-dilation", "hard", 12],
  ["mission-nuclear-ledger", "quantum", "Mass Defect Audit", "nuclear-physics", "nuclear-binding", "hard", 10],
  ["mission-buoyant-rover", "ocean", "Will It Float?", "biophysics", "buoyancy", "easy", 3],
  ["mission-field-map", "quantum", "Map the Field", "electricity", "electric-field", "medium", 5],
  ["mission-faraday-loop", "quantum", "The Changing Flux", "electromagnetism", "faradays-law", "hard", 8],
  ["mission-standing-string", "ocean", "Nodes on the Wire", "waves", "standing-waves", "medium", 4],
  ["mission-carnot-limit", "timelab", "The Engine Ceiling", "thermodynamics", "heat-engines", "hard", 9],
  ["mission-debroglie-speck", "quantum", "A Wavelength Too Small", "quantum-physics", "de-broglie-wavelength", "hard", 11],
  ["mission-hubble-stick", "orbit", "The Stretching Map", "cosmology", "hubble-expansion", "hard", 15],
  ["mission-rc-delay", "quantum", "Wait for the Charge", "circuits", "rc-circuits", "hard", 7],
  ["mission-atwood-lift", "mars", "Two Masses, One String", "dynamics", "atwood", "medium", 5],
  ["mission-incline-arrows", "mars", "Arrows on the Ramp", "forces", "inclined-plane", "easy", 2],
  ["mission-photon-color", "quantum", "Color Is Energy", "modern-physics", "photons", "medium", 6],
  ["mission-decay-count", "quantum", "Half the Sample", "nuclear-physics", "radioactive-decay", "medium", 8],
  ["mission-diffusion-span", "ocean", "How Far in Time √t", "biophysics", "diffusion", "medium", 6],
  ["mission-transformer", "quantum", "Turns and Volts", "electromagnetism", "transformers", "medium", 7],
  ["mission-double-slit", "ocean", "Bright Lines From Path", "optics", "youngs-double-slit", "hard", 8],
  ["mission-cyclotron", "quantum", "Circles in B", "magnetism", "cyclotron", "hard", 9],
  ["mission-blackbody", "orbit", "The Peak Wavelength", "modern-physics", "blackbody", "hard", 10],
];

function moreToSeed(row: [string, WorldId, string, string, string, MockDifficulty, number]): Seed {
  const [id, worldId, title, topic, conceptId, difficulty, requiredLevel] = row;
  return {
    id,
    worldId,
    title,
    hook: `${title}: the next measurement only lands if the model is named first.`,
    story: `A short scientific quest built around ${conceptId.replace(/-/g, " ")}. Each step is a real lesson, problem, or simulation.`,
    objective: `Complete the ${conceptId.replace(/-/g, " ")} loop.`,
    topic,
    conceptIds: [conceptId],
    difficulty,
    estimatedMinutes: 12 + requiredLevel,
    rewardXp: 24 + requiredLevel * 2,
    requiredLevel,
    steps: [
      { id: `${id}-lesson`, title: "Study the idea", action: "lesson", referenceId: `lesson-${conceptId}` },
      { id: `${id}-practice`, title: "Check a number", action: "practice", referenceId: `problem-${conceptId}-1` },
      { id: `${id}-sim`, title: "See it move", action: "simulation", referenceId: `sim-${conceptId}` },
    ],
  };
}

export function createMissionCatalog(completedIds: ReadonlySet<string> = new Set()): MockMission[] {
  const all = [...SEEDS, ...MORE.map(moreToSeed)];
  return all.map((seed) => {
    const steps = seed.steps.map((step) => ({ ...step, complete: completedIds.has(step.referenceId) || completedIds.has(seed.id) }));
    const completeCount = steps.filter((step) => step.complete).length;
    return createMockMission({
      id: seed.id,
      missionId: seed.id,
      worldId: seed.worldId,
      title: seed.title,
      hook: seed.hook,
      story: seed.story,
      objective: seed.objective,
      topic: seed.topic,
      goal: steps.length,
      rewardXp: seed.rewardXp,
      requiredLevel: seed.requiredLevel,
      conceptIds: seed.conceptIds,
      steps,
      requiredActions: steps.map((step) => step.action),
      rewardBadge: seed.rewardBadge,
      difficulty: seed.difficulty,
      estimatedMinutes: seed.estimatedMinutes,
      completionPercent: steps.length ? completeCount / steps.length : 0,
    });
  });
}
