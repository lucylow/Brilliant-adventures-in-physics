import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import { extractEntities } from "./entities";

export type MultimodalSession = {
  id: string;
  conceptId: string;
  modalities: Array<"text" | "image" | "equation" | "graph" | "simulation" | "lab">;
  prompt: string;
  imageType?: string;
  detected: string[];
  response: string;
  references: { simulationId: string; lessonId: string };
};

export function getMultimodalSessions(): MultimodalSession[] {
  const kinds: MultimodalSession["modalities"][] = [
    ["text", "image"],
    ["image", "equation"],
    ["image", "graph"],
    ["image", "equation", "text"],
    ["simulation", "text"],
    ["lab", "text", "graph"],
  ];
  return CATALOG.flatMap((topic, index) => {
    const modalities = kinds[index % kinds.length];
    const imageType = index % 5 === 0 ? "free-body" : index % 5 === 1 ? "circuit" : index % 5 === 2 ? "ray" : index % 5 === 3 ? "graph" : "worksheet";
    const detected =
      imageType === "circuit" ? ["battery", "resistor", "node", "branch"]
        : imageType === "ray" ? ["normal", "incident-ray", "refracted-ray", "angle"]
          : imageType === "graph" ? ["trend", "slope-candidate"]
            : imageType === "free-body" ? ["force-arrow", topic.example.unknown]
              : extractEntities(topic.example.prompt).map((item) => item.kind);
    return [{
      id: stableId("mm", `${topic.id}-a`),
      conceptId: topic.conceptId,
      modalities,
      prompt: imageType === "free-body" ? `Why is this force here in the ${topic.title} diagram?` : `Read this ${imageType} with the ${topic.title} question.`,
      imageType,
      detected,
      response:
        imageType === "circuit" ? `Label battery, resistors, and nodes before writing ${topic.equation}. This is mock vision.`
          : imageType === "ray" ? `Angles are measured from the normal. ${topic.equation} is Snell’s law only when this is refraction.`
            : imageType === "graph" ? `Name the slope’s unit from the axes before claiming it is ${topic.example.unknown}.`
              : `Detected (mock): ${detected.join(", ")}. ${topic.beginner}`,
      references: { simulationId: topic.simulationId, lessonId: topic.lessonId },
    }, {
      id: stableId("mm", `${topic.id}-b`),
      conceptId: topic.conceptId,
      modalities: ["text", "equation", "simulation"],
      prompt: topic.example.prompt,
      detected: topic.example.known.map((item) => item.name),
      response: `Structured knowns from the prompt. Model: ${topic.equation}. Visual: ${topic.simulationId}.`,
      references: { simulationId: topic.simulationId, lessonId: topic.lessonId },
    }];
  });
}

export function getWritingTransforms() {
  const ops = ["rewrite", "simplify", "summarize", "expand", "clarify"] as const;
  return CATALOG.flatMap((topic) =>
    ops.map((op) => ({
      id: stableId("wrt", `${topic.id}-${op}`),
      conceptId: topic.conceptId,
      op,
      input: topic.standard,
      output:
        op === "simplify" ? topic.oneSentence
          : op === "summarize" ? topic.flash
            : op === "expand" ? `${topic.standard} ${topic.counterExample}`
              : op === "clarify" ? `${topic.beginner} Limitation of the analogy: ${topic.analogy.limitation}`
                : topic.examReview,
    })),
  );
}

export function getLengthProfiles() {
  return CATALOG.flatMap((topic) => {
    const profiles = [
      { profile: "micro" as const, text: topic.oneSentence },
      { profile: "short" as const, text: topic.flash },
      { profile: "medium" as const, text: topic.standard },
      { profile: "long" as const, text: `${topic.standard} ${topic.examReview}` },
      { profile: "deepDive" as const, text: `${topic.advanced} ${topic.mathematical} ${topic.counterExample}` },
    ];
    return profiles.map((item) => ({
      id: stableId("len", `${topic.id}-${item.profile}`),
      profile: item.profile,
      conceptId: topic.conceptId,
      blocks: [
        { kind: "paragraph" as const, text: item.text },
        { kind: "equation" as const, text: topic.equation, equation: topic.equation },
        ...(item.profile === "deepDive" ? [{ kind: "warning" as const, text: topic.commonMistake }] : []),
        ...(item.profile === "long" ? [{ kind: "tip" as const, text: topic.followUps[0] ?? topic.flash, items: topic.followUps }] : []),
      ],
    }));
  });
}

export function getUiStressResponses() {
  const topic = CATALOG[0];
  return [
    { id: "ui-single", kind: "single-line", text: topic.oneSentence },
    { id: "ui-long", kind: "long", text: CATALOG.map((item) => item.standard).join(" ") },
    { id: "ui-eq", kind: "equation-heavy", text: CATALOG.map((item) => item.equation).join(" ; ") },
    { id: "ui-list", kind: "list-heavy", text: CATALOG.slice(0, 8).map((item) => `- ${item.title}`).join("\n") },
    { id: "ui-table", kind: "table-like", text: "quantity | value | unit\nmass | 2 | kg\na | 3 | m/s²" },
    { id: "ui-mixed", kind: "mixed-media", text: `${topic.oneSentence} [sim:${topic.simulationId}] [eq:${topic.equation}]` },
  ];
}
