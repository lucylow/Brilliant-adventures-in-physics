import type { AIMessageState, AIRequestState } from "./ai-types";

export type AIStateMachine = {
  request: AIRequestState;
  message: AIMessageState;
};

const REQUEST_TRANSITIONS: Record<AIRequestState, readonly AIRequestState[]> = {
  idle: ["loading"],
  loading: ["streaming", "complete", "error", "cancelled"],
  streaming: ["complete", "error", "cancelled"],
  complete: ["idle", "loading"],
  error: ["idle", "loading"],
  cancelled: ["idle", "loading"],
};

const MESSAGE_TRANSITIONS: Record<AIMessageState, readonly AIMessageState[]> = {
  sending: ["sent", "failed", "cancelled", "retrying"],
  sent: ["sending"],
  failed: ["retrying", "sending"],
  retrying: ["sent", "failed", "cancelled"],
  cancelled: ["sending"],
};

export function canTransitionRequest(from: AIRequestState, to: AIRequestState): boolean {
  return REQUEST_TRANSITIONS[from].includes(to);
}

export function canTransitionMessage(from: AIMessageState, to: AIMessageState): boolean {
  return MESSAGE_TRANSITIONS[from].includes(to);
}

export function transitionRequest(from: AIRequestState, to: AIRequestState): AIRequestState {
  if (!canTransitionRequest(from, to)) throw new Error(`Illegal Demo AI request transition ${from} → ${to}`);
  return to;
}

export function transitionMessage(from: AIMessageState, to: AIMessageState): AIMessageState {
  if (!canTransitionMessage(from, to)) throw new Error(`Illegal Demo AI message transition ${from} → ${to}`);
  return to;
}

export const REQUEST_TRANSITION_TABLE = REQUEST_TRANSITIONS;
export const MESSAGE_TRANSITION_TABLE = MESSAGE_TRANSITIONS;
