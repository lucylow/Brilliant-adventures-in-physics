import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "physicaai.learning.v2";
const DRAFT_KEY = "physicaai.drafts.v1";

export type TopicMastery = { attempts: number; correct: number; hints: number; confidenceTotal: number };
export type CompletionEvent = { id: string; kind: "lesson" | "lab"; contentId: string; topic: string; completedAt: string };
export type CompletionOptions = { contentId: string; topic: string; completedAt?: string };
export type LearningState = { attempts: number; correct: number; lastTopic?: string; savedQuestions: string[]; topics: Record<string, TopicMastery>; lastStudyDate?: string; streak: number; lessonsCompleted: number; labsCompleted: number; completionEvents?: CompletionEvent[] };
export type SessionDraft<T> = { id: string; data: T; updatedAt: number };
const EMPTY: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0, completionEvents: [] };

const finiteNonNegative = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

function normalizedCompletionIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function parseCompletionEvent(value: unknown): CompletionEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Partial<CompletionEvent>;
  if (typeof event.id !== "string" || event.id.length === 0 || (event.kind !== "lesson" && event.kind !== "lab") || typeof event.topic !== "string" || event.topic.length === 0 || typeof event.completedAt !== "string" || Number.isNaN(Date.parse(event.completedAt))) return null;
  const legacyId = event.id.startsWith(`${event.kind}:`) ? event.id.slice(event.kind.length + 1) : event.topic;
  const contentId = typeof event.contentId === "string" ? normalizedCompletionIdentifier(event.contentId) : normalizedCompletionIdentifier(legacyId);
  const topic = normalizedCompletionIdentifier(event.topic);
  if (!contentId || !topic) return null;
  return { id: event.id, kind: event.kind, contentId, topic, completedAt: event.completedAt };
}

export function parseCompletionEvents(value: unknown): CompletionEvent[] {
  if (!Array.isArray(value)) return [];
  const unique = new Map<string, CompletionEvent>();
  for (const item of value) {
    const event = parseCompletionEvent(item);
    if (event && !unique.has(event.id)) unique.set(event.id, event);
  }
  return [...unique.values()].slice(-200);
}

export function summarizeCompletionEvents(events: readonly CompletionEvent[]) {
  const valid = parseCompletionEvents(events);
  return {
    total: valid.length,
    lessons: valid.filter((event) => event.kind === "lesson").length,
    labs: valid.filter((event) => event.kind === "lab").length,
    topics: [...new Set(valid.map((event) => event.topic))].sort(),
  };
}

export type CompletionEventFilter = "all" | CompletionEvent["kind"];

export function completionTimelineEntries(events: readonly CompletionEvent[], filter: CompletionEventFilter = "all", limit = 10): CompletionEvent[] {
  const safeLimit = Math.max(0, Math.min(50, Math.floor(limit)));
  return parseCompletionEvents(events)
    .filter((event) => filter === "all" || event.kind === filter)
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt) || right.id.localeCompare(left.id))
    .slice(0, safeLimit);
}

export function formatCompletionDate(value: string, locale: string = "en"): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "—";
  const languageTag = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";
  return new Intl.DateTimeFormat(languageTag, { dateStyle: "medium" }).format(new Date(timestamp));
}

function normalizedCompletionTopic(topic: string): string {
  return topic.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function parseLearningState(value: unknown): LearningState {
  if (!value || typeof value !== "object") return { ...EMPTY, topics: {} };
  const input = value as Partial<LearningState>;
  const topics: Record<string, TopicMastery> = {};
  if (input.topics && typeof input.topics === "object") {
    for (const [topic, raw] of Object.entries(input.topics)) {
      if (!raw || typeof raw !== "object") continue;
      const mastery = raw as Partial<TopicMastery>;
      if (finiteNonNegative(mastery.attempts) && finiteNonNegative(mastery.correct) && finiteNonNegative(mastery.hints) && finiteNonNegative(mastery.confidenceTotal)) topics[topic] = { attempts: mastery.attempts, correct: Math.min(mastery.correct, mastery.attempts), hints: mastery.hints, confidenceTotal: mastery.confidenceTotal };
    }
  }
  return { attempts: finiteNonNegative(input.attempts) ? input.attempts : 0, correct: finiteNonNegative(input.correct) ? Math.min(input.correct, finiteNonNegative(input.attempts) ? input.attempts : 0) : 0, lastTopic: typeof input.lastTopic === "string" ? input.lastTopic : undefined, savedQuestions: Array.isArray(input.savedQuestions) ? input.savedQuestions.filter((item): item is string => typeof item === "string").slice(0, 100) : [], topics, lastStudyDate: typeof input.lastStudyDate === "string" ? input.lastStudyDate : undefined, streak: finiteNonNegative(input.streak) ? input.streak : 0, lessonsCompleted: finiteNonNegative(input.lessonsCompleted) ? input.lessonsCompleted : 0, labsCompleted: finiteNonNegative(input.labsCompleted) ? input.labsCompleted : 0, completionEvents: parseCompletionEvents(input.completionEvents) };
}

export function isValidDraft<T>(value: unknown): value is SessionDraft<T> {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<SessionDraft<T>>;
  return typeof draft.id === "string" && draft.id.length > 0 && typeof draft.updatedAt === "number" && Number.isFinite(draft.updatedAt) && draft.updatedAt > 0 && "data" in draft;
}

export type LearningLoadResult = { state: LearningState; recovered: boolean; reason?: "malformed" | "unavailable" };

export async function loadLearningStateWithStatus(): Promise<LearningLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: { ...EMPTY, savedQuestions: [], topics: {}, completionEvents: [] }, recovered: false };
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return { state: { ...EMPTY, savedQuestions: [], topics: {}, completionEvents: [] }, recovered: true, reason: "malformed" };
    }
    if (!parsed || typeof parsed !== "object") return { state: { ...EMPTY, savedQuestions: [], topics: {}, completionEvents: [] }, recovered: true, reason: "malformed" };
    return { state: parseLearningState(parsed), recovered: false };
  } catch {
    return { state: { ...EMPTY, savedQuestions: [], topics: {}, completionEvents: [] }, recovered: true, reason: "unavailable" };
  }
}

export async function loadLearningState(): Promise<LearningState> {
  return (await loadLearningStateWithStatus()).state;
}

export async function recordAttempt(correct: boolean, topic: string, hints = 0, confidence = 3): Promise<LearningState> {
  const result = await loadLearningStateWithStatus();
  if (result.recovered) throw new Error(`learning storage ${result.reason ?? "unavailable"}`);
  const current = result.state;
  const today = new Date().toISOString().slice(0, 10);
  const previousTopic = current.topics[topic] ?? { attempts: 0, correct: 0, hints: 0, confidenceTotal: 0 };
  const sameDay = current.lastStudyDate === today;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const next = { ...current, attempts: current.attempts + 1, correct: current.correct + (correct ? 1 : 0), lastTopic: topic, lastStudyDate: today, streak: sameDay ? current.streak : current.lastStudyDate === yesterday ? current.streak + 1 : 1, topics: { ...current.topics, [topic]: { attempts: previousTopic.attempts + 1, correct: previousTopic.correct + (correct ? 1 : 0), hints: previousTopic.hints + hints, confidenceTotal: previousTopic.confidenceTotal + confidence } } };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

async function updateLearning(update: (state: LearningState) => LearningState): Promise<LearningState> { const result = await loadLearningStateWithStatus(); if (result.recovered) throw new Error(`learning storage ${result.reason ?? "unavailable"}`); const next = update(result.state); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; }

function recordCompletion(kind: CompletionEvent["kind"], contentId: string, topic: string, completedAt: string): Promise<LearningState> {
  const safeContentId = normalizedCompletionIdentifier(contentId);
  const safeTopic = normalizedCompletionTopic(topic);
  const eventId = `${kind}:${safeContentId}`;
  const safeDate = !Number.isNaN(Date.parse(completedAt)) ? completedAt : new Date(0).toISOString();
  return updateLearning((state) => {
    const events = state.completionEvents ?? [];
    if (!safeContentId || !safeTopic || events.some((event) => event.id === eventId)) return state;
    const event: CompletionEvent = { id: eventId, kind, contentId: safeContentId, topic: safeTopic, completedAt: safeDate };
    return { ...state, lessonsCompleted: kind === "lesson" ? state.lessonsCompleted + 1 : state.lessonsCompleted, labsCompleted: kind === "lab" ? state.labsCompleted + 1 : state.labsCompleted, completionEvents: [...events, event].slice(-200) };
  });
}

export async function recordLessonCompletion(input: string | CompletionOptions = "projectile-motion", completedAt = new Date().toISOString()): Promise<LearningState> {
  const details = typeof input === "string" ? { contentId: input, topic: input, completedAt } : { contentId: input.contentId, topic: input.topic, completedAt: input.completedAt ?? completedAt };
  return recordCompletion("lesson", details.contentId, details.topic, details.completedAt);
}
export async function recordLabCompletion(input: string | CompletionOptions = "projectile-motion", completedAt = new Date().toISOString()): Promise<LearningState> {
  const details = typeof input === "string" ? { contentId: input, topic: input, completedAt } : { contentId: input.contentId, topic: input.topic, completedAt: input.completedAt ?? completedAt };
  return recordCompletion("lab", details.contentId, details.topic, details.completedAt);
}
export async function saveQuestion(question: string): Promise<LearningState> { return updateLearning((current) => ({ ...current, savedQuestions: current.savedQuestions.includes(question) ? current.savedQuestions : [...current.savedQuestions, question] })); }
export async function saveDraft<T>(draft: SessionDraft<T>): Promise<void> { const raw = await AsyncStorage.getItem(DRAFT_KEY); if (!raw) { await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ [draft.id]: draft })); return; } let parsed: unknown; try { parsed = JSON.parse(raw) as unknown; } catch { throw new Error("draft storage is malformed"); } if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("draft storage is malformed"); const drafts = parsed as Record<string, SessionDraft<T>>; drafts[draft.id] = draft; await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); }
export type DraftLoadResult<T> = { draft: SessionDraft<T> | null; recovered: boolean; reason?: "malformed" | "unavailable" };
export async function loadDraftWithStatus<T>(id: string, maxAge = 86400000): Promise<DraftLoadResult<T>> { try { const raw = await AsyncStorage.getItem(DRAFT_KEY); if (!raw) return { draft: null, recovered: false }; let parsed: unknown; try { parsed = JSON.parse(raw) as unknown; } catch { return { draft: null, recovered: true, reason: "malformed" }; } if (!parsed || typeof parsed !== "object") return { draft: null, recovered: true, reason: "malformed" }; const drafts = parsed as Record<string, unknown>; const draft = drafts[id]; if (!isValidDraft<T>(draft)) return Object.prototype.hasOwnProperty.call(drafts, id) ? { draft: null, recovered: true, reason: "malformed" } : { draft: null, recovered: false }; if (Date.now() - draft.updatedAt >= maxAge) return { draft: null, recovered: false }; return { draft, recovered: false }; } catch { return { draft: null, recovered: true, reason: "unavailable" }; } }
export async function loadDraft<T>(id: string, maxAge = 86400000): Promise<SessionDraft<T> | null> { return (await loadDraftWithStatus<T>(id, maxAge)).draft; }
export async function deleteDraft(id: string): Promise<void> { const raw = await AsyncStorage.getItem(DRAFT_KEY); if (!raw) return; let parsed: unknown; try { parsed = JSON.parse(raw) as unknown; } catch { throw new Error("draft storage is malformed"); } if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("draft storage is malformed"); const drafts = parsed as Record<string, SessionDraft<unknown>>; delete drafts[id]; await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); }
