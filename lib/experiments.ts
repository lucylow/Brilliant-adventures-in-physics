import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "physicaai.experiments.v1";

export type ExperimentPoint = { time: number; distance: number };
export type SavedExperiment = { id: string; title: string; points: ExperimentPoint[]; summary: string; createdAt: string };

export function isSavedExperiment(value: unknown): value is SavedExperiment {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SavedExperiment>;
  return typeof item.id === "string" && typeof item.title === "string" && typeof item.summary === "string" && typeof item.createdAt === "string" && Array.isArray(item.points) && item.points.every((point) => Boolean(point && Number.isFinite(point.time) && Number.isFinite(point.distance)));
}

export function parseSavedExperiments(value: unknown): SavedExperiment[] {
  return Array.isArray(value) ? value.filter(isSavedExperiment).slice(0, 25) : [];
}

export async function loadExperiments(): Promise<SavedExperiment[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return parseSavedExperiments(parsed);
  } catch {
    return [];
  }
}

export async function saveExperiment(experiment: Omit<SavedExperiment, "id" | "createdAt">): Promise<SavedExperiment> {
  if (!experiment.title.trim() || !experiment.summary.trim() || !experiment.points.length || !experiment.points.every((point) => Number.isFinite(point.time) && Number.isFinite(point.distance))) throw new Error("Experiment data is invalid");
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
