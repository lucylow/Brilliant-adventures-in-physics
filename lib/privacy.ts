import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseLearningState, summarizeCompletionEvents } from "./progress-store";
import type { SupportedLocale } from "./locale";

const LEARNING_KEY = "physicaai.learning.v2";
const USAGE_KEY = "physicaai.usage.v1";
const DRAFT_KEY = "physicaai.drafts.v1";
const PRIVACY_ACTIVITY_KEY = "physicaai.privacy-activity.v1";
const MAX_PRIVACY_ACTIVITY_EVENTS = 50;
export const LOCAL_DATA_STORAGE_KEYS = [LEARNING_KEY, USAGE_KEY, DRAFT_KEY, PRIVACY_ACTIVITY_KEY, "physicaai.experiments.v1", "physicaai.autosave.queue.v1", "physicaai.autosave.last-save.v1", "physicaai.preferences.v1", "physicaai.onboarding.v1", "physicaai.astronomy-catalog.v1", "physicaai.quantum-catalog.v1", "physicaai.notebook.v1", "physicaai.adventure.v1", "physicaai.puzzle-evidence.v1", "physicaai.puzzle-evidence-resolved.v1", "physicaai.review-mastery.v1"] as const;

export type LocalDataSummary = { learningRecords: number; savedQuestions: number; savedExperiments: number; activeDrafts: number; completionEvents: number; lessonCompletions: number; labCompletions: number };
export type LocalDataSummaryLoadResult = { summary: LocalDataSummary; recovered: boolean; reason?: "malformed" | "unavailable" };
export type PrivacyActivityKind = "share" | "clear";
export type PrivacyActivityOutcome = "success" | "unavailable" | "failure";
export type PrivacyActivityEvent = { id: string; kind: PrivacyActivityKind; outcome: PrivacyActivityOutcome; occurredAt: string };

function emptyLocalDataSummary(): LocalDataSummary {
  return { learningRecords: 0, savedQuestions: 0, savedExperiments: 0, activeDrafts: 0, completionEvents: 0, lessonCompletions: 0, labCompletions: 0 };
}

async function readJsonForSummary(key: string): Promise<{ value: unknown; status: "missing" | "ok" | "malformed" | "unavailable" }> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return { value: null, status: "missing" };
    try { return { value: JSON.parse(raw) as unknown, status: "ok" }; } catch { return { value: null, status: "malformed" }; }
  } catch {
    return { value: null, status: "unavailable" };
  }
}

export async function getLocalDataSummaryWithStatus(): Promise<LocalDataSummaryLoadResult> {
  const [learningResult, experimentsResult, draftsResult] = await Promise.all([readJsonForSummary(LEARNING_KEY), readJsonForSummary("physicaai.experiments.v1"), readJsonForSummary(DRAFT_KEY)]);
  const results = [learningResult, experimentsResult, draftsResult];
  const unavailable = results.some((result) => result.status === "unavailable");
  if (unavailable) return { summary: emptyLocalDataSummary(), recovered: true, reason: "unavailable" };
  if (results.some((result) => result.status === "malformed")) return { summary: emptyLocalDataSummary(), recovered: true, reason: "malformed" };
  const invalidShape = (learningResult.status === "ok" && (!learningResult.value || typeof learningResult.value !== "object" || Array.isArray(learningResult.value))) || (experimentsResult.status === "ok" && !Array.isArray(experimentsResult.value)) || (draftsResult.status === "ok" && (!draftsResult.value || typeof draftsResult.value !== "object" || Array.isArray(draftsResult.value)));
  if (invalidShape) return { summary: emptyLocalDataSummary(), recovered: true, reason: "malformed" };
  const learning = parseLearningState(learningResult.value);
  const experiments = experimentsResult.value;
  const drafts = draftsResult.value;
  const completion = summarizeCompletionEvents(learning.completionEvents ?? []);
  return { summary: { learningRecords: learning.attempts, savedQuestions: learning.savedQuestions.length, savedExperiments: Array.isArray(experiments) ? experiments.length : 0, activeDrafts: drafts && typeof drafts === "object" && !Array.isArray(drafts) ? Object.keys(drafts).length : 0, completionEvents: completion.total, lessonCompletions: completion.lessons, labCompletions: completion.labs }, recovered: false };
}

export async function getLocalDataSummary(): Promise<LocalDataSummary> {
  return (await getLocalDataSummaryWithStatus()).summary;
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

export type PrivacyActivityLoadResult = { events: PrivacyActivityEvent[]; usedFallback: boolean; reason?: "malformed" | "unavailable" };

export async function loadPrivacyActivityWithStatus(): Promise<PrivacyActivityLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(PRIVACY_ACTIVITY_KEY);
    if (!raw) return { events: [], usedFallback: false };
    let parsed: unknown;
    try { parsed = JSON.parse(raw) as unknown; } catch { return { events: [], usedFallback: true, reason: "malformed" }; }
    if (!Array.isArray(parsed) || !parsed.every(isPrivacyActivityEvent)) return { events: [], usedFallback: true, reason: "malformed" };
    return { events: parsePrivacyActivityEvents(parsed), usedFallback: false };
  } catch {
    return { events: [], usedFallback: true, reason: "unavailable" };
  }
}

export async function loadPrivacyActivity(): Promise<PrivacyActivityEvent[]> {
  return (await loadPrivacyActivityWithStatus()).events;
}

export async function recordPrivacyActivity(kind: PrivacyActivityKind, outcome: PrivacyActivityOutcome, occurredAt = new Date().toISOString()): Promise<boolean> {
  if (Number.isNaN(Date.parse(occurredAt))) return false;
  try {
    const result = await loadPrivacyActivityWithStatus();
    if (result.usedFallback) return false;
    const current = result.events;
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
  const results = await Promise.allSettled(LOCAL_DATA_STORAGE_KEYS.map((key) => AsyncStorage.removeItem(key)));
  if (results.some((result) => result.status === "rejected")) throw new Error("Some local PhysicaAI data could not be cleared");
}
