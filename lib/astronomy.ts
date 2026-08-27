import AsyncStorage from "@react-native-async-storage/async-storage";

export type CelestialType = "star" | "planet" | "moon" | "galaxy" | "nebula";
export type SpectralClass = "O" | "B" | "A" | "F" | "G" | "K" | "M";

export interface CelestialObject {
  id: string;
  name: string;
  type: CelestialType;
  description: string;
}

export interface Star extends CelestialObject {
  type: "star";
  spectralClass: SpectralClass;
  temperatureK: number;
  luminositySolar: number;
  radiusSolar: number;
}

export interface Planet extends CelestialObject {
  type: "planet";
  orbitAU: number;
  periodDays: number;
  gravityMS2: number;
  axialTiltDeg: number;
}

export interface AstronomyCatalog {
  stars: Star[];
  planets: Planet[];
}

export interface AstronomyCatalogResult {
  catalog: AstronomyCatalog;
  usedFallback: boolean;
}

export const ASTRONOMY_STORAGE_KEY = "physicaai.astronomy-catalog.v1";
export const SPEED_OF_LIGHT = 299_792_458;
export const PLANCK_CONSTANT = 6.626_070_15e-34;
export const STEFAN_BOLTZMANN_SOLAR_TEMPERATURE = 5772;
export const ASTRONOMY_UNITS = { kmPerAU: 149_597_870.7, lightYearsPerParsec: 3.26156 } as const;

export const FALLBACK_ASTRONOMY_CATALOG: AstronomyCatalog = {
  stars: [
    { id: "sun", name: "Sun", type: "star", description: "A G-class main-sequence star used as the reference for stellar comparisons.", spectralClass: "G", temperatureK: 5772, luminositySolar: 1, radiusSolar: 1 },
    { id: "sirius", name: "Sirius", type: "star", description: "A bright A-class star for comparing temperature and luminosity.", spectralClass: "A", temperatureK: 9940, luminositySolar: 25.4, radiusSolar: 1.71 },
  ],
  planets: [
    { id: "earth", name: "Earth", type: "planet", description: "A rocky planet used for orbital and surface-gravity examples.", orbitAU: 1, periodDays: 365.25, gravityMS2: 9.80665, axialTiltDeg: 23.44 },
    { id: "mars", name: "Mars", type: "planet", description: "A rocky planet with a longer orbit and lower surface gravity than Earth.", orbitAU: 1.524, periodDays: 686.98, gravityMS2: 3.72076, axialTiltDeg: 25.19 },
  ],
};

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value;
}

function positive(value: number, label: string): number {
  finite(value, label);
  if (value <= 0) throw new Error(`${label} must be greater than zero`);
  return value;
}

export const SPECTRAL_TEMPERATURES: Record<SpectralClass, number> = { O: 35_000, B: 20_000, A: 9000, F: 7000, G: 5800, K: 4500, M: 3200 };

export function getStellarTemperature(spectralClass: SpectralClass): number {
  return SPECTRAL_TEMPERATURES[spectralClass];
}

export function stellarLuminosityRelative(radiusSolar: number, temperatureK: number, solarTemperature = STEFAN_BOLTZMANN_SOLAR_TEMPERATURE): number {
  positive(radiusSolar, "Radius");
  positive(temperatureK, "Temperature");
  positive(solarTemperature, "Solar temperature");
  return radiusSolar ** 2 * (temperatureK / solarTemperature) ** 4;
}

export function peakWavelength(temperatureK: number): number {
  return 2.897_771_955e-3 / positive(temperatureK, "Temperature");
}

export function photonEnergy(wavelengthMeters: number): number {
  return (PLANCK_CONSTANT * SPEED_OF_LIGHT) / positive(wavelengthMeters, "Wavelength");
}

export function calculateGravity(massKg: number, radiusMeters: number): number {
  return (6.674_30e-11 * positive(massKg, "Mass")) / positive(radiusMeters, "Radius") ** 2;
}

export function calculateEscapeVelocity(massKg: number, radiusMeters: number): number {
  return Math.sqrt((2 * 6.674_30e-11 * positive(massKg, "Mass")) / positive(radiusMeters, "Radius"));
}

export function keplerPeriodYears(semiMajorAxisAU: number): number {
  return positive(semiMajorAxisAU, "Semi-major axis") ** 1.5;
}

export function auToKm(au: number): number {
  return positive(au, "Astronomical units") * ASTRONOMY_UNITS.kmPerAU;
}

function isCatalog(value: unknown): value is AstronomyCatalog {
  if (!value || typeof value !== "object") return false;
  const catalog = value as Partial<AstronomyCatalog>;
  return Array.isArray(catalog.stars) && Array.isArray(catalog.planets) && catalog.stars.every((star) => typeof star?.id === "string" && star.id.length > 0 && star.type === "star" && typeof star.name === "string" && Number.isFinite(star.temperatureK) && Number.isFinite(star.luminositySolar) && Number.isFinite(star.radiusSolar)) && catalog.planets.every((planet) => typeof planet?.id === "string" && planet.id.length > 0 && planet.type === "planet" && typeof planet.name === "string" && Number.isFinite(planet.orbitAU) && Number.isFinite(planet.periodDays) && Number.isFinite(planet.gravityMS2) && Number.isFinite(planet.axialTiltDeg));
}

export function parseAstronomyCatalog(value: unknown): AstronomyCatalog | null {
  return isCatalog(value) ? { stars: value.stars.slice(0, 50), planets: value.planets.slice(0, 50) } : null;
}

export async function loadAstronomyCatalog(): Promise<AstronomyCatalogResult> {
  try {
    const raw = await AsyncStorage.getItem(ASTRONOMY_STORAGE_KEY);
    if (!raw) return { catalog: FALLBACK_ASTRONOMY_CATALOG, usedFallback: true };
    const parsed = parseAstronomyCatalog(JSON.parse(raw));
    return parsed ? { catalog: parsed, usedFallback: false } : { catalog: FALLBACK_ASTRONOMY_CATALOG, usedFallback: true };
  } catch {
    return { catalog: FALLBACK_ASTRONOMY_CATALOG, usedFallback: true };
  }
}

export class AstronomyCatalogService {
  constructor(private readonly catalog: AstronomyCatalog) {}
  getStar(id: string): Star | undefined { return this.catalog.stars.find((star) => star.id === id); }
  getPlanet(id: string): Planet | undefined { return this.catalog.planets.find((planet) => planet.id === id); }
}
