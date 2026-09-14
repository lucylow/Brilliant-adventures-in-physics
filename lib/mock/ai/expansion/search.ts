import { CATALOG } from "../ai-catalog";
import { paginate } from "../../utils/pagination";
import { stableId } from "../../utils/ids";
import { getTutorConversations } from "../datasets/conversations";
import { getConversationDigests } from "./study";

export type SearchHit = {
  id: string;
  title: string;
  snippet: string;
  conceptId: string;
  score: number;
  match: "exact" | "concept" | "partial" | "recent" | "weak-topic";
};

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter((token) => token.length > 2);
}

/** Deterministic keyword overlap. Not an embedding model. */
export function keywordSimilarity(a: string, b: string): number {
  const left = new Set(tokenize(a));
  const right = tokenize(b);
  if (!left.size || !right.length) return 0;
  const hits = right.filter((token) => left.has(token)).length;
  return hits / Math.max(left.size, right.length);
}

let indexCache: Array<{ id: string; title: string; body: string; conceptId: string; equation: string }> | null = null;

export function getTutorSearchIndex() {
  if (indexCache) return indexCache;
  const fromExpansion = getConversationDigests().map((item) => ({
    id: item.id,
    title: item.title,
    body: `${item.summary} ${item.tags.intent} ${item.tags.outcome}`,
    conceptId: item.conceptId,
    equation: CATALOG.find((topic) => topic.conceptId === item.conceptId)?.equation ?? "",
  }));
  const fromLegacy = getTutorConversations().slice(0, 40).map((item) => ({
    id: `legacy-${item.id}`,
    title: item.title,
    body: item.turns.map((turn) => turn.text).join(" ").slice(0, 400),
    conceptId: item.conceptId,
    equation: CATALOG.find((topic) => topic.conceptId === item.conceptId)?.equation ?? "",
  }));
  indexCache = [...fromExpansion, ...fromLegacy];
  return indexCache;
}

export function searchTutorHistoryV3(query: string, weakConceptIds: string[] = []): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  return getTutorSearchIndex()
    .map((item) => {
      const exact = item.title.toLowerCase() === q.toLowerCase() || item.body.toLowerCase().includes(q.toLowerCase());
      const concept = item.conceptId === q || item.title.toLowerCase().includes(q.toLowerCase());
      const sim = keywordSimilarity(q, `${item.title} ${item.body} ${item.equation}`);
      const weak = weakConceptIds.includes(item.conceptId);
      const match: SearchHit["match"] = exact && sim > 0.5 ? "exact" : concept ? "concept" : weak ? "weak-topic" : sim > 0.15 ? "partial" : "recent";
      const score = (exact ? 0.4 : 0) + (concept ? 0.25 : 0) + sim * 0.3 + (weak ? 0.15 : 0);
      return {
        id: item.id,
        title: item.title,
        snippet: item.body.slice(0, 160),
        conceptId: item.conceptId,
        score,
        match,
      };
    })
    .filter((item) => item.score >= 0.12)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function paginateSearch(query: string, limit = 10, offset = 0) {
  const hits = searchTutorHistoryV3(query).map((item, index) => ({ ...item, id: item.id || `hit-${index}` }));
  return paginate(hits, limit, offset);
}

export function retrievalBundles(query: string, conceptId: string) {
  const hits = searchTutorHistoryV3(query);
  return {
    ok: hits.filter((item) => item.conceptId === conceptId).slice(0, 4),
    none: [],
    irrelevant: hits.filter((item) => item.conceptId !== conceptId).slice(0, 3),
    partial: hits.slice(0, 2),
    stale: hits.slice(0, 1).map((item) => ({ ...item, snippet: `STALE: ${item.snippet}` })),
    conflicting: hits.slice(0, 2),
  };
}

export function rankingFixtures() {
  return {
    exact: searchTutorHistoryV3("Understanding Projectile Motion"),
    concept: searchTutorHistoryV3("kinematics"),
    partial: searchTutorHistoryV3("why current"),
    weak: searchTutorHistoryV3("review", ["momentum"]),
  };
}

export function getCacheScenarios() {
  return [
    { id: "cache-fresh", freshness: "fresh" as const, usable: true },
    { id: "cache-stale", freshness: "stale" as const, usable: true },
    { id: "cache-expired", freshness: "expired" as const, usable: false },
    { id: "cache-corrupt", freshness: "corrupt" as const, usable: false },
    { id: "cache-missing", freshness: "missing" as const, usable: false },
  ];
}

export function getSyncRecords() {
  return [
    { id: "sync-local", state: "local-only" as const, note: "Saved on device only." },
    { id: "sync-ok", state: "synced" as const, note: "Mock sync flag — not a live backend." },
    { id: "sync-pend", state: "pending" as const, note: "Queued while offline." },
    { id: "sync-conf", state: "conflicted" as const, note: "Two mock edits disagree; surface the conflict." },
  ];
}

export function getOfflineCache() {
  return CATALOG.slice(0, 8).map((topic) => ({
    id: stableId("off", topic.id),
    conceptId: topic.conceptId,
    explanation: topic.oneSentence,
    hint: topic.followUps[0],
    recommendation: topic.lessonId,
  }));
}

export function getIdempotencyFixtures() {
  return [
    { requestId: "idem-1", duplicate: false },
    { requestId: "idem-1", duplicate: true },
    { requestId: "idem-2", duplicate: false },
  ];
}

export function getRequestQueue() {
  return [
    { id: "q1", state: "pending" as const },
    { id: "q2", state: "active" as const },
    { id: "q3", state: "completed" as const },
    { id: "q4", state: "failed" as const },
    { id: "q5", state: "cancelled" as const },
  ];
}

export function getConcurrencyCases() {
  return [
    { id: "two-tutor", label: "two Tutor requests", staleRisk: true },
    { id: "tutor-scan", label: "Tutor + Scan", staleRisk: true },
    { id: "tutor-sim", label: "Tutor + simulation", staleRisk: false },
    { id: "rapid-follow", label: "rapid follow-up", staleRisk: true },
  ];
}

export function getTimeoutProfiles() {
  return [
    { id: "t100", ms: 100 },
    { id: "t500", ms: 500 },
    { id: "t1000", ms: 1000 },
    { id: "t3000", ms: 3000 },
    { id: "timeout", ms: 12_000 },
  ];
}

export function paginateList<T extends { id: string }>(items: readonly T[], limit = 20, offset = 0) {
  return paginate(items, limit, offset);
}

/** On-the-fly stress rows. Not materialized as a giant array. */
export function getStressTutorMessage(index: number) {
  const topic = CATALOG[index % CATALOG.length];
  const role = index % 2 === 0 ? "user" : "assistant";
  return {
    id: `stress-msg-${index}`,
    role,
    text: role === "user" ? `Stress prompt ${index} on ${topic.title}` : `${topic.oneSentence} (${index})`,
    conceptId: topic.conceptId,
  };
}

export function pageStressMessages(limit = 20, offset = 0, total = 5000) {
  const start = Math.max(0, offset);
  const end = Math.min(total, start + Math.max(1, limit));
  const items = [];
  for (let index = start; index < end; index += 1) items.push(getStressTutorMessage(index));
  return { items, total, limit, offset: start, nextOffset: end < total ? end : null };
}
