import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_ASTRONOMY_CATALOG, loadAstronomyCatalog } from "../lib/astronomy";
import { loadNotebookEntriesWithStatus } from "../lib/notebook";
import { DEFAULT_PREFERENCES, loadPreferencesWithStatus } from "../lib/preferences";
import { FALLBACK_QUANTUM_CATALOG, loadQuantumCatalog } from "../lib/quantum";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn() } }));

describe("catalog and preference recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("not-json");
  });

  it("classifies malformed Astronomy and Quantum catalogs", async () => {
    await expect(loadAstronomyCatalog()).resolves.toEqual({ catalog: FALLBACK_ASTRONOMY_CATALOG, usedFallback: true, reason: "malformed" });
    await expect(loadQuantumCatalog()).resolves.toEqual({ catalog: FALLBACK_QUANTUM_CATALOG, usedFallback: true, reason: "malformed" });
  });

  it("classifies malformed Notebook and preference storage", async () => {
    await expect(loadNotebookEntriesWithStatus()).resolves.toMatchObject({ usedFallback: true, reason: "malformed" });
    await expect(loadPreferencesWithStatus()).resolves.toEqual({ preferences: DEFAULT_PREFERENCES, recovered: true, reason: "malformed" });
  });

  it("classifies unavailable storage without losing deterministic fallback data", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(loadAstronomyCatalog()).resolves.toMatchObject({ catalog: FALLBACK_ASTRONOMY_CATALOG, usedFallback: true, reason: "unavailable" });
    await expect(loadQuantumCatalog()).resolves.toMatchObject({ catalog: FALLBACK_QUANTUM_CATALOG, usedFallback: true, reason: "unavailable" });
    await expect(loadNotebookEntriesWithStatus()).resolves.toMatchObject({ usedFallback: true, reason: "unavailable" });
    await expect(loadPreferencesWithStatus()).resolves.toEqual({ preferences: DEFAULT_PREFERENCES, recovered: true, reason: "unavailable" });
  });
});
