import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";

export type RaceCase = {
  id: string;
  label: string;
  requests: Array<{ id: string; feature: "tutor" | "scan" | "simulation"; startedAtMs: number; completedAtMs: number }>;
  winnerId: string;
  staleIds: string[];
  rule: string;
};

export type IdempotencyCase = {
  requestId: string;
  attempt: number;
  duplicate: boolean;
  action: "execute" | "replay-stored";
};

export type QueueItem = {
  id: string;
  state: "pending" | "active" | "completed" | "failed" | "cancelled";
  feature: "tutor" | "scan" | "simulation";
  diagnosticId?: string;
};

/** Deterministic races: later completion must not replace an older request's UI if the older request is still the active one. */
export function getRaceCases(): RaceCase[] {
  const topic = CATALOG[0];
  return [
    {
      id: stableId("race", "two-tutor"),
      label: "two Tutor requests",
      requests: [
        { id: "t-slow", feature: "tutor", startedAtMs: 0, completedAtMs: 900 },
        { id: "t-fast", feature: "tutor", startedAtMs: 50, completedAtMs: 200 },
      ],
      winnerId: "t-fast",
      staleIds: ["t-slow"],
      rule: "The later-started Tutor request wins; the slow response is dropped even if it finishes last.",
    },
    {
      id: stableId("race", "tutor-scan"),
      label: "Tutor + Scan",
      requests: [
        { id: "tutor-1", feature: "tutor", startedAtMs: 0, completedAtMs: 400 },
        { id: "scan-1", feature: "scan", startedAtMs: 20, completedAtMs: 180 },
      ],
      winnerId: "scan-1",
      staleIds: [],
      rule: "Different features do not overwrite each other. Scan results land on the scan card, Tutor on the Tutor card.",
    },
    {
      id: stableId("race", "tutor-sim"),
      label: "Tutor + simulation",
      requests: [
        { id: "tutor-2", feature: "tutor", startedAtMs: 0, completedAtMs: 300 },
        { id: "sim-1", feature: "simulation", startedAtMs: 10, completedAtMs: 80 },
      ],
      winnerId: "sim-1",
      staleIds: [],
      rule: `Simulation copilot for ${topic.simulationId} is independent of the Tutor stream.`,
    },
    {
      id: stableId("race", "rapid-follow"),
      label: "rapid follow-up",
      requests: [
        { id: "q1", feature: "tutor", startedAtMs: 0, completedAtMs: 500 },
        { id: "q2", feature: "tutor", startedAtMs: 30, completedAtMs: 220 },
        { id: "q3", feature: "tutor", startedAtMs: 60, completedAtMs: 190 },
      ],
      winnerId: "q3",
      staleIds: ["q1", "q2"],
      rule: "Only the latest follow-up is shown. Earlier chunks must not append after a newer question.",
    },
  ];
}

export function pickRaceWinner(caseId: string): { winnerId: string; staleIds: string[] } {
  const row = getRaceCases().find((item) => item.id === caseId) ?? getRaceCases()[0];
  const sameFeature = row.requests.filter((item) => item.feature === row.requests[0]?.feature);
  const latestStart = [...sameFeature].sort((a, b) => b.startedAtMs - a.startedAtMs || a.id.localeCompare(b.id))[0];
  if (row.requests.some((item) => item.feature !== row.requests[0]?.feature)) {
    return { winnerId: row.winnerId, staleIds: row.staleIds };
  }
  return {
    winnerId: latestStart.id,
    staleIds: sameFeature.filter((item) => item.id !== latestStart.id).map((item) => item.id),
  };
}

export function getIdempotencyCases(): IdempotencyCase[] {
  return [
    { requestId: "idem-alpha", attempt: 1, duplicate: false, action: "execute" },
    { requestId: "idem-alpha", attempt: 2, duplicate: true, action: "replay-stored" },
    { requestId: "idem-beta", attempt: 1, duplicate: false, action: "execute" },
  ];
}

export function getQueueFixtures(): QueueItem[] {
  return [
    { id: "queue-pend", state: "pending", feature: "tutor" },
    { id: "queue-act", state: "active", feature: "scan" },
    { id: "queue-ok", state: "completed", feature: "tutor" },
    { id: "queue-fail", state: "failed", feature: "tutor", diagnosticId: "AI-GRD-CALC" },
    { id: "queue-can", state: "cancelled", feature: "simulation" },
  ];
}

export function retryPreservesContext(previousKnowns: string[], incomingKnowns: string[]): { knowns: string[]; duplicateAssistant: false } {
  const merged = [...previousKnowns];
  for (const item of incomingKnowns) {
    if (!merged.includes(item)) merged.push(item);
  }
  return { knowns: merged, duplicateAssistant: false };
}
