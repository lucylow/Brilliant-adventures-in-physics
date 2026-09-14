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
