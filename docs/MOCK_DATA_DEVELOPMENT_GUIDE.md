# Mock Data Development Guide

## Enable mock mode (development / test only)

```
EXPO_PUBLIC_USE_MOCK_DATA=true
EXPO_PUBLIC_MOCK_SCENARIO=active-learner
```

Production builds ignore this flag. `isMockModeEnabled()` returns `false` when `NODE_ENV=production`.

## Do not generate data in React render

```ts
// Wrong
function Screen() {
  const series = createPositionSeries({ seed: Math.random().toString() });
}

// Right — repository / view-model boundary
const dataset = getMockDataset();
const challenge = selectDailyChallenge(dataset);
```

Catalog adapters (`getActivePracticeQuestions`, `getActiveSimulations`, `getActiveMissions`, `getActiveTutorSessions`, `searchActiveContent`) already clone on the way out.

## Adding a content pack

1. Reuse existing types in `lib/mock/expansion/types.ts` or gen-1 `lib/mock/types.ts`.
2. Put deterministic builders in `datasets/` or `generators/`.
3. Register a loader in `compose.ts` (`PACK_LOADERS`).
4. Consume the data from `buildMockDataset` (merge into core arrays **or** read `dataset.expansion` from a selector).
5. Add a floor assertion in `tests/mock-expansion.test.ts`.

## Physics rules

- Dependent values come from `lib/physics.ts` or `expansion/physics.ts`.
- Same seed → identical series / attempts.
- Never `v >= c` in relativity fixtures (`gammaFromBeta` throws).
- Label educational / fictional astronomy and demo aggregates.

## Diagnostics

```ts
import { diagnoseExpansion, generateMockDataReport, validateRelationshipGraph } from "@/lib/mock/expansion";

const dataset = getMockDataset();
const report = generateMockDataReport(dataset, "showcase");
```

The development inspector prints entity counts plus Expansion II pack names. A JSON report can be written from `generateMockDataReport` (see `docs/mock-data-report.json` after the local generator run).

## Tests

```
pnpm test tests/mock-expansion.test.ts
pnpm check
```

Gen-1 integrity tests in `tests/mock-dataset.test.ts` still apply to the combined seed.
