import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import type { DialogueIntentFixture, DialogueIntentId, IntentConfidence, SocraticTree, SocraticNode } from "./types";

export const DIALOGUE_INTENTS: DialogueIntentId[] = [
  "askDefinition",
  "askWhy",
  "askHow",
  "askExample",
  "askCounterexample",
  "askApplication",
  "askComparison",
  "askCalculation",
  "askVerification",
  "askHint",
  "askSimplification",
  "askDeepDive",
  "askSimulation",
  "askExperiment",
  "askStudyPlan",
  "askReview",
];

const TEMPLATES: Record<DialogueIntentId, (title: string, equation: string) => string> = {
  askDefinition: (title) => `What exactly is ${title}?`,
  askWhy: (title) => `Why does ${title} work that way rather than the opposite?`,
  askHow: (title, equation) => `How do I use ${equation} for ${title} without skipping units?`,
  askExample: (title) => `Give a concrete numerical example of ${title}.`,
  askCounterexample: (title) => `When does the usual slogan about ${title} fail?`,
  askApplication: (title) => `Where would I actually use ${title} in a lab or exam?`,
  askComparison: (title) => `How is ${title} different from the quantity students mix it with?`,
  askCalculation: (title, equation) => `Compute the unknown in ${title} using ${equation}.`,
  askVerification: (title) => `Check whether my ${title} answer is dimensionally allowed.`,
  askHint: (title) => `Hint only — do not finish the ${title} calculation.`,
  askSimplification: (title) => `Explain ${title} in one careful sentence.`,
  askDeepDive: (title, equation) => `What assumption sits behind ${equation} in ${title}?`,
  askSimulation: (title) => `Which control should I change first in a ${title} simulation?`,
  askExperiment: (title) => `What would I measure to test ${title}?`,
  askStudyPlan: (title) => `How should I review ${title} in 20 minutes?`,
  askReview: (title) => `What from ${title} should I re-check before a quiz?`,
};

let intentCache: DialogueIntentFixture[] | null = null;

export function getDialogueIntents(): DialogueIntentFixture[] {
  if (intentCache) return intentCache;
  intentCache = CATALOG.flatMap((topic) =>
    DIALOGUE_INTENTS.map((intent, index) => {
      const confidence: IntentConfidence = index % 7 === 0 ? "low" : index % 3 === 0 ? "medium" : "high";
      const prompt = TEMPLATES[intent](topic.title, topic.equation);
      return {
        id: stableId("dlg", `${topic.id}-${intent}`),
        prompt,
        intent,
        confidence,
        conceptId: topic.conceptId,
        clarification: confidence === "low" ? clarificationFor(topic.title, topic.conceptId, intent) : undefined,
      };
    }),
  );
  return intentCache;
}

export function classifyDialogueIntent(prompt: string): DialogueIntentFixture {
  const text = prompt.toLowerCase();
  const exact = getDialogueIntents().find((item) => item.prompt.toLowerCase() === text);
  if (exact) return exact;
  const scored = getDialogueIntents()
    .map((item) => ({ item, n: overlap(text, item.prompt.toLowerCase()) }))
    .sort((a, b) => b.n - a.n || a.item.id.localeCompare(b.item.id))[0];
  if (!scored || scored.n < 2) {
    return {
      id: "dlg-low-unknown",
      prompt,
      intent: "askDefinition",
      confidence: "low",
      conceptId: "kinematics",
      clarification: "Are you asking for a definition, a calculation, or a simulation of a named physics concept?",
    };
  }
  return scored.n < 4 ? { ...scored.item, confidence: "low", clarification: scored.item.clarification ?? clarificationFor(scored.item.prompt, scored.item.conceptId, scored.item.intent) } : scored.item;
}

function overlap(a: string, b: string): number {
  const words = a.split(/\W+/).filter((word) => word.length > 3);
  return words.filter((word) => b.includes(word)).length;
}

export function clarificationFor(title: string, conceptId: string, intent: DialogueIntentId): string {
  switch (intent) {
    case "askCalculation":
      return `For ${title}, which unknown do you want, and which values with units are given?`;
    case "askComparison":
      return `Are you comparing ${title} with a neighbouring quantity in ${conceptId}, or with a graph feature?`;
    case "askSimulation":
      return `Should I recommend a control change in the ${title} lab, or an interpretation of an already-running graph?`;
    case "askDefinition":
      return `Do you want the one-sentence definition of ${title}, or the equation that belongs with it?`;
    default:
      return `Is this about gravitational force near Earth, or a different ${conceptId} situation for ${title}?`;
  }
}

let clarificationCache: Array<{ id: string; conceptId: string; question: string }> | null = null;

export function getClarificationPrompts() {
  if (clarificationCache) return clarificationCache;
  const stems = [
    (title: string) => `Are you asking about ${title} as a definition or as a calculation with units?`,
    (title: string) => `For ${title}, is the system a single particle, a pair, or an extended object?`,
    (title: string) => `Should I treat ${title} with air resistance neglected, or is drag part of the model?`,
    (title: string) => `Is the unknown in ${title} a vector component or a magnitude?`,
    (title: string) => `Do you want ${title} near Earth’s surface, or a more general field?`,
    (title: string) => `Are the values for ${title} already in SI, or do they need converting first?`,
    (title: string) => `Is this ${title} question from a graph, a free-body diagram, or a word problem?`,
    (title: string) => `For ${title}, which sign convention did you choose as positive?`,
  ];
  clarificationCache = CATALOG.flatMap((topic) =>
    stems.map((stem, index) => ({
      id: stableId("clq", `${topic.id}-${index}`),
      conceptId: topic.conceptId,
      question: stem(topic.title),
    })),
  );
  return clarificationCache;
}

const BANDS: SocraticTree["learnerBand"][] = ["beginner", "intermediate", "advanced", "confident-but-wrong", "uncertain", "stuck"];

let treeCache: SocraticTree[] | null = null;

export function getSocraticTrees(): SocraticTree[] {
  if (treeCache) return treeCache;
  treeCache = CATALOG.flatMap((topic, topicIndex) => {
    const band = BANDS[topicIndex % BANDS.length];
    const extra = BANDS[(topicIndex + 3) % BANDS.length];
    return [band, extra].map((learnerBand) => {
      const prefix = `${topic.id}-${learnerBand}`;
      const nodes: SocraticNode[] = [
        { id: `${prefix}-q`, kind: "question", text: `What is given in this ${topic.title} situation?`, nextIds: [`${prefix}-h`] },
        { id: `${prefix}-h`, kind: "hint", text: `Keep ${topic.example.known.map((item) => item.name).join(", ")} visible with units.`, nextIds: [`${prefix}-c`] },
        { id: `${prefix}-c`, kind: "counterquestion", text: learnerBand === "confident-but-wrong" ? `If that were ${topic.misconception}, what would go wrong?` : `Which quantity is still unknown?`, nextIds: [`${prefix}-e`] },
        { id: `${prefix}-e`, kind: "equation", text: `Does ${topic.equation} actually contain the unknown?`, nextIds: [`${prefix}-k`] },
        { id: `${prefix}-k`, kind: "check", text: `What unit must ${topic.example.unknown} carry if ${topic.equation} holds?`, nextIds: [`${prefix}-r`] },
        { id: `${prefix}-r`, kind: "reflection", text: `Would a classmate mix ${topic.title} with the usual slogan “${topic.misconception}”?`, nextIds: [] },
      ];
      return { id: stableId("soc", prefix), conceptId: topic.conceptId, learnerBand, rootId: `${prefix}-q`, nodes };
    });
  });
  return treeCache;
}

export type ConversationBranch = {
  id: string;
  conceptId: string;
  prompt: string;
  branches: Array<{ id: string; label: string; response: string; next?: string }>;
};

let branchCache: ConversationBranch[] | null = null;

export function getConversationBranches(): ConversationBranch[] {
  if (branchCache) return branchCache;
  branchCache = CATALOG.flatMap((topic) => [
    {
      id: stableId("br", topic.id),
      conceptId: topic.conceptId,
      prompt: `Help me with ${topic.title}.`,
      branches: [
        { id: "concept", label: "conceptual clarification", response: topic.beginner, next: "example" },
        { id: "calc", label: "calculation", response: `${topic.example.prompt} Principle: ${topic.example.principle}` },
        { id: "sim", label: "simulation", response: `Open ${topic.simulationId}. ${topic.intuitionFirst}` },
        { id: "why", label: "why", response: topic.standard },
        { id: "example", label: "example", response: topic.example.prompt },
      ],
    },
    {
      id: stableId("br", `${topic.id}-force`),
      conceptId: topic.conceptId,
      prompt: `Is there a force I am missing in ${topic.title}?`,
      branches: [
        { id: "clarify", label: "conceptual clarification", response: `Name interactions, not slogans. For ${topic.title}: ${topic.oneSentence}` },
        { id: "calc", label: "calculation", response: `If the unknown is ${topic.example.unknown}, start from ${topic.equation}.` },
        { id: "sim", label: "simulation", response: `Change one control in ${topic.simulationId} and watch ${topic.example.unknown}.` },
        { id: "exam", label: "exam trap", response: topic.commonMistake },
      ],
    },
  ]);
  return branchCache;
}

export function getInterruptionFixtures() {
  return CATALOG.slice(0, 16).flatMap((topic) => [
    { id: stableId("int", `${topic.id}-new`), kind: "new-question" as const, text: `Wait — switch to ${topic.followUps[0] ?? topic.title}` },
    { id: stableId("int", `${topic.id}-cancel`), kind: "cancel" as const, text: "Stop generating." },
    { id: stableId("int", `${topic.id}-concept`), kind: "change-concept" as const, text: `Actually this is about ${topic.conceptId}, not the previous idea.` },
    { id: stableId("int", `${topic.id}-value`), kind: "correct-value" as const, text: `The mass is ${topic.example.known[0]?.value ?? 2} ${topic.example.known[0]?.unit ?? "kg"}, not the number I typed.` },
  ]);
}
