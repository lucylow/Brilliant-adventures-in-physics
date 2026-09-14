# AI mock data

This layer populates Tutor, scan, practice feedback, recommendations, notebook assistance, and simulation suggestions during development, screenshots, QA, and offline demos.

It is **Demo AI**. It does not call a live model provider and must not be labeled as one.

## What it covers

- Tutor conversations, follow-ups, personas, and response styles
- Explanations, analogies, misconceptions, Socratic stages, hint ladders
- Structured solutions with deterministic physics verification
- Practice generation, feedback, unit checks, and mistake diagnosis
- Scan/OCR fixtures, graph and table interpretation
- Learning plans, daily coach, flashcards, quizzes, exam analysis
- Recommendations ranked from mastery and mistakes (not popularity)
- Streaming, cancellation, retries, offline, rate limits, malformed payloads

## Switching REAL ↔ MOCK

Presentation screens should keep using existing services/hooks.

- Mock AI off: `createAppTutorService()` uses the existing `createDeterministicTutorService()`.
- Mock AI on (development only): it uses `MockAIProvider` behind the same `Service<TutorRequest, TutorAnswer>` contract.

Flags:

- `EXPO_PUBLIC_USE_MOCK_DATA` — parent mock-data switch (already production-blocked)
- `EXPO_PUBLIC_USE_MOCK_AI` — optional explicit AI switch
- `EXPO_PUBLIC_MOCK_AI_MODE` — `mock-off | mock-basic | mock-rich | mock-streaming | mock-offline | mock-error | mock-slow | mock-deterministic`
- `EXPO_PUBLIC_MOCK_AI_SCENARIO` — scenario id
- `EXPO_PUBLIC_MOCK_AI_FAILURE` — failure injection

Production builds never enable mock AI (`NODE_ENV=production`).

## Runtime helpers

```ts
isMockAIEnabled()
getMockAIConfig()
setMockAIScenario("first-tutor-question")
getMockAIProvider()
setAIFailureMode("timeout")
```

## Data packs

See `docs/AI_DATA_CATALOG.md` for counts. Datasets are generated lazily from `lib/mock/ai/ai-catalog.ts` so screens do not rebuild thousands of conversations on render.
