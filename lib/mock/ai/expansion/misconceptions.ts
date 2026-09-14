import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import type { MisconceptionHit, MisconceptionPattern } from "./types";

const FAMILIES: MisconceptionPattern["family"][] = [
  "sign",
  "unit",
  "formula",
  "variable",
  "concept",
  "graph",
  "direction",
  "vector",
  "rounding",
  "premature-rounding",
  "assumption",
];

function diagnostic(family: MisconceptionPattern["family"], topicTitle: string, equation: string): string {
  switch (family) {
    case "sign":
      return `The magnitude for ${topicTitle} can be right while the sign disagrees with the chosen positive direction.`;
    case "unit":
      return `The number attached to ${topicTitle} is being reported with a unit that does not match ${equation}.`;
    case "formula":
      return `A neighbouring formula is being used in place of ${equation} for ${topicTitle}.`;
    case "variable":
      return `Two symbols in ${equation} have been swapped, so the unknown is no longer ${topicTitle}'s target.`;
    case "concept":
      return `${topicTitle} is being treated as a different physical quantity that shares a word or unit.`;
    case "graph":
      return `A slope, intercept, or area on a graph of ${topicTitle} is being read as the wrong quantity.`;
    case "direction":
      return `A direction (inward, along the displacement, from the normal) was dropped while using ${equation}.`;
    case "vector":
      return `A vector quantity in ${topicTitle} was added as if it were a scalar.`;
    case "rounding":
      return `The last step rounded in a way that hides whether ${equation} was applied correctly.`;
    case "premature-rounding":
      return `An intermediate value for ${topicTitle} was rounded before substitution into ${equation}.`;
    case "assumption":
      return `An idealization required by ${equation} is being used outside its stated range.`;
    default:
      return topicTitle;
  }
}

let cache: MisconceptionPattern[] | null = null;

export function getMisconceptionPatterns(): MisconceptionPattern[] {
  if (cache) return cache;
  cache = CATALOG.flatMap((topic) =>
    FAMILIES.map((family) => ({
      id: stableId("mcp", `${topic.id}-${family}`),
      family,
      conceptId: topic.conceptId,
      pattern: `${family}:${topic.example.unknown}:${topic.equation}`,
      diagnostic: diagnostic(family, topic.title, topic.equation),
      correctExplanation: `${topic.counterExample} The governing relation remains ${topic.equation}.`,
    })),
  );
  return cache;
}

export function classifyMisconception(input: {
  answer: string;
  expectedAnswer: string;
  conceptId: string;
  solutionPath?: string;
}): MisconceptionHit | null {
  const patterns = getMisconceptionPatterns().filter((item) => item.conceptId === input.conceptId);
  const text = `${input.answer} ${input.solutionPath ?? ""}`.toLowerCase();
  const expected = input.expectedAnswer.toLowerCase();
  if (/\bm\/s\b/.test(input.answer) && /m\/s²|m\/s\^2/.test(expected)) {
    const hit = patterns.find((item) => item.family === "unit");
    if (hit) return { misconceptionId: hit.id, confidence: 0.86, explanation: hit.diagnostic, family: hit.family };
  }
  if (input.answer.trim().startsWith("-") && !expected.startsWith("-")) {
    const hit = patterns.find((item) => item.family === "sign");
    if (hit) return { misconceptionId: hit.id, confidence: 0.8, explanation: hit.diagnostic, family: hit.family };
  }
  if (/graph|slope|intercept/.test(text)) {
    const hit = patterns.find((item) => item.family === "graph");
    if (hit) return { misconceptionId: hit.id, confidence: 0.7, explanation: hit.diagnostic, family: hit.family };
  }
  if (/air resistance|frictionless|ideal/.test(text) && /fail|not valid|important/.test(text)) {
    const hit = patterns.find((item) => item.family === "assumption");
    if (hit) return { misconceptionId: hit.id, confidence: 0.72, explanation: hit.diagnostic, family: hit.family };
  }
  const formula = patterns.find((item) => item.family === "formula");
  if (formula && input.answer !== input.expectedAnswer) {
    return { misconceptionId: formula.id, confidence: 0.42, explanation: formula.diagnostic, family: formula.family };
  }
  return null;
}

export function errorAwareTutorLine(hit: MisconceptionHit, conceptId: string): string {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  switch (hit.family) {
    case "unit":
      return `The digits may match a calculation for ${topic.title}, but ${topic.example.unknown} cannot be reported in that unit if the model is ${topic.equation}.`;
    case "sign":
      return `Keep the positive direction you chose for ${topic.title}. A sign error here is a convention error, not a new force.`;
    case "formula":
      return `Stay on ${topic.equation}. A neighbouring slogan does not substitute for ${topic.title}.`;
    case "graph":
      return `Read the axis labels before naming a slope for ${topic.title}.`;
    default:
      return hit.explanation;
  }
}
