export const SPEED_OF_LIGHT = 299_792_458;
export const PLANCK_REDUCED = 1.054_571_817e-34;
export const PLANCK = 6.626_070_15e-34;

function finite(value: number, label: string): number { if (!Number.isFinite(value)) throw new Error(`${label} must be finite`); return value; }
function positive(value: number, label: string): number { finite(value, label); if (value <= 0) throw new Error(`${label} must be greater than zero`); return value; }
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
