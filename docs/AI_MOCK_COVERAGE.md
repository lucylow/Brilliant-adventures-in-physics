# Demo AI mock coverage (expansion III)

Coverage below is **mock/demo** coverage: fixtures and journeys a developer can exercise without a live provider. It is not a claim of production analytics or live-model evaluation.

## Feature × screen

| Feature | Screen / adapter | Expansion III source |
| --- | --- | --- |
| Tutor | `app/(tabs)/tutor.tsx` via `tutorScreenModel` | context, personalize, intents, Socratic, memory |
| Practice | practice adapter + feedback | structured problems, misconception classifier, hints |
| Recommendations | home via `homeRecommendationModel` | `rankWhatNext`, `personalizeRecommendation` |
| Physics Lens / Scan | `scanScreenModel` | multimodal sessions, entity extract |
| Explanations | Tutor / explanation APIs | `explanationAdaptations`, length profiles |
| Simulation copilot | `simulationScreenModel` | `getSimulationCopilotTurns`, what-if |
| Experiment copilot | `experimentScreenModel` | stages, residual datasets, lab-report reviews |
| Progress | `progressScreenModel` | narratives V3, weekly/monthly (demo-labeled) |
| Study plans | personalize study plan | session planner 5–60 min |
| Notebook | existing assist + writing transforms | document summaries, study notes |
| Exam coach | debriefs + formula sheets | exam journeys |
| Search | Tutor history index | keyword overlap, not embeddings |
| Errors | guardrails + recovery matrix | diagnostic ids, no secrets |
| Streaming / cancel | Expansion I stream + expansion block fixtures | cancel before/mid/after |
| Demo inspector | `app/dev/mock-data.tsx` | showcase, test user, provider mode |

## Learner personas

beginner, intermediate, advanced, exam, visual, simulation, returning, struggling, high-performer — each with different strategy, difficulty, and intervention.

## Physics domains

Graph nodes and catalog topics cover Mechanics, Waves, Thermal, Electricity, Fluids, Modern Physics via `conceptRegistry` (kinematics through relativistic momentum). Queries never invent concept ids.

## Error / data / network states

| Axis | Values exercised in fixtures |
| --- | --- |
| Error | unsupported, insufficient data, unsafe assumption, misleading certainty, fake citation, fabricated observation, invalid calculation, timeout profiles |
| Data | fresh / stale / expired / corrupt / missing cache; local-only / synced / pending / conflicted (mock flags) |
| Network | existing mock network + `mock-offline` |
| Difficulty | intro → challenge structured problems; adaptive moves easier/same/harder/challenge |
| User | eight `TestUserState` values |
| Retrieval | none / irrelevant / partial / stale / conflicting |

`expansionTestMatrix()` enumerates Feature × User (48 cells) as a documented slice; full cartesian product is not executed on every CI run.

## Scenarios

- 10 showcases
- ≥30 end-to-end flows
- 8 difficulty scenarios
- 30+ mastery plateaus
- 50+ Socratic trees and conversation branches
- 200+ misconception patterns
- 300+ what-if parameter changes
- Controlled hallucination **TEST DATA**
- Stress pagination: 5,000 Tutor messages by index, never rendered as one list

## What is explicitly not covered

- Live provider traffic
- Real user PII
- Production analytics dashboards
- Actual embedding search
- Hidden chain-of-thought
