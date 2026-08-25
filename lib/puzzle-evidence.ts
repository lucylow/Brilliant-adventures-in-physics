import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PuzzleOutcome } from "./puzzles";

const KEY = "physicaai.puzzle-evidence.v1";

export type PuzzleEvidence = {
  puzzleId: string;
  outcome: PuzzleOutcome;
  hintsUsed: number;
  xp: number;
  recordedAt: string;
};

function validEvidence(value: unknown): value is PuzzleEvidence {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PuzzleEvidence>;
  return typeof item.puzzleId === "string" && item.puzzleId.length > 0 && (item.outcome === "correct" || item.outcome === "assisted-correct" || item.outcome === "incorrect") && typeof item.hintsUsed === "number" && Number.isFinite(item.hintsUsed) && item.hintsUsed >= 0 && typeof item.xp === "number" && Number.isFinite(item.xp) && item.xp >= 0 && typeof item.recordedAt === "string";
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

export async function recordPuzzleEvidence(entry: Omit<PuzzleEvidence, "recordedAt">, now = new Date().toISOString()): Promise<{ entry: PuzzleEvidence; recorded: boolean }> {
  const current = await loadPuzzleEvidence();
  const existing = current.find((item) => item.puzzleId === entry.puzzleId);
  if (existing) return { entry: existing, recorded: false };
  const next: PuzzleEvidence = { ...entry, hintsUsed: Math.max(0, Math.floor(entry.hintsUsed)), xp: Math.max(0, entry.xp), recordedAt: now };
  await AsyncStorage.setItem(KEY, JSON.stringify([...current, next].slice(-200)));
  return { entry: next, recorded: true };
}
