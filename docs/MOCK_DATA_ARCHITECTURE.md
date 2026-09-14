# Mock data architecture

The mock system lives under `lib/mock/` and is wired at the **service / catalog / view-model** boundary.

```
lib/mock/
  config.ts          mode, scenario, learner, latency, network, entitlements flag
  clock.ts           fixed UTC epoch (2026-09-14T16:00:00.000Z)
  version.ts         MOCK_DATA_VERSION + storage keys
  types.ts           mock entities extending existing domain types
  seed.ts            seed packs + buildMockDataset()
  registry.ts        in-memory cache keyed by scenario + learner
  persistence.ts     hydrates lib/storage (never raw AsyncStorage)
  factories/         createMockUser, createMockProblem, …
  datasets/          static catalogs (users, topics, concepts, …)
  generators/        lessons, problems, attempts, activity
  adapters/          catalog, repositories, latency, failures
  scenarios/         scenario copy + screen coverage
  validation/        Zod + reference integrity
  selectors/         screen demo selectors
  utils/             seeded RNG, search, filter, pagination, physics values
```

## Separation of concerns

| Layer | Role |
| --- | --- |
| Static fixtures | Topics, users, equations, achievement definitions |
| Factories | Clone + overrides; never mutate shared objects |
| Generators | Lessons/problems/history derived from catalogs + physics |
| Scenarios | Choose seed pack + default learner |
| Adapters | Match real catalog/repository shapes |

## Mapping to real B.A.V. types

| Mock | Existing |
| --- | --- |
| `MockConcept` | `PhysicsConcept` |
| `MockLesson` | `Lesson` |
| `toPracticeQuestion()` | `PracticeQuestion` |
| `learningState` | `LearningState` |
| `MockMission` | `AdventureMission` |
| `achievementStates` | `Achievement` |
| experiments / notebook | `SavedExperiment` / `NotebookEntry` |
| persistence | `STORAGE_KEYS` + `safeStorageJsonSet` |

Original `practiceQuestions` (10 items) and `conceptRegistry` stay unchanged so existing unit tests keep their exact search and count contracts. Screens call `getActive*` adapters, which return the original catalogs when mock mode is off.

## Repositories

`MockLessonRepository`, `MockPracticeRepository`, `MockProgressRepository`, `MockSimulationRepository`, `MockTutorRepository`, `MockNotebookRepository`, `MockAchievementRepository`, `MockUserRepository` emulate list / getById / search / pagination / create / recordAttempt.

Latency profiles: `instant` (0 ms), `fast` (40), `realistic` (180), `slow` (450). Requests accept `AbortSignal`.

Failures default to rate `0`. Injected operations (for example `tutor.get`) fail without breaking unrelated features. Offline network only fails tutor/save operations.

## Production / bundle safety

- `isMockModeEnabled()` returns false in production.
- `assertMockOnly()` guards reset and learner switching.
- Mock entitlements require `EXPO_PUBLIC_MOCK_ENTITLEMENTS` and never count as a store purchase.
- Analytics events stay in an in-memory buffer; they are not sent.
- The `/dev/mock-data` panel is hidden when production runtime or mock mode is off.

## Physics

Dependent fixture values call `lib/physics` (`projectile`, `ohmsLaw`, `hydrostaticPressure`, …) through `lib/mock/utils/physics-values.ts`. Do not type contradictory currents or ranges by hand.

## Adding fixtures

1. Prefer an existing domain type in `lib/`.
2. Add a factory override, then a dataset or generator.
3. Link IDs in `seed.ts` (`linkCatalog`).
4. Extend `validateMockReferences`.
5. Add a count assertion in `tests/mock-dataset.test.ts`.
