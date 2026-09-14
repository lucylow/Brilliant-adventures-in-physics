import { CATALOG, EXPLAIN_VARIANTS, explanationText, levelForVariant, type CatalogTopic } from "../ai-catalog";
import { HINT_DEPTHS, hintForTopic } from "../ai-styles";
import { stableId } from "../../utils/ids";
import type {
  AnalogyRecord,
  ComparisonRecord,
  ExplanationResponse,
  FollowUpSuggestions,
  HintResponse,
  MisconceptionResponse,
} from "../ai-types";

let explanationCache: ExplanationResponse[] | null = null;
let hintCache: HintResponse[] | null = null;
let analogyCache: AnalogyRecord[] | null = null;
let misconceptionCache: MisconceptionResponse[] | null = null;
let followUpCache: string[] | null = null;
let starterCache: Array<{ id: string; category: string; conceptId: string; prompt: string }> | null = null;
let comparisonCache: ComparisonRecord[] | null = null;

export function getExplanations(): ExplanationResponse[] {
  if (explanationCache) return explanationCache;
  explanationCache = CATALOG.flatMap((topic) =>
    EXPLAIN_VARIANTS.map((variant) => ({
      conceptId: topic.conceptId,
      learnerLevel: levelForVariant(variant),
      style: variant,
      summary: topic.oneSentence,
      intuition: topic.intuitionFirst,
      formalExplanation: explanationText(topic, variant),
      equations: [topic.equation],
      example: topic.example.prompt,
      commonMistake: topic.commonMistake,
      followUp: topic.followUps[0] ?? `What would you measure to test ${topic.title}?`,
    })),
  );
  return explanationCache;
}

export function getHints(): HintResponse[] {
  if (hintCache) return hintCache;
  hintCache = CATALOG.flatMap((topic, topicIndex) =>
    HINT_DEPTHS.flatMap((depth, depthIndex) =>
      [0, 1].map((variant) => {
        const built = hintForTopic(topic, depth, variant + topicIndex + depthIndex);
        return {
          conceptId: topic.conceptId,
          problemId: stableId("prob", `${topic.id}-${depth}-${variant}`),
          depth,
          text: built.text,
          revealsAnswer: built.revealsAnswer,
          nextDepth: HINT_DEPTHS[Math.min(HINT_DEPTHS.length - 1, depthIndex + 1)],
        };
      }),
    ),
  );
  return hintCache;
}

const EXTRA_ANALOGY_FRAMES: Array<(topic: CatalogTopic) => Omit<AnalogyRecord, "id" | "conceptId" | "concept">> = [
  (topic) => ({
    analogy: `A labeled map for ${topic.title}`,
    mapping: `The map’s scale is like ${topic.equation}: it converts a measurement into a prediction.`,
    limitation: "A map is not the territory. The equation is a model with stated assumptions, not the phenomenon itself.",
  }),
  (topic) => ({
    analogy: `A recipe card for ${topic.title}`,
    mapping: "Ingredients are knowns with units; the method is the principle; the dish is the unknown.",
    limitation: "Recipes are instructions for cooks. Physics equations describe constrained relationships, not kitchen preference.",
  }),
  (topic) => ({
    analogy: `A balance scale sitting next to ${topic.title}`,
    mapping: "Each side must carry matching units. If a unit cannot sit on the scale, the step is not yet an equation.",
    limitation: "A shop scale compares weights. Many physics relations compare rates, fields, or probabilities, not mass.",
  }),
];

export function getAnalogies(): AnalogyRecord[] {
  if (analogyCache) return analogyCache;
  const extras = CATALOG.flatMap((topic, index) =>
    EXTRA_ANALOGY_FRAMES.map((frame, frameIndex) => {
      const body = frame(topic);
      return {
        id: stableId("analogy", `${topic.id}-extra-${frameIndex}-${index}`),
        conceptId: topic.conceptId,
        concept: topic.title,
        ...body,
      };
    }),
  );
  const base = CATALOG.map((topic, index) => ({
    id: stableId("analogy", `${topic.id}-core-${index}`),
    conceptId: topic.conceptId,
    concept: topic.title,
    analogy: topic.analogy.analogy,
    mapping: topic.analogy.mapping,
    limitation: topic.analogy.limitation,
  }));
  analogyCache = [...base, ...extras];
  return analogyCache;
}

const MISCONCEPTION_SHIFTS = [
  (topic: CatalogTopic) => ({
    misconception: topic.misconception,
    diagnostic: `I hear the usual mix-up: “${topic.misconception}” Let’s test it against a case where it fails.`,
    correct: topic.counterExample,
    visual: `Sketch ${topic.title} with the variables in ${topic.equation} labeled.`,
    practice: topic.example.prompt,
  }),
  (topic: CatalogTopic) => ({
    misconception: topic.commonMistake,
    diagnostic: `The working often looks tidy while still making this mistake: ${topic.commonMistake}`,
    correct: topic.beginner,
    visual: `Write units beside every symbol in ${topic.equation} before substituting.`,
    practice: `Repeat ${topic.example.prompt} and annotate units at each line.`,
  }),
  (topic: CatalogTopic) => ({
    misconception: `Treating ${topic.title} as a name rather than a relationship.`,
    diagnostic: `${topic.title} is not a sticker. It is a constrained relationship, usually ${topic.equation}.`,
    correct: topic.standard,
    visual: `Turn ${topic.equation} into a sentence with the word “because”.`,
    practice: "Change one known and predict the unknown before calculating.",
  }),
  (topic: CatalogTopic) => ({
    misconception: `Using a neighbouring formula that shares a symbol with ${topic.title}.`,
    diagnostic: `Sharing a letter with ${topic.equation} is not permission to swap models.`,
    correct: topic.examReview,
    visual: `Two-column table: this model vs the look-alike.`,
    practice: `State why ${topic.equation} matches the unknown ${topic.example.unknown}.`,
  }),
  (topic: CatalogTopic) => ({
    misconception: `Ignoring the limitation of the everyday picture of ${topic.title}.`,
    diagnostic: `The analogy (${topic.analogy.analogy}) is leaking into the physics.`,
    correct: `Limitation: ${topic.analogy.limitation}`,
    visual: `Write the analogy on the left and the limitation on the right.`,
    practice: topic.followUps[1] ?? topic.followUps[0],
  }),
];

export function getMisconceptions(): MisconceptionResponse[] {
  if (misconceptionCache) return misconceptionCache;
  misconceptionCache = CATALOG.flatMap((topic, topicIndex) =>
    MISCONCEPTION_SHIFTS.map((shift, shiftIndex) => {
      const body = shift(topic);
      return {
        id: stableId("misc", `${topic.id}-${shiftIndex}-${topicIndex}`),
        conceptId: topic.conceptId,
        misconception: body.misconception,
        diagnosticResponse: body.diagnostic,
        correctExplanation: body.correct,
        counterExample: topic.counterExample,
        visualSuggestion: body.visual,
        practiceRecommendation: body.practice,
      };
    }),
  );
  return misconceptionCache;
}

export function getFollowUpPrompts(): string[] {
  if (followUpCache) return followUpCache;
  const generic = [
    "Can you explain this visually?",
    "Why is that assumption valid?",
    "What happens if the mass doubles?",
    "Can we solve it another way?",
    "Can I see a simulation?",
    "Can you say that in one sentence?",
    "Which unit should the unknown carry?",
    "What would a graph of this look like?",
    "Is there a common exam trap here?",
    "Which quantity is actually asked for?",
    "What stays constant if time doubles?",
    "How would I check this with a measurement?",
    "Which principle did we choose, and why not a neighbour?",
    "Can you show the substitution with units still visible?",
    "What happens at the extreme of this model?",
    "How is this different from the everyday meaning of the word?",
    "Could you give a counterexample?",
    "What should I sketch first?",
    "Is energy conserved in this step, or momentum, or neither automatically?",
    "What would make this model fail?",
  ];
  followUpCache = [
    ...generic,
    ...CATALOG.flatMap((topic) => topic.followUps.map((prompt) => `${prompt} (${topic.title})`)),
    ...CATALOG.map((topic) => `Why does ${topic.equation} fit ${topic.example.unknown} in ${topic.title}?`),
    ...CATALOG.map((topic) => `What measurement would disagree with our ${topic.title} story?`),
    ...CATALOG.map((topic) => `If I change the sign convention, what happens to ${topic.title}?`),
    ...CATALOG.map((topic) => `Can you contrast ${topic.title} with a look-alike quantity?`),
    ...CATALOG.map((topic) => `Open ${topic.simulationId}: which slider should I move first for ${topic.title}?`),
  ];
  return followUpCache;
}

const STARTER_CATEGORIES: Array<{ category: string; pick: (topic: CatalogTopic) => boolean }> = [
  { category: "Mechanics", pick: (topic) => topic.domain === "Mechanics" },
  { category: "Waves", pick: (topic) => topic.domain === "Waves" },
  { category: "Electricity", pick: (topic) => topic.domain === "Electricity" },
  { category: "Optics", pick: (topic) => topic.conceptId === "optics" || topic.conceptId === "total-internal-reflection" },
  { category: "Quantum", pick: (topic) => topic.domain === "Modern Physics" },
  { category: "Space", pick: (topic) => topic.conceptId === "rotation" || topic.conceptId === "gravitational-energy" || topic.conceptId === "relativistic-energy" },
  { category: "Exam Prep", pick: () => true },
  { category: "Experiments", pick: () => true },
  { category: "Units", pick: () => true },
  { category: "Graphs", pick: (topic) => topic.domain === "Mechanics" || topic.domain === "Waves" || topic.domain === "Electricity" },
  { category: "Misconceptions", pick: () => true },
];

export function getStarterPrompts(): Array<{ id: string; category: string; conceptId: string; prompt: string }> {
  if (starterCache) return starterCache;
  const rows: Array<{ id: string; category: string; conceptId: string; prompt: string }> = [];
  CATALOG.forEach((topic, index) => {
    topic.starters.forEach((prompt, starterIndex) => {
      rows.push({
        id: stableId("start", `${topic.id}-${starterIndex}`),
        category: topic.domain,
        conceptId: topic.conceptId,
        prompt,
      });
    });
    STARTER_CATEGORIES.forEach((entry, catIndex) => {
      if (!entry.pick(topic)) return;
      const extra =
        entry.category === "Exam Prep" ? `Exam-style: ${topic.examReview}`
          : entry.category === "Experiments" ? `Experiment: ${topic.experiment.name} — ${topic.experiment.objective}`
            : entry.category === "Units" ? `What unit must ${topic.example.unknown} have if we use ${topic.equation}?`
              : entry.category === "Graphs" ? `How would a graph help me see ${topic.title}?`
                : entry.category === "Misconceptions" ? `I used to think: ${topic.misconception} Help me replace that.`
                  : topic.starters[0];
      rows.push({
        id: stableId("start", `${topic.id}-${entry.category}-${index}-${catIndex}`),
        category: entry.category,
        conceptId: topic.conceptId,
        prompt: extra,
      });
    });
  });
  starterCache = rows;
  return starterCache;
}

const COMPARISON_PAIRS: Array<[string, string, string, string, string, string, string, string]> = [
  ["velocity", "acceleration", "kinematics", "kinematics", "Velocity is dx/dt; acceleration is dv/dt.", "Acceleration is the rate of change of velocity.", "A car at steady 20 m/s has velocity but zero acceleration.", "Moving is not the same as accelerating."],
  ["mass", "weight", "forces", "forces", "Mass is inertia (kg); weight is a force mg (N).", "Weight depends on the local gravitational field.", "On the Moon the same mass weighs less.", "Bathroom scales report a force, not kilograms of stuff directly."],
  ["energy", "power", "energy", "work", "Energy is a stored or transferred quantity (J); power is a rate (W).", "Power is energy per time.", "A battery stores energy; a motor’s wattage is how fast it converts it.", "A ‘powerful’ hit is often mixed up with a large energy."],
  ["force", "momentum", "forces", "momentum", "Force changes momentum; momentum is mv.", "Impulse J = FΔt = Δp.", "A brief large force and a long small force can share Δp.", "Force is not ‘stored inside’ a moving object."],
  ["voltage", "current", "circuits", "circuits", "Voltage is potential difference; current is charge flow.", "Ohmic devices link them by V = IR.", "A high voltage with an open switch still has I = 0.", "Current is not used up like a fuel."],
  ["frequency", "wavelength", "wave-motion", "wave-motion", "Frequency is oscillations per second; wavelength is the spatial period.", "v = fλ ties them through the medium’s speed.", "A 2 Hz wave with λ = 0.5 m has v = 1 m/s.", "High frequency is not automatically high speed."],
  ["heat", "temperature", "heat", "temperature", "Heat is energy in transit; temperature is a state reading.", "Q flows because of a ΔT.", "A spark is hot but carries little energy; a lake is the reverse.", "Objects do not ‘contain heat’ as a stored name."],
  ["speed", "velocity", "kinematics", "kinematics", "Speed is the magnitude; velocity includes direction.", "Average velocity uses displacement, not path length.", "Out-and-back: speed can be large while velocity averages to 0.", "The words are not interchangeable on exams."],
  ["work", "impulse", "work", "impulse", "Work is F along displacement (J); impulse is F through time (N·s).", "They change different quantities: energy vs momentum.", "Catching an egg slowly changes p with smaller average F; lifting a box changes energy.", "N·s is not a joule."],
  ["kinetic energy", "momentum", "energy", "momentum", "K is ½mv² (scalar); p is mv (vector).", "Same p does not mean same K if masses differ.", "A slow bowling ball and a fast ping-pong ball can match p and miss K.", "Conserving one does not automatically conserve the other."],
  ["series current", "parallel current", "circuits", "circuits", "Series: one path, same I. Parallel: currents split.", "Junction rule is charge conservation.", "Two identical parallel resistors each take half the battery current in the ideal case.", "Adding a parallel path does not ‘use up’ voltage the way students sometimes sketch."],
  ["reflection", "refraction", "optics", "optics", "Reflection stays in the incident medium; refraction enters the next.", "TIR is reflection after a failed refraction.", "A window both reflects and refracts.", "Mirrors are not required for all reflections."],
  ["period", "frequency", "oscillation", "oscillation", "T = 1/f. Period is time per cycle; frequency is cycles per time.", "They are reciprocals, not independent knobs on the same graph without a medium constraint.", "A 2 s period is 0.5 Hz.", "A ‘faster wave’ might mean v, f, or ‘looks busier’ — pick one."],
  ["density", "mass", "fluids", "fluids", "Density is m/V; mass is the amount of matter.", "A large mass of air can still have small density.", "A steel ship floats because average density of ship+air is less than water.", "Heavier is not a synonym for denser."],
  ["buoyant force", "weight", "buoyancy", "forces", "Buoyancy is ρ_fluid V_disp g; weight is mg.", "Float when they match.", "Apparent weight is their difference when submerged.", "Buoyancy is not a mystery extra force unrelated to pressure."],
  ["photon energy", "intensity", "modern-energy", "modern-energy", "Photon energy is hf; intensity relates to energy per time per area (packet rate × energy).", "Bright red is many small packets; dim UV can be fewer large packets.", "Photoelectric threshold cares about f, not brightness, in the simple model.", "Colour is not loudness."],
  ["classical KE", "relativistic KE", "energy", "relativistic-energy", "½mv² is the low-v limit of (γ−1)mc².", "They agree at small v/c and diverge later.", "At 0.8c, ½mv² is a serious underestimate.", "School formulas are approximations, not rival religions."],
  ["electric field", "electric force", "field", "coulomb-law", "E is force per unit charge; F = qE.", "The field can be discussed without a particular test charge.", "E can be nonzero where you have not drawn a test charge.", "Field lines are a visualization, not ropes."],
  ["pressure", "force", "fluids", "forces", "Pressure is force per area.", "The same force on a smaller area is a larger pressure.", "A sharp pin vs a snowshoe.", "Deep water pressure is not the same as the swimmer’s weight sitting on the eardrum as a single number without area."],
  ["displacement", "distance", "kinematics", "kinematics", "Displacement is a vector change in position; distance is path length.", "v_avg uses displacement.", "A 400 m track lap can have 0 displacement.", "Odometers do not report displacement."],
];

export function getComparisons(): ComparisonRecord[] {
  if (comparisonCache) return comparisonCache;
  const expanded = COMPARISON_PAIRS.flatMap((pair, index) => {
    const [left, right, leftId, rightId, difference, relationship, example, confusion] = pair;
    const a: ComparisonRecord = {
      id: stableId("cmp", `${index}-a`),
      left,
      right,
      leftConceptId: leftId,
      rightConceptId: rightId,
      difference,
      relationship,
      example,
      commonConfusion: confusion,
    };
    const b: ComparisonRecord = {
      id: stableId("cmp", `${index}-b`),
      left: right,
      right: left,
      leftConceptId: rightId,
      rightConceptId: leftId,
      difference: `${right} is not ${left}. ${difference}`,
      relationship,
      example,
      commonConfusion: `The reverse mix-up: treating ${right} as if it were ${left}. ${confusion}`,
    };
    const c: ComparisonRecord = {
      id: stableId("cmp", `${index}-exam`),
      left,
      right,
      leftConceptId: leftId,
      rightConceptId: rightId,
      difference: `Exam wording: if the unknown’s unit matches ${left}, do not report ${right}. ${difference}`,
      relationship,
      example: `Checkpoint: ${example}`,
      commonConfusion: confusion,
    };
    const d: ComparisonRecord = {
      id: stableId("cmp", `${index}-lab`),
      left,
      right,
      leftConceptId: leftId,
      rightConceptId: rightId,
      difference: `In a lab notebook, ${left} and ${right} must not share a column heading. ${difference}`,
      relationship,
      example,
      commonConfusion: confusion,
    };
    const e: ComparisonRecord = {
      id: stableId("cmp", `${index}-int`),
      left,
      right,
      leftConceptId: leftId,
      rightConceptId: rightId,
      difference: `Intuition: ${difference}`,
      relationship: `Because ${relationship}`,
      example: `Everyday: ${example}`,
      commonConfusion: confusion,
    };
    return [a, b, c, d, e];
  });
  comparisonCache = expanded;
  return comparisonCache;
}
