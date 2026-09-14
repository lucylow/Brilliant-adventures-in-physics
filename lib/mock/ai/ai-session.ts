import { clone } from "../utils/clone";
import { getMockNowIso } from "../clock";
import { createMockAITurn } from "./ai-factories";
import { truncateHistory } from "./datasets/intents-edge";
import type { MockAITurn, TutorConversation } from "./ai-types";
import { SESSION_FIXTURES } from "./datasets/intents-edge";

const sessions = new Map<string, MockAITurn[]>();
const inFlight = new Set<string>();

export function getSessionTurns(sessionId: string): MockAITurn[] {
  return clone(sessions.get(sessionId) ?? []);
}

export function appendSessionTurn(sessionId: string, turn: MockAITurn): MockAITurn[] {
  const next = [...getSessionTurns(sessionId), turn];
  sessions.set(sessionId, next);
  return clone(next);
}

export function boundedSessionContext(sessionId: string, currentQuestion: string): MockAITurn[] {
  return truncateHistory(getSessionTurns(sessionId), currentQuestion);
}

export function beginSend(sessionId: string): boolean {
  if (inFlight.has(sessionId)) return false;
  inFlight.add(sessionId);
  return true;
}

export function endSend(sessionId: string): void {
  inFlight.delete(sessionId);
}

export function isSending(sessionId: string): boolean {
  return inFlight.has(sessionId);
}

export function restoreSessionFixture(kind: (typeof SESSION_FIXTURES)[number]["kind"]): MockAITurn[] {
  const fixture = SESSION_FIXTURES.find((item) => item.kind === kind);
  if (!fixture || !("turns" in fixture) || !fixture.turns) return [];
  return fixture.turns.map((turn) => createMockAITurn(turn));
}

export function resetSessions(): void {
  sessions.clear();
  inFlight.clear();
}

export function conversationToSession(conversation: TutorConversation): void {
  sessions.set(conversation.id, conversation.turns);
}

export function touchSession(sessionId: string): string {
  return getMockNowIso();
}
