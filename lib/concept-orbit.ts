import { conceptRegistry, findConcept, type PhysicsConcept } from "./concepts";
import type { LearningState } from "./progress-store";

export function prerequisiteTrail(id: string): PhysicsConcept[] {
  const visited = new Set<string>();
  const result: PhysicsConcept[] = [];
  const visit = (conceptId: string) => {
    if (visited.has(conceptId)) return;
    const concept = findConcept(conceptId);
    if (!concept) return;
    visited.add(conceptId);
    concept.prerequisites.forEach(visit);
    result.push(concept);
  };
  visit(id);
  return result;
}

export function orbitSummary(id: string): string {
  const trail = prerequisiteTrail(id);
  if (!trail.length) return "No verified concept path is available yet.";
  return trail.length === 1 ? `Connected concept: ${trail[0].title}.` : `Learning orbit: ${trail.map((concept) => concept.title).join(" → ")}.`;
}

export function verifiedConceptId(value: string): string | null { return findConcept(value)?.id ?? null; }

export type NextConceptRecommendation = { concept: PhysicsConcept; mastery: number; reason: string };

function masteryFor(state: LearningState, id: string): number {
  const topic = state.topics[id];
  return topic && topic.attempts > 0 ? topic.correct / topic.attempts : 0;
}

export function recommendNextConcept(state: LearningState): NextConceptRecommendation {
  const eligible = conceptRegistry.filter((concept) => concept.prerequisites.every((id) => masteryFor(state, id) >= 0.7));
  const candidates = eligible.filter((concept) => masteryFor(state, concept.id) < 0.8);
  const concept = [...(candidates.length ? candidates : eligible)].sort((a, b) => {
    const masteryDifference = masteryFor(state, a.id) - masteryFor(state, b.id);
    return masteryDifference || a.prerequisites.length - b.prerequisites.length || conceptRegistry.indexOf(a) - conceptRegistry.indexOf(b);
  })[0] ?? conceptRegistry[0];
  const mastery = masteryFor(state, concept.id);
  const hasPrerequisites = concept.prerequisites.length > 0;
  return { concept, mastery, reason: mastery > 0 ? `You are building confidence in ${concept.title}.` : hasPrerequisites ? `Your prerequisite work opens the next step: ${concept.title}.` : `Start with this foundation: ${concept.title}.` };
}
