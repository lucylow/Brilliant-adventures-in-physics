import type { Paginated } from "../types";

export function paginate<T extends { id: string }>(items: readonly T[], limit = 20, offset = 0, cursor?: string): Paginated<T> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  let start = Math.max(0, Math.floor(offset));
  if (cursor) {
    const index = items.findIndex((item) => item.id === cursor);
    start = index >= 0 ? index + 1 : start;
  }
  const slice = items.slice(start, start + safeLimit);
  const nextOffset = start + slice.length < items.length ? start + slice.length : null;
  const nextCursor = nextOffset !== null ? slice[slice.length - 1]?.id ?? null : null;
  return { items: slice, total: items.length, limit: safeLimit, offset: start, nextOffset, nextCursor };
}
