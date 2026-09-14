import { createMockLesson } from "../factories/lesson";
import type { MockConcept, MockDifficulty, MockLesson } from "../types";

function difficultyOf(concept: MockConcept): MockDifficulty {
  return concept.difficulty;
}

function mistakesOf(concept: MockConcept): string[] {
  const fromKeywords = (concept.misconceptionKeywords ?? []).map((keyword) => `Avoid treating “${keyword}” as a physical law.`);
  const fallback = [
    `Forgetting units on ${concept.title.toLowerCase()} quantities.`,
    "Using degrees in a formula that expects radians without converting.",
    "Applying an equation outside the assumptions stated in the lesson.",
  ];
  return [...fromKeywords, ...fallback].slice(0, 3);
}

function workedExample(concept: MockConcept): MockLesson["workedExample"] {
  if (concept.equation?.includes("F_net") || concept.id === "forces") {
    return {
      prompt: "A 4.0 kg crate feels a 12 N net force. What is its acceleration?",
      steps: ["Write F_net = ma.", "a = 12 N / 4.0 kg.", "a = 3.0 m/s² in the direction of the net force."],
      answer: "3.0 m/s²",
    };
  }
  if (concept.id === "ohms-law" || concept.id === "circuits") {
    return {
      prompt: "A 9.0 V battery is connected to a 3.0 Ω resistor. Find the current.",
      steps: ["Write I = V/R for an ohmic resistor.", "I = 9.0 / 3.0.", "I = 3.0 A."],
      answer: "3.0 A",
    };
  }
  if (concept.id === "kinetic-energy" || concept.id === "energy") {
    return {
      prompt: "A 2.0 kg cart moves at 4.0 m/s. Find its kinetic energy.",
      steps: ["Write K = ½mv².", "K = 0.5 × 2.0 × 16.", "K = 16 J."],
      answer: "16 J",
    };
  }
  if (concept.id === "pendulum") {
    return {
      prompt: "A 1.0 m simple pendulum swings at small amplitude. Estimate its period. Take g = 9.81 m/s².",
      steps: ["Use T = 2π√(L/g) and state the small-angle assumption.", "T = 2π√(1/9.81).", "T ≈ 2.01 s. Mass does not appear."],
      answer: "2.01 s",
    };
  }
  if (concept.equation) {
    return {
      prompt: `Use ${concept.equation} to connect the known values to the unknown in a single-step check.`,
      steps: ["List knowns with units.", `Choose ${concept.equation} only if its assumptions apply.`, "Substitute, compute, and inspect the unit."],
      answer: "A unit-consistent numerical result",
    };
  }
  return {
    prompt: `Describe one measurement that would test the idea of ${concept.title.toLowerCase()}.`,
    steps: ["Name the observable.", "State what would count as supporting evidence.", "Note one assumption of the model."],
    answer: "A clearly labeled measurement with a unit",
  };
}

export function lessonFromConcept(concept: MockConcept, index: number, nextId?: string): MockLesson {
  const minutes = Math.max(8, Math.min(18, concept.estimatedMinutes));
  const title = concept.level === "foundation" ? `Foundations of ${concept.title}` : concept.level === "advanced" ? `${concept.title} beyond the slogan` : `Working with ${concept.title}`;
  return createMockLesson({
    id: `lesson-${concept.id}`,
    topicId: concept.topicId,
    conceptId: concept.id,
    title,
    subtitle: concept.summary,
    durationMin: minutes,
    objectiveIds: [`understand-${concept.id}`, `apply-${concept.id}`],
    difficulty: difficultyOf(concept),
    learningObjectives: [
      `State ${concept.title.toLowerCase()} in one precise sentence.`,
      concept.equation ? `Use ${concept.equation} only when the assumptions hold.` : `Identify a measurement connected to ${concept.title.toLowerCase()}.`,
      "Keep units visible through the last step.",
    ],
    introduction: `${concept.intuition} This lesson treats ${concept.title.toLowerCase()} as a model: it is powerful inside a stated domain and silent outside it.`,
    sections: [
      { heading: "The idea", body: `${concept.summary} ${concept.whyItMatters ?? `The idea matters because it connects ${concept.domain.toLowerCase()} language to something you can calculate or measure.`}` },
      { heading: "The representation", body: concept.equation ? `A compact statement is ${concept.equation}${concept.units ? ` with units ${concept.units}` : ""}. Symbols are not decoration; each one is a quantity with a unit.` : `${concept.title} is often stated in words first. Write the conditions (isolated system, small angle, ohmic resistor, v ≪ c) beside the claim.` },
      { heading: "A check", body: `Ask whether the result’s size is plausible. ${concept.domain === "Mechanics" ? "Speeds of everyday objects are usually meters per second, not kilometers per second." : "Compare the magnitude with a known benchmark from the same domain."}` },
    ],
    equations: concept.equation ? [concept.equation] : [],
    workedExample: workedExample(concept),
    checkpointQuestions: [
      { prompt: `What is ${concept.title.toLowerCase()} in one sentence?`, answer: concept.intuition },
      { prompt: "Name one assumption of the model used here.", answer: concept.level === "advanced" ? "The classical or simplified limit stated in the lesson." : "Constant parameters and neglected secondary effects as noted." },
    ],
    simulationReference: concept.simulationIds[0] ?? (index % 3 === 0 ? `sim-${concept.topicId}` : undefined),
    commonMistakes: mistakesOf(concept),
    summary: `${concept.title} is a tool: ${concept.intuition} Check units, signs, and assumptions before treating a number as a measurement.`,
    nextLessonId: nextId,
    blocks: [
      { type: "explain", data: { title: "The idea", body: concept.intuition } },
      ...(concept.equation ? [{ type: "equation" as const, data: { formula: concept.equation, caption: concept.title } }] : []),
      { type: "example", data: { title: "Worked check", body: workedExample(concept).prompt } },
      { type: "check", data: { prompt: `What would change if a key assumption of ${concept.title.toLowerCase()} failed?` } },
      { type: "reflection", data: { prompt: `Where have you seen ${concept.title.toLowerCase()} outside a textbook diagram?` } },
    ],
  });
}

export function createLessonCatalog(concepts: readonly MockConcept[]): MockLesson[] {
  const teachable = concepts.filter((concept) => concept.level !== "advanced" || concepts.indexOf(concept) < 120);
  const selected = teachable.slice(0, Math.max(80, Math.min(concepts.length, 120)));
  return selected.map((concept, index) => lessonFromConcept(concept, index, selected[index + 1] ? `lesson-${selected[index + 1].id}` : undefined));
}
