# Mock data validation

## What is checked

`validateMockDataset()` uses Zod for required fields, finite numbers, ISO dates, and difficulty enums.

`validateMockReferences()` requires:

- `concept.topicId` → a topic
- `concept.prerequisites[]` → concepts (not topic ids)
- `lesson.conceptId` / `lesson.topicId` / `lesson.nextLessonId`
- `problem.conceptId` / `problem.topicId`
- `simulation.conceptIds[]`
- `attempt.problemId`
- mission steps whose ids do not use the `lesson-` / `problem-` / `sim-` prefix must exist

`assertValidMockDataset()` throws in development if either list is non-empty.

## Tests

Vitest coverage lives in:

- `tests/mock-rng.test.ts` — determinism, clock, factory overrides
- `tests/mock-dataset.test.ts` — seed counts, references, recommendations, search/filter/pagination, XP
- `tests/mock-repositories.test.ts` — CRUD/list, abortable latency, injected failures, analytics, entitlements

Malformed records belong in `lib/mock/fixtures/empty.ts` (`malformedFixtures`). They must not appear in demo seeds.

## Commands

```
pnpm check
pnpm lint
pnpm test
pnpm build
```

Mock mode stays **off** during the default test run so existing catalog tests (`searchConcepts("Newton").length === 0`, exactly ten `practiceQuestions`) keep passing.

## Integrity habits

- Stable string ids (`user-maya`, `lesson-kinematics`, `problem-ohm-1`, `sim-projectile`)
- Seeded RNG only (`createSeededRandom`); no `Math.random()` in mock fixtures
- Dates from `getMockNow()` / `isoDaysAgo()`, never `Date.now()` inside generators
- Dependent physics from `lib/physics`
- Clone on the way out of repositories

## Final report (validation)

`pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build` were run after wiring. **445 tests passed**, 1 skipped (`auth.logout`). Lint reported 0 errors and 3 existing monetization warnings. Snapshot floors in `tests/mock-dataset.test.ts` now require the demo pack to meet the catalog minima (150 concepts, 80 lessons, 250 problems, 50 simulations, 50 tutor sessions, 500 attempts, 100 activity records).

Malformed fixtures stay in `lib/mock/fixtures/empty.ts` only. Production runtime cannot enable mock data.
