import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearExperiments } from "./experiments";
import { clearRetryQueue } from "./retry-queue";
import { parseLearningState, summarizeCompletionEvents } from "./progress-store";

const LEARNING_KEY = "physicaai.learning.v2";
const USAGE_KEY = "physicaai.usage.v1";
const DRAFT_KEY = "physicaai.drafts.v1";
export const LOCAL_DATA_STORAGE_KEYS = [LEARNING_KEY, USAGE_KEY, DRAFT_KEY, "physicaai.experiments.v1", "physicaai.autosave.queue.v1", "physicaai.autosave.last-save.v1"] as const;

export type LocalDataSummary = { learningRecords: number; savedQuestions: number; savedExperiments: number; activeDrafts: number; completionEvents: number; lessonCompletions: number; labCompletions: number };

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getLocalDataSummary(): Promise<LocalDataSummary> {
  const [learningRaw, experimentsRaw, draftsRaw] = await Promise.all([AsyncStorage.getItem(LEARNING_KEY), AsyncStorage.getItem("physicaai.experiments.v1"), AsyncStorage.getItem(DRAFT_KEY)]);
  const learning = parseLearningState(parseJson<unknown>(learningRaw, null));
  const experiments = parseJson<unknown>(experimentsRaw, []);
  const drafts = parseJson<unknown>(draftsRaw, {});
  const completion = summarizeCompletionEvents(learning.completionEvents ?? []);
  return { learningRecords: learning.attempts, savedQuestions: learning.savedQuestions.length, savedExperiments: Array.isArray(experiments) ? experiments.length : 0, activeDrafts: drafts && typeof drafts === "object" ? Object.keys(drafts).length : 0, completionEvents: completion.total, lessonCompletions: completion.lessons, labCompletions: completion.labs };
}

export function formatLocalDataSummary(summary: LocalDataSummary): string {
  return ["PhysicaAI local data summary", `Practice attempts: ${summary.learningRecords}`, `Saved questions: ${summary.savedQuestions}`, `Saved experiments: ${summary.savedExperiments}`, `Active drafts: ${summary.activeDrafts}`, `Completion events: ${summary.completionEvents}`, `Lessons completed: ${summary.lessonCompletions}`, `Labs completed: ${summary.labCompletions}`].join("\n");
}

export async function clearAllLocalData(): Promise<void> {
  await Promise.all([AsyncStorage.removeItem(LEARNING_KEY), AsyncStorage.removeItem(USAGE_KEY), AsyncStorage.removeItem(DRAFT_KEY), clearExperiments(), clearRetryQueue()]);
}
