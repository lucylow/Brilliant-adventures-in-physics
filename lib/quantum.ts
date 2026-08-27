import AsyncStorage from "@react-native-async-storage/async-storage";

export const QUANTUM_CONSTANTS = {
  h: 6.62607015e-34,
  hbar: 1.054571817e-34,
  c: 299792458,
  electronMass: 9.1093837e-31,
  protonMass: 1.67262192369e-27,
  elementaryCharge: 1.602176634e-19,
  boltzmann: 1.380649e-23,
} as const;

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value;
}

function positive(value: number, label: string): number {
  finite(value, label);
  if (value <= 0) throw new Error(`${label} must be greater than zero`);
  return value;
}

function nonNegative(value: number, label: string): number {
  finite(value, label);
  if (value < 0) throw new Error(`${label} must be non-negative`);
  return value;
}

export function evToJoules(eV: number): number { return finite(eV, "Energy") * QUANTUM_CONSTANTS.elementaryCharge; }
export function joulesToEV(joules: number): number { return finite(joules, "Energy") / QUANTUM_CONSTANTS.elementaryCharge; }
export function metersToNm(meters: number): number { return finite(meters, "Length") * 1e9; }
export function nmToMeters(nm: number): number { return finite(nm, "Length") * 1e-9; }

export function photonEnergy(wavelengthMeters: number): number { return QUANTUM_CONSTANTS.h * QUANTUM_CONSTANTS.c / positive(wavelengthMeters, "Wavelength"); }
export function photonFrequency(wavelengthMeters: number): number { return QUANTUM_CONSTANTS.c / positive(wavelengthMeters, "Wavelength"); }

export type PhotoelectricResult = { photonEnergyJ: number; workFunctionJ: number; maximumKineticEnergyJ: number; thresholdFrequencyHz: number; emitted: boolean };
export function photoelectricEffect(wavelengthMeters: number, workFunctionJ: number): PhotoelectricResult {
  const work = nonNegative(workFunctionJ, "Work function");
  const energy = photonEnergy(wavelengthMeters);
  return { photonEnergyJ: energy, workFunctionJ: work, maximumKineticEnergyJ: Math.max(0, energy - work), thresholdFrequencyHz: work / QUANTUM_CONSTANTS.h, emitted: energy >= work };
}

export function classicalMomentum(massKg: number, velocityMs: number): number { return positive(massKg, "Mass") * finite(velocityMs, "Velocity"); }
export function deBroglieWavelength(momentumKgMs: number): number { return QUANTUM_CONSTANTS.h / positive(Math.abs(momentumKgMs), "Momentum"); }
export function matterWave(massKg: number, velocityMs: number): { momentum: number; wavelengthM: number } {
  const momentum = classicalMomentum(massKg, velocityMs);
  return { momentum, wavelengthM: deBroglieWavelength(momentum) };
}

export function minimumMomentumUncertainty(positionUncertaintyMeters: number): number { return QUANTUM_CONSTANTS.hbar / (2 * positive(positionUncertaintyMeters, "Position uncertainty")); }
export function uncertaintyProduct(deltaX: number, deltaP: number): number { return positive(deltaX, "Position uncertainty") * positive(deltaP, "Momentum uncertainty"); }

export type ComplexNumber = { real: number; imaginary: number };
export type QuantumState = { amplitudes: ComplexNumber[]; labels: string[] };
export function complex(real: number, imaginary = 0): ComplexNumber { return { real: finite(real, "Real part"), imaginary: finite(imaginary, "Imaginary part") }; }
export function complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber { return complex(a.real + b.real, a.imaginary + b.imaginary); }
export function complexMultiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber { return complex(a.real * b.real - a.imaginary * b.imaginary, a.real * b.imaginary + a.imaginary * b.real); }
export function complexMagnitude(value: ComplexNumber): number { return Math.hypot(finite(value.real, "Real part"), finite(value.imaginary, "Imaginary part")); }
export function probabilityFromAmplitude(value: ComplexNumber): number { return complexMagnitude(value) ** 2; }

export function normalizeState(amplitudes: ComplexNumber[]): ComplexNumber[] {
  if (!amplitudes.length) throw new Error("Quantum state must contain amplitudes");
  const total = amplitudes.reduce((sum, amplitude) => sum + probabilityFromAmplitude(amplitude), 0);
  if (!Number.isFinite(total) || total <= 0) throw new Error("Quantum state cannot be normalized");
  const factor = 1 / Math.sqrt(total);
  return amplitudes.map((amplitude) => complex(amplitude.real * factor, amplitude.imaginary * factor));
}

export function measurementProbabilities(state: QuantumState): number[] {
  const normalized = normalizeState(state.amplitudes);
  return normalized.map(probabilityFromAmplitude);
}

export function measureState(state: QuantumState, random = Math.random()): number {
  const sample = finite(random, "Random sample");
  if (sample < 0 || sample > 1) throw new Error("Random sample must be between zero and one");
  const probabilities = measurementProbabilities(state);
  let cumulative = 0;
  for (let index = 0; index < probabilities.length; index += 1) {
    cumulative += probabilities[index];
    if (sample <= cumulative) return index;
  }
  return probabilities.length - 1;
}

export function collapseState(state: QuantumState, selectedIndex: number): QuantumState {
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= state.amplitudes.length) throw new Error("Selected state index is invalid");
  return { labels: [...state.labels], amplitudes: state.amplitudes.map((_, index) => index === selectedIndex ? complex(1) : complex(0)) };
}

export type QubitState = { alpha: ComplexNumber; beta: ComplexNumber };
export function normalizeQubit(qubit: QubitState): QubitState {
  const factor = Math.sqrt(probabilityFromAmplitude(qubit.alpha) + probabilityFromAmplitude(qubit.beta));
  if (!Number.isFinite(factor) || factor <= 0) throw new Error("Qubit cannot be normalized");
  return { alpha: complex(qubit.alpha.real / factor, qubit.alpha.imaginary / factor), beta: complex(qubit.beta.real / factor, qubit.beta.imaginary / factor) };
}
export function qubitProbabilities(qubit: QubitState): { zero: number; one: number } { const normalized = normalizeQubit(qubit); return { zero: probabilityFromAmplitude(normalized.alpha), one: probabilityFromAmplitude(normalized.beta) }; }
export function blochCoordinates(qubit: QubitState): { x: number; y: number; z: number } {
  const normalized = normalizeQubit(qubit);
  const a = normalized.alpha;
  const b = normalized.beta;
  return { x: 2 * (a.real * b.real + a.imaginary * b.imaginary), y: 2 * (a.real * b.imaginary - a.imaginary * b.real), z: probabilityFromAmplitude(a) - probabilityFromAmplitude(b) };
}

export function hydrogenEnergyEV(nuclearCharge: number, principalLevel: number): number {
  const charge = positive(nuclearCharge, "Nuclear charge");
  const n = principalLevel;
  if (!Number.isInteger(n) || n < 1) throw new Error("Principal level must be an integer greater than zero");
  return -13.605693 * charge ** 2 / n ** 2;
}
export function hydrogenTransitionEnergyEV(nuclearCharge: number, initialLevel: number, finalLevel: number): number { return Math.abs(hydrogenEnergyEV(nuclearCharge, initialLevel) - hydrogenEnergyEV(nuclearCharge, finalLevel)); }
export function transitionWavelengthNm(energyEV: number): number { return metersToNm(QUANTUM_CONSTANTS.h * QUANTUM_CONSTANTS.c / positive(evToJoules(energyEV), "Transition energy")); }

export function infiniteWellEnergyJ(level: number, widthMeters: number, massKg = QUANTUM_CONSTANTS.electronMass): number {
  if (!Number.isInteger(level) || level < 1) throw new Error("Well level must be an integer greater than zero");
  return (level ** 2 * QUANTUM_CONSTANTS.h ** 2) / (8 * positive(massKg, "Particle mass") * positive(widthMeters, "Well width") ** 2);
}
export function tunnelingProbability(barrierJ: number, particleEnergyJ: number, widthMeters: number, massKg = QUANTUM_CONSTANTS.electronMass): number {
  const barrier = finite(barrierJ, "Barrier energy");
  const energy = finite(particleEnergyJ, "Particle energy");
  const width = positive(widthMeters, "Barrier width");
  const mass = positive(massKg, "Particle mass");
  if (barrier <= energy) return 1;
  const kappa = Math.sqrt(2 * mass * (barrier - energy)) / QUANTUM_CONSTANTS.hbar;
  return Math.max(0, Math.min(1, Math.exp(-2 * kappa * width)));
}

export type QuantumConcept = { id: string; title: string; description: string; simulation: "photon" | "matter-wave" | "uncertainty" | "qubit" | "tunneling" | "spectrum" };
export type QuantumCatalog = { concepts: QuantumConcept[] };
export const FALLBACK_QUANTUM_CATALOG: QuantumCatalog = {
  concepts: [
    { id: "photon-energy", title: "Photon energy", description: "Connect wavelength, frequency, and quantized light energy.", simulation: "photon" },
    { id: "matter-waves", title: "Matter waves", description: "Compare momentum with a particle’s de Broglie wavelength.", simulation: "matter-wave" },
    { id: "uncertainty", title: "Uncertainty principle", description: "Explore the lower bound on simultaneous position and momentum precision.", simulation: "uncertainty" },
    { id: "qubit", title: "Qubit probabilities", description: "Normalize a two-state quantum system and inspect its Bloch coordinates.", simulation: "qubit" },
    { id: "tunneling", title: "Quantum tunneling", description: "Visualize how a finite barrier changes transmission probability.", simulation: "tunneling" },
    { id: "hydrogen-spectrum", title: "Hydrogen spectrum", description: "Calculate idealized hydrogenic transitions and wavelengths.", simulation: "spectrum" },
  ],
};

const QUANTUM_CATALOG_KEY = "physicaai.quantum-catalog.v1";
function isQuantumConcept(value: unknown): value is QuantumConcept { if (!value || typeof value !== "object") return false; const item = value as Partial<QuantumConcept>; return typeof item.id === "string" && typeof item.title === "string" && typeof item.description === "string" && ["photon", "matter-wave", "uncertainty", "qubit", "tunneling", "spectrum"].includes(item.simulation ?? ""); }
function parseQuantumCatalog(value: unknown): QuantumCatalog | null { if (!value || typeof value !== "object") return null; const concepts = (value as { concepts?: unknown }).concepts; return Array.isArray(concepts) && concepts.length > 0 && concepts.length <= 24 && concepts.every(isQuantumConcept) ? { concepts } : null; }
export async function loadQuantumCatalog(): Promise<{ catalog: QuantumCatalog; usedFallback: boolean; reason?: "malformed" | "unavailable" }> {
  try {
    const raw = await AsyncStorage.getItem(QUANTUM_CATALOG_KEY);
    if (!raw) return { catalog: FALLBACK_QUANTUM_CATALOG, usedFallback: true };
    const parsed = parseQuantumCatalog(JSON.parse(raw));
    return parsed ? { catalog: parsed, usedFallback: false } : { catalog: FALLBACK_QUANTUM_CATALOG, usedFallback: true, reason: "malformed" };
  } catch {
    return { catalog: FALLBACK_QUANTUM_CATALOG, usedFallback: true, reason: "unavailable" };
  }
}
