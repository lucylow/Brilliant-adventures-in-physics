import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import type { ExperimentAnalysis, SimulationCopilotTurn, TrendKind } from "./types";
import { getWhatIfScenarios } from "./what-if";

const COPILOT_PROMPTS = [
  "What should I change?",
  "What does this graph mean?",
  "Why did the object stop?",
  "What happens if I increase gravity?",
  "Which variable is on the vertical axis?",
  "Is this run consistent with the equation?",
  "What is a next measurement?",
];

let simCache: SimulationCopilotTurn[] | null = null;

export function getSimulationCopilotTurns(): SimulationCopilotTurn[] {
  if (simCache) return simCache;
  const whatIf = getWhatIfScenarios();
  simCache = CATALOG.flatMap((topic) =>
    COPILOT_PROMPTS.map((user, index) => {
      const related = whatIf.find((item) => item.conceptId === topic.conceptId);
      const assistant =
        index === 0 ? `Change one control in ${topic.simulationId}: start with ${topic.example.known[0]?.name ?? "the independent variable"}.`
          : index === 1 ? `Read axis labels. Slope language only matches ${topic.equation} if the axes are the matching pair.`
            : index === 2 ? `Stopping is not mysterious: name the interaction that removed the energy or momentum in ${topic.title}.`
              : index === 3 ? (related ? `${related.question} ${related.principle} Under ${related.assumption}, ${related.after.name} becomes ${related.after.value} ${related.after.unit}.` : `Raising g changes flight time in projectile models; it does not invent a new force name.`)
                : index === 4 ? `The vertical axis should be a quantity in ${topic.equation}, not a decorative percentage.`
                  : index === 5 ? `Compare the on-screen number with the deterministic model ${topic.equation}. If they disagree, mark a mismatch rather than trusting the prettier one.`
                    : `Measure ${topic.experiment.observation} and keep uncertainty visible.`;
      return {
        id: stableId("scp", `${topic.id}-${index}`),
        simulationId: topic.simulationId,
        conceptId: topic.conceptId,
        user,
        assistant,
        provenance: index === 3 && related ? "verified" : "generated",
      };
    }),
  );
  return simCache;
}

const TRENDS: TrendKind[] = ["linear", "quadratic", "inverse", "exponential", "oscillatory", "piecewise", "none"];

let expCache: ExperimentAnalysis[] | null = null;

export function getExperimentAnalyses(): ExperimentAnalysis[] {
  if (expCache) return expCache;
  const tasks: ExperimentAnalysis["task"][] = ["slope", "trend", "outlier", "uncertainty", "theory", "residuals"];
  expCache = CATALOG.flatMap((topic, index) =>
    tasks.map((task, taskIndex) => {
      const trend = TRENDS[(index + taskIndex) % TRENDS.length];
      return {
        id: stableId("exa", `${topic.id}-${task}`),
        conceptId: topic.conceptId,
        task,
        trend,
        observed: topic.experiment.observation,
        inferred: `A ${trend} pattern is consistent with ${topic.equation} only if the axes match the model.`,
        expected: topic.example.principle,
        uncertaintyNote: "Report a range, not an extra significant figure the instrument cannot support.",
      };
    }),
  );
  return expCache;
}

export function getOutlierFixtures() {
  return [
    { id: "out-single", kind: "single-outlier" as const, note: "One point sits far from the trend; check a unit prefix before rewriting the model." },
    { id: "out-multi", kind: "multiple-outliers" as const, note: "Several points fail the same way — look for a systematic offset." },
    { id: "out-none", kind: "no-outlier" as const, note: "Scatter is consistent with stated uncertainty." },
    { id: "out-shift", kind: "systematic-shift" as const, note: "The whole series is offset; zero error is more likely than a new force." },
  ];
}

export function getLabReportReviews() {
  const sections = ["hypothesis", "procedure", "results", "conclusion"] as const;
  return CATALOG.flatMap((topic) =>
    sections.map((section) => ({
      id: stableId("labr", `${topic.id}-${section}`),
      conceptId: topic.conceptId,
      section,
      feedback:
        section === "hypothesis" ? `Tie the hypothesis to ${topic.equation}, not to a hoped-for number.`
          : section === "procedure" ? `Name the independent variable in ${topic.experiment.name} and what is held fixed.`
            : section === "results" ? `Keep ${topic.experiment.observation} distinct from interpretation.`
              : `Conclusion must separate observed (${topic.experiment.observation}) from inferred (the ${topic.equation} model).`,
      assistanceLabel: "Demo AI lab-report assistance — not a fabricated result.",
    })),
  );
}

export function getExperimentCopilotStages() {
  const stages = ["setup", "prediction", "measurement", "analysis", "conclusion"] as const;
  return CATALOG.flatMap((topic) =>
    stages.map((stage) => ({
      id: stableId("ecs", `${topic.id}-${stage}`),
      conceptId: topic.conceptId,
      stage,
      prompt: `Help with the ${stage} of ${topic.experiment.name}.`,
      response:
        stage === "setup" ? topic.experiment.objective
          : stage === "prediction" ? `If ${topic.equation} holds, you should see ${topic.experiment.observation}.`
            : stage === "measurement" ? "Record value, unit, and instrument precision together."
              : stage === "analysis" ? topic.experiment.analysis
                : "State observed, inferred, and expected as three separate sentences.",
    })),
  );
}

export function experimentConclusion(conceptId: string) {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  return {
    observed: topic.experiment.observation,
    inferred: `The pattern is consistent with ${topic.equation} inside the stated assumptions.`,
    expected: topic.example.principle,
  };
}
