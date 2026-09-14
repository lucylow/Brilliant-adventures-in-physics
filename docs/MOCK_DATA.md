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

## Final report

### Files created

The mock system is a modular tree under `lib/mock/` (about 100 TypeScript modules): configuration, clock, versioning, factories, datasets, generators, repositories, catalog adapters, scenarios, validation, selectors, stats, XP, achievement/mission engines, entitlements, analytics, persistence, and the existing Demo AI subtree.

Supporting surfaces:

- `components/mock-data-provider.tsx` — hydrates `lib/storage` when mock mode is on
- `hooks/use-mock-data.ts` — scenario / learner / latency / reset controls
- `app/dev/mock-data.tsx` — development inspector (hidden in production)
- `tests/mock-rng.test.ts`, `tests/mock-dataset.test.ts`, `tests/mock-repositories.test.ts`
- `vitest.config.ts` — path aliases so Vitest can load `@/` and `@shared/`

### Files modified (integration)

View-models (`home`, `lab`, `progress`, `practice`, `tutor`) read mock catalogs through `isMockModeEnabled()` and `getActive*` adapters. Settings links to the mock panel in development. Practice, concepts, lesson, and tutor screens use catalog adapters instead of hardcoded demo arrays.

Inline `import { value, type T }` / `export { value, type T }` in several barrels were split so Vitest’s Rollup parser can load them (`lib/design-system`, `lib/view-models`, `lib/storage`, `shared/errors`, and related indexes).

### Demo entity counts (`seedDemo()` / `active-learner`)

| Entity | Count |
| --- | --- |
| Users | 24 |
| Topics | 30 |
| Concepts | 172 |
| Lessons | 120 |
| Equations | 89 |
| Practice problems | 268 |
| Attempts | 520 |
| Mastery records | 172 |
| Simulations | 55 |
| Experiments | 40 |
| Missions | 34 |
| Achievements | 50 |
| Tutor sessions | 50 |
| Notebook entries | 50 |
| Notifications | 56 |
| Activity | 128 |
| Review queue | 36 |
| Physics Lens records | 7 |
| Daily activity | 90 days |

Problem difficulty mix in the demo pack: easy 110, medium 134, hard 24. Combined notifications + review + recommendation ids exceed 100.

### Available scenarios

`fresh-user`, `beginner`, `active-learner` (default), `advanced-learner`, `power-user`, `exam-prep`, `explorer`, `offline-user`, `returning-user`, `empty-state`, `error-state`.

### How to enable

```
EXPO_PUBLIC_USE_MOCK_DATA=true
EXPO_PUBLIC_MOCK_SCENARIO=active-learner
```

Default `developmentOnly`: on in `NODE_ENV=development`, off in tests unless `setMockConfig({ mode: "enabled" })`, **always off in production**.

### How to reset

Development only: Settings → Open mock data panel → Reset, or `resetMockData()`. Production calls throw via `assertMockOnly()`.

### Repository mapping

| Mock | Real |
| --- | --- |
| `getActivePracticeQuestions()` | `practiceQuestions` when mock is off |
| `searchActiveConcepts()` | `searchConcepts()` when mock is off |
| `getActiveLesson()` | `projectileLesson` when mock is off |
| `Mock*Repository` | in-memory stand-ins for list/get/search/create/recordAttempt |
| persistence | `STORAGE_KEYS` + `safeStorageJsonSet` |
| analytics | in-memory buffer only |
| entitlements | `EXPO_PUBLIC_MOCK_ENTITLEMENTS`; never a store receipt |

### Tests added

- `tests/mock-rng.test.ts` (6)
- `tests/mock-dataset.test.ts` (14)
- `tests/mock-repositories.test.ts` (9)

### Commands run

| Command | Result |
| --- | --- |
| `pnpm check` | Passed |
| `pnpm lint` | Passed (0 errors; 3 pre-existing warnings in monetization files) |
| `pnpm test` | **445 passed, 1 skipped** (`tests/auth.logout.test.ts`) |
| `pnpm build` | Passed (`dist/index.js`) |

Expo validation in this repo is `pnpm lint` (`expo lint`) plus `pnpm check`. There is no `expo-doctor` script.

### Remaining limitations

- Mock mode does **not** make B.A.V. production-ready. It is a reversible development/demo layer.
- `MockDataProvider` hydrates storage asynchronously; first paint can still read empty persisted keys before hydrate finishes. In-memory `getMockDataset()` is available immediately.
- Mission step IDs that already use `lesson-` / `problem-` / `sim-` prefixes are not re-checked against the live catalogs.
- Equation fixtures are 89 standalone records; worked examples also live on lessons and problems rather than as a separate 150-item equation table.
- Physics Lens / scan fixtures are small (enough for UI states, not a large OCR corpus).
- Challenge-difficulty practice items exist in factories; the generated demo mix is currently easy/medium/hard.
- Original `practiceQuestions` (10) and `conceptRegistry` stay unchanged when mock is off so existing catalog tests keep their contracts.
- Tutor copy is labeled `MOCK_TUTOR` / `AI_EXPLANATION` / `VERIFIED_CALCULATION`. It is not a live model provider response.

## Expansion II

A second content generation lives under `lib/mock/expansion/` (labs, measurement series, circuits, discovery, calendar, missions, selectors). See:

- `docs/MOCK_DATA_EXPANSION_II.md`
- `docs/PHYSICS_DATA_CATALOG.md`
- `docs/EXPERIMENT_DATA_FORMAT.md`
- `docs/DEMO_SCENARIOS.md`
- `docs/MOCK_DATA_DEVELOPMENT_GUIDE.md`
