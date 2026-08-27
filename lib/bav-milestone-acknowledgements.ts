import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BAVMilestoneId } from "@/lib/bav-milestones";

export const BAV_MILESTONE_ACKNOWLEDGEMENTS_KEY = "physicaai.bav-milestone-acknowledgements.v1";
export const MAX_BAV_MILESTONE_ACKNOWLEDGEMENTS = 3;

export type BAVMilestoneAcknowledgement = { id: BAVMilestoneId; acknowledgedAt: number };
export type BAVMilestoneAcknowledgementLoadResult = { entries: BAVMilestoneAcknowledgement[]; recovered: boolean; reason?: "malformed" | "unavailable" };
export type BAVMilestoneAcknowledgementWriteResult = { ok: true; data: BAVMilestoneAcknowledgement[] } | { ok: false; reason: "malformed" | "unavailable" };

const isMilestoneId = (value: unknown): value is BAVMilestoneId => value === "build-foundation" || value === "adventure-loop" || value === "visualize-mastery";

function isAcknowledgement(value: unknown): value is BAVMilestoneAcknowledgement {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return isMilestoneId(entry.id) && typeof entry.acknowledgedAt === "number" && Number.isFinite(entry.acknowledgedAt) && entry.acknowledgedAt >= 0;
}

export function parseBAVMilestoneAcknowledgements(input: unknown): BAVMilestoneAcknowledgement[] {
  if (!Array.isArray(input) || input.some((entry) => !isAcknowledgement(entry))) return [];
  const unique = new Map<BAVMilestoneId, BAVMilestoneAcknowledgement>();
  for (const entry of input) if (!unique.has(entry.id)) unique.set(entry.id, entry);
  return [...unique.values()].slice(0, MAX_BAV_MILESTONE_ACKNOWLEDGEMENTS);
}

export async function loadBAVMilestoneAcknowledgementsWithStatus(): Promise<BAVMilestoneAcknowledgementLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(BAV_MILESTONE_ACKNOWLEDGEMENTS_KEY);
    if (!raw) return { entries: [], recovered: false };
    let parsed: unknown;
    try { parsed = JSON.parse(raw) as unknown; } catch { return { entries: [], recovered: true, reason: "malformed" }; }
    if (!Array.isArray(parsed) || parsed.some((entry) => !isAcknowledgement(entry))) return { entries: [], recovered: true, reason: "malformed" };
    return { entries: parseBAVMilestoneAcknowledgements(parsed), recovered: false };
  } catch {
    return { entries: [], recovered: true, reason: "unavailable" };
  }
}

export async function acknowledgeBAVMilestone(id: BAVMilestoneId, acknowledgedAt = Date.now()): Promise<BAVMilestoneAcknowledgementWriteResult> {
  if (!isMilestoneId(id) || !Number.isFinite(acknowledgedAt) || acknowledgedAt < 0) return { ok: false, reason: "malformed" };
  const current = await loadBAVMilestoneAcknowledgementsWithStatus();
  if (current.recovered) return { ok: false, reason: current.reason ?? "unavailable" };
  if (current.entries.some((entry) => entry.id === id)) return { ok: true, data: current.entries };
  try {
    const next = [{ id, acknowledgedAt }, ...current.entries].slice(0, MAX_BAV_MILESTONE_ACKNOWLEDGEMENTS);
    await AsyncStorage.setItem(BAV_MILESTONE_ACKNOWLEDGEMENTS_KEY, JSON.stringify(next));
    return { ok: true, data: next };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
