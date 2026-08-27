import AsyncStorage from "@react-native-async-storage/async-storage";
import { isPreviewableLocalMediaUri } from "./media-contract";

const STORAGE_KEY = "physicaai.notebook.v1";
const MAX_ENTRIES = 50;

export type NotebookMediaContext = { uri?: string; caption?: string; capturedAt?: string };
export type NotebookEntry = { id: string; title: string; type: "experiment" | "reflection" | "mistake"; content: string; links: string[]; createdAt: string; media?: NotebookMediaContext };
export type NotebookLoadResult = { entries: NotebookEntry[]; usedFallback: boolean; reason?: "malformed" | "unavailable" };

export const DEMO_NOTEBOOK_ENTRY: NotebookEntry = {
  id: "demo-local-notebook",
  title: "[Demo] Kinematics observation",
  type: "experiment",
  content: "Demo data only — storage was unavailable. A local observation can connect position, time, and velocity without replacing saved notes.",
  links: ["kinematics"],
  createdAt: "2026-01-01T00:00:00.000Z",
};

function isNotebookMediaContext(value: unknown): value is NotebookMediaContext {
  if (!value || typeof value !== "object") return false;
  const media = value as Partial<NotebookMediaContext>;
  return (media.uri === undefined || isPreviewableLocalMediaUri(media.uri)) && (media.caption === undefined || (typeof media.caption === "string" && media.caption.length <= 160)) && (media.capturedAt === undefined || (typeof media.capturedAt === "string" && !Number.isNaN(Date.parse(media.capturedAt))));
}

export function isNotebookEntry(value: unknown): value is NotebookEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<NotebookEntry>;
  return typeof entry.id === "string" && typeof entry.title === "string" && (entry.type === "experiment" || entry.type === "reflection" || entry.type === "mistake") && typeof entry.content === "string" && Array.isArray(entry.links) && entry.links.every((link) => typeof link === "string") && typeof entry.createdAt === "string" && (entry.media === undefined || isNotebookMediaContext(entry.media));
}

export function parseNotebookEntries(value: unknown): NotebookEntry[] { return Array.isArray(value) ? value.filter(isNotebookEntry).slice(0, MAX_ENTRIES) : []; }

export function sameNotebookEntry(a: Pick<NotebookEntry, "title" | "type" | "content" | "links">, b: Pick<NotebookEntry, "title" | "type" | "content" | "links">): boolean { return a.title.trim() === b.title.trim() && a.type === b.type && a.content.trim() === b.content.trim() && a.links.map((link) => link.trim()).filter(Boolean).join("|") === b.links.map((link) => link.trim()).filter(Boolean).join("|"); }

export async function loadNotebookEntriesWithStatus(): Promise<NotebookLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [], usedFallback: false };
    let parsed: unknown;
    try { parsed = JSON.parse(raw) as unknown; } catch { return { entries: [DEMO_NOTEBOOK_ENTRY], usedFallback: true, reason: "malformed" }; }
    if (!Array.isArray(parsed)) return { entries: [DEMO_NOTEBOOK_ENTRY], usedFallback: true, reason: "malformed" };
    return { entries: parseNotebookEntries(parsed), usedFallback: false };
  } catch {
    return { entries: [DEMO_NOTEBOOK_ENTRY], usedFallback: true, reason: "unavailable" };
  }
}

export async function loadNotebookEntries(): Promise<NotebookEntry[]> {
  return (await loadNotebookEntriesWithStatus()).entries;
}

async function readNotebookEntriesForWrite(): Promise<NotebookEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Notebook storage is malformed");
  return parseNotebookEntries(parsed);
}

export async function saveNotebookEntry(entry: Omit<NotebookEntry, "id" | "createdAt">): Promise<NotebookEntry> {
  const normalized = { ...entry, title: entry.title.trim(), content: entry.content.trim(), links: entry.links.map((link) => link.trim()).filter(Boolean) };
  if (!normalized.title || !normalized.content || !normalized.links.length) throw new Error("Notebook entry is invalid");
  const current = await readNotebookEntriesForWrite();
  const duplicate = current.find((item) => sameNotebookEntry(item, normalized));
  if (duplicate) return duplicate;
  const next: NotebookEntry = { ...normalized, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...current].slice(0, MAX_ENTRIES)));
  return next;
}

export async function deleteNotebookEntry(id: string): Promise<void> { const current = await readNotebookEntriesForWrite(); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((entry) => entry.id !== id))); }

export async function clearNotebook(): Promise<void> { await AsyncStorage.removeItem(STORAGE_KEY); }

export type NotebookFilter = "all" | NotebookEntry["type"];

export function filterNotebookEntries(entries: NotebookEntry[], filter: NotebookFilter, query = ""): NotebookEntry[] {
  const term = query.trim().toLowerCase();
  return entries.filter((entry) => (filter === "all" || entry.type === filter) && (!term || `${entry.title} ${entry.content} ${entry.links.join(" ")}`.toLowerCase().includes(term)));
}

export function notebookSummary(topic: string, entries: NotebookEntry[]): string { return entries.length ? `${entries.length} local ${entries.length === 1 ? "entry" : "entries"} connected to ${topic}.` : `No local notes yet for ${topic}.`; }
