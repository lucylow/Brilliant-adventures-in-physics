import { isoDaysAgo } from "../../clock";
import { createMockMission } from "../../factories/mission";
import { createMockProblem } from "../../factories/problem";
import { createMockTutorSession } from "../../factories/tutor-session";
import { gammaFromBeta, hydrogenTransition } from "../physics";
import { PHYSICS } from "@/lib/physics";
import type { AstroBody, AtomicTransition, ClassroomFixture, CosmologyRecord, ExamSession, GasSnapshot, HintLadder, LearnerJourney, LeaderboardEntry, MissionBranch, NuclearRecord, OpticsMeasurement, QuantumRecord, RelativityRecord, ScientistRecord, SocialProofFixture, SoundRecord, ThermalRecord, TimelineEvent, WaveRecord } from "../types";
import type { MockMission, MockProblem, MockTutorSession } from "../../types";

const H_TIMES_C = PHYSICS.h * PHYSICS.c;

export function createSpaceMissions(): MockMission[] {
  const seeds: Array<[string, string, string, string]> = [
    ["land-moon", "Land on a Moon", "escape-velocity", "Use energy to judge a soft landing burn."],
    ["match-orbit", "Match an Orbit", "orbits", "Raise a circular orbit by a Hohmann-style educational burn."],
    ["rescue-sat", "Rescue a Satellite", "impulse", "A docking impulse must match Δp."],
    ["calc-escape", "Calculate Escape Velocity", "escape-velocity", "Compute v_esc = √(2GM/r) with published GM."],
    ["navigate-thrust", "Navigate a Thruster", "newtons-laws", "Net force including thrust and weight."],
    ["measure-planet", "Measure a Planet", "gravitation", "Estimate g from a drop on a demo world."],
    ["detect-star", "Detect a Star", "blackbody", "Peak wavelength as a temperature clue."],
    ["decode-spectrum", "Decode a Spectrum", "hydrogen-spectrum", "Match a line to a level jump."],
    ["heat-shield", "Build a Heat Shield", "heat", "Energy dump during a reentry sketch."],
    ["predict-reentry", "Predict a Reentry", "projectile-motion", "Ballistic arc with air neglected first."],
  ];
  const extraTitles = [
    "Relay the Beacon", "Map a Crater", "Time a Transit", "Balance a Reaction Wheel", "Store Solar Energy",
    "Filter a Dust Storm", "Align an Antenna", "Calibrate a Magnetometer", "Sample an Atmosphere", "Chart a Lagrange Sketch",
    "Track a Comet", "Spin-Stabilize", "Deploy a Sail", "Rove a Slope", "Drill a Core Analog",
    "Ice Prospect", "Comms Delay", "Star Tracker", "Docking Radar", "Eclipse Geometry",
    "Tether Demo", "Fuel Budget", "Radiation Shield Concept", "Cabin Pressure", "Waste Heat Radiator",
    "Gyroscopic Survey", "Seismic Ping", "Geyser Timing", "Ring Particle Speed", "Aurora Model",
  ];
  const more = extraTitles.map((title, index): [string, string, string, string] => [
    `space-${index + 1}`,
    title,
    ["orbits", "energy", "magnetic-field", "pressure", "wave-motion"][index % 5],
    `${title} uses a named physics check. Educational quest only.`,
  ]);
  return [...seeds, ...more].map(([slug, title, conceptId, hook], index) =>
    createMockMission({
      id: `mission-space-${slug}`,
      missionId: `mission-space-${slug}`,
      worldId: (["orbit", "mars", "quantum", "ocean", "timelab"] as const)[index % 5],
      title,
      hook,
      story: `${hook} Not a real flight plan.`,
      objective: `Complete a lesson and a practice item for ${conceptId.replace(/-/g, " ")}.`,
      topic: conceptId,
      conceptIds: [conceptId],
      difficulty: index % 4 === 0 ? "hard" : "medium",
      estimatedMinutes: 12 + (index % 10),
      rewardXp: 30 + index,
      requiredLevel: 1 + (index % 8),
      steps: [
        { id: "a", title: "Study", action: "lesson", referenceId: `lesson-${conceptId}`, complete: index < 3 },
        { id: "b", title: "Practice", action: "practice", referenceId: "problem-ohm-1", complete: index < 2 },
        { id: "c", title: "Lab", action: "simulation", referenceId: "sim-orbit", complete: false },
      ],
    }),
  );
}

export function createMissionBranches(): MissionBranch[] {
  return [
    { missionId: "mission-space-land-moon", fromStepId: "b", on: "correct", toStepId: "c", note: "Proceed to the lab." },
    { missionId: "mission-space-land-moon", fromStepId: "b", on: "incorrect", toStepId: "a", note: "Return to the energy lesson." },
    { missionId: "mission-space-land-moon", fromStepId: "b", on: "repeat-mistake", toStepId: "a", note: "Remediate mass–energy vs mechanical energy mix-up." },
    { missionId: "mission-space-match-orbit", fromStepId: "a", on: "mastery", toStepId: "c", note: "Skip ahead to the orbit sim." },
    { missionId: "mission-circuit-rescue", fromStepId: "s2", on: "incorrect", toStepId: "s1", note: "Revisit Ohm’s law." },
    { missionId: "mission-falling-satellite", fromStepId: "s2", on: "correct", toStepId: "s3", note: "Range is consistent; open the projectile lab." },
    { missionId: "mission-falling-satellite", fromStepId: "s2", on: "incorrect", toStepId: "s1", note: "Horizontal and vertical motion were mixed." },
  ];
}

export function createJourneys(): LearnerJourney[] {
  const paths = [
    { id: "journey-alex", learnerId: "user-alex", start: "foundation", current: "kinematics", done: ["vectors"], future: ["forces", "energy"] },
    { id: "journey-maya", learnerId: "user-maya", start: "core", current: "projectile-motion", done: ["kinematics", "energy"], future: ["orbits"] },
    { id: "journey-noah", learnerId: "user-noah", start: "advanced", current: "rotation", done: ["forces", "energy"], future: ["fluids"] },
    { id: "journey-priya", learnerId: "user-priya", start: "core", current: "optics", done: ["wave-motion"], future: ["astrophysics"] },
    { id: "journey-jordan", learnerId: "user-jordan", start: "advanced", current: "circuits", done: ["ohms-law", "energy"], future: ["electromagnetic-induction"] },
    { id: "journey-sam", learnerId: "user-sam", start: "core", current: "energy", done: ["kinematics"], future: ["momentum"] },
    { id: "journey-taylor", learnerId: "user-taylor", start: "exam", current: "ohms-law", done: ["kinematics", "forces"], future: ["waves", "modern-energy"] },
    { id: "journey-morgan", learnerId: "user-morgan", start: "lab", current: "simple-harmonic-motion", done: ["kinematics"], future: ["wave-motion"] },
    { id: "journey-riley", learnerId: "user-riley", start: "core", current: "buoyancy", done: ["pressure"], future: ["ideal-gas-law"] },
    { id: "journey-casey", learnerId: "user-casey", start: "advanced", current: "special-relativity", done: ["kinematics"], future: ["photoelectric-effect"] },
    { id: "journey-avery", learnerId: "user-avery", start: "foundation", current: "charge", done: [], future: ["circuits"] },
    { id: "journey-quinn", learnerId: "user-quinn", start: "core", current: "sound", done: ["wave-motion"], future: ["doppler-effect"] },
    { id: "journey-drew", learnerId: "user-drew", start: "lab", current: "thin-lenses", done: ["snells-law"], future: ["diffraction"] },
    { id: "journey-sage", learnerId: "user-sage", start: "space", current: "orbits", done: ["gravitation"], future: ["hubble-expansion"] },
    { id: "journey-cameron", learnerId: "user-cameron", start: "foundation", current: "velocity", done: [], future: ["acceleration"] },
  ];
  return paths.map((path) => ({
    id: path.id,
    learnerId: path.learnerId,
    startingLevel: path.start,
    goals: [`Secure ${path.current}`, "Keep units visible"],
    completedTopics: path.done,
    currentTopic: path.current,
    futureTopics: path.future,
    attemptHistoryIds: [],
    mistakeIds: [],
    streakHistory: [0, 1, 2, 3, 1, 4, 5].map((value, index) => (path.start === "foundation" ? value : value + index)),
    recommendedNextSteps: [`Lesson on ${path.current}`, "One mixed practice set"],
  }));
}

export function createExamSessions(problemIds: string[]): ExamSession[] {
  const counts = [10, 20, 40, 60] as const;
  return counts.map((count, index) => ({
    id: `exam-${count}`,
    title: `${count}-question mock paper`,
    questionCount: count,
    questionIds: problemIds.slice(0, count),
    kinds: ["numeric", "conceptual", "multi-step", "graph"],
    difficultyDistribution: { easy: 0.3, medium: 0.4, hard: 0.2, challenge: 0.1 },
    timeLimitMin: count * 1.5,
    score: 55 + index * 8,
    accuracy: 0.5 + index * 0.08,
    timePerQuestionS: 70 - index * 5,
    weakAreas: ["units", index ? "graphs" : "free-body diagrams"],
    reviewList: problemIds.slice(0, 6),
    mockLabel: "MOCK_EXAM",
  }));
}

export function createHintLadders(problems: readonly MockProblem[]): HintLadder[] {
  return problems.slice(0, 40).map((problem) => ({
    id: `hints-${problem.id}`,
    problemId: problem.id,
    hint1: "Name the system and the quantity you want.",
    hint2: "List knowns with SI units.",
    hint3: "Choose the equation that contains the unknown and omits extras.",
    conceptReminder: `This item targets ${problem.conceptId.replace(/-/g, " ")}.`,
    equationHint: problem.equationId ? `Look up ${problem.equationId}.` : "Write the governing relation first.",
    unitHint: `The unknown is reported in ${problem.unit}.`,
    finalReveal: `${problem.finalAnswer} ${problem.unit} (mock worked value).`,
  }));
}

export function createModernPack() {
  const relativity: RelativityRecord[] = [0.1, 0.3, 0.6, 0.8, 0.9].map((beta, index) => ({
    id: `rel-gamma-${index + 1}`,
    phenomenon: "time-dilation",
    velocityOverC: beta,
    gamma: gammaFromBeta(beta),
    result: gammaFromBeta(beta),
    unit: "1",
    conceptId: "time-dilation",
    educationalModel: "SPECIAL_RELATIVITY_INTRO",
  }));
  const quantum: QuantumRecord[] = [
    { id: "q-green", model: "photon", wavelengthM: 5e-7, energyJ: H_TIMES_C / 5e-7, educationalModel: "SIMPLIFIED_QUANTUM_MODEL", conceptId: "photons", notes: "Educational photon energy; not a spectrometer file." },
    { id: "q-pe", model: "photoelectric", frequencyHz: 8e14, educationalModel: "SIMPLIFIED_QUANTUM_MODEL", conceptId: "photoelectric-effect", notes: "Threshold vs intensity distinction." },
    { id: "q-db", model: "de-broglie", wavelengthM: 1e-10, educationalModel: "SIMPLIFIED_QUANTUM_MODEL", conceptId: "de-broglie-wavelength", notes: "Electron-scale λ example." },
  ];
  const atomic: AtomicTransition[] = [
    [3, 2],
    [4, 2],
    [5, 2],
    [4, 3],
  ].map(([ni, nf]) => {
    const jump = hydrogenTransition(ni, nf);
    return {
      id: `h-${ni}-${nf}`,
      initialLevel: ni,
      finalLevel: nf,
      energyDifferenceEv: jump.energyEv,
      frequencyHz: jump.frequencyHz,
      wavelengthM: jump.wavelengthM,
      process: "emission" as const,
      conceptId: "hydrogen-spectrum",
    };
  });
  const nuclear: NuclearRecord[] = [0, 1, 2, 3, 4].map((n) => ({
    id: `decay-${n}`,
    isotope: "C-14 educational",
    halfLifeS: 1.8e11,
    elapsedHalfLives: n,
    remainingFraction: Math.pow(0.5, n),
    conceptId: "radioactive-decay",
    educationalModel: "INTRO_NUCLEAR_MODEL",
  }));
  return { relativity, quantum, atomic, nuclear };
}

export function createSpaceBodies(): AstroBody[] {
  return [
    { id: "astro-earth", name: "Earth", kind: "planet", massKg: 5.97e24, radiusM: 6.37e6, escapeVelocityMps: 11200, source: "STANDARD_SOLAR_SYSTEM", conceptId: "gravitation" },
    { id: "astro-moon", name: "Moon", kind: "moon", massKg: 7.35e22, radiusM: 1.74e6, orbitalPeriodS: 2.36e6, source: "STANDARD_SOLAR_SYSTEM", conceptId: "orbits" },
    { id: "astro-sun", name: "Sun", kind: "star", massKg: 1.99e30, radiusM: 6.96e8, source: "STANDARD_SOLAR_SYSTEM", conceptId: "stellar-structure" },
    { id: "astro-demo-exo", name: "Kepler-demo (educational)", kind: "exoplanet", massKg: 5e24, radiusM: 7e6, orbitalPeriodS: 5e6, source: "EDUCATIONAL_FIXTURE", conceptId: "kepler" },
    { id: "astro-bh-demo", name: "Stellar-mass BH demo", kind: "black-hole-demo", massKg: 2e31, radiusM: 3e4, source: "EDUCATIONAL_FIXTURE", conceptId: "gravitation" },
  ];
}

export function createCosmologyRecords(): CosmologyRecord[] {
  return [
    { id: "cosmo-z", topic: "redshift", value: 0.1, unit: "1", explanation: "Educational z = Δλ/λ example, not a catalog measurement.", educationalModel: "INTRO_COSMOLOGY", conceptId: "hubble-expansion" },
    { id: "cosmo-hubble", topic: "hubble", value: 70, unit: "km/s/Mpc", explanation: "Order-of-magnitude H0 for classroom arithmetic.", educationalModel: "INTRO_COSMOLOGY", conceptId: "hubble-expansion" },
    { id: "cosmo-cmb", topic: "cmb", value: 2.7, unit: "K", explanation: "Approximate CMB temperature in the simple blackbody model.", educationalModel: "INTRO_COSMOLOGY", conceptId: "cosmic-microwave" },
  ];
}

export function createWavesAndThermal() {
  const waves: WaveRecord[] = [
    { id: "wave-string", kind: "transverse", frequencyHz: 40, periodS: 0.025, wavelengthM: 0.8, amplitude: 0.01, phaseRad: 0, speedMps: 32, conceptId: "wave-motion" },
    { id: "wave-sound", kind: "longitudinal", frequencyHz: 256, periodS: 1 / 256, wavelengthM: 340 / 256, amplitude: 0.001, phaseRad: 0, speedMps: 340, conceptId: "sound" },
    { id: "wave-stand", kind: "standing", frequencyHz: 120, periodS: 1 / 120, wavelengthM: 1.2, amplitude: 0.02, phaseRad: 0, speedMps: 144, conceptId: "standing-waves" },
  ];
  const sound: SoundRecord[] = [
    { id: "snd-tune", scenario: "tuning", frequencyHz: 440, amplitude: 0.2, harmonics: [440, 880, 1320], wavelengthM: 340 / 440, speedMps: 340, decibelLevel: 70, waveformType: "complex", conceptId: "sound" },
    { id: "snd-echo", scenario: "echo", frequencyHz: 1000, amplitude: 0.1, harmonics: [1000], wavelengthM: 0.34, speedMps: 340, decibelLevel: 65, waveformType: "sine", conceptId: "sound" },
    { id: "snd-doppler", scenario: "doppler", frequencyHz: 500, amplitude: 0.15, harmonics: [500], wavelengthM: 0.68, speedMps: 340, decibelLevel: 72, waveformType: "sine", conceptId: "doppler-effect" },
  ];
  const thermal: ThermalRecord[] = [
    { id: "th-heat", process: "specific-heat", temperatureK: 350, massKg: 0.2, specificHeat: 4180, energyJ: 0.2 * 4180 * 20, conceptId: "specific-heat" },
    { id: "th-phase", process: "phase-change", temperatureK: 273, massKg: 0.05, energyJ: 0.05 * 3.34e5, conceptId: "phase-changes" },
    { id: "th-gas", process: "gas-law", temperatureK: 300, pressurePa: 101325, volumeM3: 0.002, massKg: 0.0023, energyJ: 1.5 * 8.314 * 300, conceptId: "ideal-gas-law" },
  ];
  const gas: GasSnapshot[] = [
    { id: "gas-room", particleCount: 80, temperatureK: 300, pressurePa: 101325, volumeM3: 0.001, averageSpeed: 480, maxSpeed: 1200, averageKineticEnergy: 1.5 * 1.38e-23 * 300, assumption: "Ideal monatomic educational sample; particleCount is a render budget, not Avogadro." },
  ];
  const optics: OpticsMeasurement[] = [
    { id: "opt-lens", setup: "lens", objectDistanceM: 0.4, imageDistanceM: 0.4, focalLengthM: 0.2, magnification: -1, uncertainty: 0.005, conceptId: "thin-lenses", assumption: "Thin lens in air." },
    { id: "opt-snell", setup: "refraction", incidentDeg: 30, refractedDeg: 19.47, n1: 1, n2: 1.5, uncertainty: 0.5, conceptId: "snells-law", assumption: "Monochromatic ray." },
  ];
  return { waves, sound, thermal, gas, optics };
}

export function createScientists(): ScientistRecord[] {
  return [
    { id: "sci-newton", name: "Isaac Newton", era: "1643–1727", field: "mechanics", contributions: ["Laws of motion", "Universal gravitation"], relatedConcepts: ["newtons-laws", "gravitation"] },
    { id: "sci-faraday", name: "Michael Faraday", era: "1791–1867", field: "electromagnetism", contributions: ["Induction", "Field thinking"], relatedConcepts: ["faradays-law"] },
    { id: "sci-maxwell", name: "James Clerk Maxwell", era: "1831–1879", field: "electromagnetism", contributions: ["Unification of electricity, magnetism, and light"], relatedConcepts: ["em-waves"] },
    { id: "sci-einstein", name: "Albert Einstein", era: "1879–1955", field: "relativity / quantum", contributions: ["Special relativity", "Photoelectric explanation"], relatedConcepts: ["special-relativity", "photoelectric-effect"] },
    { id: "sci-curie", name: "Marie Curie", era: "1867–1934", field: "radioactivity", contributions: ["Isolation of radium and polonium", "Radiation measurement"], relatedConcepts: ["radioactive-decay"] },
  ];
}

export function createTimelines(): TimelineEvent[] {
  return [
    { id: "tl-1687", year: 1687, title: "Principia", detail: "Newtonian mechanics published.", timeline: "mechanics" },
    { id: "tl-1820", year: 1820, title: "Oersted", detail: "Current deflects a compass.", timeline: "electromagnetism" },
    { id: "tl-1831", year: 1831, title: "Faraday induction", detail: "Changing magnetism makes current.", timeline: "electromagnetism" },
    { id: "tl-1900", year: 1900, title: "Planck", detail: "Quantized energy exchanges.", timeline: "quantum" },
    { id: "tl-1905", year: 1905, title: "Einstein annus", detail: "Photoelectric and special relativity papers.", timeline: "quantum" },
    { id: "tl-1919", year: 1919, title: "Eddington eclipse", detail: "Light deflection test of general relativity.", timeline: "space" },
    { id: "tl-1969", year: 1969, title: "Apollo 11", detail: "Crewed lunar landing.", timeline: "space" },
  ];
}

export function createClassroom(): ClassroomFixture {
  return {
    id: "class-demo-physics",
    name: "Demo Period Physics (fictional)",
    studentIds: ["user-alex", "user-maya", "user-noah", "user-taylor"],
    assignments: [
      { id: "asg-practice", title: "Kinematics set", kind: "practice", dueAt: isoDaysAgo(2, 16), status: "scored", completion: 1, score: 82, feedback: "Watch displacement vs distance." },
      { id: "asg-lab", title: "Pendulum lab", kind: "lab", dueAt: isoDaysAgo(1, 16), status: "submitted", completion: 0.8, feedback: "Include uncertainty." },
      { id: "asg-exam", title: "Mixed paper", kind: "exam", dueAt: isoDaysAgo(-3, 16), status: "assigned", completion: 0, feedback: "Not yet due." },
      { id: "asg-mission", title: "Orbit mission", kind: "mission", dueAt: isoDaysAgo(0, 18), status: "assigned", completion: 0.3, feedback: "Finish the range check." },
      { id: "asg-review", title: "Unit review", kind: "review", dueAt: isoDaysAgo(0, 20), status: "assigned", completion: 0.1, feedback: "SI prefixes first." },
    ],
    classMastery: 0.61,
    teacherNote: "Fictional mentor note: keep units in every line.",
    fictional: true,
  };
}

export function createLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, name: "Jordan Blake", xp: 6400, level: 12, weeklyXP: 420, badges: 18, fictional: true },
    { rank: 2, name: "Maya Chen", xp: 2840, level: 6, weeklyXP: 210, badges: 9, fictional: true },
    { rank: 3, name: "Noah Okonkwo", xp: 4100, level: 9, weeklyXP: 180, badges: 11, fictional: true },
    { rank: 4, name: "Taylor Kim", xp: 1980, level: 5, weeklyXP: 260, badges: 6, fictional: true },
    { rank: 5, name: "Alex Rivera", xp: 420, level: 4, weeklyXP: 40, badges: 2, fictional: true },
  ];
}

export function createSocialProof(): SocialProofFixture[] {
  return [
    { id: "sp-sim", metric: "studentsCompletedSimulation", value: 1280, mockLabel: "DEMO_AGGREGATE_NOT_PRODUCTION" },
    { id: "sp-acc", metric: "averageAccuracy", value: 0.71, mockLabel: "DEMO_AGGREGATE_NOT_PRODUCTION" },
    { id: "sp-time", metric: "averageTime", value: 94, mockLabel: "DEMO_AGGREGATE_NOT_PRODUCTION" },
    { id: "sp-topic", metric: "popularTopic", value: "projectile-motion", mockLabel: "DEMO_AGGREGATE_NOT_PRODUCTION" },
  ];
}

export function createExtraTutorSessions(): MockTutorSession[] {
  const prompts: Array<[string, string, string]> = [
    ["I keep mixing heat and temperature.", "temperature", "Heat is energy in transit; temperature is the thermal state."],
    ["Can you sketch the FBD for an incline?", "inclined-plane", "Weight, normal, and friction on one object only."],
    ["Show the units in Ohm’s law.", "ohms-law", "V in volts, I in amperes, R in ohms."],
    ["Why is v < c in the γ formula?", "special-relativity", "γ is defined only for |v| < c; v ≥ c is excluded."],
    ["Hint only: projectile range.", "projectile-motion", "Keep vx constant; gravity changes only vy."],
    ["Harder: derive T for a pendulum.", "pendulum", "Small-angle SHM: T = 2π√(L/g)."],
    ["Visual: interference fringes.", "interference", "Path difference of mλ versus (m+½)λ."],
    ["I think current is used up.", "current", "Charge is conserved; the rate can change with R."],
  ];
  return prompts.map(([title, conceptId, reply], index) =>
    createMockTutorSession({
      id: `tutor-x-${index + 1}`,
      title,
      conceptId,
      topicId: conceptId,
      suggestedQuestions: ["Can you show the equation?", "What should I try in the lab?"],
      messages: [
        { id: `tx-${index}-u`, role: "user", text: title, source: "MOCK_TUTOR", createdAt: isoDaysAgo(index + 1, 8) },
        { id: `tx-${index}-a`, role: "assistant", text: reply, source: "AI_EXPLANATION", createdAt: isoDaysAgo(index + 1, 8) },
      ],
    }),
  );
}

export function createCampaignProblems(): MockProblem[] {
  const gamma = gammaFromBeta(0.6);
  const snell = (Math.asin(Math.sin((30 * Math.PI) / 180) / 1.5) * 180) / Math.PI;
  return [
    createMockProblem({
      id: "problem-x-atwood",
      conceptId: "atwood",
      topicId: "dynamics",
      difficulty: "hard",
      prompt: "Atwood masses 1.2 kg and 0.8 kg. Find a if the string and pulley are ideal.",
      givenValues: { m1: 1.2, m2: 0.8, g: 9.8 },
      unknown: "acceleration",
      unit: "m/s²",
      finalAnswer: (0.4 * 9.8) / 2,
      explanation: "a = (m1−m2)g/(m1+m2) for an ideal Atwood machine.",
    }),
    createMockProblem({
      id: "problem-x-snell",
      conceptId: "snells-law",
      topicId: "optics",
      difficulty: "medium",
      prompt: "n1=1.00, θ1=30°, n2=1.50. Find θ2.",
      givenValues: { n1: 1, theta1: 30, n2: 1.5 },
      unknown: "refracted angle",
      unit: "deg",
      finalAnswer: Math.round(snell * 100) / 100,
      explanation: "n1 sinθ1 = n2 sinθ2.",
    }),
    createMockProblem({
      id: "problem-x-gamma",
      conceptId: "time-dilation",
      topicId: "relativity",
      difficulty: "hard",
      prompt: "A ship moves at 0.6c. Find γ. (v < c is required.)",
      givenValues: { beta: 0.6 },
      unknown: "gamma",
      unit: "1",
      finalAnswer: gamma,
      explanation: "γ = 1/√(1−β²); v < c.",
    }),
  ];
}
