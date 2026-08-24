import { findConcept, type PhysicsConcept } from "./concepts";

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
