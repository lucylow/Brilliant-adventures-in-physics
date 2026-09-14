import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import type { ExplainLikeMode } from "../ai-types";
import { explanationText } from "../ai-catalog";

export function explainLike(conceptId: string, mode: ExplainLikeMode): { conceptId: string; mode: ExplainLikeMode; text: string } {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  const text = (() => {
    switch (mode) {
      case "one-sentence":
        return topic.oneSentence;
      case "simple":
      case "middle-school":
        return topic.kidFriendly;
      case "high-school":
        return topic.standard;
      case "college":
        return topic.advanced;
      case "technical":
        return topic.mathematical;
      case "analogy":
        return `${topic.analogy.analogy} Mapping: ${topic.analogy.mapping} Limitation: ${topic.analogy.limitation}`;
      case "equations-only":
        return topic.equation;
      case "oral-exam":
        return `${topic.examReview} Say the knowns, the principle, ${topic.equation}, then the unit of ${topic.example.unknown}.`;
      default:
        return topic.beginner;
    }
  })();
  return { conceptId: topic.conceptId, mode, text };
}

export function getFlashExplanations() {
  return CATALOG.map((topic) => ({
    id: stableId("flash", topic.id),
    conceptId: topic.conceptId,
    seconds: 20,
    text: topic.flash,
  }));
}

export function getVisualExplanations() {
  return CATALOG.map((topic) => ({
    conceptId: topic.conceptId,
    visualType: "simulation" as const,
    diagramType: topic.domain === "Electricity" ? "circuit" as const : topic.domain === "Waves" ? "wave" as const : "motion" as const,
    simulationId: topic.simulationId,
    animationSuggestion: `Animate the variables in ${topic.equation}.`,
    highlightedVariables: topic.example.known.map((item) => item.name),
    body: explanationText(topic, "intuition-first"),
  }));
}

export function getLabReportAssists() {
  return CATALOG.map((topic) => ({
    conceptId: topic.conceptId,
    assistanceLabel: "Demo AI lab-report assistance — not a substitute for your measurements.",
    hypothesisFeedback: `A testable hypothesis for ${topic.title} should name a measurable quantity, not a slogan.`,
    procedureFeedback: `Change one variable at a time. ${topic.experiment.objective}`,
    resultsInterpretation: `Assistance only: ${topic.experiment.observation} Compare with ${topic.equation}; do not invent missing data.`,
    conclusionSuggestions: `State whether the evidence agrees with ${topic.example.principle}, and name uncertainty.`,
    errorAnalysis: "Separate random scatter from a systematic offset (zero error, calibration, reaction time).",
  }));
}

export function getNotebookAssists() {
  return CATALOG.map((topic) => ({
    conceptId: topic.conceptId,
    summarizeNote: `Note summary (Demo AI): ${topic.oneSentence}`,
    explainEquation: `${topic.equation} — ${topic.mathematical}`,
    flashcardsFromNote: [`Define ${topic.title}`, `When does ${topic.equation} apply?`],
    findMisconception: topic.misconception,
    suggestReview: topic.examReview,
    relatedConcepts: topic.conceptId,
  }));
}

export function getMotivationMessages() {
  return CATALOG.slice(0, 20).flatMap((topic) => [
    { kind: "milestone" as const, text: `You finished a verified attempt on ${topic.title}. That matters because ${topic.oneSentence}` },
    { kind: "streak" as const, text: `A short return to ${topic.flash} is enough. This is not a guilt prompt.` },
    { kind: "recovery" as const, text: `A miss on ${topic.title} is data: ${topic.commonMistake} is a known trap, not a character flaw.` },
    { kind: "challenge" as const, text: `Optional: ${topic.example.prompt}` },
    { kind: "curiosity" as const, text: `Curiosity prompt: ${topic.followUps[0]}` },
  ]);
}

export function getAchievementExplanations() {
  return [
    { achievementId: "first-step", text: "The first verified attempt matters because it creates a local record you can actually review." },
    { achievementId: "steady-reasoner", text: "Five attempts is enough to see a pattern in units or signs rather than a single lucky hit." },
    { achievementId: "topic-builder", text: "Working two topics shows you can move between models instead of memorizing one screen." },
    { achievementId: "lesson-lab-loop", text: "Lesson plus lab is the product’s intended loop: explain, then measure." },
    { achievementId: "verified-thinking", text: "80% after three attempts is local evidence, not a live ranking against other students." },
  ];
}

export function getReflectionPrompts() {
  return CATALOG.flatMap((topic) => [
    `What assumption did you make in ${topic.title}?`,
    `Which step in ${topic.equation} was hardest?`,
    `Which unit check would have caught an error in ${topic.example.unknown}?`,
  ]);
}

export function getFavorites() {
  return CATALOG.slice(0, 24).map((topic, index) => ({
    id: stableId("fav", topic.id),
    kind: (["explanation", "hint", "conversation", "analogy"] as const)[index % 4],
    conceptId: topic.conceptId,
    title: topic.title,
    body: index % 4 === 3 ? topic.analogy.analogy : topic.oneSentence,
  }));
}

export function getTutorExportFixture() {
  return {
    generatedAt: "2026-09-14T16:00:00.000Z",
    label: "Demo AI export — development mock, not a live provider transcript",
    sessions: getNotebookAssists().slice(0, 8).map((item) => ({ conceptId: item.conceptId, summary: item.summarizeNote })),
    omitted: ["apiKey", "authorization", "rawPrompt", "providerSecret"],
  };
}
