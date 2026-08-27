export const SPEED_OF_LIGHT = 299_792_458;
export const PLANCK_REDUCED = 1.054_571_817e-34;
export const PLANCK = 6.626_070_15e-34;

function finite(value: number, label: string): number { if (!Number.isFinite(value)) throw new Error(`${label} must be finite`); return value; }
function positive(value: number, label: string): number { finite(value, label); if (value <= 0) throw new Error(`${label} must be greater than zero`); return value; }
function nonNegative(value: number, label: string): number { finite(value, label); if (value < 0) throw new Error(`${label} must be non-negative`); return value; }
function subluminal(speed: number): number { finite(speed, "Speed"); if (Math.abs(speed) >= SPEED_OF_LIGHT) throw new Error("Speed must be below the speed of light"); return speed; }

export function lorentzGamma(speed: number): number { const v = subluminal(speed); return 1 / Math.sqrt(1 - (v * v) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT)); }
export function properTime(coordinateTimeS: number, speed: number): number { positive(coordinateTimeS, "Coordinate time"); return coordinateTimeS / lorentzGamma(speed); }
export function timeDilation(properTimeS: number, speed: number): number { positive(properTimeS, "Proper time"); return properTimeS * lorentzGamma(speed); }
export function lengthContracted(restLengthM: number, speed: number): number { positive(restLengthM, "Rest length"); return restLengthM / lorentzGamma(speed); }
export function relativisticEnergy(massKg: number, speed: number): number { positive(massKg, "Mass"); return lorentzGamma(speed) * massKg * SPEED_OF_LIGHT ** 2; }
export function energyMomentum(massKg: number, momentumKgMps: number): number { positive(massKg, "Mass"); finite(momentumKgMps, "Momentum"); return Math.sqrt((momentumKgMps * SPEED_OF_LIGHT) ** 2 + (massKg * SPEED_OF_LIGHT ** 2) ** 2); }

export type Complex = { re: number; im: number };
export function complexAdd(a: Complex, b: Complex): Complex { finite(a.re, "Real part"); finite(a.im, "Imaginary part"); finite(b.re, "Real part"); finite(b.im, "Imaginary part"); return { re: a.re + b.re, im: a.im + b.im }; }
export function complexMultiply(a: Complex, b: Complex): Complex { return { re: finite(a.re, "Real part") * finite(b.re, "Real part") - finite(a.im, "Imaginary part") * finite(b.im, "Imaginary part"), im: a.re * b.im + a.im * b.re }; }
export function probabilityDensity(amplitude: Complex): number { finite(amplitude.re, "Real part"); finite(amplitude.im, "Imaginary part"); return amplitude.re ** 2 + amplitude.im ** 2; }
export function quantumOscillatorEnergy(level: number, angularFrequency: number): number { finite(level, "Energy level"); if (!Number.isInteger(level) || level < 0) throw new Error("Energy level must be a non-negative integer"); positive(angularFrequency, "Angular frequency"); return (level + 0.5) * PLANCK_REDUCED * angularFrequency; }
export function tunnelingFactor(barrierJ: number, particleEnergyJ: number, widthM: number, massKg: number): number { finite(barrierJ, "Barrier energy"); finite(particleEnergyJ, "Particle energy"); positive(widthM, "Barrier width"); positive(massKg, "Mass"); if (barrierJ <= particleEnergyJ) return 1; const k = Math.sqrt(2 * massKg * (barrierJ - particleEnergyJ)) / PLANCK_REDUCED; return Math.exp(-2 * k * widthM); }
export function normalizeWavefunction(psi: Complex[], dxM: number): Complex[] { positive(dxM, "Grid spacing"); if (!psi.length) throw new Error("Wavefunction must contain samples"); const norm = psi.reduce((sum, sample) => sum + probabilityDensity(sample) * dxM, 0); if (norm <= 0) throw new Error("Wavefunction norm must be positive"); const factor = 1 / Math.sqrt(norm); return psi.map((sample) => ({ re: sample.re * factor, im: sample.im * factor })); }


export const ATOMIC_CONSTANTS = {
  bohrRadius: 5.29177210903e-11,
  rydbergEnergyEV: 13.605693,
  electronMass: 9.1093837e-31,
  protonMass: 1.67262192369e-27,
  neutronMass: 1.67492749804e-27,
  elementaryCharge: 1.602176634e-19,
  h: PLANCK,
  hbar: PLANCK_REDUCED,
  c: SPEED_OF_LIGHT,
} as const;

export function hydrogenicEnergyEV(nuclearCharge: number, level: number): number {
  positive(nuclearCharge, "Nuclear charge");
  if (!Number.isInteger(level) || level < 1) throw new Error("Principal level must be an integer greater than zero");
  return -ATOMIC_CONSTANTS.rydbergEnergyEV * nuclearCharge ** 2 / level ** 2;
}

export function hydrogenicTransitionEnergyEV(nuclearCharge: number, initialLevel: number, finalLevel: number): number {
  return Math.abs(hydrogenicEnergyEV(nuclearCharge, initialLevel) - hydrogenicEnergyEV(nuclearCharge, finalLevel));
}

export function spectralWavelengthNm(energyEV: number): number {
  const energyJ = positive(energyEV, "Transition energy") * ATOMIC_CONSTANTS.elementaryCharge;
  return ATOMIC_CONSTANTS.h * ATOMIC_CONSTANTS.c / energyJ * 1e9;
}

export function orbitalAngularMomentum(l: number): number {
  if (!Number.isInteger(l) || l < 0) throw new Error("Orbital quantum number must be a non-negative integer");
  return Math.sqrt(l * (l + 1)) * ATOMIC_CONSTANTS.hbar;
}

export function electronConfiguration(electrons: number): Array<{ shell: number; electrons: number }> {
  if (!Number.isInteger(electrons) || electrons < 0) throw new Error("Electron count must be a non-negative integer");
  const capacities = [2, 8, 18, 32];
  let remaining = electrons;
  const shells: Array<{ shell: number; electrons: number }> = [];
  for (let index = 0; index < capacities.length && remaining > 0; index += 1) {
    const count = Math.min(remaining, capacities[index]);
    shells.push({ shell: index + 1, electrons: count });
    remaining -= count;
  }
  return shells;
}

export function molecularMomentOfInertia(massKg: number, bondLengthM: number): number {
  return positive(massKg, "Reduced mass") * positive(bondLengthM, "Bond length") ** 2;
}

export function rotationalEnergyJ(level: number, momentOfInertiaKgM2: number): number {
  if (!Number.isInteger(level) || level < 0) throw new Error("Rotational level must be a non-negative integer");
  return level * (level + 1) * ATOMIC_CONSTANTS.hbar ** 2 / (2 * positive(momentOfInertiaKgM2, "Moment of inertia"));
}

export function vibrationalEnergyJ(level: number, angularFrequency: number): number {
  if (!Number.isInteger(level) || level < 0) throw new Error("Vibrational level must be a non-negative integer");
  return (level + 0.5) * ATOMIC_CONSTANTS.hbar * positive(angularFrequency, "Angular frequency");
}

export function morsePotentialJ(distanceM: number, equilibriumDistanceM: number, wellDepthJ: number, widthInverseM: number): number {
  const distance = positive(distanceM, "Distance");
  const equilibrium = positive(equilibriumDistanceM, "Equilibrium distance");
  const depth = positive(wellDepthJ, "Well depth");
  const width = positive(widthInverseM, "Morse width");
  return depth * (1 - Math.exp(-width * (distance - equilibrium))) ** 2;
}

export function nuclearRadiusM(massNumber: number): number {
  if (!Number.isInteger(massNumber) || massNumber < 1) throw new Error("Mass number must be a positive integer");
  return 1.2e-15 * massNumber ** (1 / 3);
}

export function nuclearVolumeM3(massNumber: number): number { return (4 / 3) * Math.PI * nuclearRadiusM(massNumber) ** 3; }
export function massDefectKg(protons: number, neutrons: number, nucleusMassKg: number): number { if (!Number.isInteger(protons) || protons < 0 || !Number.isInteger(neutrons) || neutrons < 0 || protons + neutrons < 1) throw new Error("Nucleon counts are invalid"); return protons * ATOMIC_CONSTANTS.protonMass + neutrons * ATOMIC_CONSTANTS.neutronMass - positive(nucleusMassKg, "Nucleus mass"); }
export function nuclearBindingEnergyJ(protons: number, neutrons: number, nucleusMassKg: number): number { return massDefectKg(protons, neutrons, nucleusMassKg) * SPEED_OF_LIGHT ** 2; }
export function bindingEnergyPerNucleonJ(protons: number, neutrons: number, nucleusMassKg: number): number { return nuclearBindingEnergyJ(protons, neutrons, nucleusMassKg) / (protons + neutrons); }

export function radioactiveRemaining(initialAmount: number, halfLifeS: number, elapsedS: number): number { return positive(initialAmount, "Initial amount") * Math.pow(0.5, nonNegative(elapsedS, "Elapsed time") / positive(halfLifeS, "Half-life")); }
export function decayConstant(halfLifeS: number): number { return Math.LN2 / positive(halfLifeS, "Half-life"); }
export function radioactiveActivity(initialAmount: number, halfLifeS: number, elapsedS: number): number { return decayConstant(halfLifeS) * radioactiveRemaining(initialAmount, halfLifeS, elapsedS); }

export function unitCellVolume(aM: number, bM: number, cM: number): number { return positive(aM, "Cell edge a") * positive(bM, "Cell edge b") * positive(cM, "Cell edge c"); }
export function crystalDensityKgM3(massPerCellKg: number, volumeM3: number): number { return positive(massPerCellKg, "Mass per cell") / positive(volumeM3, "Cell volume"); }
export function braggAngleRad(wavelengthM: number, planeSpacingM: number, order = 1): number { const n = positive(order, "Diffraction order"); const ratio = n * positive(wavelengthM, "Wavelength") / (2 * positive(planeSpacingM, "Plane spacing")); if (ratio > 1) throw new Error("Bragg condition has no real angle"); return Math.asin(ratio); }
export function fermiDiracOccupation(energyJ: number, chemicalPotentialJ: number, temperatureK: number): number { const temperature = positive(temperatureK, "Temperature"); const exponent = (finite(energyJ, "Energy") - finite(chemicalPotentialJ, "Chemical potential")) / (1.380649e-23 * temperature); return 1 / (Math.exp(Math.max(-700, Math.min(700, exponent))) + 1); }
export function boseEinsteinOccupation(energyJ: number, chemicalPotentialJ: number, temperatureK: number): number { const temperature = positive(temperatureK, "Temperature"); const gap = finite(energyJ, "Energy") - finite(chemicalPotentialJ, "Chemical potential"); if (gap <= 0) throw new Error("Energy must exceed chemical potential"); const exponent = gap / (1.380649e-23 * temperature); return 1 / Math.expm1(Math.min(700, exponent)); }

export type AdvancedPhysicsCatalogItem = { id: string; domain: "atomic" | "molecular" | "nuclear" | "condensed-matter"; title: string; description: string };
export const FALLBACK_ADVANCED_PHYSICS_CATALOG: AdvancedPhysicsCatalogItem[] = [
  { id: "hydrogen-spectrum", domain: "atomic", title: "Hydrogenic spectrum", description: "Calculate idealized energy levels and transition wavelengths." },
  { id: "molecular-vibration", domain: "molecular", title: "Molecular vibration", description: "Explore zero-point and quantized vibrational energy." },
  { id: "radioactive-decay", domain: "nuclear", title: "Radioactive decay", description: "Model half-life, remaining amount, and activity." },
  { id: "bragg-diffraction", domain: "condensed-matter", title: "Bragg diffraction", description: "Relate lattice spacing, wavelength, and diffraction angle." },
];
