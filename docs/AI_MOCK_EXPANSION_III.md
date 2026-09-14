# Demo AI mock expansion III

This is the **third** AI-specific mock-data expansion. It sits beside Expansions I and II. It does **not** replace them.

| Layer | Path | Version |
| --- | --- | --- |
| Expansion I/II (provider, conversations, hints, scans, …) | `lib/mock/ai/` | `MOCK_AI_DATA_VERSION` `1.0.0` |
| Expansion III (learner model, context, memory, copilots, evaluation) | `lib/mock/ai/expansion/` | `MOCK_AI_EXPANSION_VERSION` `3.0.0` |

The product switch is still **REAL AI / deterministic tutor ↔ Demo AI**. Production builds cannot enable Demo AI. Nothing in this folder is a live provider.

## What this expansion adds

- Deterministic **learner models** (nine factories) that change explanation style, hints, difficulty, and recommendations.
- An AI-facing **physics knowledge graph** over `conceptRegistry` + the existing catalog.
- A **context assembler** with relevance scoring, window sizes, and tests that drop Hubble-style noise from a kinematics question.
- A **long-term memory store** with retrieval that does not dump the whole store into every request.
- **Personalization**, adaptive hints/difficulty, interventions, Socratic trees, misconception patterns.
- **What-if** rows that recalculate with `lib/physics`.
- Simulation and experiment **copilots**, study guides, flashcards, quizzes, weekly/monthly demo reviews (labeled demo, never production analytics).
- Evaluation, golden responses, controlled **TEST DATA** hallucination fixtures, guardrails, search, demo showcases, journeys.

## How to use it

1. Enable mock data **and** Demo AI (`EXPO_PUBLIC_USE_MOCK_AI`, `EXPO_PUBLIC_MOCK_AI_MODE`). See `docs/AI_MOCK_ARCHITECTURE.md`.
2. Open **Settings → Mock data panel** (`app/dev/mock-data.tsx`).
3. Pick a **Demo AI provider** mode (basic / rich / streaming / failure / offline / slow).
4. Pick an **AI showcase** (Tutor, Scan, Experiment, Exam, Simulation, Personalization, Recovery, Streaming, Verification, Multimodal).
5. Pick an **AI test user** (`fresh`, `active`, `struggling`, …). That maps onto a learner model via `learnerIdForTestUser()`.
6. Tutor payloads personalize when `request.userId` is a `demo-learner-*` id, or when the showcase is `personalization`. Default catalog users such as `user-maya` keep Expansion I responses.

## Important files

| File | Role |
| --- | --- |
| `expansion/learner-model.ts` | Nine learner factories + `applyLearnerEvent` |
| `expansion/knowledge-graph.ts` | Graph + deterministic queries |
| `expansion/context.ts` | Context assembly + windows |
| `expansion/memory-store.ts` | Long-term memory + event processing |
| `expansion/personalize.ts` | Style/strategy-aware outputs |
| `expansion/adaptive.ts` | Difficulty, hints, interventions |
| `expansion/misconceptions.ts` | Pattern library + classifier |
| `expansion/dialogue.ts` | Intents, clarifications, Socratic trees |
| `expansion/entities.ts` | Extraction + SI normalization |
| `expansion/problems.ts` | Structured problems + assumptions |
| `expansion/what-if.ts` | Parameter-change recalculation |
| `expansion/copilots.ts` | Simulation / experiment assistance |
| `expansion/study.ts` | Coaching, reviews, guides, “what next?” |
| `expansion/evaluation.ts` | Scores, golden, hallucination demos |
| `expansion/orchestration.ts` | Showcases, timelines, resets |
| `expansion/journeys.ts` | Multi-feature journeys |
| `expansion/validators.ts` | Counts + integrity |
| `expansion/debug.ts` | Dev inspector snapshot |

Screens still go through `lib/mock/ai/ai-screen-adapters.ts` and `createAppTutorService()`. Do not import giant fixture arrays into UI files.

## Resets

```ts
resetAIUserState()      // learner cache + long-term memory
resetAIMemory()
resetAIConversation()   // Tutor sessions
resetAIScenarios()      // showcase + test user
resetAIRecommendations()
```

## Determinism

Factories and generators are seedless tables plus `stableId`. Same learner id → same mastery, style, and recommendations. Stress datasets (`pageStressMessages`) generate **by index**; they do not allocate 5,000 rows up front.

## Rules this layer will not break

- No live-provider claims.
- No fabricated production analytics (`isDemoAnalytics: true` on weekly/monthly rolls).
- No invented scientific observations.
- No credentials in diagnostics (`redactDiagnosticInput`).
- No hidden chain-of-thought; reasoning summaries are educational (principle, equation, unit check).
- No `Math.random()` in core generation.
- Hallucination fixtures are marked `hallucinationDemo` and contain `TEST DATA`.
