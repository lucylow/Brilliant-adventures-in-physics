import { isoDateDaysAgo } from "../../clock";
import { createSeededRandom } from "../../utils/rng";
import type { DailyChallenge, ExpansionFlashcard, FermiProblem, MicroLesson, QuestionOfTheDay, ScienceFact, SeasonalCampaign, WeeklyCampaign } from "../types";
import type { MockDifficulty } from "../../types";

const CONCEPTS = ["kinematics", "projectile-motion", "forces", "energy", "momentum", "rotation", "wave-motion", "ohms-law", "snells-law", "ideal-gas-law", "photoelectric-effect", "orbits", "sound", "thin-lenses", "pendulum"] as const;

function difficultyFor(index: number): MockDifficulty {
  if (index % 11 === 0) return "challenge";
  if (index % 5 === 0) return "hard";
  if (index % 2 === 0) return "medium";
  return "easy";
}

export function createDailyChallenges(): DailyChallenge[] {
  return Array.from({ length: 90 }, (_, day) => {
    const conceptId = CONCEPTS[day % CONCEPTS.length];
    const n = 2 + (day % 7);
    return {
      challengeId: `challenge-day-${day + 1}`,
      dayIndex: day,
      title: `${conceptId.replace(/-/g, " ")} · day ${day + 1}`,
      prompt: promptFor(conceptId, n, day),
      conceptId,
      difficulty: difficultyFor(day),
      xp: 8 + (day % 5) * 2,
      solution: solutionFor(conceptId, n, day),
      streakContribution: day % 6 !== 5,
    };
  });
}

function promptFor(conceptId: string, n: number, day: number): string {
  switch (conceptId) {
    case "kinematics":
      return `A cart starts at ${n} m/s and accelerates at 1.5 m/s² for ${2 + (day % 3)} s. Find the final speed.`;
    case "ohms-law":
      return `A ${n + 2} Ω resistor is across ${6 + (day % 7)} V. Find the current.`;
    case "energy":
      return `A ${n} kg object moves at ${3 + (day % 4)} m/s. Find K.`;
    case "pendulum":
      return `A small-angle pendulum has L = ${0.4 + (day % 5) * 0.1} m. Estimate T using g = 9.8 m/s².`;
    default:
      return `Apply the introductory ${conceptId.replace(/-/g, " ")} relation with the numbers of day ${day + 1}. State the assumption.`;
  }
}

function solutionFor(conceptId: string, n: number, day: number): string {
  if (conceptId === "kinematics") {
    const t = 2 + (day % 3);
    return `v = ${n} + 1.5×${t} = ${n + 1.5 * t} m/s (constant a).`;
  }
  if (conceptId === "ohms-law") {
    const v = 6 + (day % 7);
    const r = n + 2;
    return `I = ${v}/${r} = ${Math.round((v / r) * 1000) / 1000} A for an ohmic resistor.`;
  }
  if (conceptId === "energy") {
    const speed = 3 + (day % 4);
    return `K = ½(${n})(${speed})² = ${0.5 * n * speed * speed} J.`;
  }
  return `Use the named equation, keep SI units, and write one assumption.`;
}

export function createWeeklyCampaigns(): WeeklyCampaign[] {
  const themes = ["Motion Week", "Forces Week", "Energy Week", "Momentum Week", "Waves Week", "Electricity Week", "Optics Week", "Thermal Week", "Space Week", "Quantum Week", "Fluids Week", "Exam Sprint"];
  const conceptGroups = [
    ["kinematics", "projectile-motion"],
    ["forces", "friction"],
    ["energy", "work"],
    ["momentum", "impulse"],
    ["wave-motion", "sound"],
    ["ohms-law", "circuits"],
    ["snells-law", "thin-lenses"],
    ["ideal-gas-law", "heat"],
    ["orbits", "escape-velocity"],
    ["photoelectric-effect", "photons"],
    ["buoyancy", "pressure"],
    ["kinematics", "ohms-law"],
  ];
  return themes.map((theme, index) => ({
    id: `week-${index + 1}`,
    week: index + 1,
    theme,
    conceptIds: conceptGroups[index],
    missionIds: index % 2 ? ["mission-falling-satellite"] : ["mission-circuit-rescue"],
    simulationIds: index % 2 ? ["sim-projectile"] : ["sim-circuit"],
    mockLabel: "MOCK_CAMPAIGN",
  }));
}

export function createSeasonalCampaigns(): SeasonalCampaign[] {
  return [
    { id: "season-summer", name: "Summer Lab", season: "summer-lab", description: "Outdoor timing, echoes, and solar-angle sketches. Mock seasonal pack.", mockLabel: "MOCK_SEASONAL" },
    { id: "season-school", name: "Back-to-School Physics", season: "back-to-school", description: "Kinematics refresh plus units.", mockLabel: "MOCK_SEASONAL" },
    { id: "season-winter", name: "Winter Motion", season: "winter-motion", description: "Friction on ice and energy on slopes.", mockLabel: "MOCK_SEASONAL" },
    { id: "season-space", name: "Space Week", season: "space-week", description: "Orbits and spectra as educational fixtures.", mockLabel: "MOCK_SEASONAL" },
    { id: "season-fair", name: "Science Fair", season: "science-fair", description: "Experiment design and uncertainty.", mockLabel: "MOCK_SEASONAL" },
    { id: "season-exam", name: "Exam Sprint", season: "exam-sprint", description: "Timed mixed papers.", mockLabel: "MOCK_SEASONAL" },
  ];
}

export function createQuestionsOfTheDay(): QuestionOfTheDay[] {
  return Array.from({ length: 365 }, (_, day) => {
    const conceptId = CONCEPTS[day % CONCEPTS.length];
    const a = 1 + (day % 9);
    return {
      id: `qotd-${day + 1}`,
      dayOfYear: day + 1,
      prompt: `Day ${day + 1}: ${promptFor(conceptId, a, day)}`,
      conceptId,
      answer: solutionFor(conceptId, a, day),
      difficulty: difficultyFor(day),
    };
  });
}

export function createScienceFacts(): ScienceFact[] {
  const rng = createSeededRandom("facts-v2");
  const stems = [
    "c is defined as 299792458 m/s; the metre is based on that definition.",
    "g ≈ 9.8 N/kg near Earth's surface is a local field, not a universal constant of motion.",
    "A joule is a newton-metre; torque uses the same SI unit with a different quantity name.",
    "Sound in dry air near 20 °C is about 343 m/s; it is not instantaneous.",
    "Visible light spans roughly 400–700 nm; photon energy rises as wavelength falls.",
    "An ohmic resistor has a linear V–I graph through the origin over a stated range.",
    "The Moon’s free-fall acceleration is much smaller than Earth’s surface g, but not zero.",
    "Half-life is a property of a species in a given decay mode, not of sample size in the exponential model.",
    "Ideal-gas temperature in PV = nRT is thermodynamic temperature in kelvin.",
    "Magnetic forces on charges are perpendicular to velocity, so they change direction, not speed, when E = 0.",
  ];
  const facts: ScienceFact[] = [];
  for (let index = 0; index < 300; index += 1) {
    const conceptId = CONCEPTS[index % CONCEPTS.length];
    const stem = stems[index % stems.length];
    facts.push({
      id: `fact-${index + 1}`,
      text: `${stem} (${conceptId.replace(/-/g, " ")}; mock archive item ${index + 1}, seed ${rng.randomInt(10, 99)}).`,
      conceptId,
    });
  }
  return facts;
}

export function createMicroLessons(): MicroLesson[] {
  return CONCEPTS.flatMap((conceptId, group) =>
    Array.from({ length: 7 }, (_, index) => ({
      id: `micro-${conceptId}-${index + 1}`,
      title: `${conceptId.replace(/-/g, " ")} in ${2 + (index % 3)} minutes`,
      minutes: 2 + (index % 3),
      conceptId,
      body: `State the quantity, the SI unit, and one assumption for ${conceptId.replace(/-/g, " ")}. Then substitute a single numerical example.`,
      checkpoint: `Write the governing equation for ${conceptId.replace(/-/g, " ")} with units.`,
    })),
  ).slice(0, 105);
}

export function createExpansionFlashcards(): ExpansionFlashcard[] {
  const types: ExpansionFlashcard["type"][] = ["definition", "equation", "unit", "conceptual", "misconception", "visual"];
  const base = CONCEPTS.flatMap((conceptId) =>
    types.map((type) => ({
      id: `xcard-${conceptId}-${type}`,
      type,
      front: frontFor(type, conceptId),
      back: backFor(type, conceptId),
      conceptId,
    })),
  );
  const extras = Array.from({ length: 210 }, (_, index) => {
    const conceptId = CONCEPTS[index % CONCEPTS.length];
    const type = types[index % types.length];
    const n = 1 + (index % 9);
    return {
      id: `xcard-extra-${index + 1}`,
      type,
      front: extraFront(type, conceptId, n, index),
      back: extraBack(type, conceptId, n),
      conceptId,
    };
  });
  return [...base, ...extras];
}

function extraFront(type: ExpansionFlashcard["type"], conceptId: string, n: number, index: number): string {
  const name = conceptId.replace(/-/g, " ");
  switch (type) {
    case "definition":
      return `In one clause, distinguish ${name} from a nearby everyday word. Card ${index + 1}.`;
    case "equation":
      return `If one control in ${name} is multiplied by ${n}, what happens to the unknown?`;
    case "unit":
      return `Convert a ${name} report so the number sits near 1–10 using an SI prefix.`;
    case "conceptual":
      return `Name the assumption that would fail first for ${name} in a classroom demo.`;
    case "misconception":
      return `Why might a learner say “${name} is just ${n} times bigger when you go faster”?`;
    default:
      return `What two labels belong on a sketch of ${name}?`;
  }
}

function extraBack(type: ExpansionFlashcard["type"], conceptId: string, n: number): string {
  const name = conceptId.replace(/-/g, " ");
  switch (type) {
    case "definition":
      return `${name} is the defined quantity; the everyday word is usually a different SI quantity.`;
    case "equation":
      return `Scale using the actual exponents in the ${name} equation; a factor of ${n} is not automatic.`;
    case "unit":
      return `Keep the SI unit of ${name} and move powers of ten into the prefix.`;
    case "conceptual":
      return `Write the assumption (no drag, ohmic, small angle, v < c, point mass) that ${name} needs.`;
    case "misconception":
      return `${name} does not scale with “faster” unless the equation says so.`;
    default:
      return `Axes, system boundary, and the arrows that belong only to ${name}.`;
  }
}

function frontFor(type: ExpansionFlashcard["type"], conceptId: string): string {
  const name = conceptId.replace(/-/g, " ");
  switch (type) {
    case "definition":
      return `Define ${name} in one sentence.`;
    case "equation":
      return `Write the introductory equation for ${name}.`;
    case "unit":
      return `What SI unit reports ${name}?`;
    case "conceptual":
      return `Name one assumption behind ${name}.`;
    case "misconception":
      return `What is a common mix-up involving ${name}?`;
    default:
      return `What would you sketch for ${name}?`;
  }
}

function backFor(type: ExpansionFlashcard["type"], conceptId: string): string {
  const name = conceptId.replace(/-/g, " ");
  switch (type) {
    case "definition":
      return `${name} is defined by a relation among measurable quantities, not by a vibe.`;
    case "equation":
      return `Use the lesson equation for ${name}; keep the unit of the unknown visible.`;
    case "unit":
      return `Report ${name} with its SI unit and a prefix if the number is awkward.`;
    case "conceptual":
      return `Typical assumptions: no drag, ohmic, small angle, v < c, point mass — pick the one that matches ${name}.`;
    case "misconception":
      return `Do not swap ${name} with a nearby everyday word (speed/velocity, heat/temperature, current/voltage).`;
    default:
      return `Sketch axes, arrows, and the system boundary for ${name}.`;
  }
}

export function createFermiProblems(): FermiProblem[] {
  return [
    { id: "fermi-breaths", prompt: "About how many breaths in 80 years?", assumptions: ["12 breaths/min", "80 y", "no sleep adjustment"], orderOfMagnitude: 9, unit: "1", conceptId: "kinematics" },
    { id: "fermi-battery", prompt: "Energy stored in a 3 Ah, 3.7 V phone cell?", assumptions: ["E ≈ QV", "Q = 3×3600 C"], orderOfMagnitude: 4, unit: "J", conceptId: "electric-power" },
    { id: "fermi-bike", prompt: "Time to cross a 12 km city by bike at 5 m/s?", assumptions: ["straight path", "constant speed"], orderOfMagnitude: 3, unit: "s", conceptId: "uniform-motion" },
    { id: "fermi-room", prompt: "Air mass in a 5×4×3 m room?", assumptions: ["ρ ≈ 1.2 kg/m³"], orderOfMagnitude: 2, unit: "kg", conceptId: "fluids" },
    { id: "fermi-sunlight", prompt: "Energy on 1 m² in 10 min at 800 W/m²?", assumptions: ["clear sky educational flux"], orderOfMagnitude: 5, unit: "J", conceptId: "intensity" },
  ];
}

export function isoForDay(dayIndex: number): string {
  return `${isoDateDaysAgo(89 - dayIndex)}T12:00:00.000Z`;
}
