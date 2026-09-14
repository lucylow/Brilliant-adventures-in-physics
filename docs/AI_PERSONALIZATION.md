# Demo AI personalization

Personalization is **opt-in** on the Tutor path so Expansion I tests and default catalog users stay stable.

## When it runs

`buildTutorPayload` in `lib/mock/ai/ai-client.ts` calls `personalizeTutorPayload` only if:

- `request.userId` matches a `demo-learner-*` model, or
- the AI showcase is `personalization` (`setAIDemoShowcase("personalization")`).

`user-maya` (default factory user) is unchanged.

## Strategy selection

`selectTeachingStrategy` (in order of checks):

1. simulation-first — high simulation affinity or simulation modality
2. visual — visual learner
3. analogy — struggling, or mastery below 0.3
4. worked-example — exam learner
5. socratic — high hint dependence
6. direct-explanation — advanced / high performer
7. counterexample — repeated mistakes on the concept
8. practice-first — default

## Surfaces

| Function | Depends on |
| --- | --- |
| `personalizeExplanation` | style + strategy prefix |
| `explanationAdaptations` | short / standard / deep / visual / analogy / equation-first / exam-review for the **same** concept |
| `personalizeHint` | previous hint count → subtle → directional → equation → substitution |
| `personalizeProblem` | preferred difficulty (scales knowns) |
| `personalizeRecommendation` | weak concepts + mistake memory; reasons never say “popular” |
| `personalizeSimulation` | simulation affinity |
| `personalizeStudyPlan` | time budget + weak concepts |

## Adaptive engines

- `selectNextDifficulty` — accuracy, response time, hint usage, mastery, confidence → easier / same / harder / challenge.
- Fixtures: `rapidImprovement`, `steadyProgress`, `plateau`, `decline`, `overconfidence`, `underconfidence`, `highAccuracySlow`, `lowAccuracyFast`.
- `decideIntervention` — repeated mistake, inactivity, rapid guessing, hint dependency, streak break, mastery plateau. Copy avoids guilt.
- `calibrationNote` — high confidence + wrong ≠ “you are certain.” Low confidence + correct is treated as a calibration issue.

## Recommendations

`rankWhatNext(learnerId)` returns review / practice / lesson / simulation / tutor / mission with an explicit reason from **this learner’s weaknesses**. Exploration / curiosity links live in `getCuriosityLinks()` and are separate from deficit-driven ranking.
