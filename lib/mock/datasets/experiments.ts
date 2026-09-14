import { createMockExperiment } from "../factories/experiment";
import { isoDaysAgo } from "../clock";
import type { MockExperiment } from "../types";

type Seed = {
  id: string;
  title: string;
  category: string;
  conceptId: string;
  status: MockExperiment["status"];
  daysAgo: number;
  description: string;
  components: string[];
  variables: Record<string, number>;
  expectedObservation: string;
  points: Array<{ time: number; distance: number }>;
  summary: string;
};

const SEEDS: Seed[] = [
  { id: "experiment-ramp-1", title: "Rolling object on a ramp", category: "mechanical", conceptId: "kinematics", status: "completed", daysAgo: 6, description: "A cart rolls from rest down a straight ramp.", components: ["ramp", "cart", "meter stick"], variables: { angleDeg: 20, massKg: 0.5 }, expectedObservation: "Displacement should grow faster than linearly if acceleration is constant.", points: [{ time: 0, distance: 0 }, { time: 0.5, distance: 0.4 }, { time: 1, distance: 1.6 }], summary: "Distance grew faster than linearly, consistent with roughly constant acceleration." },
  { id: "experiment-spring-1", title: "Spring–mass period", category: "mechanical", conceptId: "elasticity", status: "saved", daysAgo: 4, description: "Measure period versus mass for an ideal spring.", components: ["spring", "masses", "stopwatch"], variables: { k: 80, massKg: 0.4 }, expectedObservation: "Period should increase with √m.", points: [{ time: 0, distance: 0.12 }, { time: 0.35, distance: 0 }, { time: 0.7, distance: -0.12 }], summary: "The motion looked sinusoidal; mass increase lengthened the period." },
  { id: "experiment-circuit-1", title: "Ohm’s law check", category: "circuits", conceptId: "circuits", status: "completed", daysAgo: 3, description: "Vary voltage on a fixed resistor and record current.", components: ["battery", "resistor", "ammeter"], variables: { voltage: 12, resistance: 4 }, expectedObservation: "I should equal V/R for an ohmic resistor.", points: [{ time: 0, distance: 0 }, { time: 1, distance: 3 }], summary: "Current was 3 A at 12 V, matching V/R." },
  { id: "experiment-wave-1", title: "Ripple tank wavelength", category: "waves", conceptId: "wave-motion", status: "saved", daysAgo: 8, description: "Estimate λ from a ripple photograph.", components: ["ripple tank", "strobe"], variables: { frequencyHz: 4, wavelengthM: 0.5 }, expectedObservation: "v = fλ should match the measured wave speed.", points: [{ time: 0, distance: 0 }, { time: 0.25, distance: 0.5 }], summary: "Four crests in 2 m gave λ ≈ 0.5 m." },
  { id: "experiment-orbit-draft", title: "Orbital speed sketch", category: "orbital", conceptId: "orbits", status: "draft", daysAgo: 1, description: "Draft notes for a circular-orbit calculation.", components: ["notebook"], variables: { radius: 2 }, expectedObservation: "v = √(GM/r) once G and M are stated.", points: [{ time: 0, distance: 0 }], summary: "Draft only — values not yet verified." },
  { id: "experiment-failed-save", title: "Pendulum timing", category: "mechanical", conceptId: "pendulum", status: "failed", daysAgo: 2, description: "Timing was interrupted before ten periods were recorded.", components: ["pendulum", "photogate"], variables: { length: 1 }, expectedObservation: "T ≈ 2π√(L/g) for small angles.", points: [{ time: 0, distance: 0.2 }], summary: "Save failed; only one swing was stored." },
];

const CATEGORIES = ["mechanical", "circuits", "waves", "orbital", "particle", "optics", "thermal"] as const;
const STATUSES: MockExperiment["status"][] = ["draft", "completed", "failed", "saved"];

export function createExperimentCatalog(): MockExperiment[] {
  const extras: MockExperiment[] = Array.from({ length: 34 }, (_, index) => {
    const status = STATUSES[index % STATUSES.length];
    const category = CATEGORIES[index % CATEGORIES.length];
    return createMockExperiment({
      id: `experiment-lab-${index + 1}`,
      title: `${category[0].toUpperCase()}${category.slice(1)} setup ${index + 1}`,
      category,
      conceptId: index % 2 ? "kinematics" : "circuits",
      status,
      createdAt: isoDaysAgo(1 + (index % 40), 8 + (index % 6)),
      updatedAt: isoDaysAgo(index % 20, 4),
      description: `A ${category} configuration used to test one variable at a time.`,
      components: category === "circuits" ? ["source", "resistor", "leads"] : ["sensor", "stand", "timer"],
      variables: category === "circuits" ? { voltage: 6 + (index % 5), resistance: 2 + (index % 4) } : { value: 1 + (index % 7) },
      initialConditions: { t0: 0 },
      expectedObservation: "The observable should respond to the single changed control.",
      points: [{ time: 0, distance: 0 }, { time: 1, distance: 0.4 + (index % 5) * 0.1 }, { time: 2, distance: 1.2 + (index % 4) * 0.2 }],
      summary: status === "failed" ? "The run did not complete; queued for retry in mock offline mode." : `Local ${category} run stored for review.`,
    });
  });
  return [
    ...SEEDS.map((seed) =>
      createMockExperiment({
        id: seed.id,
        title: seed.title,
        category: seed.category,
        conceptId: seed.conceptId,
        status: seed.status,
        description: seed.description,
        components: seed.components,
        variables: seed.variables,
        initialConditions: { t0: 0 },
        expectedObservation: seed.expectedObservation,
        points: seed.points,
        summary: seed.summary,
        createdAt: isoDaysAgo(seed.daysAgo, 9),
        updatedAt: isoDaysAgo(seed.daysAgo, 8),
      }),
    ),
    ...extras,
  ];
}
