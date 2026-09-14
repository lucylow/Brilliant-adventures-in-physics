import { isoDaysAgo } from "../../clock";
import { clone } from "../../utils/clone";
import { stableId } from "../../utils/ids";
import { CATALOG } from "../ai-catalog";
import type { LearnerEvent, LearnerModel, LearnerModelId, MemoryKind, MemoryRecord } from "./types";
import { applyLearnerEvent, getLearnerModel, resetLearnerModelCache } from "./learner-model";

const LEARNER_IDS: readonly LearnerModelId[] = [
  "beginner",
  "intermediate",
  "advanced",
  "exam",
  "visual",
  "simulation",
  "returning",
  "struggling",
  "high-performer",
];

function resolveLearner(userId: string): LearnerModel {
  return LEARNER_IDS.map((id) => getLearnerModel(id)).find((item) => item.userId === userId) ?? getLearnerModel("intermediate");
}

const store = new Map<string, MemoryRecord[]>();
const modelState = new Map<string, LearnerModel>();

function expiresFor(kind: MemoryKind): string {
  if (kind === "preference" || kind === "style") return isoDaysAgo(-90, 9);
  if (kind === "misconception") return isoDaysAgo(-30, 9);
  if (kind === "question" || kind === "recent-concept") return isoDaysAgo(-14, 9);
  return isoDaysAgo(-21, 9);
}

function seedFor(model: LearnerModel): MemoryRecord[] {
  const weak = [...model.knowledge].sort((a, b) => a.mastery - b.mastery)[0];
  const strong = [...model.knowledge].sort((a, b) => b.mastery - a.mastery)[0];
  const topic = CATALOG.find((item) => item.conceptId === weak.conceptId) ?? CATALOG[0];
  return [
    { id: stableId("mem", `${model.userId}-style`), userId: model.userId, kind: "style", text: model.preference.explanationStyle, createdAt: isoDaysAgo(3, 8), expiresAt: expiresFor("style"), weight: 0.9 },
    { id: stableId("mem", `${model.userId}-pref`), userId: model.userId, kind: "preference", text: `modality:${model.preference.modality};difficulty:${model.preference.problemDifficulty}`, createdAt: isoDaysAgo(3, 8), expiresAt: expiresFor("preference"), weight: 0.85 },
    { id: stableId("mem", `${model.userId}-weak`), userId: model.userId, kind: "misconception", conceptId: weak.conceptId, text: topic.misconception, createdAt: isoDaysAgo(2, 10), expiresAt: expiresFor("misconception"), weight: 0.8 },
    { id: stableId("mem", `${model.userId}-q`), userId: model.userId, kind: "question", conceptId: weak.conceptId, text: topic.starters[0] ?? topic.title, createdAt: isoDaysAgo(1, 12), expiresAt: expiresFor("question"), weight: 0.6 },
    { id: stableId("mem", `${model.userId}-ok`), userId: model.userId, kind: "success", conceptId: strong.conceptId, text: `Verified practice on ${strong.conceptId}`, createdAt: isoDaysAgo(1, 14), expiresAt: expiresFor("success"), weight: 0.5 },
    { id: stableId("mem", `${model.userId}-fail`), userId: model.userId, kind: "failure", conceptId: weak.conceptId, text: topic.commonMistake, createdAt: isoDaysAgo(1, 11), expiresAt: expiresFor("failure"), weight: 0.7 },
    { id: stableId("mem", `${model.userId}-exp`), userId: model.userId, kind: "explanation", conceptId: weak.conceptId, text: topic.oneSentence, createdAt: isoDaysAgo(4, 9), expiresAt: expiresFor("explanation"), weight: 0.45 },
    { id: stableId("mem", `${model.userId}-rc`), userId: model.userId, kind: "recent-concept", conceptId: weak.conceptId, text: weak.conceptId, createdAt: isoDaysAgo(0, 16), expiresAt: expiresFor("recent-concept"), weight: 0.75 },
  ];
}

export function getLongTermMemory(userId: string): MemoryRecord[] {
  const existing = store.get(userId);
  if (existing) return clone(existing);
  const model = resolveLearner(userId);
  const seeded = seedFor({ ...model, userId });
  store.set(userId, seeded);
  return clone(seeded);
}

function live(userId: string): MemoryRecord[] {
  return getLongTermMemory(userId);
}

export function retrieveRelevantMemory(userId: string, conceptId: string, limit = 4): MemoryRecord[] {
  return live(userId)
    .filter((item) => item.conceptId === conceptId || item.kind === "style" || item.kind === "preference")
    .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function retrieveRecentMemory(userId: string, limit = 5): MemoryRecord[] {
  return live(userId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function retrieveConceptMemory(userId: string, conceptId: string): MemoryRecord[] {
  return live(userId).filter((item) => item.conceptId === conceptId);
}

export function retrieveMistakeMemory(userId: string): MemoryRecord[] {
  return live(userId).filter((item) => item.kind === "misconception" || item.kind === "failure");
}

export function retrievePreferenceMemory(userId: string): MemoryRecord[] {
  return live(userId).filter((item) => item.kind === "preference" || item.kind === "style");
}

export function rememberMemory(record: Omit<MemoryRecord, "id" | "createdAt" | "expiresAt"> & { id?: string }): MemoryRecord {
  const full: MemoryRecord = {
    ...record,
    id: record.id ?? stableId("mem", `${record.userId}-${record.kind}-${record.text.slice(0, 24)}`),
    createdAt: isoDaysAgo(0, 12),
    expiresAt: expiresFor(record.kind),
  };
  const next = [full, ...live(record.userId).filter((item) => item.id !== full.id)].slice(0, 40);
  store.set(record.userId, next);
  return full;
}

export function processMemoryEvent(event: LearnerEvent): LearnerModel {
  const current = modelState.get(event.userId) ?? resolveLearner(event.userId);
  const aligned = current.userId === event.userId ? current : { ...current, userId: event.userId };
  const next = applyLearnerEvent(aligned, event);
  modelState.set(event.userId, next);
  const kind: MemoryKind =
    event.kind === "problem-failure" ? "failure"
      : event.kind === "problem-success" ? "success"
        : event.kind === "hint-request" ? "question"
          : "recent-concept";
  rememberMemory({ userId: event.userId, kind, conceptId: event.conceptId, text: `${event.kind} on ${event.conceptId}`, weight: 0.55 });
  return next;
}

export function getTrackedLearner(userId: string): LearnerModel {
  getLongTermMemory(userId);
  return modelState.get(userId) ?? resolveLearner(userId);
}

export function resetAIMemory(): void {
  store.clear();
  modelState.clear();
}

export function resetAIUserState(): void {
  resetAIMemory();
  resetLearnerModelCache();
}

export function seedExpansionMemories(): void {
  LEARNER_IDS.forEach((id) => {
    getLongTermMemory(getLearnerModel(id).userId);
  });
}

export function memoryCount(): number {
  seedExpansionMemories();
  return [...store.values()].reduce((sum, rows) => sum + rows.length, 0);
}

export type { LearnerModelId };
