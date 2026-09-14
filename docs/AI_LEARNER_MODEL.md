# Demo AI learner model

Expansion III adds a **deterministic learner model** used only while Demo AI is on. It is not a production analytics profile and it does not describe a real person.

## Types

- `LearnerModel` — knowledge, signals, preferences, insights, velocity, hint dependence, streak, fatigue.
- `LearnerSignal` — accuracy / hint / time / confidence / engagement / fatigue observations (mock).
- `LearnerPreference` — explanation style, difficulty, modality, simulation affinity, challenge tolerance, review tendency, time budget.
- `LearnerInsight` — a short, evidenced next action (`isMock: true`).

Concept ids come from `lib/concepts.ts` `conceptRegistry`. Demo user ids are `demo-learner-beginner`, `demo-learner-exam`, … — they do not collide with catalog users (`user-maya`, …).

## Factories

| Factory | What the Tutor tends to do |
| --- | --- |
| `createBeginnerLearnerModel()` | Analogy-first, easier items, higher hint dependence |
| `createIntermediateLearnerModel()` | Step-by-step, mixed modality |
| `createAdvancedLearnerModel()` | Direct / equation-heavy |
| `createExamLearnerModel()` | Worked examples, over-review, longer time budget |
| `createVisualLearnerModel()` | Visual strategy, diagrams first |
| `createSimulationLearnerModel()` | Simulation-first recommendations |
| `createReturningLearnerModel()` | Short recap, no guilt, fragile streak |
| `createStrugglingLearnerModel()` | Analogy / Socratic, intervention on repeated mistakes |
| `createHighPerformerLearnerModel()` | Equation-first, low hint dependence, challenge moves |

`selectTeachingStrategy(model, conceptId)` and `personalizeExplanation` / `personalizeHint` / `personalizeStudyPlan` read these fields. Same concept, different factory → different copy and next action.

## Events

`applyLearnerEvent` and `processMemoryEvent` handle:

- lesson / review completion
- problem success / failure
- hint request
- tutor request
- simulation / mission completion

Effects are small and clamped to `[0, 1]`. Failures increment `mistakeCount`; hints raise `hintDependence`.

## Memory

`lib/mock/ai/expansion/memory-store.ts` stores recent concepts, misconceptions, styles, questions, explanations, successes, and failures with expiry:

- style / preference ~ 90 days
- misconceptions ~ 30 days
- questions / recent concepts ~ 14 days

Retrieval APIs (`retrieveRelevantMemory`, `retrieveRecentMemory`, `retrieveConceptMemory`, `retrieveMistakeMemory`, `retrievePreferenceMemory`) always take a **limit**. They must not be replaced with “return the whole store”.

## Privacy

No realistic private identity, email, or school records. Labels are role names (“Exam-focused learner”), not people.
