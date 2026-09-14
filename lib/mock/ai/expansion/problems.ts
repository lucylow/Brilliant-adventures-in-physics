import { CATALOG, type CatalogTopic } from "../ai-catalog";
import { runVerifiedCalc, verifyTopicCalculation } from "../ai-verification";
import { stableId } from "../../utils/ids";
import type { AssumptionConflict, StructuredProblem } from "./types";

const ASSUMPTIONS: Array<{ statement: string; reason: string; failsWhen: string }> = [
  { statement: "neglect air resistance", reason: "Drag is small compared with weight at these speeds.", failsWhen: "the object is light and fast enough that drag is comparable to weight" },
  { statement: "assume an ideal rope", reason: "The rope is treated as massless and inextensible so tension is uniform.", failsWhen: "the rope stretches or has non-negligible mass" },
  { statement: "neglect friction", reason: "The surface is specified as smooth, so mechanical energy is easier to track.", failsWhen: "a thermal rise or a stopping distance is the actual unknown" },
  { statement: "uniform gravitational field", reason: "Height changes are tiny compared with Earth's radius, so g is constant.", failsWhen: "orbital motion or large altitude changes enter the problem" },
  { statement: "small-angle approximation", reason: "sinθ ≈ θ (radians) for a pendulum or slope labeled small.", failsWhen: "the angle is tens of degrees" },
  { statement: "ideal gas", reason: "PV = nRT is the local model, with point particles and elastic collisions.", failsWhen: "the gas is near condensation or high density" },
  { statement: "point-mass approximation", reason: "Size is small compared with the distances in the force law.", failsWhen: "extended charge or mass distributions matter" },
  { statement: "thin-lens approximation", reason: "Lens thickness is neglected relative to object and image distances.", failsWhen: "a thick lens or strong aberration is in play" },
  { statement: "ohmic resistor", reason: "V = IR with constant R is the circuit model.", failsWhen: "the component is temperature-dependent or non-ohmic" },
  { statement: "constant acceleration", reason: "The SUVAT set requires a fixed vector a.", failsWhen: "force (hence a) changes during the interval" },
];

function assumptionsFor(topic: CatalogTopic) {
  if (topic.verified?.kind === "projectile-range") return [ASSUMPTIONS[0], ASSUMPTIONS[3]];
  if (topic.conceptId === "circuits") return [ASSUMPTIONS[8]];
  if (topic.conceptId === "oscillation") return [ASSUMPTIONS[4], ASSUMPTIONS[2]];
  if (topic.conceptId === "gas-laws") return [ASSUMPTIONS[5]];
  if (topic.conceptId === "optics") return [ASSUMPTIONS[7]];
  if (topic.conceptId === "coulomb-law") return [ASSUMPTIONS[6]];
  return [ASSUMPTIONS[9], ASSUMPTIONS[3]];
}

let problemCache: StructuredProblem[] | null = null;

export function getStructuredProblems(): StructuredProblem[] {
  if (problemCache) return problemCache;
  const difficulties = ["intro", "easy", "medium", "hard", "challenge"] as const;
  const kinds = ["direct", "multi-step", "what-if", "unit", "graph", "error-analysis", "estimation"] as const;
  const extraKinds = ["lab-data", "estimation"] as const;
  problemCache = CATALOG.flatMap((topic) => [
    ...difficulties.map((difficulty, index) => {
      const scale = difficulty === "intro" || difficulty === "easy" ? 0.5 : difficulty === "hard" || difficulty === "challenge" ? 1.8 : 1;
      const knowns = topic.example.known.map((item) => ({ ...item, value: Number((item.value * scale).toPrecision(4)) }));
      const verified = topic.verified
        ? runVerifiedCalc(topic.verified.kind, topic.verified.inputs)
        : verifyTopicCalculation(topic);
      return {
        id: stableId("stp", `${topic.id}-${difficulty}`),
        prompt: `${topic.example.prompt} [${difficulty} / ${kinds[index % kinds.length]}]`,
        conceptId: topic.conceptId,
        knowns,
        unknowns: [topic.example.unknown],
        constraints: [`Stay inside ${topic.equation}`, `Report ${topic.example.unknown} with a unit`],
        assumptions: assumptionsFor(topic).map((item) => ({ statement: item.statement, reason: item.reason })),
        equations: [topic.equation],
        requiredSteps: ["knowns", "principle", "equation", "substitute", "unit-check", "reasonableness"],
        verified: verified ? { name: verified.name, value: verified.value, unit: verified.unit } : undefined,
      };
    }),
    ...extraKinds.map((kind) => {
      const verified = verifyTopicCalculation(topic);
      return {
        id: stableId("stp", `${topic.id}-${kind}`),
        prompt: kind === "lab-data"
          ? `From a mock table for ${topic.experiment.name}, estimate ${topic.example.unknown} using ${topic.equation}.`
          : `Order-of-magnitude estimate: is ${topic.example.unknown} closer to everyday or lab scale in ${topic.title}?`,
        conceptId: topic.conceptId,
        knowns: topic.example.known,
        unknowns: [topic.example.unknown],
        constraints: [`Do not invent extra digits`, `Keep ${topic.equation}`],
        assumptions: assumptionsFor(topic).map((item) => ({ statement: item.statement, reason: item.reason })),
        equations: [topic.equation],
        requiredSteps: kind === "lab-data" ? ["table", "trend", "equation", "uncertainty"] : ["scale", "principle", "reasonableness"],
        verified: verified ? { name: verified.name, value: verified.value, unit: verified.unit } : undefined,
      };
    }),
  ]);
  return problemCache;
}

export function getAssumptionLibrary() {
  return ASSUMPTIONS;
}

export function getAssumptionConflicts(): AssumptionConflict[] {
  return CATALOG.map((topic, index) => {
    const assumption = assumptionsFor(topic)[0] ?? ASSUMPTIONS[0];
    return {
      id: stableId("asc", topic.id),
      conceptId: topic.conceptId,
      assumption: assumption.statement,
      failureMode: assumption.failsWhen,
      flag: `Do not silently keep “${assumption.statement}” for ${topic.title} when ${assumption.failsWhen}. Index ${index}.`,
    };
  });
}

export function getApproximationFixtures() {
  return [
    { id: "approx-small-angle", name: "small-angle approximation", statement: "sinθ ≈ θ (rad) ≈ tanθ", validWhen: "θ ≲ 10°", conceptId: "oscillation" },
    { id: "approx-constant-g", name: "constant-g approximation", statement: "g = 9.80665 m/s², independent of height", validWhen: "Δh ≪ Earth radius", conceptId: "gravitational-energy" },
    { id: "approx-ideal-gas", name: "ideal-gas approximation", statement: "PV = nRT", validWhen: "low density, away from condensation", conceptId: "gas-laws" },
    { id: "approx-point-mass", name: "point-mass approximation", statement: "size neglected next to separation", validWhen: "r ≫ object size", conceptId: "coulomb-law" },
    { id: "approx-thin-lens", name: "thin-lens approximation", statement: "lens thickness neglected", validWhen: "thickness ≪ object/image distances", conceptId: "optics" },
  ];
}

export function reasoningSummaryFor(problem: StructuredProblem) {
  return {
    problemInterpretation: problem.prompt,
    selectedPrinciple: problem.assumptions[0]?.reason ?? "Use the local catalog principle.",
    equation: problem.equations[0],
    substitution: problem.knowns.map((item) => `${item.name}=${item.value} ${item.unit}`).join(", "),
    calculation: problem.verified ? `${problem.verified.name}=${problem.verified.value} ${problem.verified.unit}` : "no numerical claim",
    unitCheck: `Unknown ${problem.unknowns[0]} must match ${problem.equations[0]}.`,
    reasonableness: problem.verified ? "Compare magnitude with everyday scale after the unit check." : "Explanation only.",
    provenance: problem.verified ? "verified" : "generated",
  };
}
