import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearExperiments } from "./experiments";
import { clearRetryQueue } from "./retry-queue";
import { parseLearningState, summarizeCompletionEvents } from "./progress-store";
import type { SupportedLocale } from "./locale";

const LEARNING_KEY = "physicaai.learning.v2";
const USAGE_KEY = "physicaai.usage.v1";
const DRAFT_KEY = "physicaai.drafts.v1";
const PRIVACY_ACTIVITY_KEY = "physicaai.privacy-activity.v1";
const MAX_PRIVACY_ACTIVITY_EVENTS = 50;
export const LOCAL_DATA_STORAGE_KEYS = [LEARNING_KEY, USAGE_KEY, DRAFT_KEY, PRIVACY_ACTIVITY_KEY, "physicaai.experiments.v1", "physicaai.autosave.queue.v1", "physicaai.autosave.last-save.v1"] as const;

export type LocalDataSummary = { learningRecords: number; savedQuestions: number; savedExperiments: number; activeDrafts: number; completionEvents: number; lessonCompletions: number; labCompletions: number };
export type PrivacyActivityKind = "share" | "clear";
export type PrivacyActivityOutcome = "success" | "unavailable" | "failure";
export type PrivacyActivityEvent = { id: string; kind: PrivacyActivityKind; outcome: PrivacyActivityOutcome; occurredAt: string };

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

export const LOCAL_SUMMARY_FILE_NAME = "physicaai-local-summary.txt";

export function buildLocalDataShareText(summary: LocalDataSummary): string {
  return formatLocalDataSummary(summary);
}

export function localSummaryFileUri(directory: string | null): string | null {
  return directory ? `${directory}${LOCAL_SUMMARY_FILE_NAME}` : null;
}

function isPrivacyActivityEvent(value: unknown): value is PrivacyActivityEvent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PrivacyActivityEvent>;
  return typeof item.id === "string" && item.id.length > 0 && item.id.length <= 128 && (item.kind === "share" || item.kind === "clear") && (item.outcome === "success" || item.outcome === "unavailable" || item.outcome === "failure") && typeof item.occurredAt === "string" && item.occurredAt.length <= 64 && !Number.isNaN(Date.parse(item.occurredAt));
}

export function parsePrivacyActivityEvents(value: unknown): PrivacyActivityEvent[] {
  if (!Array.isArray(value)) return [];
  const unique = new Map<string, PrivacyActivityEvent>();
  for (const item of value) {
    if (isPrivacyActivityEvent(item) && !unique.has(item.id)) {
      unique.set(item.id, { id: item.id, kind: item.kind, outcome: item.outcome, occurredAt: item.occurredAt });
    }
  }
  return [...unique.values()].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || b.id.localeCompare(a.id)).slice(0, MAX_PRIVACY_ACTIVITY_EVENTS);
}

export async function loadPrivacyActivity(): Promise<PrivacyActivityEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(PRIVACY_ACTIVITY_KEY);
    return parsePrivacyActivityEvents(parseJson<unknown>(raw, []));
  } catch {
    return [];
  }
}

export async function recordPrivacyActivity(kind: PrivacyActivityKind, outcome: PrivacyActivityOutcome, occurredAt = new Date().toISOString()): Promise<boolean> {
  if (Number.isNaN(Date.parse(occurredAt))) return false;
  try {
    const current = await loadPrivacyActivity();
    const id = `${kind}:${occurredAt}`;
    if (current.some((item) => item.id === id)) return false;
    const event: PrivacyActivityEvent = { id, kind, outcome, occurredAt };
    await AsyncStorage.setItem(PRIVACY_ACTIVITY_KEY, JSON.stringify(parsePrivacyActivityEvents([event, ...current])));
    return true;
  } catch {
    return false;
  }
}

export function formatPrivacyActivityTimestamp(occurredAt: string, locale: SupportedLocale): string {
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) return occurredAt;
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date);
  } catch {
    return date.toISOString();
  }
}

export async function clearAllLocalData(): Promise<void> {
  await Promise.all([AsyncStorage.removeItem(LEARNING_KEY), AsyncStorage.removeItem(USAGE_KEY), AsyncStorage.removeItem(DRAFT_KEY), clearExperiments(), clearRetryQueue()]);
}
