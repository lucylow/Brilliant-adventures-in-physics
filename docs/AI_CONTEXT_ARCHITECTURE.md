# Demo AI context architecture

Context assembly lives in `lib/mock/ai/expansion/context.ts`. It is a **mock** retrieval layer: keyword and concept overlap, not embeddings.

## Builders

| Builder | Typical records |
| --- | --- |
| `buildTutorContext(query, conceptId, history, learnerId, window)` | current question, concept, lesson, simulation, recent mistake, learner weakness, last turns |
| `buildProblemContext` | prompt, knowns, prerequisites |
| `buildScanContext` | small window around the scanned concept |
| `buildExperimentContext` | objective, observation, matching simulation |
| `buildProgressContext` | weak concepts only |
| `buildRecommendationContext` | weak + related concepts |

Every record has `relevanceScore` and a **reason**. `prioritizeContext` drops scores below `0.12` and then applies a window cap.

## Windows

| Window | Cap |
| --- | --- |
| `tiny` | 2 |
| `small` | 4 |
| `normal` | 8 |
| `large` | 14 |
| `oversized` | 40 |

`contextWindowsDemo` builds a 24-turn history (including Hubble noise) so tests can assert truncation.

## Relevance

`scoreRelevance({ query, conceptId, lessonId, problemText, history }, candidate)` adds:

- same concept as the current question
- query overlap
- concept id mentioned in the candidate
- last-message overlap
- lesson id overlap

A kinematics projectile question must **not** keep a Hubble / cosmology row just because that row exists in the catalog. The assembler includes an explicit `irr-astronomy` candidate so tests can prove it is excluded.

## Search

`search.ts` indexes Expansion III conversation digests plus a slice of Expansion I conversations. `keywordSimilarity` is token overlap. Comments and docs must not call this semantic embeddings.

Ranking match tags: `exact` | `concept` | `partial` | `recent` | `weak-topic`.

Retrieval bundles include `none`, `irrelevant`, `partial`, `stale`, and `conflicting` so UI can practice empty and conflict states. Conflicting sources are **flagged**, not silently merged (`knowledgeConflicts()` in `evaluation.ts`).

## Provenance

Significant outputs should know whether they are `derived`, `retrieved`, `generated`, `verified`, `user-provided`, or `mock`. Numerical claims that go through `lib/physics` are `verified` / `deterministic-calculator`.
