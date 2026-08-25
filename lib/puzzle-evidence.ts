import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PuzzleOutcome } from "./puzzles";

const KEY = "physicaai.puzzle-evidence.v1";

export type PuzzleEvidence = {
  puzzleId: string;
  topic?: string;
  outcome: PuzzleOutcome;
  hintsUsed: number;
  xp: number;
  recordedAt: string;
};

function validEvidence(value: unknown): value is PuzzleEvidence {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PuzzleEvidence>;
  return typeof item.puzzleId === "string" && item.puzzleId.length > 0 && (item.topic === undefined || typeof item.topic === "string") && (item.outcome === "correct" || item.outcome === "assisted-correct" || item.outcome === "incorrect") && typeof item.hintsUsed === "number" && Number.isFinite(item.hintsUsed) && item.hintsUsed >= 0 && typeof item.xp === "number" && Number.isFinite(item.xp) && item.xp >= 0 && typeof item.recordedAt === "string";
}

export async function loadPuzzleEvidence(): Promise<PuzzleEvidence[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(validEvidence).slice(-200) : [];
  } catch {
    return [];
  }
}

export function missedPuzzleReviewQueue(entries: readonly PuzzleEvidence[], limit = 3): PuzzleEvidence[] {
  const unique = new Map<string, PuzzleEvidence>();
  for (const entry of entries) if (!unique.has(entry.puzzleId)) unique.set(entry.puzzleId, entry);
  return [...unique.values()].filter((entry) => entry.outcome === "incorrect").sort((a, b) => a.recordedAt.localeCompare(b.recordedAt) || a.puzzleId.localeCompare(b.puzzleId)).slice(0, Math.max(0, Math.floor(limit)));
}

export function summarizePuzzleEvidence(entries: readonly PuzzleEvidence[]) {
  const unique = new Map<string, PuzzleEvidence>();
  for (const entry of entries) if (!unique.has(entry.puzzleId)) unique.set(entry.puzzleId, entry);
  const values = [...unique.values()];
  const correct = values.filter((entry) => entry.outcome !== "incorrect").length;
  return { total: values.length, correct, assisted: values.filter((entry) => entry.outcome === "assisted-correct").length, xp: values.reduce((sum, entry) => sum + entry.xp, 0), accuracy: values.length ? correct / values.length : 0 };
}

export async function recordPuzzleEvidence(entry: Omit<PuzzleEvidence, "recordedAt">, now = new Date().toISOString()): Promise<{ entry: PuzzleEvidence; recorded: boolean }> {
  const current = await loadPuzzleEvidence();
  const existing = current.find((item) => item.puzzleId === entry.puzzleId);
  if (existing) return { entry: existing, recorded: false };
  const next: PuzzleEvidence = { ...entry, hintsUsed: Math.max(0, Math.floor(entry.hintsUsed)), xp: Math.max(0, entry.xp), recordedAt: now };
  await AsyncStorage.setItem(KEY, JSON.stringify([...current, next].slice(-200)));
  return { entry: next, recorded: true };
}
