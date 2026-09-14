export type Searchable = { id: string; title?: string; name?: string; prompt?: string; summary?: string; description?: string; tags?: readonly string[] };

function haystack(item: Searchable): string {
  return [item.id, item.title, item.name, item.prompt, item.summary, item.description, ...(item.tags ?? [])]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

export function tokenize(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

export function searchItems<T extends Searchable>(items: readonly T[], query: string): T[] {
  const term = query.trim().toLowerCase();
  if (!term) return [...items];
  const tokens = tokenize(term);
  const scored = items
    .map((item) => {
      const text = haystack(item);
      const id = item.id.toLowerCase();
      const title = (item.title ?? item.name ?? "").toLowerCase();
      let score = 0;
      if (id === term || title === term) score += 100;
      else if (id.startsWith(term) || title.startsWith(term)) score += 60;
      else if (text.includes(term)) score += 30;
      const tokenHits = tokens.filter((token) => text.includes(token)).length;
      if (tokens.length && tokenHits === tokens.length) score += 20;
      else if (tokenHits) score += tokenHits * 5;
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  return scored.map((entry) => entry.item);
}
