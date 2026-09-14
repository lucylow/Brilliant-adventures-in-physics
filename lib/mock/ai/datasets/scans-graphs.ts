import { stableId } from "../../utils/ids";
import { CATALOG } from "../ai-catalog";
import type {
  AIConfidenceBand,
  GraphAnalysisResponse,
  ScanAnalysisResponse,
  SimulationRecommendationResponse,
  TableAnalysisResponse,
} from "../ai-types";

const IMAGE_TYPES = ["textbook-problem", "handwritten-equation", "free-body", "circuit", "ray-diagram", "graph", "lab-setup", "whiteboard", "worksheet"] as const;
const BANDS: AIConfidenceBand[] = ["veryHigh", "high", "medium", "low", "failed"];
const GRAPH_TYPES = ["position-time", "velocity-time", "force-extension", "iv", "wave", "energy", "cooling"] as const;
const GRAPH_TASKS = ["describe-trend", "identify-slope", "identify-intercept", "find-maximum", "find-period", "find-threshold", "detect-outlier", "compare-curves"] as const;

let scanCache: ScanAnalysisResponse[] | null = null;
let graphCache: GraphAnalysisResponse[] | null = null;
let tableCache: TableAnalysisResponse[] | null = null;
let simRecCache: SimulationRecommendationResponse[] | null = null;

function bandConfidence(band: AIConfidenceBand): number {
  switch (band) {
    case "veryHigh":
      return 0.96;
    case "high":
      return 0.86;
    case "medium":
      return 0.64;
    case "low":
      return 0.38;
    case "failed":
      return 0;
    default:
      return 0.5;
  }
}

export function getScanAnalyses(): ScanAnalysisResponse[] {
  if (scanCache) return scanCache;
  scanCache = CATALOG.flatMap((topic, topicIndex) =>
    IMAGE_TYPES.slice(0, 4).map((imageType, imageIndex) => {
      const band = BANDS[(topicIndex + imageIndex) % BANDS.length];
      const ambiguous = band === "low" || band === "medium" || band === "failed";
      return {
        id: stableId("scan", `${topic.id}-${imageType}-${band}`),
        imageType,
        mockImageReference: `mock-image://${topic.id}/${imageType}`,
        detectedText: imageType === "handwritten-equation"
          ? topic.equation.replace("²", "2")
          : `${topic.example.prompt} [${imageType}]`,
        detectedObjects: imageType === "free-body"
          ? ["arrow-weight", "arrow-normal", "surface"]
          : imageType === "circuit"
            ? ["battery", "resistor", "ammeter"]
            : imageType === "ray-diagram"
              ? ["incident-ray", "normal", "boundary"]
              : [topic.title, "axes"],
        equations: [topic.equation],
        variables: topic.example.known.map((item, index) => ({
          name: item.name,
          value: band === "failed" ? null : item.value,
          unit: item.unit,
          ambiguous: ambiguous && index === 0,
        })),
        units: [...new Set(topic.example.known.map((item) => item.unit))],
        confidence: bandConfidence(band),
        confidenceBand: band,
        ambiguities: ambiguous
          ? [
              imageIndex % 2 === 0
                ? `I detected two possible values for an angle or digit in ${topic.title}. Which one should I use?`
                : `OCR may have turned a superscript into a digit in ${topic.equation}.`,
            ]
          : [],
        suggestedCorrection: ambiguous ? `Confirm the knowns: ${topic.example.known.map((item) => `${item.name}=${item.value} ${item.unit}`).join(", ")}.` : undefined,
        clarificationQuestion: band === "low" || band === "failed"
          ? `I am not confident reading this ${imageType} for ${topic.title}. Which known value is correct?`
          : undefined,
        isMock: true,
      };
    }),
  );
  const ocrExtras: ScanAnalysisResponse[] = [
    { id: "scan-ocr-0o", imageType: "handwritten-equation", mockImageReference: "mock-image://ocr/0o", detectedText: "v = 1O m/s", detectedObjects: ["digit-letter-confusion"], equations: ["v = 10 m/s"], variables: [{ name: "v", value: null, unit: "m/s", ambiguous: true }], units: ["m/s"], confidence: 0.34, confidenceBand: "low", ambiguities: ["0/O confusion: is the speed 10 m/s or an unknown O?"], suggestedCorrection: "Confirm whether the symbol is 0 or O.", clarificationQuestion: "Is the handwritten character a zero or the letter O?", isMock: true },
    { id: "scan-ocr-1l", imageType: "handwritten-equation", mockImageReference: "mock-image://ocr/1l", detectedText: "I = 1 A", detectedObjects: ["current-or-length"], equations: ["I = 1 A"], variables: [{ name: "I", value: 1, unit: "A", ambiguous: true }], units: ["A"], confidence: 0.4, confidenceBand: "low", ambiguities: ["1/l confusion: current I versus length l."], suggestedCorrection: "If this is current, keep A. If length, the unit cannot be amperes.", clarificationQuestion: "Is that an I (current) or an l (length)?", isMock: true },
    { id: "scan-ocr-sup", imageType: "whiteboard", mockImageReference: "mock-image://ocr/sup", detectedText: "v2 = 9.8", detectedObjects: ["superscript-loss"], equations: ["v² = 9.8"], variables: [{ name: "v", value: null, unit: "m/s", ambiguous: true }], units: ["m/s"], confidence: 0.42, confidenceBand: "low", ambiguities: ["Superscript loss: v² became v2."], suggestedCorrection: "Ask whether the student wrote v² or a labeled v2.", clarificationQuestion: "Did you mean v squared?", isMock: true },
    { id: "scan-ocr-minus", imageType: "worksheet", mockImageReference: "mock-image://ocr/minus", detectedText: "a = 2.0 m/s²", detectedObjects: ["minus-loss"], equations: ["a = −2.0 m/s²"], variables: [{ name: "a", value: 2, unit: "m/s²", ambiguous: true }], units: ["m/s²"], confidence: 0.5, confidenceBand: "medium", ambiguities: ["A leading minus sign may have been lost."], suggestedCorrection: "Confirm the declared positive axis.", clarificationQuestion: "Is acceleration opposite the chosen positive direction?", isMock: true },
    { id: "scan-ocr-decimal", imageType: "textbook-problem", mockImageReference: "mock-image://ocr/dec", detectedText: "m = 25 kg", detectedObjects: ["decimal-loss"], equations: ["m = 2.5 kg"], variables: [{ name: "m", value: 25, unit: "kg", ambiguous: true }], units: ["kg"], confidence: 0.48, confidenceBand: "medium", ambiguities: ["Decimal loss: 2.5 may have been read as 25."], suggestedCorrection: "Check whether 25 kg is reasonable for the object.", clarificationQuestion: "Is the mass 2.5 kg or 25 kg?", isMock: true },
    { id: "scan-ocr-greek", imageType: "handwritten-equation", mockImageReference: "mock-image://ocr/mu", detectedText: "u = 0.4", detectedObjects: ["greek-letter"], equations: ["μ = 0.4"], variables: [{ name: "μ", value: 0.4, unit: "1", ambiguous: true }], units: ["1"], confidence: 0.45, confidenceBand: "medium", ambiguities: ["Greek-letter confusion: μ read as u."], suggestedCorrection: "If this is friction, μ is dimensionless; u might be a speed.", clarificationQuestion: "Is that mu (friction) or u (initial speed)?", isMock: true },
    { id: "scan-ocr-unit", imageType: "worksheet", mockImageReference: "mock-image://ocr/unit", detectedText: "t = 5 m", detectedObjects: ["unit-confusion"], equations: ["t = 5 s"], variables: [{ name: "t", value: 5, unit: "m", ambiguous: true }], units: ["m"], confidence: 0.36, confidenceBand: "low", ambiguities: ["Unit confusion: time labeled with metres."], suggestedCorrection: "Time cannot be metres. Confirm s vs m.", clarificationQuestion: "Is t a time in seconds?", isMock: true },
  ];
  scanCache = [...scanCache, ...ocrExtras];
  return scanCache;
}

export function getGraphAnalyses(): GraphAnalysisResponse[] {
  if (graphCache) return graphCache;
  graphCache = CATALOG.flatMap((topic, topicIndex) =>
    GRAPH_TASKS.map((task, taskIndex) => {
      const graphType = GRAPH_TYPES[(topicIndex + taskIndex) % GRAPH_TYPES.length];
      return {
        id: stableId("graph", `${topic.id}-${task}-${graphType}`),
        conceptId: topic.conceptId,
        graphType,
        task,
        description: graphDescription(graphType, topic.title),
        result: graphResult(task, topic.title, topic.equation),
        caution: "Read axis labels and units before claiming a slope is a physical quantity.",
      };
    }),
  );
  return graphCache;
}

function graphDescription(type: (typeof GRAPH_TYPES)[number], title: string): string {
  switch (type) {
    case "position-time":
      return `Position versus time related to ${title}. Straight segments mean constant velocity.`;
    case "velocity-time":
      return `Velocity versus time related to ${title}. Slope is acceleration; area is displacement.`;
    case "force-extension":
      return `Force versus extension. A linear region would support an ideal spring model near ${title}.`;
    case "iv":
      return `Current versus voltage. A straight line through the origin is ohmic behaviour.`;
    case "wave":
      return `Displacement versus position at a snapshot, used to read wavelength for ${title}.`;
    case "energy":
      return `Energy stores versus time or position for ${title}.`;
    case "cooling":
      return `Temperature versus time. A curve’s slope is not automatically heat.`;
    default:
      return title;
  }
}

function graphResult(task: (typeof GRAPH_TASKS)[number], title: string, equation: string): string {
  switch (task) {
    case "describe-trend":
      return `The plotted quantity for ${title} increases, decreases, or stays flat only where the model (${equation}) allows it.`;
    case "identify-slope":
      return `Slope has the unit of the vertical axis over the horizontal axis — not a free-floating number.`;
    case "identify-intercept":
      return `The intercept is the value when the horizontal variable is zero, which may or may not be physical.`;
    case "find-maximum":
      return `A maximum is where the slope changes from positive to negative, not necessarily where ${title} ‘feels biggest’.`;
    case "find-period":
      return `Period is the time between repeating features, matching T = 1/f when this is an oscillation graph.`;
    case "find-threshold":
      return `A threshold is a value where behaviour changes, as in photoelectric cut-off, not a decorative kink.`;
    case "detect-outlier":
      return `An outlier may be a measurement error or a real regime where ${equation} no longer applies.`;
    case "compare-curves":
      return `Two curves differ by a parameter in ${title}; name that parameter before inventing a new force.`;
    default:
      return title;
  }
}

export function getTableAnalyses(): TableAnalysisResponse[] {
  if (tableCache) return tableCache;
  tableCache = CATALOG.flatMap((topic, index) => {
    const known = topic.example.known;
    const rowA = known.map((item) => item.value);
    const rowB = known.map((item) => item.value * (index % 2 === 0 ? 2 : 0.5));
    const rowC = known.map((item, itemIndex) => (itemIndex === 0 ? item.value * 10 : item.value));
    return [
      {
        id: stableId("table", `${topic.id}-a`),
        conceptId: topic.conceptId,
        headers: known.map((item) => `${item.name} / ${item.unit}`),
        rows: [rowA, rowB],
        interpretation: `Rows are consistent with scaling expected from ${topic.equation} for ${topic.title}.`,
      },
      {
        id: stableId("table", `${topic.id}-b`),
        conceptId: topic.conceptId,
        headers: known.map((item) => item.name),
        rows: [rowA, rowC],
        interpretation: `One header is missing a unit. Treat the outlier-looking jump as a unit mistake until proven otherwise.`,
        missingUnits: "Column headers omitted SI units.",
        outlierNote: "The ×10 jump in the first column is more likely a prefix error than new physics.",
      },
      {
        id: stableId("table", `${topic.id}-c`),
        conceptId: topic.conceptId,
        headers: [...known.map((item) => `${item.name} / ${item.unit}`), "notes"],
        rows: [
          [...rowA, "trial 1"],
          [...rowB, "trial 2"],
          [...rowA, "repeat"],
        ],
        interpretation: `Repeats for ${topic.title} should be compared with uncertainty, not with a single exact ${topic.equation} prediction.`,
      },
      {
        id: stableId("table", `${topic.id}-d`),
        conceptId: topic.conceptId,
        headers: ["trial", ...known.map((item) => `${item.name} / ${item.unit}`)],
        rows: [[1, ...rowA], [2, ...rowB], [3, ...rowA.map((value) => value * 1.02)]],
        interpretation: `Small scatter across trials for ${topic.title} is more consistent with random error than with a new term in ${topic.equation}.`,
        outlierNote: "Trial 3 is a 2% shift — check instrument precision before rewriting the model.",
      },
    ];
  });
  return tableCache;
}

export function getSimulationRecommendations(): SimulationRecommendationResponse[] {
  if (simRecCache) return simRecCache;
  simRecCache = CATALOG.flatMap((topic) =>
    topic.starters.concat(topic.followUps).slice(0, 7).map((question, index) => ({
      question,
      conceptId: topic.conceptId,
      simulationId: topic.simulationId,
      whyHelpful: `${topic.simulationId} makes ${topic.title} visible: ${topic.intuitionFirst}`,
      suggestedParameters: Object.fromEntries(topic.example.known.map((item, itemIndex) => [item.name, item.value * (1 + 0.1 * ((index + itemIndex) % 3))])),
    })),
  );
  return simRecCache;
}

export function getExperimentRecommendations() {
  return CATALOG.map((topic) => ({
    conceptId: topic.conceptId,
    experiment: topic.experiment.name,
    objective: topic.experiment.objective,
    expectedObservation: topic.experiment.observation,
    analysisQuestion: topic.experiment.analysis,
  }));
}

export function getOcrErrorFixtures() {
  return getScanAnalyses().filter((item) => item.id.startsWith("scan-ocr"));
}
