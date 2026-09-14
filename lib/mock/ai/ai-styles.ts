import type { TutorResponseStyle } from "./ai-types";
import type { CatalogTopic } from "./ai-catalog";
import { explanationText } from "./ai-catalog";

export type StyleRenderer = {
  id: TutorResponseStyle;
  label: string;
  render: (topic: CatalogTopic, focus: string) => string;
};

function clip(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export const STYLE_RENDERERS: StyleRenderer[] = [
  {
    id: "concise",
    label: "Concise",
    render: (topic, focus) => clip(`${topic.oneSentence} Focus: ${focus}. Equation: ${topic.equation}.`),
  },
  {
    id: "standard",
    label: "Standard",
    render: (topic, focus) => clip(`${topic.standard} ${focus} stays inside that model. ${topic.flash}`),
  },
  {
    id: "step-by-step",
    label: "Step-by-step",
    render: (topic, focus) =>
      clip(`1) Name the system for ${topic.title}. 2) List knowns with units. 3) Use ${topic.equation}. 4) ${focus} 5) Check units and size. ${topic.examReview}`),
  },
  {
    id: "socratic",
    label: "Socratic",
    render: (topic, focus) =>
      clip(`Before the answer: which quantity in ${topic.title} is known, and which is asked? ${focus} The principle hiding here is captured by ${topic.equation}. What would a unit check reject?`),
  },
  {
    id: "visual",
    label: "Visual",
    render: (topic, focus) =>
      clip(`Sketch ${topic.title}: mark the variables in ${topic.equation}. ${topic.intuitionFirst} ${focus} A useful visual is the ${topic.simulationId} simulation.`),
  },
  {
    id: "analogy-first",
    label: "Analogy-first",
    render: (topic, focus) =>
      clip(`${topic.analogy.analogy} maps to ${topic.title} because ${topic.analogy.mapping}. Limitation: ${topic.analogy.limitation} ${focus}`),
  },
  {
    id: "equation-first",
    label: "Equation-first",
    render: (topic, focus) =>
      clip(`Start from ${topic.equation}. ${topic.mathematical} ${focus} Keep every term’s unit visible before substituting.`),
  },
  {
    id: "exam-style",
    label: "Exam-style",
    render: (topic, focus) =>
      clip(`${topic.examReview} Method: knowns → principle → ${topic.equation} → substitute → unit check. ${focus} Common mistake: ${topic.commonMistake}`),
  },
  {
    id: "remedial",
    label: "Remedial",
    render: (topic, focus) =>
      clip(`A frequent mix-up for ${topic.title} is: ${topic.misconception} The correction: ${topic.counterExample} ${topic.beginner} ${focus}`),
  },
  {
    id: "advanced",
    label: "Advanced",
    render: (topic, focus) => clip(`${explanationText(topic, "advanced")} ${focus} ${topic.mathematical}`),
  },
];

export function styleById(id: TutorResponseStyle): StyleRenderer {
  const found = STYLE_RENDERERS.find((style) => style.id === id);
  if (!found) throw new Error(`Unknown style ${id}`);
  return found;
}

export const HINT_DEPTHS = ["subtle", "directional", "equation", "substitution", "near-complete", "final-check"] as const;

export function hintForTopic(topic: CatalogTopic, depth: (typeof HINT_DEPTHS)[number], variant: number): { text: string; revealsAnswer: boolean } {
  const extra = variant % 2 === 0 ? topic.flash : topic.oneSentence;
  switch (depth) {
    case "subtle":
      return { text: `Which physical idea is ${topic.title} actually about? ${extra}`, revealsAnswer: false };
    case "directional":
      return { text: `List the knowns with units, then name the unknown for ${topic.title}. ${topic.beginner}`, revealsAnswer: false };
    case "equation":
      return { text: `The governing relationship is ${topic.equation}. ${topic.examReview}`, revealsAnswer: false };
    case "substitution":
      return { text: `Write ${topic.equation}, then substitute the labeled knowns from the problem. Do not skip the unit of each symbol. ${topic.commonMistake}`, revealsAnswer: false };
    case "near-complete":
      return { text: `After substitution into ${topic.equation}, complete the arithmetic and keep the unit of the unknown. Example setup: ${topic.example.prompt}`, revealsAnswer: false };
    case "final-check":
      return { text: `Check three things for ${topic.title}: unit of the unknown, sign/direction, and whether the magnitude is physically plausible. ${topic.counterExample}`, revealsAnswer: false };
    default:
      return { text: extra, revealsAnswer: false };
  }
}
