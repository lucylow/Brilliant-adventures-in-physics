import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import type { EvaluatedResponse, EvaluationScores, GuardrailHit, ProvenanceKind } from "./types";

function scores(partial: Partial<EvaluationScores>): EvaluationScores {
  return {
    correctness: partial.correctness ?? 0.8,
    relevance: partial.relevance ?? 0.8,
    clarity: partial.clarity ?? 0.8,
    completeness: partial.completeness ?? 0.75,
    pedagogy: partial.pedagogy ?? 0.8,
    verification: partial.verification ?? 0.7,
  };
}

let evalCache: EvaluatedResponse[] | null = null;

export function getEvaluatedResponses(): EvaluatedResponse[] {
  if (evalCache) return evalCache;
  evalCache = CATALOG.flatMap((topic) => {
    const golden: EvaluatedResponse = {
      id: stableId("ev", `${topic.id}-gold`),
      conceptId: topic.conceptId,
      text: `${topic.oneSentence} Equation ${topic.equation}. Counterexample: ${topic.counterExample}`,
      scores: scores({ correctness: 0.96, verification: 0.9, pedagogy: 0.92 }),
      provenance: "verified",
      golden: true,
      hallucinationDemo: false,
      notes: "Golden educational response for regression.",
    };
    const weak: EvaluatedResponse = {
      id: stableId("ev", `${topic.id}-thin`),
      conceptId: topic.conceptId,
      text: "It depends.",
      scores: scores({ correctness: 0.2, completeness: 0.1, pedagogy: 0.2, verification: 0 }),
      provenance: "generated",
      golden: false,
      hallucinationDemo: false,
      notes: "Too thin for a Tutor card.",
    };
    const hallu: EvaluatedResponse = {
      id: stableId("ev", `${topic.id}-hallu`),
      conceptId: topic.conceptId,
      text: `TEST DATA ONLY. Invented citation: “Smith 2099 measured ${topic.title} on Mars.” Invented value 12.3456 tesla.`,
      scores: scores({ correctness: 0, verification: 0, pedagogy: 0.1 }),
      provenance: "mock",
      golden: false,
      hallucinationDemo: true,
      notes: "Controlled hallucination fixture so the app can refuse fake sources and invented observations.",
    };
    const mismatch: EvaluatedResponse = {
      id: stableId("ev", `${topic.id}-mis`),
      conceptId: topic.conceptId,
      text: `Uses the wrong neighbouring slogan instead of ${topic.equation}.`,
      scores: scores({ correctness: 0.25, verification: 0.1 }),
      provenance: "generated",
      golden: false,
      hallucinationDemo: false,
      notes: "Wrong equation fixture.",
    };
    const unitSlip: EvaluatedResponse = {
      id: stableId("ev", `${topic.id}-unit`),
      conceptId: topic.conceptId,
      text: `${topic.oneSentence} Reported ${topic.example.unknown} without a unit.`,
      scores: scores({ correctness: 0.55, verification: 0.2, completeness: 0.4 }),
      provenance: "generated",
      golden: false,
      hallucinationDemo: false,
      notes: "Missing unit where the model requires one.",
    };
    const rounded: EvaluatedResponse = {
      id: stableId("ev", `${topic.id}-round`),
      conceptId: topic.conceptId,
      text: `${topic.oneSentence} Equation ${topic.equation}. Values shown after an allowed rounding step.`,
      scores: scores({ correctness: 0.9, verification: 0.85 }),
      provenance: "verified",
      golden: false,
      hallucinationDemo: false,
      notes: "verified-after-rounding profile.",
    };
    const overclaim: EvaluatedResponse = {
      id: stableId("ev", `${topic.id}-over`),
      conceptId: topic.conceptId,
      text: `${topic.oneSentence} This is certainly the only possible model.`,
      scores: scores({ correctness: 0.5, pedagogy: 0.2, verification: 0.2 }),
      provenance: "generated",
      golden: false,
      hallucinationDemo: false,
      notes: "Misleading certainty fixture.",
    };
    return [golden, weak, hallu, mismatch, unitSlip, rounded, overclaim];
  });
  return evalCache;
}

export function getGoldenResponses() {
  return getEvaluatedResponses().filter((item) => item.golden);
}

export function diffResponses(expected: string, actual: string): { equal: boolean; missingTokens: string[]; extraTokens: string[] } {
  const a = new Set(expected.toLowerCase().split(/\W+/).filter((token) => token.length > 3));
  const b = new Set(actual.toLowerCase().split(/\W+/).filter((token) => token.length > 3));
  return {
    equal: expected === actual,
    missingTokens: [...a].filter((token) => !b.has(token)).slice(0, 8),
    extraTokens: [...b].filter((token) => !a.has(token)).slice(0, 8),
  };
}

export function evaluateText(text: string, conceptId: string): EvaluationScores & { overall: number } {
  const topic = CATALOG.find((item) => item.conceptId === conceptId);
  const hasEq = topic ? text.includes(topic.equation.split("=")[0]?.trim() ?? "") : false;
  const hasUnit = /\b(m|s|kg|N|J|V|A|Hz)\b/.test(text);
  const halluc = /2099|invented citation|tesla on mars/i.test(text);
  const correctness = halluc ? 0 : hasEq ? 0.85 : 0.45;
  const verification = halluc ? 0 : hasUnit ? 0.7 : 0.3;
  const result = scores({ correctness, verification, completeness: Math.min(1, text.length / 280), pedagogy: hasEq ? 0.8 : 0.4 });
  const overall = (result.correctness + result.relevance + result.clarity + result.completeness + result.pedagogy + result.verification) / 6;
  return { ...result, overall };
}

export function getHallucinationDemos() {
  return getEvaluatedResponses().filter((item) => item.hallucinationDemo);
}

export function getSelfCorrectionFixtures() {
  return CATALOG.slice(0, 16).map((topic) => ({
    id: stableId("corr", topic.id),
    conceptId: topic.conceptId,
    initial: `Rough claim: ${topic.title} ignores units.`,
    verification: `Unit check against ${topic.equation}.`,
    detectedError: "missing unit / overclaim",
    corrected: topic.oneSentence,
  }));
}

export const GUARDRAIL_LIBRARY: GuardrailHit[] = [
  { id: "grd-domain", code: "unsupported-domain", userMessage: "Demo AI only answers physics-learning questions in this app.", retry: false, fallback: "Open a concept from the catalog.", diagnosticId: "AI-GRD-UNSUPPORTED", recoveryAction: "Ask about a named concept." },
  { id: "grd-data", code: "insufficient-data", userMessage: "That question is missing a value or a unit.", retry: true, fallback: "Clarification question.", diagnosticId: "AI-GRD-INSUFFICIENT", recoveryAction: "Add one known with a unit." },
  { id: "grd-assume", code: "unsafe-assumption", userMessage: "The idealization you named does not apply here. Demo AI will not silently keep it.", retry: true, fallback: "Flag the assumption.", diagnosticId: "AI-GRD-ASSUME", recoveryAction: "Restate the model limits." },
  { id: "grd-certain", code: "misleading-certainty", userMessage: "This answer is not a verified calculation. Confidence is not truth.", retry: false, fallback: "Lower-confidence wording.", diagnosticId: "AI-GRD-CERTAIN", recoveryAction: "Show verification status." },
  { id: "grd-cite", code: "fake-citation", userMessage: "Demo AI will not invent papers or instruments.", retry: false, fallback: "Refuse the citation.", diagnosticId: "AI-GRD-CITE", recoveryAction: "Use the local lesson instead." },
  { id: "grd-obs", code: "fabricated-observation", userMessage: "That observation is not in the mock lab record.", retry: false, fallback: "Ask for the measured table.", diagnosticId: "AI-GRD-OBS", recoveryAction: "Paste real (or mock) measurements." },
  { id: "grd-calc", code: "invalid-calculation", userMessage: "The numerical claim disagrees with the deterministic engine.", retry: true, fallback: "Show mismatch status.", diagnosticId: "AI-GRD-CALC", recoveryAction: "Re-run verification." },
];

export function recoveryMatrix() {
  return GUARDRAIL_LIBRARY.map((item) => ({
    code: item.code,
    userMessage: item.userMessage,
    retry: item.retry,
    fallback: item.fallback,
    diagnostic: item.diagnosticId,
    recoveryAction: item.recoveryAction,
  }));
}

export function unsupportedInputs() {
  return [
    { id: "un-empty", prompt: "", response: "Ask a physics question with a concept or a value and unit." },
    { id: "un-image", prompt: "[unreadable image]", response: "The mock scan is unreadable. Retake or type the knowns." },
    { id: "un-vars", prompt: "Find v.", response: "v of which object, at which time, with which unit?" },
    { id: "un-contra", prompt: "Mass is 2 kg and 8 kg for the same object.", response: "Those masses contradict. Which value should I use?" },
    { id: "un-unit", prompt: "Speed is 12 smoots per fortnight.", response: "That unit is not in the local converter. Use SI or a listed unit." },
  ];
}

export function knowledgeConflicts() {
  return CATALOG.slice(0, 12).map((topic) => ({
    id: stableId("kc", topic.id),
    conceptId: topic.conceptId,
    sourceA: { kind: "lesson" as const, claim: topic.standard },
    sourceB: { kind: "mock-dataset" as const, claim: `A stale note says ${topic.misconception}` },
    resolution: "Flag the conflict. Prefer the lesson plus a deterministic check; do not silently pick the slogan.",
  }));
}

export type ProvenanceStamp = { provenance: ProvenanceKind; source: "lesson" | "equation-library" | "deterministic-calculator" | "mock-dataset" | "user-input" };

export function stampProvenance(hasVerifiedNumber: boolean, fromUser: boolean): ProvenanceStamp {
  if (fromUser) return { provenance: "user-provided", source: "user-input" };
  if (hasVerifiedNumber) return { provenance: "verified", source: "deterministic-calculator" };
  return { provenance: "generated", source: "mock-dataset" };
}
