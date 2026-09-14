import { isMockModeEnabled, isProductionRuntime } from "./config";

export type MockAnalyticsEvent =
  | "lesson_started"
  | "lesson_completed"
  | "problem_started"
  | "problem_answered"
  | "simulation_started"
  | "simulation_completed"
  | "tutor_message_sent"
  | "mission_completed";

const buffer: Array<{ event: MockAnalyticsEvent; at: string; payload?: Record<string, string | number | boolean> }> = [];

export function recordMockAnalytics(event: MockAnalyticsEvent, payload?: Record<string, string | number | boolean>): void {
  if (isProductionRuntime() || !isMockModeEnabled()) return;
  buffer.push({ event, at: new Date().toISOString(), payload });
  if (buffer.length > 200) buffer.shift();
}

export function getMockAnalyticsEvents() {
  return [...buffer];
}

export function clearMockAnalytics(): void {
  buffer.length = 0;
}
