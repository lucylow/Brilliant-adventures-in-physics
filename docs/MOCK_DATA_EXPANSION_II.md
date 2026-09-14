# Mock Data Expansion II

B.A.V. already has a first-generation typed mock layer under `lib/mock/`. Expansion II **extends** that layer. It does not replace catalogs, factories, or production services.

## What this layer is

A development content pack for:

- Figma / screenshot seeds
- Cursor UI implementation
- QA of empty, partial, and rich states
- Offline demo of Home, Tutor, Practice, Adventure, Lab, Progress, Notebook, Search

Mock mode stays a **content adapter**. Live backends remain the production path. `isMockModeEnabled()` is **false in production** regardless of `EXPO_PUBLIC_USE_MOCK_DATA`.

## Version

`MOCK_DATA_VERSION` is `1.1.0`. Persistence rehydrates when the stored version differs.

## Where the new code lives

| Path | Role |
| --- | --- |
| `lib/mock/expansion/types.ts` | Expansion II record types and `MockExpansion` |
| `lib/mock/expansion/compose.ts` | Pack registry, `composeMockDataset`, cached `buildMockExpansion` |
| `lib/mock/expansion/datasets/` | Labs, circuits, discovery, calendar, literacy, campaigns, mechanics |
| `lib/mock/expansion/generators/` | Measurement series, CSV, graphs, vectors |
| `lib/mock/expansion/factories.ts` | Second-generation factories that compose gen-1 factories |
| `lib/mock/expansion/selectors.ts` | Derived screen selectors (no `Math.random` in render) |
| `lib/mock/expansion/diagnostics.ts` | Counts, duplicate IDs, relationship graph |
| `lib/mock/expansion/report.ts` | `generateMockDataReport()` |

`MockDataset.expansion` is always present when a dataset is built. Screens read it through existing view-models and catalog adapters.

## Content packs

Pack ids: `mechanics`, `waves`, `electricity`, `optics`, `thermal`, `modern`, `space`, `literacy`, `classroom`.

```ts
import { buildMockExpansion, mechanicsPack, wavesPack, composeMockDataset } from "@/lib/mock/expansion";

const full = buildMockExpansion();
const subset = composeMockDataset([mechanicsPack(), wavesPack()], ["mechanics", "waves"]);
```

Composition **clones** pack arrays. Do not mutate returned repository data; `copyMockDataset()` / catalog adapters already clone at the boundary.

## New scenarios

In addition to gen-1 scenarios:

- `showcase` — screenshot / Figma seed (Jordan, rich pack)
- `mechanics-lab` — explorer-scale mechanics labs
- `space-week` — orbital missions and educational astronomy
- `exam-sprint` — timed papers and review

## Selectors (derive, do not shuffle)

- `selectFeaturedSimulation`
- `selectRecommendedLesson`
- `selectDailyChallenge` (day-of-year against the 90-day calendar)
- `selectCurrentMission`
- `selectWeakConcepts`
- `selectDueReviews`
- `selectRecentActivity` / `selectRecentExperiments`
- `selectAchievementsInProgress`
- `selectTutorSuggestions`
- `selectNextBestAction`

These run at the repository/view-model boundary, never inside a React render as a generator.

## Production safety

- Production `NODE_ENV` cannot enable mock catalogs.
- Demo aggregates use `DEMO_AGGREGATE_NOT_PRODUCTION`.
- Leaderboard rows are `fictional: true`.
- Astro records with `EDUCATIONAL_FIXTURE` are not real discoveries.
- Relativity fixtures reject `v >= c`.
