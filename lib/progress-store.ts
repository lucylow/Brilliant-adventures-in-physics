import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "physicaai.learning.v2";
const DRAFT_KEY = "physicaai.drafts.v1";

export type TopicMastery = { attempts: number; correct: number; hints: number; confidenceTotal: number };
export type LearningState = { attempts: number; correct: number; lastTopic?: string; savedQuestions: string[]; topics: Record<string, TopicMastery>; lastStudyDate?: string; streak: number; lessonsCompleted: number; labsCompleted: number };
export type SessionDraft<T> = { id: string; data: T; updatedAt: number };
const EMPTY: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 };

export async function loadLearningState(): Promise<LearningState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<LearningState>;
    return { ...EMPTY, ...parsed, topics: parsed.topics && typeof parsed.topics === "object" ? parsed.topics : {}, savedQuestions: Array.isArray(parsed.savedQuestions) ? parsed.savedQuestions : [] };
  } catch { return EMPTY; }
}

export async function recordAttempt(correct: boolean, topic: string, hints = 0, confidence = 3): Promise<LearningState> {
  const current = await loadLearningState();
  const today = new Date().toISOString().slice(0, 10);
  const previousTopic = current.topics[topic] ?? { attempts: 0, correct: 0, hints: 0, confidenceTotal: 0 };
  const sameDay = current.lastStudyDate === today;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const next = { ...current, attempts: current.attempts + 1, correct: current.correct + (correct ? 1 : 0), lastTopic: topic, lastStudyDate: today, streak: sameDay ? current.streak : current.lastStudyDate === yesterday ? current.streak + 1 : 1, topics: { ...current.topics, [topic]: { attempts: previousTopic.attempts + 1, correct: previousTopic.correct + (correct ? 1 : 0), hints: previousTopic.hints + hints, confidenceTotal: previousTopic.confidenceTotal + confidence } } };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

async function updateLearning(update: (state: LearningState) => LearningState): Promise<LearningState> { const next = update(await loadLearningState()); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; }
export async function recordLessonCompletion(): Promise<LearningState> { return updateLearning((state) => ({ ...state, lessonsCompleted: state.lessonsCompleted + 1 })); }
export async function recordLabCompletion(): Promise<LearningState> { return updateLearning((state) => ({ ...state, labsCompleted: state.labsCompleted + 1 })); }
export async function saveQuestion(question: string): Promise<LearningState> { return updateLearning((current) => ({ ...current, savedQuestions: current.savedQuestions.includes(question) ? current.savedQuestions : [...current.savedQuestions, question] })); }
export async function saveDraft<T>(draft: SessionDraft<T>): Promise<void> { const raw = await AsyncStorage.getItem(DRAFT_KEY); const drafts = raw ? JSON.parse(raw) as Record<string, SessionDraft<T>> : {}; drafts[draft.id] = draft; await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); }
export async function loadDraft<T>(id: string, maxAge = 86400000): Promise<SessionDraft<T> | null> { try { const raw = await AsyncStorage.getItem(DRAFT_KEY); const drafts = raw ? JSON.parse(raw) as Record<string, SessionDraft<T>> : {}; const draft = drafts[id]; if (!draft || Date.now() - draft.updatedAt >= maxAge) return null; return draft; } catch { return null; } }
export async function deleteDraft(id: string): Promise<void> { const raw = await AsyncStorage.getItem(DRAFT_KEY); const drafts = raw ? JSON.parse(raw) as Record<string, SessionDraft<unknown>> : {}; delete drafts[id]; await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); }
