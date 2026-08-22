import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "physicaai.learning.v1";

export type LearningState = {
  attempts: number;
  correct: number;
  lastTopic?: string;
  savedQuestions: string[];
};

const EMPTY: LearningState = { attempts: 0, correct: 0, savedQuestions: [] };

export async function loadLearningState(): Promise<LearningState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<LearningState>;
    return { ...EMPTY, ...parsed, savedQuestions: Array.isArray(parsed.savedQuestions) ? parsed.savedQuestions : [] };
  } catch {
    return EMPTY;
  }
}

export async function recordAttempt(correct: boolean, topic: string): Promise<LearningState> {
  const current = await loadLearningState();
  const next = { ...current, attempts: current.attempts + 1, correct: current.correct + (correct ? 1 : 0), lastTopic: topic };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function saveQuestion(question: string): Promise<LearningState> {
  const current = await loadLearningState();
  const savedQuestions = current.savedQuestions.includes(question) ? current.savedQuestions : [...current.savedQuestions, question];
  const next = { ...current, savedQuestions };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
