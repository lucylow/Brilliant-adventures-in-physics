import { findConcept } from "@/lib/concepts";
import { CATALOG } from "../ai-catalog";
import type { MockAITurn } from "../ai-types";
import { findCommonMistakes, findPrerequisites, findRelatedConcepts, findSimulationForConcept } from "./knowledge-graph";
import { getLearnerModel, weakConceptsOf } from "./learner-model";
import type { AssembledContext, ContextRecord, LearnerModel, LearnerModelId } from "./types";

export type RelevanceInput = {
  query: string;
  conceptId?: string;
  lessonId?: string;
  problemText?: string;
  history?: readonly MockAITurn[];
};

export function scoreRelevance(input: RelevanceInput, candidate: { text: string; conceptId?: string }): { relevanceScore: number; reason: string } {
  const query = input.query.toLowerCase();
  const text = candidate.text.toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  if (candidate.conceptId && input.conceptId && candidate.conceptId === input.conceptId) {
    score += 0.45;
    reasons.push("same concept as the current question");
  }
  if (query && text.includes(query.slice(0, Math.min(18, query.length)))) {
    score += 0.2;
    reasons.push("query overlap");
  }
  if (input.conceptId && candidate.text.toLowerCase().includes(input.conceptId)) {
    score += 0.1;
    reasons.push("concept id mentioned");
  }
  const last = input.history?.at(-1)?.text.toLowerCase() ?? "";
  if (last && text.includes(last.slice(0, Math.min(12, last.length)))) {
    score += 0.15;
    reasons.push("recent-message overlap");
  }
  if (input.lessonId && text.includes(input.lessonId)) {
    score += 0.08;
    reasons.push("lesson match");
  }
  return { relevanceScore: Math.min(1, score), reason: reasons.join("; ") || "no overlap with the current question" };
}

function record(id: string, kind: ContextRecord["kind"], text: string, conceptId: string | undefined, score: { relevanceScore: number; reason: string }): ContextRecord {
  return { id, kind, text, conceptId, relevanceScore: score.relevanceScore, reason: score.reason };
}

const WINDOW_LIMIT = { tiny: 2, small: 4, normal: 8, large: 14, oversized: 40 } as const;

export function prioritizeContext(records: ContextRecord[], window: keyof typeof WINDOW_LIMIT): AssembledContext {
  const ranked = [...records].sort((a, b) => b.relevanceScore - a.relevanceScore || a.id.localeCompare(b.id));
  const limit = WINDOW_LIMIT[window];
  const kept = ranked.filter((item) => item.relevanceScore >= 0.12).slice(0, limit);
  const excluded = ranked.filter((item) => !kept.includes(item)).map((item) => item.id);
  return {
    feature: "context",
    query: "",
    records: kept,
    truncated: ranked.length > kept.length,
    window,
    excludedIds: excluded,
  };
}

function topicRecords(query: string, conceptId: string, history: readonly MockAITurn[] | undefined, learner?: LearnerModel): ContextRecord[] {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  const concept = findConcept(conceptId);
  const candidates: Array<{ id: string; kind: ContextRecord["kind"]; text: string; conceptId?: string }> = [
    { id: `q-${conceptId}`, kind: "question", text: query, conceptId },
    { id: `c-${conceptId}`, kind: "concept", text: `${concept?.title ?? topic.title}: ${concept?.intuition ?? topic.oneSentence}`, conceptId },
    { id: `l-${topic.lessonId}`, kind: "lesson", text: topic.lessonId, conceptId },
    { id: `s-${topic.simulationId}`, kind: "simulation", text: topic.simulationId, conceptId },
    { id: `m-${conceptId}`, kind: "mistake", text: findCommonMistakes(conceptId)[0] ?? topic.misconception, conceptId },
    { id: `irr-astronomy`, kind: "concept", text: "Hubble expansion is unrelated unless the question is cosmological.", conceptId: "relativistic-energy" },
    ...(learner ? weakConceptsOf(learner, 2).map((id) => ({ id: `w-${id}`, kind: "weakness" as const, text: `Recent weakness on ${id}`, conceptId: id })) : []),
    ...(history ?? []).slice(-4).map((turn, index) => ({ id: `h-${index}`, kind: "history" as const, text: turn.text, conceptId: turn.conceptIds?.[0] })),
  ];
  return candidates.map((item) => record(item.id, item.kind, item.text, item.conceptId, scoreRelevance({ query, conceptId, history }, item)));
}

export function buildTutorContext(query: string, conceptId: string, history: readonly MockAITurn[] = [], learnerId: LearnerModelId = "intermediate", window: keyof typeof WINDOW_LIMIT = "normal"): AssembledContext {
  const learner = getLearnerModel(learnerId);
  const assembled = prioritizeContext(topicRecords(query, conceptId, history, learner), window);
  return { ...assembled, feature: "tutor", query };
}

export function buildProblemContext(query: string, conceptId: string, window: keyof typeof WINDOW_LIMIT = "normal"): AssembledContext {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  const records = [
    record("prompt", "question", query, conceptId, scoreRelevance({ query, conceptId, problemText: query }, { text: query, conceptId })),
    record("knowns", "concept", topic.example.known.map((item) => `${item.name}=${item.value}${item.unit}`).join(", "), conceptId, { relevanceScore: 0.7, reason: "knowns from the structured problem" }),
    record("prereq", "lesson", findPrerequisites(conceptId).join(", ") || "none", conceptId, { relevanceScore: 0.4, reason: "prerequisites" }),
    record("noise", "concept", "Unrelated formula sheet row: Hubble constant", "relativistic-energy", scoreRelevance({ query, conceptId }, { text: "Hubble constant", conceptId: "relativistic-energy" })),
  ];
  return { ...prioritizeContext(records, window), feature: "problem", query };
}

export function buildScanContext(query: string, conceptId: string): AssembledContext {
  return { ...prioritizeContext(topicRecords(query, conceptId, [], undefined), "small"), feature: "scan", query };
}

export function buildExperimentContext(query: string, conceptId: string): AssembledContext {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  const records = [
    record("obj", "question", topic.experiment.objective, conceptId, { relevanceScore: 0.8, reason: "experiment objective" }),
    record("obs", "concept", topic.experiment.observation, conceptId, { relevanceScore: 0.7, reason: "expected observation" }),
    record("sim", "simulation", findSimulationForConcept(conceptId)[0] ?? topic.simulationId, conceptId, { relevanceScore: 0.5, reason: "matching lab visual" }),
  ];
  return { ...prioritizeContext(records, "normal"), feature: "experiment", query };
}

export function buildProgressContext(learnerId: LearnerModelId): AssembledContext {
  const learner = getLearnerModel(learnerId);
  const weak = weakConceptsOf(learner, 3);
  const records = weak.map((id) => record(`weak-${id}`, "weakness", `Mastery gap on ${id}`, id, { relevanceScore: 0.7, reason: "learner weakness" }));
  return { ...prioritizeContext(records, "normal"), feature: "progress", query: "progress" };
}

export function buildRecommendationContext(learnerId: LearnerModelId, query = "what next"): AssembledContext {
  const learner = getLearnerModel(learnerId);
  const weak = weakConceptsOf(learner, 3);
  const related = weak.flatMap((id) => findRelatedConcepts(id).slice(0, 1));
  const records = [...weak, ...related].map((id) => record(`rec-${id}`, "weakness", `Candidate ${id}`, id, scoreRelevance({ query, conceptId: weak[0] }, { text: id, conceptId: id })));
  return { ...prioritizeContext(records, "normal"), feature: "recommendation", query };
}

export function contextWindowsDemo(query: string, conceptId: string) {
  const history: MockAITurn[] = Array.from({ length: 24 }, (_, index) => ({
    id: `hist-${index}`,
    role: index % 2 === 0 ? "user" : "assistant",
    text: index % 5 === 0 ? `Unrelated note ${index} about Hubble.` : `Turn ${index} on ${conceptId}`,
    createdAt: "2026-09-14T12:00:00.000Z",
    conceptIds: index % 5 === 0 ? ["relativistic-energy"] : [conceptId],
  }));
  return {
    tiny: buildTutorContext(query, conceptId, history, "intermediate", "tiny"),
    small: buildTutorContext(query, conceptId, history, "intermediate", "small"),
    normal: buildTutorContext(query, conceptId, history, "intermediate", "normal"),
    large: buildTutorContext(query, conceptId, history, "intermediate", "large"),
    oversized: buildTutorContext(query, conceptId, history, "intermediate", "oversized"),
  };
}
