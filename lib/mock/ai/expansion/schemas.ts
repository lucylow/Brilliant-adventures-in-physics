import { z } from "zod";

export const learnerModelIdSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "exam",
  "visual",
  "simulation",
  "returning",
  "struggling",
  "high-performer",
]);

export const assembledContextSchema = z.object({
  feature: z.string().min(1).max(80),
  query: z.string().max(2000),
  records: z.array(z.object({
    id: z.string().min(1),
    kind: z.enum(["question", "history", "concept", "lesson", "mistake", "simulation", "weakness"]),
    text: z.string().min(1).max(4000),
    conceptId: z.string().max(80).optional(),
    relevanceScore: z.number().finite().min(0).max(1),
    reason: z.string().min(1).max(400),
  })).max(40),
  truncated: z.boolean(),
  window: z.enum(["tiny", "small", "normal", "large", "oversized"]),
  excludedIds: z.array(z.string()),
});

export const evaluatedResponseSchema = z.object({
  id: z.string().min(1),
  conceptId: z.string().min(1).max(80),
  text: z.string().min(1).max(8000),
  scores: z.object({
    correctness: z.number().min(0).max(1),
    relevance: z.number().min(0).max(1),
    clarity: z.number().min(0).max(1),
    completeness: z.number().min(0).max(1),
    pedagogy: z.number().min(0).max(1),
    verification: z.number().min(0).max(1),
  }),
  provenance: z.enum(["derived", "retrieved", "generated", "verified", "user-provided", "mock"]),
  golden: z.boolean(),
  hallucinationDemo: z.boolean(),
  notes: z.string().min(1).max(800),
});

export const contentBlockSchema = z.object({
  kind: z.enum(["paragraph", "equation", "bullet-list", "warning", "tip", "example", "callout", "chart", "simulation", "practice", "source"]),
  text: z.string().min(1).max(8000),
  equation: z.string().max(400).optional(),
  items: z.array(z.string().max(400)).max(20).optional(),
});

export function assertContentBlocks(blocks: Array<{ kind: string; text: string }>, label: string): void {
  if (!blocks.length) throw new Error(`${label} has no content blocks`);
  blocks.forEach((block, index) => {
    if (!block.text.trim()) throw new Error(`${label} block ${index} is empty`);
  });
}
