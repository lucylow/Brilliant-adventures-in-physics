# Demo AI evaluation

`lib/mock/ai/expansion/evaluation.ts` is a **mock evaluator**. Scores are transparent heuristics, not a live judge model.

## Scores

Each evaluated response has:

- correctness, relevance, clarity, completeness, pedagogy, verification ∈ `[0, 1]`
- `provenance`
- `golden` — regression reference for a concept
- `hallucinationDemo` — **must** be false for golden items

`evaluateText` down-scores invented citations / “2099” / “tesla on Mars” patterns and missing units.

`diffResponses(expected, actual)` compares token sets for structural regression tests.

## Hallucination demos

Controlled fixtures where Demo AI **intentionally** emits a bad claim so the app can practice catching:

- wrong equations
- invented sources
- invented observations
- extra-precise fake instruments

They contain the substring `TEST DATA` and `hallucinationDemo: true`. They are not shown as real Tutor answers in production (Demo AI is off in production).

## Guardrails

`GUARDRAIL_LIBRARY` maps failure codes to:

- user-facing message
- whether retry is appropriate
- fallback
- diagnostic id (`AI-GRD-…`)
- recovery action

Codes: unsupported domain, insufficient data, unsafe assumption, misleading certainty, fake citation, fabricated observation, invalid calculation.

`redactDiagnosticInput` strips authorization, tokens, secrets, and over-long input before any dev log.

## Self-correction and revision

- `getSelfCorrectionFixtures` — initial → verification → detected error → corrected.
- `getAnswerRevisions` — user correction, missing variable, unit clarification, image clarification.
- Assumption conflicts (`getAssumptionConflicts`) tell the copilot to **flag** a broken idealization rather than silently keep “neglect air resistance.”

## Knowledge conflicts

When a lesson and a stale mock note disagree, `knowledgeConflicts()` records both sources and a resolution: flag the conflict, prefer the lesson plus a deterministic check.

## Regression

`validateExpansionLayer()` (and `tests/ai-expansion.test.ts`) checks:

- schema samples
- unique ids
- concept / graph references
- journey consistency
- count floors (intents, problems, what-ifs, …)
- hallucination labeling
- no secret leakage
