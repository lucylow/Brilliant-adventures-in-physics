import { labeledLocalFallback } from "@/lib/tutor-validation";
import { CATALOG } from "./ai-catalog";
import { MOCK_AI_PROVIDER_LABEL, type TutorResponsePayload } from "./ai-types";

export function localFallbackExplanation(question: string, conceptId?: string): TutorResponsePayload {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  const base = labeledLocalFallback(question);
  return {
    ...base,
    summary: `[Local fallback] ${base.summary} Demo AI did not generate this live.`,
    followUps: topic.followUps,
    style: "standard",
    reasoning: {
      identifiedQuantities: [],
      selectedPrinciple: topic.example.principle,
      equationUsed: topic.equation,
      unitCheck: "Fallback does not invent a calculation.",
      resultCheck: "Use Lab or Practice for a verified number.",
    },
    sourceLabel: MOCK_AI_PROVIDER_LABEL,
    confidence: 0,
  };
}

export function isFallbackText(text: string): boolean {
  return text.includes("[Local fallback]") || text.includes("not a live AI");
}
