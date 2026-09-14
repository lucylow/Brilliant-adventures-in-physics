import type { DifficultyBand, LearnerMemory, LearnerPersonaId, TutorResponseStyle } from "./ai-types";
import { PERSONAS } from "./ai-personas";

const memories = new Map<string, LearnerMemory>();

export function defaultMemory(userId: string, personaId: LearnerPersonaId = "curious-beginner"): LearnerMemory {
  const persona = PERSONAS.find((item) => item.id === personaId) ?? PERSONAS[0];
  return {
    userId,
    preferredStyle: persona.preferredStyle,
    recentConceptIds: ["kinematics"],
    recurringMistakes: ["unitError"],
    knownStrengths: [],
    recentQuestions: [],
    savedInterests: ["projectile motion"],
    preferredDifficulty: "medium",
  };
}

export function getLearnerMemory(userId: string): LearnerMemory {
  const existing = memories.get(userId);
  if (existing) return { ...existing, recentConceptIds: [...existing.recentConceptIds], recurringMistakes: [...existing.recurringMistakes], knownStrengths: [...existing.knownStrengths], recentQuestions: [...existing.recentQuestions], savedInterests: [...existing.savedInterests] };
  const created = defaultMemory(userId);
  memories.set(userId, created);
  return getLearnerMemory(userId);
}

export function rememberTurn(userId: string, question: string, conceptId: string, style?: TutorResponseStyle): LearnerMemory {
  const current = getLearnerMemory(userId);
  const next: LearnerMemory = {
    ...current,
    preferredStyle: style ?? current.preferredStyle,
    recentConceptIds: [conceptId, ...current.recentConceptIds.filter((id) => id !== conceptId)].slice(0, 8),
    recentQuestions: [question, ...current.recentQuestions].slice(0, 12),
  };
  memories.set(userId, next);
  return getLearnerMemory(userId);
}

export function rememberMistake(userId: string, mistake: string): void {
  const current = getLearnerMemory(userId);
  memories.set(userId, { ...current, recurringMistakes: [mistake, ...current.recurringMistakes.filter((item) => item !== mistake)].slice(0, 8) });
}

export function rememberStrength(userId: string, conceptId: string): void {
  const current = getLearnerMemory(userId);
  memories.set(userId, { ...current, knownStrengths: [conceptId, ...current.knownStrengths.filter((item) => item !== conceptId)].slice(0, 8) });
}

export function setPreferredDifficulty(userId: string, preferredDifficulty: DifficultyBand): void {
  const current = getLearnerMemory(userId);
  memories.set(userId, { ...current, preferredDifficulty });
}

export function getRecentTutorContext(userId: string): string[] {
  return getLearnerMemory(userId).recentQuestions;
}

export function getLearnerWeakConcepts(userId: string): string[] {
  return getLearnerMemory(userId).recurringMistakes;
}

export function getPreferredExplanationStyle(userId: string): TutorResponseStyle {
  return getLearnerMemory(userId).preferredStyle;
}

export function getRecentMistakes(userId: string): string[] {
  return getLearnerMemory(userId).recurringMistakes;
}

export function getSavedInterests(userId: string): string[] {
  return getLearnerMemory(userId).savedInterests;
}

export function resetLearnerMemory(): void {
  memories.clear();
}

export function seedDemoMemories(): void {
  PERSONAS.forEach((persona) => {
    const userId = `demo-${persona.id}`;
    memories.set(userId, defaultMemory(userId, persona.id));
  });
}
