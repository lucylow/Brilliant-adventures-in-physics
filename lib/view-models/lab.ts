import { createSimulationCatalog, simulationsForCategory } from "@/lib/mock/datasets/simulations";
import type { MockSimulation } from "@/lib/mock/types";
import type { ScreenStatus } from "@/lib/screen-recovery";

export const LAB_CATEGORIES = ["All", "Mechanics", "Waves", "Electricity", "Optics", "Quantum", "Astronomy"] as const;
export type LabCategory = (typeof LAB_CATEGORIES)[number];

export type LabViewModel = {
  status: ScreenStatus;
  category: LabCategory;
  countLabel: string;
  items: Array<{
    id: string;
    title: string;
    concept: string;
    difficulty: string;
    duration: number;
    motif: string;
    accent: string;
    featured: boolean;
    route: "/lab" | "/quantum" | "/astronomy";
  }>;
};

function difficultyLabel(value: MockSimulation["difficulty"]): string {
  if (value === "easy") return "Beginner";
  if (value === "hard" || value === "challenge") return "Advanced";
  return "Intermediate";
}

function routeFor(simulation: MockSimulation): "/lab" | "/quantum" | "/astronomy" {
  if (simulation.category === "Quantum") return "/quantum";
  if (simulation.category === "Astronomy") return "/astronomy";
  return "/lab";
}

export function buildLabViewModel(category: LabCategory = "All", status: ScreenStatus = "success"): LabViewModel {
  const items = (category === "All" ? createSimulationCatalog() : simulationsForCategory(category)).map((simulation) => ({
    id: simulation.id,
    title: simulation.title,
    concept: `${simulation.category} · ${simulation.topicId.replace(/-/g, " ")}`,
    difficulty: difficultyLabel(simulation.difficulty),
    duration: simulation.duration,
    motif: simulation.thumbnail.motif,
    accent: simulation.thumbnail.accent,
    featured: simulation.featured,
    route: routeFor(simulation),
  }));
  return {
    status: status === "success" && items.length === 0 ? "empty" : status,
    category,
    countLabel: `${items.length} interactive simulations · ${category}`,
    items,
  };
}

export type SimulationViewModel = {
  id: string;
  title: string;
  equations: string[];
  observables: string[];
  parameters: MockSimulation["parameters"];
  defaults: Record<string, number>;
};

export function buildSimulationViewModel(id = "sim-projectile"): SimulationViewModel {
  const simulation = createSimulationCatalog().find((item) => item.id === id) ?? createSimulationCatalog()[0];
  return {
    id: simulation.id,
    title: simulation.title,
    equations: simulation.equations,
    observables: simulation.observableQuantities,
    parameters: simulation.parameters,
    defaults: simulation.defaultParameters,
  };
}
