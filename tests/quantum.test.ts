import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FALLBACK_QUANTUM_CATALOG, blochCoordinates, hydrogenTransitionEnergyEV, loadQuantumCatalog, measurementProbabilities, normalizeState, photonEnergy, photonFrequency, qubitProbabilities, transitionWavelengthNm, tunnelingProbability } from "../lib/quantum";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("quantum physics helpers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("computes photon and hydrogen spectrum quantities deterministically", () => {
    expect(photonFrequency(500e-9)).toBeCloseTo(599584916000000, -6);
    expect(photonEnergy(500e-9)).toBeCloseTo(3.972891714e-19, 27);
    const energy = hydrogenTransitionEnergyEV(1, 3, 2);
    expect(energy).toBeCloseTo(1.8896795833333333, 12);
    expect(transitionWavelengthNm(energy)).toBeCloseTo(656.1122823505145, 10);
  });

  it("normalizes states, probabilities, and Bloch coordinates", () => {
    const state = { amplitudes: [{ real: 1, imaginary: 0 }, { real: 1, imaginary: 0 }], labels: ["0", "1"] };
    expect(measurementProbabilities(state)[0]).toBeCloseTo(0.5, 12);
    expect(measurementProbabilities(state)[1]).toBeCloseTo(0.5, 12);
    expect(qubitProbabilities({ alpha: { real: 1, imaginary: 0 }, beta: { real: 1, imaginary: 0 } }).zero).toBeCloseTo(0.5, 12);
    expect(qubitProbabilities({ alpha: { real: 1, imaginary: 0 }, beta: { real: 1, imaginary: 0 } }).one).toBeCloseTo(0.5, 12);
    expect(blochCoordinates({ alpha: { real: 1, imaginary: 0 }, beta: { real: 0, imaginary: 0 } }).z).toBe(1);
    expect(() => normalizeState([])).toThrow("must contain amplitudes");
  });

  it("keeps tunneling bounded and rejects invalid physical domains", () => {
    expect(tunnelingProbability(1, 2, 1)).toBe(1);
    expect(tunnelingProbability(2, 1, 1)).toBeGreaterThanOrEqual(0);
    expect(tunnelingProbability(2, 1, 1)).toBeLessThanOrEqual(1);
    expect(() => photonEnergy(0)).toThrow("greater than zero");
    expect(() => tunnelingProbability(2, 1, 0)).toThrow("greater than zero");
  });

  it("uses a labeled offline quantum catalog when storage is unavailable or malformed", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error("offline"));
    await expect(loadQuantumCatalog()).resolves.toMatchObject({ catalog: FALLBACK_QUANTUM_CATALOG, usedFallback: true, reason: "unavailable" });
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify({ concepts: [] }));
    await expect(loadQuantumCatalog()).resolves.toMatchObject({ catalog: FALLBACK_QUANTUM_CATALOG, usedFallback: true, reason: "malformed" });
  });
});
