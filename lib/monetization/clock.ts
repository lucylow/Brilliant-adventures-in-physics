import type { Clock } from "./types";

const MS_PER_DAY = 86_400_000;

let overrideNow: number | null = null;

export function setMonetizationNow(value: number | Date | string | null): number | null {
  if (value === null) {
    overrideNow = null;
    return null;
  }
  const timestamp = typeof value === "number" ? value : Date.parse(typeof value === "string" ? value : value.toISOString());
  if (!Number.isFinite(timestamp)) throw new Error("Monetization clock requires a valid date");
  overrideNow = timestamp;
  return overrideNow;
}

export function resetMonetizationNow(): void {
  overrideNow = null;
}

export function monetizationNow(): number {
  return overrideNow ?? Date.now();
}

export function monetizationIso(at = monetizationNow()): string {
  return new Date(at).toISOString();
}

export function monetizationDateKey(at = monetizationNow()): string {
  return new Date(at).toISOString().slice(0, 10);
}

export function startOfUtcDay(at = monetizationNow()): number {
  const date = new Date(at);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function nextUtcReset(at = monetizationNow()): number {
  return startOfUtcDay(at) + MS_PER_DAY;
}

export function daysFrom(ms: number, at = monetizationNow()): number {
  return (at - ms) / MS_PER_DAY;
}

export function addDays(at: number, days: number): number {
  return at + days * MS_PER_DAY;
}

export function createClock(nowFn: () => number = monetizationNow): Clock {
  return {
    now: nowFn,
    iso: (at) => monetizationIso(at ?? nowFn()),
    dateKey: (at) => monetizationDateKey(at ?? nowFn()),
  };
}

export const defaultClock = createClock();
