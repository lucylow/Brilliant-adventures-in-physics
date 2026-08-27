export type PhysicsDomain = "particle" | "optics" | "light-matter" | "electronics" | "biophysics";
export type ParticleCategory = "quark" | "lepton" | "boson" | "hadron" | "meson" | "baryon";
export type Particle = { id: string; name: string; symbol: string; category: ParticleCategory; charge: number; spin: number; massMeV: number; antiparticle?: string };

export const STANDARD_MODEL_PARTICLES: readonly Particle[] = [
  { id: "up", name: "Up quark", symbol: "u", category: "quark", charge: 2 / 3, spin: 0.5, massMeV: 2.2, antiparticle: "anti-up" },
  { id: "down", name: "Down quark", symbol: "d", category: "quark", charge: -1 / 3, spin: 0.5, massMeV: 4.7, antiparticle: "anti-down" },
  { id: "electron", name: "Electron", symbol: "e⁻", category: "lepton", charge: -1, spin: 0.5, massMeV: 0.511, antiparticle: "positron" },
  { id: "neutrino", name: "Electron neutrino", symbol: "νₑ", category: "lepton", charge: 0, spin: 0.5, massMeV: 0, antiparticle: "anti-neutrino" },
  { id: "photon", name: "Photon", symbol: "γ", category: "boson", charge: 0, spin: 1, massMeV: 0 },
  { id: "gluon", name: "Gluon", symbol: "g", category: "boson", charge: 0, spin: 1, massMeV: 0 },
  { id: "higgs", name: "Higgs boson", symbol: "H", category: "boson", charge: 0, spin: 0, massMeV: 125100 },
];

const C = 299792458;
const ELECTRON_CHARGE = 1.602176634e-19;
const PLANCK = 6.62607015e-34;
function finite(value: number, label: string): number { if (!Number.isFinite(value)) throw new Error(`${label} must be finite`); return value; }
function positive(value: number, label: string): number { finite(value, label); if (value <= 0) throw new Error(`${label} must be greater than zero`); return value; }
function nonNegative(value: number, label: string): number { finite(value, label); if (value < 0) throw new Error(`${label} must be non-negative`); return value; }

export function findParticle(id: string): Particle | undefined { return STANDARD_MODEL_PARTICLES.find((particle) => particle.id === id); }
export function getAntiparticle(particle: Particle): Particle { return { ...particle, id: `${particle.id}-anti`, name: `Anti-${particle.name}`, charge: -particle.charge, symbol: particle.symbol.includes("⁻") ? particle.symbol.replace("⁻", "⁺") : `anti-${particle.symbol}` }; }
export function isBaryonComposition(quarks: readonly string[]): boolean { return quarks.length === 3 && quarks.every((quark) => quark.length > 0); }
export function isMesonComposition(quarks: readonly string[]): boolean { return quarks.length === 2 && quarks.every((quark) => quark.length > 0); }
export function restEnergyJ(massKg: number): number { return positive(massKg, "Mass") * C ** 2; }
export function relativisticEnergyJ(massKg: number, momentumKgMps: number): number { const mass = positive(massKg, "Mass"); const momentum = finite(momentumKgMps, "Momentum"); return Math.sqrt((momentum * C) ** 2 + (mass * C ** 2) ** 2); }
export function relativisticMomentumKgMps(massKg: number, velocityMs: number): number { const mass = positive(massKg, "Mass"); const velocity = finite(velocityMs, "Velocity"); if (Math.abs(velocity) >= C) throw new Error("Massive particles must have speed below c"); return mass * velocity / Math.sqrt(1 - velocity ** 2 / C ** 2); }
export function velocityFromMomentumMs(massKg: number, momentumKgMps: number): number { const mass = positive(massKg, "Mass"); const momentum = finite(momentumKgMps, "Momentum"); return C * momentum / Math.sqrt(momentum ** 2 + (mass * C) ** 2); }

export function thinLensImageDistanceM(focalLengthM: number, objectDistanceM: number): number { const focal = positive(focalLengthM, "Focal length"); const object = positive(objectDistanceM, "Object distance"); const denominator = 1 / focal - 1 / object; if (Math.abs(denominator) < 1e-15) throw new Error("Object is at the focal point"); return 1 / denominator; }
export function thinLensMagnification(focalLengthM: number, objectDistanceM: number): number { return -thinLensImageDistanceM(focalLengthM, objectDistanceM) / positive(objectDistanceM, "Object distance"); }
export function snellsLawAngleRad(incidentAngleRad: number, refractiveIndexFrom: number, refractiveIndexTo: number): number { const angle = finite(incidentAngleRad, "Incident angle"); const from = positive(refractiveIndexFrom, "First refractive index"); const to = positive(refractiveIndexTo, "Second refractive index"); const ratio = from * Math.sin(angle) / to; if (Math.abs(ratio) > 1) throw new Error("Total internal reflection"); return Math.asin(ratio); }
export function photonMomentumKgMps(wavelengthM: number): number { return PLANCK / positive(wavelengthM, "Wavelength"); }
export function absorptionProbability(absorptionCoefficientM: number, pathLengthM: number): number { return 1 - Math.exp(-positive(absorptionCoefficientM, "Absorption coefficient") * nonNegative(pathLengthM, "Path length")); }

export function ohmsLawCurrentA(voltageV: number, resistanceOhm: number): number { return finite(voltageV, "Voltage") / positive(resistanceOhm, "Resistance"); }
export function electricalPowerW(voltageV: number, resistanceOhm: number): number { const voltage = finite(voltageV, "Voltage"); return voltage ** 2 / positive(resistanceOhm, "Resistance"); }
export function seriesResistanceOhm(resistances: readonly number[]): number { if (!resistances.length) throw new Error("At least one resistor is required"); return resistances.reduce((sum, resistance) => sum + positive(resistance, "Resistance"), 0); }
export function rcChargingFraction(elapsedS: number, resistanceOhm: number, capacitanceF: number): number { return 1 - Math.exp(-nonNegative(elapsedS, "Elapsed time") / (positive(resistanceOhm, "Resistance") * positive(capacitanceF, "Capacitance"))); }

export function diffusionRmsDistanceM(diffusionCoefficientM2S: number, elapsedS: number): number { return Math.sqrt(2 * positive(diffusionCoefficientM2S, "Diffusion coefficient") * nonNegative(elapsedS, "Elapsed time")); }
export function membranePotentialV(insideConcentration: number, outsideConcentration: number, temperatureK = 310): number { const inside = positive(insideConcentration, "Inside concentration"); const outside = positive(outsideConcentration, "Outside concentration"); return 8.314462618 * positive(temperatureK, "Temperature") / ELECTRON_CHARGE * Math.log(outside / inside); }

export type DomainCatalogItem = { id: string; domain: PhysicsDomain; title: string; description: string };
export const FALLBACK_DOMAIN_CATALOG: readonly DomainCatalogItem[] = [
  { id: "standard-model", domain: "particle", title: "Standard Model particles", description: "Inspect a bounded local catalog of quarks, leptons, and bosons." },
  { id: "lenses", domain: "optics", title: "Geometric optics", description: "Use the thin-lens and Snell-law models locally." },
  { id: "light-matter", domain: "light-matter", title: "Light–matter interaction", description: "Relate wavelength, momentum, absorption coefficient, and path length." },
  { id: "circuits", domain: "electronics", title: "Electronics", description: "Calculate current, power, series resistance, and RC charging." },
  { id: "diffusion", domain: "biophysics", title: "Biophysics", description: "Explore diffusion distance and a simplified membrane-potential model." },
];
