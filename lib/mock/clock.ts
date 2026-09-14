/**
 * Fixed mock clock. Activity timestamps derive from this instant, not Date.now() during render.
 * The default epoch is timezone-independent UTC.
 */

export const MOCK_EPOCH_ISO = "2026-09-14T16:00:00.000Z";
export const MS_PER_DAY = 86_400_000;
export const MS_PER_HOUR = 3_600_000;

let mockNowMs = Date.parse(MOCK_EPOCH_ISO);

export function getMockNow(): Date {
  return new Date(mockNowMs);
}

export function getMockNowIso(): string {
  return new Date(mockNowMs).toISOString();
}

export function getMockNowMs(): number {
  return mockNowMs;
}

export function setMockNow(value: Date | string | number): Date {
  const timestamp = typeof value === "number" ? value : Date.parse(typeof value === "string" ? value : value.toISOString());
  if (!Number.isFinite(timestamp)) throw new Error("Mock clock requires a valid date");
  mockNowMs = timestamp;
  return getMockNow();
}

export function resetMockNow(): Date {
  mockNowMs = Date.parse(MOCK_EPOCH_ISO);
  return getMockNow();
}

export function daysAgo(days: number, hours = 12): Date {
  return new Date(mockNowMs - days * MS_PER_DAY - hours * MS_PER_HOUR);
}

export function hoursAgo(hours: number): Date {
  return new Date(mockNowMs - hours * MS_PER_HOUR);
}

export function isoDaysAgo(days: number, hours = 12): string {
  return daysAgo(days, hours).toISOString();
}

export function isoDateDaysAgo(days: number): string {
  return daysAgo(days, 0).toISOString().slice(0, 10);
}

export type MockRelativeDay = "today" | "yesterday" | "this-week" | "last-week" | "last-month";

export function relativeMockDate(slot: MockRelativeDay): Date {
  switch (slot) {
    case "today":
      return getMockNow();
    case "yesterday":
      return daysAgo(1, 10);
    case "this-week":
      return daysAgo(3, 14);
    case "last-week":
      return daysAgo(10, 9);
    case "last-month":
      return daysAgo(28, 11);
    default:
      return getMockNow();
  }
}

export function dateKey(value: Date | string): string {
  const iso = typeof value === "string" ? value : value.toISOString();
  return iso.slice(0, 10);
}
