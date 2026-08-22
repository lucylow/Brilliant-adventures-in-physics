import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearExperiments } from "@/lib/experiments";

const LEARNING_KEY = "physicaai.learning.v2";
const USAGE_KEY = "physicaai.usage.v1";
const DRAFT_KEY = "physicaai.drafts.v1";

export type LocalDataSummary = { learningRecords: number; savedQuestions: number; savedExperiments: number; activeDrafts: number };

export async function getLocalDataSummary(): Promise<LocalDataSummary> {
  const [learningRaw, experimentsRaw, draftsRaw] = await Promise.all([AsyncStorage.getItem(LEARNING_KEY), AsyncStorage.getItem("physicaai.experiments.v1"), AsyncStorage.getItem(DRAFT_KEY)]);
  const learning = learningRaw ? JSON.parse(learningRaw) as { attempts?: number; savedQuestions?: string[] } : {};
  const experiments = experimentsRaw ? JSON.parse(experimentsRaw) : [];
  const drafts = draftsRaw ? JSON.parse(draftsRaw) : {};
  return { learningRecords: Number(learning.attempts) || 0, savedQuestions: Array.isArray(learning.savedQuestions) ? learning.savedQuestions.length : 0, savedExperiments: Array.isArray(experiments) ? experiments.length : 0, activeDrafts: drafts && typeof drafts === "object" ? Object.keys(drafts).length : 0 };
}

export async function clearAllLocalData(): Promise<void> {
  await Promise.all([AsyncStorage.removeItem(LEARNING_KEY), AsyncStorage.removeItem(USAGE_KEY), AsyncStorage.removeItem(DRAFT_KEY), clearExperiments()]);
}
