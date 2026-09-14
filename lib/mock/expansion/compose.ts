import { clone } from "../utils/clone";
import {
  createAccelerationSeries,
  createCurrentSeries,
  createEnergySeries,
  createForceSeries,
  createPositionSeries,
  createTimeSeries,
  createVelocitySeries,
  createVoltageSeries,
} from "./generators/series";
import { createOhmGraph, createProjectileGraph, createPvGraph, createWavelengthFrequencyGraph, graphFromSeries } from "./generators/graphs";
import { createLabExperimentCatalog } from "./datasets/lab-experiments";
import { createCircuitCatalog, createCircuitFaults, createFieldGrid, createFigures, createFreeBodyCatalog, createMagnetismRecords, createUncertaintySet, createVectorLibrary } from "./datasets/circuits-fields";
import { createDiscoveryCards, createMisconceptionCatalog, createWhyQuestions } from "./datasets/discovery";
import { createDailyChallenges, createExpansionFlashcards, createFermiProblems, createMicroLessons, createQuestionsOfTheDay, createScienceFacts, createSeasonalCampaigns, createWeeklyCampaigns } from "./datasets/calendar";
import { createConstants, createConversions, createFormulaIndex, createGraphPractice, createLabDesignQuestions, createSafetyReminders, createScales, createTablePractice, createUnitRecords } from "./datasets/literacy";
import {
  createCampaignProblems,
  createClassroom,
  createCosmologyRecords,
  createExamSessions,
  createExtraTutorSessions,
  createHintLadders,
  createJourneys,
  createLeaderboard,
  createMissionBranches,
  createModernPack,
  createScientists,
  createSocialProof,
  createSpaceBodies,
  createSpaceMissions,
  createTimelines,
  createWavesAndThermal,
} from "./datasets/campaigns";
import { createMechanicsProblems } from "./datasets/mechanics-pack";
import { createContextExamples, createExplanationLibrary, createSportsMusicEngineeringNotes } from "./datasets/contexts";
import { createErrorInjections, createPersistenceFixtures } from "./datasets/persistence";
import { createActivityTimeline } from "./factories";
import type { AnalysisScenario, ContentPackId, GraphDataset, MeasurementSeries, MockExpansion } from "./types";

const ALL_PACKS: ContentPackId[] = ["mechanics", "waves", "electricity", "optics", "thermal", "modern", "space", "literacy", "classroom"];

let cached: { key: string; value: MockExpansion } | null = null;

function emptyExpansion(packs: ContentPackId[]): MockExpansion {
  return {
    version: "1.1.0",
    packsLoaded: packs,
    labExperiments: [],
    series: [],
    graphs: [],
    csvTables: [],
    analysis: [],
    uncertainties: [],
    figures: [],
    freeBodies: [],
    vectors: [],
    circuits: [],
    circuitFaults: [],
    fieldGrids: [],
    magnetism: [],
    optics: [],
    waves: [],
    sound: [],
    thermal: [],
    gas: [],
    relativity: [],
    quantum: [],
    atomic: [],
    nuclear: [],
    astro: [],
    cosmology: [],
    extraMissions: [],
    missionBranches: [],
    discoveryCards: [],
    whyQuestions: [],
    misconceptions: [],
    hintLadders: [],
    explanations: [],
    contexts: [],
    journeys: [],
    exams: [],
    extraProblems: [],
    dailyChallenges: [],
    weeklyCampaigns: [],
    seasonal: [],
    socialProof: [],
    leaderboard: [],
    scientists: [],
    timelines: [],
    flashcards: [],
    microLessons: [],
    questionsOfTheDay: [],
    facts: [],
    formulas: [],
    units: [],
    conversions: [],
    fermi: [],
    scales: [],
    constants: [],
    graphPractice: [],
    tablePractice: [],
    labDesign: [],
    safety: [],
    persistenceFixtures: [],
    errorInjections: [],
    extraTutorSessions: [],
  };
}

function createSeriesLibrary(): MeasurementSeries[] {
  return [
    createTimeSeries({ seed: "t-linear", sampleCount: 20, slope: 1 }),
    createPositionSeries({ seed: "x-const-a", sampleCount: 24, offset: 0, slope: 1.5, amplitude: 0.8 }),
    createVelocitySeries({ seed: "v-linear", sampleCount: 24, offset: 2, slope: 0.6 }),
    createAccelerationSeries({ seed: "a-flat", sampleCount: 16, offset: 1.2, trend: "flat" }),
    createForceSeries({ seed: "f-linear", sampleCount: 16, offset: 0, slope: 4 }),
    createEnergySeries({ seed: "e-shm", sampleCount: 24 }),
    createVoltageSeries({ seed: "v-rc", sampleCount: 20, offset: 0, amplitude: 12, trend: "saturating" }),
    createCurrentSeries({ seed: "i-ohm", sampleCount: 20, offset: 0, amplitude: 12, trend: "linear" }),
  ];
}

function createGraphLibrary(series: MeasurementSeries[]): GraphDataset[] {
  const position = series.find((item) => item.kind === "position");
  const velocity = series.find((item) => item.kind === "velocity");
  const acceleration = series.find((item) => item.kind === "acceleration");
  const force = series.find((item) => item.kind === "force");
  const energy = series.find((item) => item.kind === "energy");
  const graphs: GraphDataset[] = [createProjectileGraph(), createOhmGraph([2, 4, 6, 8, 10, 12]), createPvGraph(), createWavelengthFrequencyGraph()];
  if (position) graphs.push(graphFromSeries("graph-xt", "Position versus time", "motion-graphs", position, position, "quadratic"));
  if (velocity) graphs.push(graphFromSeries("graph-vt", "Velocity versus time", "motion-graphs", velocity, velocity, "linear"));
  if (acceleration) graphs.push(graphFromSeries("graph-at", "Acceleration versus time", "motion-graphs", acceleration, acceleration, "flat"));
  if (force) graphs.push(graphFromSeries("graph-fx", "Force versus displacement", "elasticity", force, force, "linear"));
  if (energy) graphs.push(graphFromSeries("graph-et", "Energy versus time", "energy", energy, energy, "oscillating"));
  return graphs;
}

function createAnalysis(graphs: GraphDataset[]): AnalysisScenario[] {
  const templates: Array<Pick<AnalysisScenario, "trendType" | "expectedObservation" | "commonIncorrectInterpretation" | "hint">> = [
    { trendType: "linear", expectedObservation: "A straight line; slope has units of y/x.", commonIncorrectInterpretation: "Reading a point as the slope.", hint: "Use a rise over a run that spans several points." },
    { trendType: "exponential-decay", expectedObservation: "y falls as 1/x or as an exponential, depending on the axes.", commonIncorrectInterpretation: "Calling every curve ‘exponential’.", hint: "Check whether xy or ln y is constant." },
    { trendType: "quadratic", expectedObservation: "x grows faster than linearly; a v–t slope should be constant if a is constant.", commonIncorrectInterpretation: "Treating the curve as two unrelated lines.", hint: "Plot x vs t² if you suspect constant a." },
    { trendType: "oscillating", expectedObservation: "A repeating amplitude around a center.", commonIncorrectInterpretation: "Reading noise as a second frequency.", hint: "Estimate T from neighboring peaks." },
    { trendType: "linear", expectedObservation: "Scatter around a line; one point may be an outlier.", commonIncorrectInterpretation: "Forcing the line through the outlier.", hint: "Ask whether the point fails a repeated trial." },
    { trendType: "saturating", expectedObservation: "y approaches a ceiling.", commonIncorrectInterpretation: "Fitting a line through the plateau.", hint: "Name the limiting value." },
  ];
  return graphs.slice(0, 9).map((graph, index) => {
    const template = templates[index % templates.length];
    return {
      id: `analysis-${graph.id}`,
      title: `Interpret ${graph.title}`,
      graphId: graph.id,
      conceptId: graph.conceptId,
      ...template,
    };
  });
}

export function mechanicsPack(): Partial<MockExpansion> {
  const labs = createLabExperimentCatalog().filter((lab) => lab.category === "mechanical");
  return {
    labExperiments: labs,
    extraProblems: createMechanicsProblems(),
    freeBodies: createFreeBodyCatalog(),
    vectors: createVectorLibrary(),
    uncertainties: createUncertaintySet(),
  };
}

export function wavesPack(): Partial<MockExpansion> {
  const labs = createLabExperimentCatalog().filter((lab) => lab.category === "waves");
  const wt = createWavesAndThermal();
  return { labExperiments: labs, waves: wt.waves, sound: wt.sound };
}

export function electricityPack(): Partial<MockExpansion> {
  const labs = createLabExperimentCatalog().filter((lab) => lab.category === "circuits" || lab.category === "electricity" || lab.category === "magnetism");
  return {
    labExperiments: labs,
    circuits: createCircuitCatalog(),
    circuitFaults: createCircuitFaults(),
    fieldGrids: [createFieldGrid()],
    magnetism: createMagnetismRecords(),
  };
}

export function opticsPack(): Partial<MockExpansion> {
  const labs = createLabExperimentCatalog().filter((lab) => lab.category === "optics");
  return { labExperiments: labs, optics: createWavesAndThermal().optics, figures: createFigures() };
}

export function thermalPack(): Partial<MockExpansion> {
  const labs = createLabExperimentCatalog().filter((lab) => lab.category === "thermal");
  const wt = createWavesAndThermal();
  return { labExperiments: labs, thermal: wt.thermal, gas: wt.gas };
}

export function modernPack(): Partial<MockExpansion> {
  const labs = createLabExperimentCatalog().filter((lab) => lab.category === "modern");
  const modern = createModernPack();
  return { labExperiments: labs, ...modern };
}

export function spacePack(): Partial<MockExpansion> {
  const labs = createLabExperimentCatalog().filter((lab) => lab.category === "space");
  return {
    labExperiments: labs,
    extraMissions: createSpaceMissions(),
    missionBranches: createMissionBranches(),
    astro: createSpaceBodies(),
    cosmology: createCosmologyRecords(),
  };
}

export function literacyPack(): Partial<MockExpansion> {
  return {
    dailyChallenges: createDailyChallenges(),
    weeklyCampaigns: createWeeklyCampaigns(),
    seasonal: createSeasonalCampaigns(),
    questionsOfTheDay: createQuestionsOfTheDay(),
    facts: createScienceFacts(),
    flashcards: createExpansionFlashcards(),
    microLessons: createMicroLessons(),
    fermi: createFermiProblems(),
    formulas: createFormulaIndex(),
    units: createUnitRecords(),
    conversions: createConversions(),
    constants: createConstants(),
    scales: createScales(),
    labDesign: createLabDesignQuestions(),
    safety: createSafetyReminders(),
    discoveryCards: createDiscoveryCards(),
    whyQuestions: createWhyQuestions(),
    misconceptions: createMisconceptionCatalog(),
    explanations: createExplanationLibrary(),
    contexts: [...createContextExamples(), ...createSportsMusicEngineeringNotes()],
    persistenceFixtures: createPersistenceFixtures(),
    errorInjections: createErrorInjections(),
  };
}

export function classroomPack(): Partial<MockExpansion> {
  return {
    journeys: createJourneys(),
    extraTutorSessions: createExtraTutorSessions(),
    classroom: createClassroom(),
    leaderboard: createLeaderboard(),
    socialProof: createSocialProof(),
    scientists: createScientists(),
    timelines: createTimelines(),
  };
}

const PACK_LOADERS: Record<ContentPackId, () => Partial<MockExpansion>> = {
  mechanics: mechanicsPack,
  waves: wavesPack,
  electricity: electricityPack,
  optics: opticsPack,
  thermal: thermalPack,
  modern: modernPack,
  space: spacePack,
  literacy: literacyPack,
  classroom: classroomPack,
};

function mergePart(target: MockExpansion, part: Partial<MockExpansion>): void {
  (Object.keys(part) as Array<keyof MockExpansion>).forEach((key) => {
    const value = part[key];
    if (value === undefined) return;
    const current = target[key];
    if (Array.isArray(current) && Array.isArray(value)) {
      (target[key] as unknown[]) = [...current, ...clone(value)];
    } else if (key !== "version" && key !== "packsLoaded") {
      (target as Record<string, unknown>)[key] = clone(value);
    }
  });
}

export function composeMockDataset(packs: ReadonlyArray<Partial<MockExpansion>>, loaded: ContentPackId[] = ALL_PACKS): MockExpansion {
  const target = emptyExpansion(loaded);
  for (const pack of packs) mergePart(target, pack);
  return target;
}

function dedupeById<T extends { id?: string; challengeId?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = item.id ?? item.challengeId ?? "";
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function buildMockExpansion(packs: ContentPackId[] = ALL_PACKS): MockExpansion {
  const key = [...packs].sort().join(",");
  if (cached?.key === key) return cached.value;
  const selected = packs.filter((pack) => ALL_PACKS.includes(pack));
  const parts = selected.map((pack) => PACK_LOADERS[pack]());
  const composed = composeMockDataset(parts, selected);

  const series = createSeriesLibrary();
  const graphs = createGraphLibrary(series);
  const labs = dedupeById(composed.labExperiments.length ? composed.labExperiments : createLabExperimentCatalog());
  const extraProblems = dedupeById([...composed.extraProblems, ...createCampaignProblems()]);
  const extraMissions = composed.extraMissions.length ? composed.extraMissions : createSpaceMissions();

  const expansion: MockExpansion = {
    ...composed,
    labExperiments: labs,
    series,
    graphs,
    csvTables: labs.map((lab) => lab.data),
    analysis: createAnalysis(graphs),
    extraProblems,
    extraMissions,
    missionBranches: composed.missionBranches.length ? composed.missionBranches : createMissionBranches(),
    hintLadders: createHintLadders(extraProblems),
    exams: createExamSessions(extraProblems.map((problem) => problem.id)),
    graphPractice: createGraphPractice(graphs.map((graph) => graph.id)),
    tablePractice: createTablePractice(labs.map((lab) => lab.data.id)),
    extraTutorSessions: composed.extraTutorSessions.length ? composed.extraTutorSessions : createExtraTutorSessions(),
  };
  cached = { key, value: expansion };
  return expansion;
}

export function invalidateMockExpansion(): void {
  cached = null;
}

export function contentPackIds(): ContentPackId[] {
  return [...ALL_PACKS];
}

export { createActivityTimeline };
