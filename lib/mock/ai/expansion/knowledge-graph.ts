import { conceptRegistry, findConcept } from "@/lib/concepts";
import { stableId } from "../../utils/ids";
import { CATALOG } from "../ai-catalog";
import type { GraphEdge, GraphEdgeKind, GraphNode, PhysicsKnowledgeGraph } from "./types";

let graphCache: PhysicsKnowledgeGraph | null = null;

function node(kind: GraphNode["kind"], id: string, label: string, conceptId?: string, refId?: string): GraphNode {
  return { id: stableId("gn", `${kind}-${id}`), kind, label, conceptId, refId };
}

function edge(from: string, to: string, kind: GraphEdgeKind, reason: string, disambiguator = ""): GraphEdge {
  return { id: stableId("ge", `${kind}-${from}-${to}-${disambiguator}`), from, to, kind, reason };
}

export function getPhysicsKnowledgeGraph(): PhysicsKnowledgeGraph {
  if (graphCache) return graphCache;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const conceptNode = new Map<string, string>();

  for (const concept of conceptRegistry) {
    const id = node("concept", concept.id, concept.title, concept.id, concept.id).id;
    conceptNode.set(concept.id, id);
    nodes.push({ id, kind: "concept", label: concept.title, conceptId: concept.id, refId: concept.id });
    nodes.push(node("topic", `${concept.domain}-${concept.id}`, concept.domain, concept.id));
    if (concept.equation) {
      nodes.push(node("equation", concept.id, concept.equation, concept.id, concept.equation));
    }
  }

  for (const concept of conceptRegistry) {
    const from = conceptNode.get(concept.id);
    if (!from) continue;
    const topicId = stableId("gn", `topic-${concept.domain}-${concept.id}`);
    edges.push(edge(from, topicId, "related", `${concept.title} belongs to ${concept.domain}.`));
    if (concept.equation) {
      edges.push(edge(from, stableId("gn", `equation-${concept.id}`), "exampleOf", `${concept.equation} is the local model for ${concept.title}.`));
    }
    for (const pre of concept.prerequisites) {
      const preId = conceptNode.get(pre);
      if (preId) edges.push(edge(from, preId, "prerequisite", `${concept.title} needs ${pre} first.`));
    }
  }

  for (const topic of CATALOG) {
    const conceptId = conceptNode.get(topic.conceptId);
    nodes.push(node("lesson", `${topic.id}:${topic.lessonId}`, topic.lessonId, topic.conceptId, topic.lessonId));
    nodes.push(node("simulation", `${topic.id}:${topic.simulationId}`, topic.simulationId, topic.conceptId, topic.simulationId));
    nodes.push(node("experiment", `${topic.id}:${topic.experiment.name}`, topic.experiment.name, topic.conceptId, topic.id));
    nodes.push(node("misconception", `${topic.id}-mix`, topic.misconception, topic.conceptId, topic.id));
    nodes.push(node("problem", `${topic.id}-ex`, topic.example.prompt, topic.conceptId, topic.id));
    if (!conceptId) continue;
    edges.push(edge(conceptId, stableId("gn", `lesson-${topic.id}:${topic.lessonId}`), "related", "Lesson covers this concept."));
    edges.push(edge(conceptId, stableId("gn", `simulation-${topic.id}:${topic.simulationId}`), "visualizedBy", `${topic.simulationId} makes ${topic.title} visible.`));
    edges.push(edge(conceptId, stableId("gn", `experiment-${topic.id}:${topic.experiment.name}`), "experimentedWith", topic.experiment.objective));
    edges.push(edge(conceptId, stableId("gn", `misconception-${topic.id}-mix`), "commonMistakeFor", topic.misconception));
    edges.push(edge(conceptId, stableId("gn", `problem-${topic.id}-ex`), "testedBy", topic.example.principle));
    const related = conceptRegistry.find((item) => item.id !== topic.conceptId && item.domain === findConcept(topic.conceptId)?.domain);
    if (related) {
      const other = conceptNode.get(related.id);
      if (other) edges.push(edge(conceptId, other, "related", `Same domain as ${related.title}.`, topic.id));
    }
  }

  graphCache = { nodes, edges };
  return graphCache;
}

function neighbors(conceptId: string, kind: GraphEdgeKind): string[] {
  const graph = getPhysicsKnowledgeGraph();
  const conceptNodeId = stableId("gn", `concept-${conceptId}`);
  return graph.edges
    .filter((item) => item.kind === kind && (item.from === conceptNodeId || graph.nodes.find((node) => node.id === item.from)?.conceptId === conceptId))
    .map((item) => graph.nodes.find((node) => node.id === item.to))
    .filter((item): item is GraphNode => Boolean(item && item.conceptId))
    .map((item) => item.conceptId as string)
    .filter((id, index, all) => all.indexOf(id) === index);
}

export function findPrerequisites(conceptId: string): string[] {
  return findConcept(conceptId)?.prerequisites ?? [];
}

export function findRelatedConcepts(conceptId: string): string[] {
  const concept = findConcept(conceptId);
  if (!concept) return [];
  return conceptRegistry
    .filter((item) => item.id !== conceptId && (item.domain === concept.domain || item.prerequisites.includes(conceptId) || concept.prerequisites.includes(item.id)))
    .map((item) => item.id);
}

export function findRemediationConcepts(conceptId: string): string[] {
  const prereq = findPrerequisites(conceptId);
  const related = findRelatedConcepts(conceptId).slice(0, 2);
  return [...prereq, ...related].filter((id, index, all) => all.indexOf(id) === index);
}

export function findPracticeForConcept(conceptId: string): string[] {
  return CATALOG.filter((topic) => topic.conceptId === conceptId).map((topic) => topic.example.prompt);
}

export function findSimulationForConcept(conceptId: string): string[] {
  return CATALOG.filter((topic) => topic.conceptId === conceptId).map((topic) => topic.simulationId).filter((id, index, all) => all.indexOf(id) === index);
}

export function findExperimentsForConcept(conceptId: string): string[] {
  return CATALOG.filter((topic) => topic.conceptId === conceptId).map((topic) => topic.experiment.name);
}

export function findCommonMistakes(conceptId: string): string[] {
  const fromCatalog = CATALOG.filter((topic) => topic.conceptId === conceptId).flatMap((topic) => [topic.misconception, topic.commonMistake]);
  const fromRegistry = findConcept(conceptId)?.misconceptionKeywords ?? [];
  return [...fromCatalog, ...fromRegistry].filter((item, index, all) => all.indexOf(item) === index);
}

export function graphStats() {
  const graph = getPhysicsKnowledgeGraph();
  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    concepts: graph.nodes.filter((item) => item.kind === "concept").length,
    simulations: graph.nodes.filter((item) => item.kind === "simulation").length,
  };
}

export function resetKnowledgeGraph(): void {
  graphCache = null;
}

export { neighbors };
