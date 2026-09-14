import { ohmsLaw, PHYSICS, projectile, wave } from "@/lib/physics";
import { isoDaysAgo } from "../clock";
import { createMockSimulation } from "../factories/simulation";
import { circuitCurrent, circuitPower, pendulumPeriod, roundPhysics } from "../utils/physics-values";
import type { MockDifficulty, MockSimulation, MockSimulationSnapshot } from "../types";

type SimulationSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: MockDifficulty;
  motif: string;
  accent: string;
  duration: number;
  topicId: string;
  conceptIds: string[];
  equations: string[];
  goals: string[];
  observables: string[];
  parameters: MockSimulation["parameters"];
  featured?: boolean;
  tags: string[];
};

const DEFAULT_PARAMS = {
  speed: { key: "speed", label: "Speed", unit: "m/s", min: 1, max: 40, step: 1, defaultValue: 18 },
  angle: { key: "angleDeg", label: "Angle", unit: "°", min: 5, max: 85, step: 1, defaultValue: 42 },
  mass: { key: "mass", label: "Mass", unit: "kg", min: 0.1, max: 8, step: 0.1, defaultValue: 1 },
  length: { key: "length", label: "Length", unit: "m", min: 0.2, max: 3, step: 0.1, defaultValue: 1 },
  voltage: { key: "voltage", label: "Voltage", unit: "V", min: 1, max: 24, step: 1, defaultValue: 12 },
  resistance: { key: "resistance", label: "Resistance", unit: "Ω", min: 1, max: 40, step: 1, defaultValue: 4 },
  frequency: { key: "frequency", label: "Frequency", unit: "Hz", min: 1, max: 20, step: 0.5, defaultValue: 4 },
  wavelength: { key: "wavelength", label: "Wavelength", unit: "m", min: 0.1, max: 4, step: 0.1, defaultValue: 0.5 },
  k: { key: "k", label: "Spring constant", unit: "N/m", min: 10, max: 200, step: 5, defaultValue: 80 },
};

const CORE: SimulationSeed[] = [
  { id: "sim-projectile", title: "Projectile Motion", description: "Launch a body and inspect range, peak height, and flight time. Air resistance is neglected.", category: "Mechanics", difficulty: "easy", motif: "arc", accent: "#EA580C", duration: 8, topicId: "projectile-motion", conceptIds: ["kinematics", "projectile-motion"], equations: ["x = vₓ t", "y = y₀ + vᵧ t − ½gt²"], goals: ["Separate horizontal and vertical motion", "Predict range from speed and angle"], observables: ["range", "peakHeight", "flightTime"], parameters: [DEFAULT_PARAMS.speed, DEFAULT_PARAMS.angle], featured: true, tags: ["mechanics", "kinematics"] },
  { id: "sim-kinematics-track", title: "Kinematics Track", description: "Constant-acceleration motion along a straight track with origin and signs kept visible.", category: "Mechanics", difficulty: "easy", motif: "vector", accent: "#2563EB", duration: 7, topicId: "kinematics", conceptIds: ["kinematics", "velocity"], equations: ["v = v₀ + at"], goals: ["Read v from a constant-a model"], observables: ["velocity", "position"], parameters: [{ key: "v0", label: "Initial speed", unit: "m/s", min: 0, max: 12, step: 0.5, defaultValue: 2 }, { key: "a", label: "Acceleration", unit: "m/s²", min: -4, max: 4, step: 0.5, defaultValue: 1.5 }], tags: ["mechanics"] },
  { id: "sim-orbit", title: "Orbital Mechanics", description: "Compare circular-orbit speed with Kepler’s period relation in a Newtonian 1/r potential.", category: "Astronomy", difficulty: "medium", motif: "orbit", accent: "#1D4ED8", duration: 12, topicId: "gravitation", conceptIds: ["gravitation", "orbits"], equations: ["v = √(GM/r)", "T² ∝ a³"], goals: ["Treat orbit as continuous free fall"], observables: ["orbitalSpeed", "period"], parameters: [{ key: "radius", label: "Orbit radius", unit: "Earth radii", min: 1.1, max: 8, step: 0.1, defaultValue: 1.06 }], featured: true, tags: ["astronomy", "gravity"] },
  { id: "sim-waves", title: "Wave Interference", description: "Superpose two waves and watch constructive and destructive regions.", category: "Waves", difficulty: "medium", motif: "wave", accent: "#2563EB", duration: 10, topicId: "waves", conceptIds: ["wave-motion", "interference"], equations: ["v = fλ"], goals: ["Connect path difference to bright and dark lines"], observables: ["speed", "period"], parameters: [DEFAULT_PARAMS.frequency, DEFAULT_PARAMS.wavelength], featured: true, tags: ["waves"] },
  { id: "sim-wave-interfere", title: "Two-Source Interference", description: "A second view of superposition with a fixed source spacing.", category: "Waves", difficulty: "medium", motif: "wave", accent: "#1D4ED8", duration: 10, topicId: "waves", conceptIds: ["interference", "wave-motion"], equations: ["δ = d sinθ"], goals: ["Name the condition for a bright fringe"], observables: ["pathDifference"], parameters: [{ key: "spacing", label: "Source spacing", unit: "m", min: 0.1, max: 2, step: 0.05, defaultValue: 0.4 }, DEFAULT_PARAMS.wavelength], tags: ["waves", "optics"] },
  { id: "sim-fields", title: "Electric Fields", description: "Place charges and read field direction from a verified Coulomb model.", category: "Electricity", difficulty: "medium", motif: "field", accent: "#D97706", duration: 10, topicId: "electricity", conceptIds: ["field", "coulomb-law"], equations: ["F = kq₁q₂/r²"], goals: ["Field is force per unit charge"], observables: ["field", "force"], parameters: [{ key: "charge", label: "Source charge", unit: "µC", min: 1, max: 20, step: 1, defaultValue: 5 }, { key: "distance", label: "Distance", unit: "m", min: 0.1, max: 2, step: 0.1, defaultValue: 0.5 }], tags: ["electricity"] },
  { id: "sim-shm", title: "Simple Harmonic Motion", description: "Track displacement, velocity, and energy of a mass on a spring.", category: "Mechanics", difficulty: "easy", motif: "wave", accent: "#15803D", duration: 8, topicId: "oscillations", conceptIds: ["oscillation", "simple-harmonic-motion"], equations: ["T = 2π√(m/k)"], goals: ["Energy swaps between kinetic and spring potential"], observables: ["period", "energy"], parameters: [DEFAULT_PARAMS.mass, DEFAULT_PARAMS.k], featured: true, tags: ["oscillations"] },
  { id: "sim-tunnel", title: "Quantum Tunneling", description: "Inspect an educational transmission factor across a finite barrier. This is a teaching model, not a full scattering solution.", category: "Quantum", difficulty: "hard", motif: "particle", accent: "#7C3AED", duration: 14, topicId: "quantum-physics", conceptIds: ["quantum-states", "uncertainty-principle"], equations: ["T ≈ e^{−2κL}"], goals: ["Transmission falls rapidly with barrier width"], observables: ["transmission"], parameters: [{ key: "widthNm", label: "Barrier width", unit: "nm", min: 0.1, max: 1.2, step: 0.05, defaultValue: 0.4 }, { key: "heightEv", label: "Barrier height", unit: "eV", min: 1, max: 10, step: 0.5, defaultValue: 4 }], tags: ["quantum"] },
  { id: "sim-lens", title: "Lens & Optics", description: "Apply Snell’s law and a thin-lens relation to a ray sketch.", category: "Optics", difficulty: "medium", motif: "vector", accent: "#E11D48", duration: 9, topicId: "optics", conceptIds: ["optics", "snells-law"], equations: ["n₁ sin θ₁ = n₂ sin θ₂"], goals: ["Measure angles from the normal"], observables: ["refractedAngle"], parameters: [{ key: "incident", label: "Incident angle", unit: "°", min: 5, max: 70, step: 1, defaultValue: 30 }], featured: true, tags: ["optics"] },
  { id: "sim-optics", title: "Ray Optics Bench", description: "A labeled air-to-glass boundary with a single incident ray.", category: "Optics", difficulty: "medium", motif: "vector", accent: "#BE185D", duration: 9, topicId: "optics", conceptIds: ["snells-law", "optics"], equations: ["n₁sinθ₁ = n₂sinθ₂"], goals: ["Predict the refracted angle"], observables: ["refractedAngle"], parameters: [{ key: "incident", label: "Incident angle", unit: "°", min: 5, max: 70, step: 1, defaultValue: 30 }], tags: ["optics"] },
  { id: "sim-rc", title: "RC Circuits", description: "Charge a capacitor and compare the exponential model to live values.", category: "Electricity", difficulty: "hard", motif: "grid", accent: "#059669", duration: 11, topicId: "circuits", conceptIds: ["rc-circuits", "capacitance"], equations: ["V(t) = V(1 − e^{−t/RC})"], goals: ["Name the time constant RC"], observables: ["timeConstant", "current"], parameters: [DEFAULT_PARAMS.voltage, DEFAULT_PARAMS.resistance, { key: "capacitance", label: "Capacitance", unit: "F", min: 0.001, max: 0.02, step: 0.001, defaultValue: 0.005 }], tags: ["circuits"] },
  { id: "sim-circuit", title: "Ohm Circuit Loop", description: "A single-loop circuit whose current is V/R for an ohmic resistor.", category: "Electricity", difficulty: "easy", motif: "grid", accent: "#CA8A04", duration: 8, topicId: "circuits", conceptIds: ["ohms-law", "electric-power"], equations: ["V = IR", "P = IV"], goals: ["Predict current and power from labeled V and R"], observables: ["current", "power"], parameters: [DEFAULT_PARAMS.voltage, DEFAULT_PARAMS.resistance], featured: true, tags: ["circuits"] },
  { id: "sim-pendulum", title: "Pendulum Lab", description: "Small-angle period 2π√(L/g). Mass cancels; large amplitude is out of scope.", category: "Mechanics", difficulty: "easy", motif: "arc", accent: "#0F766E", duration: 8, topicId: "oscillations", conceptIds: ["pendulum", "simple-harmonic-motion"], equations: ["T = 2π√(L/g)"], goals: ["See that mass does not enter the small-angle period"], observables: ["period"], parameters: [DEFAULT_PARAMS.length], tags: ["oscillations"] },
  { id: "sim-collision", title: "1D Elastic Collision", description: "Two carts exchange momentum; kinetic energy is conserved in this ideal model.", category: "Mechanics", difficulty: "medium", motif: "vector", accent: "#0369A1", duration: 9, topicId: "momentum", conceptIds: ["momentum", "elastic-collisions"], equations: ["pᵢ = p_f"], goals: ["Check both momentum and kinetic energy"], observables: ["v1Final", "v2Final"], parameters: [{ key: "m1", label: "Mass 1", unit: "kg", min: 0.5, max: 5, step: 0.5, defaultValue: 1 }, { key: "v1", label: "Velocity 1", unit: "m/s", min: 0, max: 8, step: 0.5, defaultValue: 3 }], tags: ["momentum"] },
  { id: "sim-spring", title: "Spring–Mass Energy", description: "Store ½kx² and watch it become kinetic energy at equilibrium.", category: "Mechanics", difficulty: "easy", motif: "wave", accent: "#15803D", duration: 8, topicId: "energy", conceptIds: ["elasticity", "hookes-law"], equations: ["U = ½kx²"], goals: ["Energy is stored in the deformation"], observables: ["energy", "force"], parameters: [DEFAULT_PARAMS.k, { key: "x", label: "Displacement", unit: "m", min: 0.05, max: 0.4, step: 0.05, defaultValue: 0.12 }], tags: ["energy"] },
  { id: "sim-torque", title: "Torque Balance", description: "A rigid bar stays put only if net force and net torque are both zero.", category: "Mechanics", difficulty: "hard", motif: "grid", accent: "#1E3A8A", duration: 10, topicId: "rotation", conceptIds: ["torque", "equilibrium"], equations: ["τ = rF sinθ"], goals: ["Choose a pivot and sum signed torques"], observables: ["netTorque"], parameters: [{ key: "force", label: "Force", unit: "N", min: 1, max: 20, step: 1, defaultValue: 8 }, { key: "lever", label: "Lever arm", unit: "m", min: 0.1, max: 2, step: 0.1, defaultValue: 0.5 }], tags: ["rotation"] },
  { id: "sim-sound", title: "Sound Speed", description: "A traveling pressure wave with v = fλ. The medium is air at a stated temperature.", category: "Waves", difficulty: "easy", motif: "wave", accent: "#6D28D9", duration: 7, topicId: "sound", conceptIds: ["sound", "wavelength"], equations: ["v = fλ"], goals: ["Pitch is frequency, not amplitude"], observables: ["speed"], parameters: [DEFAULT_PARAMS.frequency, DEFAULT_PARAMS.wavelength], tags: ["sound"] },
  { id: "sim-gas", title: "Ideal Gas Particles", description: "A teaching sketch of PV = nRT. Particles are points with elastic collisions.", category: "Mechanics", difficulty: "medium", motif: "particle", accent: "#EA580C", duration: 10, topicId: "thermodynamics", conceptIds: ["ideal-gas-law", "gas-laws"], equations: ["PV = nRT"], goals: ["Temperature is not the same as heat"], observables: ["pressure"], parameters: [{ key: "n", label: "Moles", unit: "mol", min: 0.5, max: 4, step: 0.5, defaultValue: 1 }, { key: "T", label: "Temperature", unit: "K", min: 250, max: 400, step: 10, defaultValue: 300 }], tags: ["thermal"] },
  { id: "sim-thermal", title: "Thermal Diffusion", description: "A 1D temperature profile relaxing toward equilibrium. This is a qualitative sketch.", category: "Mechanics", difficulty: "medium", motif: "grid", accent: "#C2410C", duration: 11, topicId: "thermodynamics", conceptIds: ["heat", "diffusion"], equations: ["Q = mcΔT"], goals: ["Heat is energy in transit"], observables: ["temperature"], parameters: [{ key: "dT", label: "ΔT", unit: "K", min: 1, max: 40, step: 1, defaultValue: 5 }], tags: ["thermal"] },
  { id: "sim-photoelectric", title: "Photoelectric Bench", description: "Electrons leave only above a threshold frequency. Intensity is photon count, not photon energy.", category: "Quantum", difficulty: "hard", motif: "particle", accent: "#7C3AED", duration: 12, topicId: "modern-physics", conceptIds: ["photoelectric-effect", "photons"], equations: ["K_max = hf − φ"], goals: ["Color sets energy; brightness sets rate"], observables: ["kMax"], parameters: [{ key: "frequencyTHz", label: "Frequency", unit: "THz", min: 400, max: 900, step: 10, defaultValue: 600 }, { key: "workEv", label: "Work function", unit: "eV", min: 1, max: 4, step: 0.1, defaultValue: 2.3 }], featured: true, tags: ["quantum", "modern"] },
  { id: "sim-atomic", title: "Atomic Transitions", description: "Photon energy equals the difference of two allowed levels in a hydrogen-like teaching model.", category: "Quantum", difficulty: "hard", motif: "orbit", accent: "#5B21B6", duration: 11, topicId: "atomic-physics", conceptIds: ["bohr-model", "hydrogen-spectrum"], equations: ["E_n = −13.6 eV / n²"], goals: ["Spectra are evidence, not decoration"], observables: ["photonEnergy"], parameters: [{ key: "n1", label: "Lower n", unit: "1", min: 1, max: 4, step: 1, defaultValue: 1 }, { key: "n2", label: "Upper n", unit: "1", min: 2, max: 5, step: 1, defaultValue: 2 }], tags: ["quantum"] },
  { id: "sim-probability", title: "Quantum Probability", description: "A stationary |ψ|² sketch. The curve is a probability density, not a trajectory.", category: "Quantum", difficulty: "challenge", motif: "wave", accent: "#6D28D9", duration: 12, topicId: "quantum-physics", conceptIds: ["quantum-states"], equations: ["P = |ψ|²"], goals: ["Amplitude is not a path"], observables: ["peakProbability"], parameters: [{ key: "n", label: "State index", unit: "1", min: 1, max: 4, step: 1, defaultValue: 1 }], tags: ["quantum"] },
  { id: "sim-relativity", title: "Time Dilation", description: "A moving clock runs slow by γ. The model requires v < c.", category: "Astronomy", difficulty: "hard", motif: "orbit", accent: "#4338CA", duration: 10, topicId: "relativity", conceptIds: ["special-relativity", "time-dilation"], equations: ["Δt = γ Δτ"], goals: ["Keep v strictly below c"], observables: ["gamma"], parameters: [{ key: "beta", label: "v/c", unit: "1", min: 0.1, max: 0.9, step: 0.05, defaultValue: 0.6 }], tags: ["relativity"] },
  { id: "sim-magnetic", title: "Magnetic Field Loop", description: "A current-carrying wire and the force on a moving charge.", category: "Electricity", difficulty: "hard", motif: "field", accent: "#854D0E", duration: 10, topicId: "magnetism", conceptIds: ["magnetic-field", "lorentz-force"], equations: ["F = qvB sinθ"], goals: ["Magnetic force changes direction, not speed"], observables: ["force"], parameters: [{ key: "current", label: "Current", unit: "A", min: 1, max: 10, step: 0.5, defaultValue: 3 }], tags: ["magnetism"] },
  { id: "sim-free-fall", title: "Free-Fall Timer", description: "Unsupported motion with g = 9.80665 m/s² and air neglected.", category: "Mechanics", difficulty: "easy", motif: "arc", accent: "#1D4ED8", duration: 6, topicId: "kinematics", conceptIds: ["free-fall", "acceleration"], equations: ["y = y₀ + v₀t − ½gt²"], goals: ["g is acceleration, not a force name"], observables: ["time", "impactSpeed"], parameters: [{ key: "height", label: "Height", unit: "m", min: 1, max: 40, step: 1, defaultValue: 12 }], tags: ["mechanics"] },
];

const EXTRA_CONCEPTS: Array<[string, string, string, string, MockDifficulty]> = [
  ["friction", "forces", "The Stubborn Crate Lab", "Mechanics", "medium"],
  ["impulse", "momentum", "Impulse Docking", "Mechanics", "medium"],
  ["simple-harmonic-motion", "oscillations", "Quiet Clock", "Mechanics", "medium"],
  ["thin-lenses", "optics", "Bring the Image In", "Optics", "medium"],
  ["ideal-gas-law", "thermodynamics", "Pressure in the Tank", "Mechanics", "medium"],
  ["time-dilation", "relativity", "The Fast Clock", "Astronomy", "hard"],
  ["nuclear-binding", "nuclear-physics", "Mass Defect Audit", "Quantum", "hard"],
  ["buoyancy", "biophysics", "Will It Float?", "Mechanics", "easy"],
  ["electric-field", "electricity", "Map the Field", "Electricity", "medium"],
  ["faradays-law", "electromagnetism", "The Changing Flux", "Electricity", "hard"],
  ["standing-waves", "waves", "Nodes on the Wire", "Waves", "medium"],
  ["heat-engines", "thermodynamics", "The Engine Ceiling", "Mechanics", "hard"],
  ["de-broglie-wavelength", "quantum-physics", "A Wavelength Too Small", "Quantum", "hard"],
  ["hubble-expansion", "cosmology", "The Stretching Map", "Astronomy", "hard"],
  ["rc-circuits", "circuits", "Wait for the Charge", "Electricity", "hard"],
  ["atwood", "dynamics", "Two Masses, One String", "Mechanics", "medium"],
  ["inclined-plane", "forces", "Arrows on the Ramp", "Mechanics", "easy"],
  ["photons", "modern-physics", "Color Is Energy", "Quantum", "medium"],
  ["radioactive-decay", "nuclear-physics", "Half the Sample", "Quantum", "medium"],
  ["diffusion", "biophysics", "How Far in Time √t", "Mechanics", "medium"],
  ["transformers", "electromagnetism", "Turns and Volts", "Electricity", "medium"],
  ["youngs-double-slit", "optics", "Bright Lines From Path", "Optics", "hard"],
  ["cyclotron", "magnetism", "Circles in B", "Electricity", "hard"],
  ["blackbody", "modern-physics", "The Peak Wavelength", "Astronomy", "hard"],
  ["escape-velocity", "gravitation", "Leaving the Well", "Astronomy", "hard"],
  ["work", "energy", "Force Along a Path", "Mechanics", "easy"],
  ["centripetal-acceleration", "rotation", "Turning Is Accelerating", "Mechanics", "medium"],
  ["doppler-effect", "sound", "Moving Source", "Waves", "hard"],
  ["wave-particle-duality", "quantum-physics", "Interference and Clicks", "Quantum", "hard"],
  ["mass-energy", "relativity", "Rest Energy Check", "Astronomy", "hard"],
];

function extraFrom(row: [string, string, string, string, MockDifficulty]): SimulationSeed {
  const [conceptId, topicId, title, category, difficulty] = row;
  return {
    id: `sim-${conceptId}`,
    title,
    description: `A focused lab for ${conceptId.replace(/-/g, " ")}. Change one control at a time and keep units visible.`,
    category,
    difficulty,
    motif: category === "Quantum" ? "particle" : category === "Waves" || category === "Optics" ? "wave" : category === "Astronomy" ? "orbit" : "vector",
    accent: "#2563EB",
    duration: 8 + (difficulty === "hard" || difficulty === "challenge" ? 4 : 0),
    topicId,
    conceptIds: [conceptId],
    equations: ["model as stated in the matching lesson"],
    goals: [`Connect the ${conceptId.replace(/-/g, " ")} lesson to a visible change`],
    observables: ["value"],
    parameters: [{ key: "control", label: "Control", unit: "1", min: 1, max: 10, step: 1, defaultValue: 3 }],
    tags: [category.toLowerCase(), conceptId],
  };
}

function toSimulation(seed: SimulationSeed): MockSimulation {
  return createMockSimulation({
    id: seed.id,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    difficulty: seed.difficulty,
    thumbnail: { motif: seed.motif, accent: seed.accent },
    parameters: seed.parameters,
    defaultParameters: Object.fromEntries(seed.parameters.map((parameter) => [parameter.key, parameter.defaultValue])),
    observableQuantities: seed.observables,
    equations: seed.equations,
    learningGoals: seed.goals,
    controls: [...seed.parameters.map((parameter) => parameter.key), "play", "reset"],
    duration: seed.duration,
    featured: seed.featured === true,
    tags: seed.tags,
    conceptIds: seed.conceptIds,
    topicId: seed.topicId,
  });
}

export function createSimulationCatalog(): MockSimulation[] {
  const all = [...CORE, ...EXTRA_CONCEPTS.map(extraFrom)];
  const unique = new Map<string, MockSimulation>();
  for (const seed of all) {
    if (!unique.has(seed.id)) unique.set(seed.id, toSimulation(seed));
  }
  return [...unique.values()];
}

export function simulationsForCategory(category: string): MockSimulation[] {
  const catalog = createSimulationCatalog();
  const key = category.trim().toLowerCase();
  if (!key || key === "all") return catalog;
  return catalog.filter((item) =>
    item.category.toLowerCase() === key ||
    item.topicId.includes(key.replace(/\s+/g, "-")) ||
    item.tags.some((tag) => tag.toLowerCase().includes(key)) ||
    item.title.toLowerCase().includes(key),
  );
}

export function createSimulationSnapshots(simulations: readonly MockSimulation[]): MockSimulationSnapshot[] {
  const projectileShot = projectile({ speed: 18, angleDeg: 42, height: 0 });
  const circuit = ohmsLaw(12, 4);
  const waveShot = wave({ frequencyHz: 4, wavelengthM: 0.5 });
  const known: Record<string, Record<string, number>> = {
    "sim-projectile": { range: roundPhysics(projectileShot.range), peakHeight: roundPhysics(projectileShot.peakHeight), flightTime: roundPhysics(projectileShot.flightTime) },
    "sim-circuit": { current: circuitCurrent(12, 4), power: circuitPower(12, 4) },
    "sim-rc": { current: circuit.current, power: circuit.power, timeConstant: roundPhysics(4 * 0.005) },
    "sim-pendulum": { period: pendulumPeriod(1), gravity: PHYSICS.g },
    "sim-waves": { speed: roundPhysics(waveShot.speedMps), period: roundPhysics(waveShot.periodS) },
    "sim-shm": { period: roundPhysics(2 * Math.PI * Math.sqrt(1 / 80)) },
  };
  return simulations.map((simulation, index) => ({
    id: `snap-${simulation.id}`,
    simulationId: simulation.id,
    parameters: { ...simulation.defaultParameters },
    observables: known[simulation.id] ?? { value: simulation.defaultParameters.control ?? index + 1 },
    capturedAt: isoDaysAgo(1 + (index % 40), 6),
    notes: `MOCK snapshot for ${simulation.title}. Dependent values use the local physics model where one exists.`,
  }));
}
