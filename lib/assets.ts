/**
 * Semantic visual placeholders. Screens must not import raw stock paths.
 * Motifs are data-driven SVG, not copyrighted illustrations.
 */
export const BAV_PLACEHOLDERS = {
  orbit: "orbit",
  wave: "wave",
  grid: "grid",
  vector: "vector",
  particle: "particle",
  field: "field",
  circuit: "circuit",
  ray: "ray",
} as const;

export type BavPlaceholderKind = (typeof BAV_PLACEHOLDERS)[keyof typeof BAV_PLACEHOLDERS];

export function placeholderForTopic(topic: string): BavPlaceholderKind {
  const value = topic.toLowerCase();
  if (value.includes("orbit") || value.includes("gravity") || value.includes("astro")) return "orbit";
  if (value.includes("wave") || value.includes("sound") || value.includes("oscill")) return "wave";
  if (value.includes("force") || value.includes("vector") || value.includes("motion")) return "vector";
  if (value.includes("quantum") || value.includes("photon") || value.includes("particle")) return "particle";
  if (value.includes("field") || value.includes("electric") || value.includes("magnet")) return "field";
  if (value.includes("circuit") || value.includes("ohm") || value.includes("current")) return "circuit";
  if (value.includes("optic") || value.includes("lens") || value.includes("ray")) return "ray";
  return "grid";
}
