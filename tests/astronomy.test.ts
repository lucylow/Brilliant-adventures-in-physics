import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASTRONOMY_STORAGE_KEY, FALLBACK_ASTRONOMY_CATALOG, calculateEscapeVelocity, calculateGravity, keplerPeriodYears, loadAstronomyCatalog, parseAstronomyCatalog, peakWavelength, photonEnergy, stellarLuminosityRelative } from "../lib/astronomy";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: vi.fn(), setItem: vi.fn() },
}));

describe("astronomy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calculates deterministic stellar and orbital values", () => {
    expect(stellarLuminosityRelative(1, 5772)).toBeCloseTo(1, 8);
    expect(peakWavelength(5772)).toBeCloseTo(5.020e-7, 10);
    expect(photonEnergy(5e-7)).toBeCloseTo(3.9728917e-19, 25);
    expect(keplerPeriodYears(1)).toBe(1);
    expect(calculateGravity(5.9722e24, 6.371e6)).toBeCloseTo(9.820, 2);
    expect(calculateEscapeVelocity(5.9722e24, 6.371e6)).toBeCloseTo(11186, 0);
  });

  it("rejects invalid physical inputs", () => {
    expect(() => peakWavelength(0)).toThrow();
    expect(() => photonEnergy(-1)).toThrow();
    expect(() => keplerPeriodYears(0)).toThrow();
    expect(() => calculateGravity(Number.NaN, 1)).toThrow();
  });

  it("parses a bounded catalog and rejects malformed records", () => {
    expect(parseAstronomyCatalog(FALLBACK_ASTRONOMY_CATALOG)?.stars).toHaveLength(2);
    expect(parseAstronomyCatalog({ stars: [{ id: "bad", type: "star" }], planets: [] })).toBeNull();
  });

  it("uses a clearly labeled offline fallback for missing or malformed storage", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null).mockResolvedValueOnce("{");
    await expect(loadAstronomyCatalog()).resolves.toEqual({ catalog: FALLBACK_ASTRONOMY_CATALOG, usedFallback: true });
    await expect(loadAstronomyCatalog()).resolves.toEqual({ catalog: FALLBACK_ASTRONOMY_CATALOG, usedFallback: true, reason: "malformed" });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(ASTRONOMY_STORAGE_KEY);
  });
});
