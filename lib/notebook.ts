import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "physicaai.notebook.v1";
const MAX_ENTRIES = 50;

export type NotebookEntry = { id: string; title: string; type: "experiment" | "reflection" | "mistake"; content: string; links: string[]; createdAt: string };

export function isNotebookEntry(value: unknown): value is NotebookEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<NotebookEntry>;
  return typeof entry.id === "string" && typeof entry.title === "string" && (entry.type === "experiment" || entry.type === "reflection" || entry.type === "mistake") && typeof entry.content === "string" && Array.isArray(entry.links) && entry.links.every((link) => typeof link === "string") && typeof entry.createdAt === "string";
}

export function parseNotebookEntries(value: unknown): NotebookEntry[] { return Array.isArray(value) ? value.filter(isNotebookEntry).slice(0, MAX_ENTRIES) : []; }

export function sameNotebookEntry(a: Pick<NotebookEntry, "title" | "type" | "content" | "links">, b: Pick<NotebookEntry, "title" | "type" | "content" | "links">): boolean { return a.title.trim() === b.title.trim() && a.type === b.type && a.content.trim() === b.content.trim() && a.links.map((link) => link.trim()).filter(Boolean).join("|") === b.links.map((link) => link.trim()).filter(Boolean).join("|"); }

export async function loadNotebookEntries(): Promise<NotebookEntry[]> {
  try { const raw = await AsyncStorage.getItem(STORAGE_KEY); return parseNotebookEntries(raw ? JSON.parse(raw) : []); } catch { return []; }
}

export async function saveNotebookEntry(entry: Omit<NotebookEntry, "id" | "createdAt">): Promise<NotebookEntry> {
  const normalized = { ...entry, title: entry.title.trim(), content: entry.content.trim(), links: entry.links.map((link) => link.trim()).filter(Boolean) };
  if (!normalized.title || !normalized.content || !normalized.links.length) throw new Error("Notebook entry is invalid");
  const current = await loadNotebookEntries();
  const duplicate = current.find((item) => sameNotebookEntry(item, normalized));
  if (duplicate) return duplicate;
  const next: NotebookEntry = { ...normalized, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...current].slice(0, MAX_ENTRIES)));
  return next;
}

export async function deleteNotebookEntry(id: string): Promise<void> { const current = await loadNotebookEntries(); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((entry) => entry.id !== id))); }

export async function clearNotebook(): Promise<void> { await AsyncStorage.removeItem(STORAGE_KEY); }

export function notebookSummary(topic: string, entries: NotebookEntry[]): string { return entries.length ? `${entries.length} local ${entries.length === 1 ? "entry" : "entries"} connected to ${topic}.` : `No local notes yet for ${topic}.`; }
