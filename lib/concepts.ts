export type ConceptState = "unknown" | "emerging" | "developing" | "secure";
export type PhysicsConcept = { id: string; title: string; domain: string; level: "foundation" | "core" | "advanced"; prerequisites: string[]; intuition: string; equation?: string; units?: string; misconceptionKeywords?: string[] };

export const conceptHierarchy = { mechanics: ["kinematics", "forces", "energy", "momentum", "rotation"], waves: ["oscillation", "wave-motion", "sound", "optics"], electricity: ["charge", "field", "circuits", "power"], thermal: ["temperature", "heat", "gas-laws"], modern: ["relativity", "quantum-basics"] } as const;

export const conceptRegistry: PhysicsConcept[] = [
  { id: "kinematics", title: "Kinematics", domain: "Mechanics", level: "foundation", prerequisites: [], intuition: "Describe how position changes without explaining why.", equation: "v = v₀ + at", units: "m, m/s, m/s²", misconceptionKeywords: ["acceleration is speed", "moving means accelerating"] },
  { id: "forces", title: "Forces", domain: "Mechanics", level: "core", prerequisites: ["kinematics"], intuition: "Interactions change an object’s motion through net force.", equation: "F_net = ma", units: "N", misconceptionKeywords: ["normal force always equals weight", "centripetal force is a new force"] },
  { id: "energy", title: "Energy", domain: "Mechanics", level: "core", prerequisites: ["kinematics"], intuition: "Track transfers and transformations rather than memorizing isolated formulas.", equation: "K = ½mv²", units: "J" },
  { id: "momentum", title: "Momentum", domain: "Mechanics", level: "core", prerequisites: ["kinematics"], intuition: "Momentum measures motion that changes through impulse and interactions.", equation: "p = mv", units: "kg·m/s" },
  { id: "oscillation", title: "Oscillation", domain: "Waves", level: "foundation", prerequisites: [], intuition: "A repeating change around an equilibrium position provides the pattern behind many waves.", equation: "T = 1/f", units: "s, Hz" },
  { id: "wave-motion", title: "Wave Motion", domain: "Waves", level: "core", prerequisites: ["oscillation"], intuition: "A disturbance transfers energy and information without transporting matter as a whole.", equation: "v = fλ", units: "m/s" },
  { id: "sound", title: "Sound", domain: "Waves", level: "core", prerequisites: ["wave-motion"], intuition: "Sound is a mechanical wave whose frequency relates to pitch and whose amplitude relates to perceived loudness.", equation: "v = fλ", units: "Hz, m/s" },
  { id: "optics", title: "Optics", domain: "Waves", level: "core", prerequisites: ["wave-motion"], intuition: "Light changes direction at a boundary according to the refractive indices of the two media.", equation: "n₁ sin θ₁ = n₂ sin θ₂", units: "degrees" },
  { id: "total-internal-reflection", title: "Total Internal Reflection", domain: "Waves", level: "advanced", prerequisites: ["optics"], intuition: "When light travels into a lower-index medium beyond the critical angle, it reflects instead of refracting.", equation: "sin θc = n₂/n₁", units: "degrees" },
  { id: "circuits", title: "Circuits", domain: "Electricity", level: "core", prerequisites: ["charge", "field"], intuition: "Charges transfer energy through a connected path.", equation: "V = IR", units: "V, A, Ω" },
];

export function findConcept(id: string): PhysicsConcept | undefined { return conceptRegistry.find((concept) => concept.id === id); }
export function searchConcepts(query: string): PhysicsConcept[] { const term = query.trim().toLowerCase(); if (!term) return conceptRegistry; return conceptRegistry.filter((concept) => `${concept.id} ${concept.title} ${concept.domain} ${concept.intuition}`.toLowerCase().includes(term)); }
export function missingPrerequisites(id: string, mastery: Record<string, number>, threshold = 0.7): string[] { return (findConcept(id)?.prerequisites ?? []).filter((prerequisite) => (mastery[prerequisite] ?? 0) < threshold); }
export function conceptState(score: number): ConceptState { if (score < 0.25) return "unknown"; if (score < 0.5) return "emerging"; if (score < 0.8) return "developing"; return "secure"; }
export function detectMisconception(text: string): string | null { const normalized = text.toLowerCase(); const match = conceptRegistry.flatMap((concept) => (concept.misconceptionKeywords ?? []).map((keyword) => ({ concept, keyword }))).find(({ keyword }) => normalized.includes(keyword)); return match ? `${match.concept.id}:${match.keyword}` : null; }
