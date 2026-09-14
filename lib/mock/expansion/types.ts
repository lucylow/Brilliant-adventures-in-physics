import type { MockDifficulty, MockExperiment, MockMission, MockProblem, MockTutorSession } from "../types";

export type ContentPackId =
  | "mechanics"
  | "waves"
  | "electricity"
  | "optics"
  | "thermal"
  | "modern"
  | "space"
  | "literacy"
  | "classroom";

export type SeriesKind =
  | "time"
  | "position"
  | "velocity"
  | "acceleration"
  | "force"
  | "energy"
  | "temperature"
  | "pressure"
  | "voltage"
  | "current"
  | "frequency"
  | "wavelength"
  | "angle";

export type SeriesTrend = "flat" | "linear" | "quadratic" | "exponential-decay" | "oscillating" | "saturating";

export type MeasurementSeries = {
  id: string;
  kind: SeriesKind;
  unit: string;
  sampleCount: number;
  sampleInterval: number;
  noiseLevel: number;
  trend: SeriesTrend;
  offset: number;
  measurementResolution: number;
  seed: string;
  values: number[];
  times: number[];
  assumption: string;
};

export type CsvColumn = { header: string; unit: string };
export type CsvTable = {
  id: string;
  title: string;
  metadata: { experimentId: string; instrument: string; mockLabel: "MOCK_LAB_EXPORT" };
  columns: CsvColumn[];
  rows: number[][];
};

export type GraphAxis = { label: string; unit: string };
export type GraphPoint = { x: number; y: number };
export type GraphDataset = {
  id: string;
  title: string;
  conceptId: string;
  xAxis: GraphAxis;
  yAxis: GraphAxis;
  series: Array<{ id: string; label: string; points: GraphPoint[] }>;
  min: { x: number; y: number };
  max: { x: number; y: number };
  suggestedTrend: SeriesTrend;
};

export type AnalysisScenario = {
  id: string;
  title: string;
  graphId: string;
  trendType: SeriesTrend;
  expectedObservation: string;
  commonIncorrectInterpretation: string;
  hint: string;
  conceptId: string;
};

export type UncertaintyKind = "absolute" | "percent" | "resolution" | "random" | "systematic";
export type UncertaintyRecord = {
  id: string;
  quantity: string;
  value: number;
  unit: string;
  kind: UncertaintyKind;
  uncertainty: number;
  percentUncertainty: number;
  instrumentResolution?: number;
  note: string;
};

export type FigureKind =
  | "free-body"
  | "ray"
  | "circuit"
  | "force-vectors"
  | "velocity-vectors"
  | "electric-field"
  | "magnetic-field"
  | "orbit"
  | "energy-level"
  | "wave";

export type ScientificFigure = {
  id: string;
  title: string;
  description: string;
  kind: FigureKind;
  elements: string[];
  labels: string[];
  conceptIds: string[];
};

export type ForceVector = {
  name: "gravity" | "normal" | "tension" | "friction" | "drag" | "thrust" | "spring";
  magnitude: number;
  angleDeg: number;
  unit: "N";
};

export type FreeBodyDiagram = {
  id: string;
  title: string;
  situation: string;
  conceptId: string;
  forces: ForceVector[];
  netForceN: number;
  equilibrium: boolean;
  assumption: string;
};

export type Vector2 = { magnitude: number; angleDeg: number; x: number; y: number; unit: string; label: string };
export type VectorSet = {
  id: string;
  title: string;
  conceptId: string;
  vectors: Vector2[];
  resultant: Vector2;
  context: "two-vector" | "three-vector" | "equilibrium" | "relative-velocity" | "projectile-components";
};

export type CircuitComponent = {
  id: string;
  kind: "resistor" | "capacitor" | "inductor" | "source" | "ammeter" | "voltmeter";
  label: string;
  value: number;
  unit: string;
};

export type CircuitDefinition = {
  id: string;
  title: string;
  topology: "series" | "parallel" | "combination" | "rc" | "ac";
  components: CircuitComponent[];
  sourceVoltage: number;
  equivalentResistance: number;
  current: number;
  power: number;
  measurements: Array<{ quantity: string; value: number; unit: string }>;
  conceptId: string;
};

export type CircuitFault = {
  id: string;
  circuitId: string;
  kind: "open" | "short" | "wrong-resistor" | "reversed-polarity" | "missing" | "measurement-error" | "overload" | "wrong-connection";
  symptoms: string[];
  observations: string[];
  diagnosticHints: string[];
  expectedFix: string;
  relatedConcept: string;
};

export type FieldSample = { x: number; y: number; ex: number; ey: number; potential: number };
export type FieldGrid = {
  id: string;
  title: string;
  conceptId: string;
  charges: Array<{ x: number; y: number; q: number }>;
  samples: FieldSample[];
  assumption: string;
};

export type MagnetismRecord = {
  id: string;
  title: string;
  setup: "straight-wire" | "loop" | "solenoid" | "moving-charge";
  currentA: number;
  distanceM: number;
  fieldT: number;
  forceN?: number;
  velocityMps?: number;
  chargeC?: number;
  angleDeg: number;
  direction: string;
  conceptId: string;
};

export type OpticsMeasurement = {
  id: string;
  setup: "mirror" | "lens" | "refraction" | "tir" | "interference";
  objectDistanceM?: number;
  imageDistanceM?: number;
  focalLengthM?: number;
  magnification?: number;
  incidentDeg?: number;
  refractedDeg?: number;
  n1?: number;
  n2?: number;
  uncertainty: number;
  conceptId: string;
  assumption: string;
};

export type WaveRecord = {
  id: string;
  kind: "transverse" | "longitudinal" | "standing" | "interference" | "beats" | "doppler";
  frequencyHz: number;
  periodS: number;
  wavelengthM: number;
  amplitude: number;
  phaseRad: number;
  speedMps: number;
  conceptId: string;
};

export type SoundRecord = {
  id: string;
  scenario: "tuning" | "echo" | "doppler" | "resonance-tube" | "standing-wave";
  frequencyHz: number;
  amplitude: number;
  harmonics: number[];
  wavelengthM: number;
  speedMps: number;
  decibelLevel: number;
  waveformType: "sine" | "square" | "complex";
  conceptId: string;
};

export type ThermalRecord = {
  id: string;
  process: "heat-transfer" | "specific-heat" | "phase-change" | "expansion" | "gas-law";
  temperatureK: number;
  pressurePa?: number;
  volumeM3?: number;
  massKg: number;
  specificHeat?: number;
  energyJ: number;
  conceptId: string;
};

export type GasSnapshot = {
  id: string;
  particleCount: number;
  temperatureK: number;
  pressurePa: number;
  volumeM3: number;
  averageSpeed: number;
  maxSpeed: number;
  averageKineticEnergy: number;
  assumption: string;
};

export type RelativityRecord = {
  id: string;
  phenomenon: "time-dilation" | "length-contraction" | "momentum" | "energy" | "mass-energy";
  velocityOverC: number;
  gamma: number;
  result: number;
  unit: string;
  conceptId: string;
  educationalModel: "SPECIAL_RELATIVITY_INTRO";
};

export type QuantumRecord = {
  id: string;
  model: "photon" | "photoelectric" | "de-broglie" | "energy-level" | "double-slit";
  wavelengthM?: number;
  frequencyHz?: number;
  energyJ?: number;
  educationalModel: "SIMPLIFIED_QUANTUM_MODEL";
  conceptId: string;
  notes: string;
};

export type AtomicTransition = {
  id: string;
  initialLevel: number;
  finalLevel: number;
  energyDifferenceEv: number;
  frequencyHz: number;
  wavelengthM: number;
  process: "emission" | "absorption";
  conceptId: string;
};

export type NuclearRecord = {
  id: string;
  isotope: string;
  halfLifeS: number;
  remainingFraction: number;
  elapsedHalfLives: number;
  bindingEnergyMev?: number;
  conceptId: string;
  educationalModel: "INTRO_NUCLEAR_MODEL";
};

export type AstroBody = {
  id: string;
  name: string;
  kind: "planet" | "moon" | "star" | "exoplanet" | "galaxy" | "black-hole-demo";
  massKg: number;
  radiusM: number;
  orbitalPeriodS?: number;
  escapeVelocityMps?: number;
  source: "EDUCATIONAL_FIXTURE" | "STANDARD_SOLAR_SYSTEM";
  conceptId: string;
};

export type CosmologyRecord = {
  id: string;
  topic: "redshift" | "hubble" | "expansion" | "light-travel" | "cmb";
  value: number;
  unit: string;
  explanation: string;
  educationalModel: "INTRO_COSMOLOGY";
  conceptId: string;
};

export type MissionBranch = {
  missionId: string;
  fromStepId: string;
  on: "correct" | "incorrect" | "repeat-mistake" | "mastery";
  toStepId: string;
  note: string;
};

export type DiscoveryCard = {
  id: string;
  title: string;
  hook: string;
  fact: string;
  whyItMatters: string;
  relatedConcepts: string[];
  relatedSimulation?: string;
  difficulty: MockDifficulty;
  estimatedReadTime: number;
};

export type WhyQuestion = {
  id: string;
  question: string;
  intuition: string;
  physicsExplanation: string;
  misconception: string;
  visualSuggestion: string;
  conceptId: string;
};

export type MisconceptionRecord = {
  id: string;
  conceptId: string;
  misconception: string;
  whyItSeemsReasonable: string;
  correctModel: string;
  diagnosticQuestion: string;
  remediationLesson: string;
  remediationSimulation?: string;
};

export type HintLadder = {
  id: string;
  problemId: string;
  hint1: string;
  hint2: string;
  hint3: string;
  conceptReminder: string;
  equationHint: string;
  unitHint: string;
  finalReveal: string;
};

export type ExplanationKind = "definition" | "intuition" | "equation" | "worked-example" | "common-mistake" | "visual-analogy" | "checkpoint" | "summary";
export type ExplanationBlock = {
  id: string;
  kind: ExplanationKind;
  conceptId: string;
  title: string;
  body: string;
};

export type ContextExample = {
  id: string;
  domain: "cars" | "bikes" | "sports" | "space" | "music" | "phones" | "cameras" | "bridges" | "roller-coasters" | "weather" | "medical" | "energy" | "electronics" | "robotics";
  title: string;
  situation: string;
  conceptId: string;
  governingIdea: string;
};

export type LearnerJourney = {
  id: string;
  learnerId: string;
  startingLevel: string;
  goals: string[];
  completedTopics: string[];
  currentTopic: string;
  futureTopics: string[];
  attemptHistoryIds: string[];
  mistakeIds: string[];
  streakHistory: number[];
  recommendedNextSteps: string[];
};

export type ExamQuestionKind = "multiple-choice" | "numeric" | "unit-entry" | "conceptual" | "graph" | "equation" | "ordering" | "matching" | "multi-step";
export type ExamSession = {
  id: string;
  title: string;
  questionCount: 10 | 20 | 40 | 60;
  questionIds: string[];
  kinds: ExamQuestionKind[];
  difficultyDistribution: Record<MockDifficulty, number>;
  timeLimitMin: number;
  score: number;
  accuracy: number;
  timePerQuestionS: number;
  weakAreas: string[];
  reviewList: string[];
  mockLabel: "MOCK_EXAM";
};

export type DailyChallenge = {
  challengeId: string;
  dayIndex: number;
  title: string;
  prompt: string;
  conceptId: string;
  difficulty: MockDifficulty;
  xp: number;
  solution: string;
  streakContribution: boolean;
};

export type WeeklyCampaign = {
  id: string;
  week: number;
  theme: string;
  conceptIds: string[];
  missionIds: string[];
  simulationIds: string[];
  mockLabel: "MOCK_CAMPAIGN";
};

export type SeasonalCampaign = {
  id: string;
  name: string;
  season: "summer-lab" | "back-to-school" | "winter-motion" | "space-week" | "science-fair" | "exam-sprint";
  description: string;
  mockLabel: "MOCK_SEASONAL";
};

export type SocialProofFixture = {
  id: string;
  metric: "studentsCompletedSimulation" | "averageAccuracy" | "averageTime" | "popularTopic";
  value: number | string;
  mockLabel: "DEMO_AGGREGATE_NOT_PRODUCTION";
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  xp: number;
  level: number;
  weeklyXP: number;
  badges: number;
  fictional: true;
};

export type ClassroomAssignment = {
  id: string;
  title: string;
  kind: "practice" | "lab" | "mission" | "review" | "exam";
  dueAt: string;
  status: "assigned" | "submitted" | "scored";
  completion: number;
  score?: number;
  feedback: string;
};

export type ClassroomFixture = {
  id: string;
  name: string;
  studentIds: string[];
  assignments: ClassroomAssignment[];
  classMastery: number;
  teacherNote: string;
  fictional: true;
};

export type ScientistRecord = {
  id: string;
  name: string;
  era: string;
  field: string;
  contributions: string[];
  relatedConcepts: string[];
};

export type TimelineEvent = {
  id: string;
  year: number;
  title: string;
  detail: string;
  timeline: "mechanics" | "electromagnetism" | "quantum" | "space";
};

export type ExpansionFlashcard = {
  id: string;
  type: "definition" | "equation" | "unit" | "conceptual" | "misconception" | "visual";
  front: string;
  back: string;
  conceptId: string;
};

export type MicroLesson = {
  id: string;
  title: string;
  minutes: number;
  conceptId: string;
  body: string;
  checkpoint: string;
};

export type QuestionOfTheDay = {
  id: string;
  dayOfYear: number;
  prompt: string;
  conceptId: string;
  answer: string;
  difficulty: MockDifficulty;
};

export type ScienceFact = {
  id: string;
  text: string;
  conceptId: string;
};

export type FormulaIndexEntry = {
  id: string;
  latex: string;
  plainText: string;
  topicId: string;
  conceptId: string;
  variables: Array<{ symbol: string; unit: string }>;
  exampleProblemId?: string;
  simulationId?: string;
};

export type UnitRecord = {
  id: string;
  symbol: string;
  name: string;
  kind: "si-base" | "derived" | "prefix";
  siEquivalent?: string;
};

export type ConversionPractice = {
  id: string;
  fromValue: number;
  fromUnit: string;
  toUnit: string;
  expected: number;
  quantity: string;
};

export type FermiProblem = {
  id: string;
  prompt: string;
  assumptions: string[];
  orderOfMagnitude: number;
  unit: string;
  conceptId: string;
};

export type ScaleComparison = {
  id: string;
  left: string;
  right: string;
  ratioOrder: number;
  domain: "length" | "time" | "energy" | "mass";
};

export type ConstantRecord = {
  id: string;
  symbol: string;
  value: number;
  siUnit: string;
  description: string;
  relatedTopics: string[];
};

export type GraphPracticeItem = {
  id: string;
  graphId: string;
  ask: "slope" | "intercept" | "maximum" | "minimum" | "area" | "trend" | "crossing" | "rate";
  prompt: string;
  expected: string;
  conceptId: string;
};

export type TablePracticeItem = {
  id: string;
  csvId: string;
  prompt: string;
  expected: string;
  conceptId: string;
};

export type LabDesignQuestion = {
  id: string;
  prompt: string;
  independent: string;
  dependent: string;
  controls: string[];
  bestGraph: string;
  errorSource: string;
  conceptId: string;
};

export type SafetyReminder = {
  id: string;
  domain: "electricity" | "heat" | "light" | "mechanics";
  reminder: string;
};

export type PersistenceFixtureKind = "draftSave" | "completedSave" | "corruptedSave" | "legacySave" | "partialSave";
export type PersistenceFixture = {
  kind: PersistenceFixtureKind;
  payload: unknown;
  note: string;
};

export type ErrorInjection = {
  id: string;
  operation: string;
  code: string;
  message: string;
};

export type LabExperiment = MockExperiment & {
  subtitle: string;
  difficulty: MockDifficulty;
  objective: string;
  hypothesis: string;
  equipment: string[];
  setup: string;
  controlledVariables: string[];
  independentVariable: string;
  dependentVariable: string;
  procedure: string[];
  observations: string[];
  data: CsvTable;
  expectedPattern: string;
  analysisQuestions: string[];
  conclusion: string;
  relatedConcepts: string[];
  relatedEquations: string[];
  relatedSimulation?: string;
};

export type MockExpansion = {
  version: "1.1.0";
  packsLoaded: ContentPackId[];
  labExperiments: LabExperiment[];
  series: MeasurementSeries[];
  graphs: GraphDataset[];
  csvTables: CsvTable[];
  analysis: AnalysisScenario[];
  uncertainties: UncertaintyRecord[];
  figures: ScientificFigure[];
  freeBodies: FreeBodyDiagram[];
  vectors: VectorSet[];
  circuits: CircuitDefinition[];
  circuitFaults: CircuitFault[];
  fieldGrids: FieldGrid[];
  magnetism: MagnetismRecord[];
  optics: OpticsMeasurement[];
  waves: WaveRecord[];
  sound: SoundRecord[];
  thermal: ThermalRecord[];
  gas: GasSnapshot[];
  relativity: RelativityRecord[];
  quantum: QuantumRecord[];
  atomic: AtomicTransition[];
  nuclear: NuclearRecord[];
  astro: AstroBody[];
  cosmology: CosmologyRecord[];
  extraMissions: MockMission[];
  missionBranches: MissionBranch[];
  discoveryCards: DiscoveryCard[];
  whyQuestions: WhyQuestion[];
  misconceptions: MisconceptionRecord[];
  hintLadders: HintLadder[];
  explanations: ExplanationBlock[];
  contexts: ContextExample[];
  journeys: LearnerJourney[];
  exams: ExamSession[];
  extraProblems: MockProblem[];
  dailyChallenges: DailyChallenge[];
  weeklyCampaigns: WeeklyCampaign[];
  seasonal: SeasonalCampaign[];
  socialProof: SocialProofFixture[];
  leaderboard: LeaderboardEntry[];
  classroom?: ClassroomFixture;
  scientists: ScientistRecord[];
  timelines: TimelineEvent[];
  flashcards: ExpansionFlashcard[];
  microLessons: MicroLesson[];
  questionsOfTheDay: QuestionOfTheDay[];
  facts: ScienceFact[];
  formulas: FormulaIndexEntry[];
  units: UnitRecord[];
  conversions: ConversionPractice[];
  fermi: FermiProblem[];
  scales: ScaleComparison[];
  constants: ConstantRecord[];
  graphPractice: GraphPracticeItem[];
  tablePractice: TablePracticeItem[];
  labDesign: LabDesignQuestion[];
  safety: SafetyReminder[];
  persistenceFixtures: PersistenceFixture[];
  errorInjections: ErrorInjection[];
  extraTutorSessions: MockTutorSession[];
};
