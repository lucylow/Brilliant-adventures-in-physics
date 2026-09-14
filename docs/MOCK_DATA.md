# Mock data

B.A.V. can start in a **Demo / Mock Data** mode that fills Home, Practice, Progress, Lab, Adventure, Tutor, Notebook, and Settings with a coherent physics catalog. The layer sits behind existing view-models, hooks, and storage. It does not replace production backends.

This is development, QA, screenshot, and Figma-to-Cursor infrastructure. It is not a live content API.

## How to enable

Use the repository’s existing `EXPO_PUBLIC_*` convention.

```
EXPO_PUBLIC_USE_MOCK_DATA=true
```

Optional:

```
EXPO_PUBLIC_MOCK_SCENARIO=active-learner
EXPO_PUBLIC_MOCK_ENTITLEMENTS=true
```

`EXPO_PUBLIC_MOCK_ENTITLEMENTS` is ignored unless mock mode is already on, and it is always off in production.

Default mode is `developmentOnly`:

- `NODE_ENV=development` → mock data on (unless `EXPO_PUBLIC_USE_MOCK_DATA=false`)
- `NODE_ENV=test` → mock data off unless a test calls `setMockConfig({ mode: "enabled" })`
- `NODE_ENV=production` → always off, even if env flags are present

## How to reset

Development only (`assertMockOnly`):

- Settings → **Open mock data panel** → **Reset mock data**
- `resetMockData()` from `lib/mock`

Reset clears the in-memory registry and re-hydrates `lib/storage` keys for learning, notebook, experiments, adventure, onboarding, and the retry queue.

## Switching learners

The mock panel can switch:

- Beginner (`user-alex`)
- Intermediate (`user-maya`)
- Advanced (`user-noah`)
- Power User (`user-jordan`)
- Exam Prep (`user-taylor`)

Switching rebuilds a coherent dataset for that persona rather than renaming the current user.

## Runtime helpers

```ts
isMockModeEnabled()
getMockConfig()
setMockScenario("active-learner")
getMockScenario()
setMockLearner("user-maya")
resetMockData()
getMockDatasetStats(dataset, scenario)
```

Screens should consume `lib/mock/adapters/catalog` (`getActivePracticeQuestions`, `getActiveLesson`, `searchActiveConcepts`, …) or existing view-models. Do not import fixture arrays into presentational components.

## Related docs

- [Architecture](./MOCK_DATA_ARCHITECTURE.md)
- [Scenarios](./MOCK_SCENARIOS.md)
- [Validation](./MOCK_DATA_VALIDATION.md)
- Demo AI (separate layer): [AI mock data](./AI_MOCK_DATA.md)
