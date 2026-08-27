export type CosmologyTopic = "big-bang" | "inflation" | "expansion" | "cmb" | "nucleosynthesis" | "dark-matter" | "dark-energy" | "gravitational-waves" | "cosmic-horizons";

export interface UniverseModel {
  ageGyr: number;
  hubbleConstantKmsMpc: number;
  matterFraction: number;
  darkMatterFraction: number;
  darkEnergyFraction: number;
  radiationFraction: number;
  curvature: number;
}

export interface ExpansionState {
  scaleFactor: number;
  redshift: number;
  cosmicTimeGyr: number;
  expansionRatePerGyr: number;
}

export interface CosmicEra {
  id: CosmologyTopic | "recombination";
  name: string;
  startSeconds: number;
  endSeconds: number;
  description: string;
}

export const COSMOLOGY = {
  speedOfLight: 299_792_458,
  gravitationalConstant: 6.674_30e-11,
  boltzmannConstant: 1.380_649e-23,
  planckConstant: 6.626_070_15e-34,
  megaparsecMeters: 3.085_677_581e22,
  solarMassKg: 1.988_47e30,
} as const;

export const CMB_TEMPERATURE_K = 2.725;
export const FALLBACK_UNIVERSE: UniverseModel = { ageGyr: 13.8, hubbleConstantKmsMpc: 67.4, matterFraction: 0.315, darkMatterFraction: 0.265, darkEnergyFraction: 0.684, radiationFraction: 0.00009, curvature: 0 };
export const FALLBACK_COSMIC_ERAS: CosmicEra[] = [
  { id: "inflation", name: "Inflation", startSeconds: 0, endSeconds: 1e-32, description: "A rapid early expansion phase used as a model in this learning module." },
  { id: "nucleosynthesis", name: "Big Bang nucleosynthesis", startSeconds: 1, endSeconds: 1000, description: "Light atomic nuclei formed as the early universe cooled." },
  { id: "recombination", name: "Recombination", startSeconds: 1e13, endSeconds: 1e14, description: "Electrons joined nuclei and photons traveled more freely." },
];

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value;
}

function nonNegative(value: number, label: string): number {
  finite(value, label);
  if (value < 0) throw new Error(`${label} must not be negative`);
  return value;
}

function positive(value: number, label: string): number {
  finite(value, label);
  if (value <= 0) throw new Error(`${label} must be greater than zero`);
  return value;
}

export function hubbleParameter(hubbleConstantKmsMpc: number, matterFraction: number, darkEnergyFraction: number, redshift: number): number {
  const H0 = positive(hubbleConstantKmsMpc, "Hubble constant");
  const matter = nonNegative(matterFraction, "Matter fraction");
  const darkEnergy = nonNegative(darkEnergyFraction, "Dark-energy fraction");
  const z = finite(redshift, "Redshift");
  if (z < -1) throw new Error("Redshift must be at least -1");
  return H0 * Math.sqrt(matter * (1 + z) ** 3 + darkEnergy);
}

export function redshiftToScaleFactor(redshift: number): number {
  const z = finite(redshift, "Redshift");
  if (z <= -1) throw new Error("Redshift must be greater than -1");
  return 1 / (1 + z);
}

export function scaleFactorToRedshift(scaleFactor: number): number {
  return 1 / positive(scaleFactor, "Scale factor") - 1;
}

export function advanceExpansion(state: ExpansionState, dtGyr: number, expansionRatePerGyr: number): ExpansionState {
  const dt = nonNegative(dtGyr, "Time step");
  const rate = finite(expansionRatePerGyr, "Expansion rate");
  const scaleFactor = positive(state.scaleFactor, "Scale factor") * Math.exp(rate * dt);
  return { scaleFactor, redshift: scaleFactorToRedshift(scaleFactor), cosmicTimeGyr: state.cosmicTimeGyr + dt, expansionRatePerGyr: rate };
}

export function cosmicTemperature(temperatureTodayK: number, redshift: number): number {
  const z = finite(redshift, "Redshift");
  if (z <= -1) throw new Error("Redshift must be greater than -1");
  return positive(temperatureTodayK, "Temperature") * (1 + z);
}

export function cmbTemperatureAtRedshift(redshift: number): number {
  return cosmicTemperature(CMB_TEMPERATURE_K, redshift);
}

export function stretchedWavelength(originalWavelengthMeters: number, redshift: number): number {
  const z = finite(redshift, "Redshift");
  if (z <= -1) throw new Error("Redshift must be greater than -1");
  return positive(originalWavelengthMeters, "Wavelength") * (1 + z);
}

export function photonFrequency(wavelengthMeters: number): number {
  return COSMOLOGY.speedOfLight / positive(wavelengthMeters, "Wavelength");
}

export function cmbPhotonEnergy(wavelengthMeters: number): number {
  return COSMOLOGY.planckConstant * photonFrequency(wavelengthMeters);
}

export function planckRadiance(wavelengthMeters: number, temperatureK: number): number {
  const wavelength = positive(wavelengthMeters, "Wavelength");
  const temperature = positive(temperatureK, "Temperature");
  const exponent = (COSMOLOGY.planckConstant * COSMOLOGY.speedOfLight) / (wavelength * COSMOLOGY.boltzmannConstant * temperature);
  return (2 * COSMOLOGY.planckConstant * COSMOLOGY.speedOfLight ** 2) / (wavelength ** 5 * Math.expm1(exponent));
}

export function generateCMBSpectrum(temperatureK: number, count = 32): { wavelengthMeters: number; intensity: number }[] {
  positive(temperatureK, "Temperature");
  const safeCount = Math.max(2, Math.min(200, Math.floor(count)));
  return Array.from({ length: safeCount }, (_, index) => {
    const wavelengthMeters = 1e-4 + index * (3e-3 / (safeCount - 1));
    return { wavelengthMeters, intensity: planckRadiance(wavelengthMeters, temperatureK) };
  });
}

export function approximateIonization(temperatureK: number, thresholdK = 3000): number {
  return Math.min(1, Math.max(0, positive(temperatureK, "Temperature") / positive(thresholdK, "Threshold temperature")));
}

export function criticalDensity(hubbleConstantKmsMpc: number): number {
  const hubblePerSecond = positive(hubbleConstantKmsMpc, "Hubble constant") * 1000 / COSMOLOGY.megaparsecMeters;
  return 3 * hubblePerSecond ** 2 / (8 * Math.PI * COSMOLOGY.gravitationalConstant);
}

export function matterDensity(hubbleConstantKmsMpc: number, matterFraction: number): number {
  return criticalDensity(hubbleConstantKmsMpc) * nonNegative(matterFraction, "Matter fraction");
}

export interface CosmicTimeState {
  secondsSinceBeginning: number;
  scaleFactor: number;
  redshift: number;
  temperatureK: number;
}

export function createCosmicTimeState(secondsSinceBeginning: number): CosmicTimeState {
  const seconds = positive(secondsSinceBeginning, "Cosmic time");
  const scaleFactor = Math.max(1e-6, (seconds / 4.35e17) ** (2 / 3));
  return { secondsSinceBeginning: seconds, scaleFactor, redshift: scaleFactorToRedshift(scaleFactor), temperatureK: temperatureFromScaleFactor(scaleFactor) };
}

export function temperatureFromScaleFactor(scaleFactor: number): number {
  return CMB_TEMPERATURE_K / positive(scaleFactor, "Scale factor");
}

export type CosmicEraLabel = "extremely-early-universe" | "early-hot-universe" | "ionized-universe" | "transparent-universe" | "modern-cold-universe";

export function cosmicEraFromTemperature(temperatureK: number): CosmicEraLabel {
  const temperature = positive(temperatureK, "Temperature");
  if (temperature > 1e9) return "extremely-early-universe";
  if (temperature > 1e6) return "early-hot-universe";
  if (temperature > 3000) return "ionized-universe";
  if (temperature > 10) return "transparent-universe";
  return "modern-cold-universe";
}

export function calculateLookbackFraction(redshift: number): number {
  const z = finite(redshift, "Redshift");
  if (z < 0) throw new Error("Redshift must not be negative");
  return z / (z + 1);
}

export function spacetimeInterval(dtSeconds: number, dxMeters: number, dyMeters: number, dzMeters: number): number {
  const dt = finite(dtSeconds, "Time interval");
  const dx = finite(dxMeters, "X interval");
  const dy = finite(dyMeters, "Y interval");
  const dz = finite(dzMeters, "Z interval");
  return (COSMOLOGY.speedOfLight * dt) ** 2 - dx ** 2 - dy ** 2 - dz ** 2;
}

export interface LightConePoint { timeSeconds: number; distanceMeters: number }

export function generateLightCone(timeMaxSeconds: number, samples = 24): LightConePoint[] {
  const maxTime = nonNegative(timeMaxSeconds, "Maximum time");
  const safeSamples = Math.max(2, Math.min(200, Math.floor(samples)));
  return Array.from({ length: safeSamples }, (_, index) => {
    const timeSeconds = (index / (safeSamples - 1)) * maxTime;
    return { timeSeconds, distanceMeters: COSMOLOGY.speedOfLight * timeSeconds };
  });
}

export function lorentzFactorBeta(beta: number): number {
  const value = finite(beta, "Beta");
  if (value < 0 || value >= 1) throw new Error("Beta must be between 0 and 1");
  return 1 / Math.sqrt(1 - value ** 2);
}

export function relativisticMomentumBeta(massKg: number, beta: number): number {
  return lorentzFactorBeta(beta) * positive(massKg, "Mass") * beta * COSMOLOGY.speedOfLight;
}

export function relativisticEnergyBeta(massKg: number, beta: number): number {
  return lorentzFactorBeta(beta) * positive(massKg, "Mass") * COSMOLOGY.speedOfLight ** 2;
}
