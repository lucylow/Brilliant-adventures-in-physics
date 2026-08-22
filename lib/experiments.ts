import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "physicaai.experiments.v1";

export type ExperimentPoint = { time: number; distance: number };
export type SavedExperiment = { id: string; title: string; points: ExperimentPoint[]; summary: string; createdAt: string };

export async function loadExperiments(): Promise<SavedExperiment[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveExperiment(experiment: Omit<SavedExperiment, "id" | "createdAt">): Promise<SavedExperiment> {
  const current = await loadExperiments();
  const next: SavedExperiment = { ...experiment, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...current].slice(0, 25)));
  return next;
}

export async function deleteExperiment(id: string): Promise<void> {
  const current = await loadExperiments();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((item) => item.id !== id)));
}

export async function clearExperiments(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
