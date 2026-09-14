# AI data catalog

Counts are produced by `getAIDatasetCounts()` (lazy generation). Re-run tests after catalog edits.

Primary generator input: `lib/mock/ai/ai-catalog.ts` (one scientifically distinct topic record per major idea, all `conceptId`s from `conceptRegistry`).

## Packs

| Pack | Module | Notes |
| --- | --- | --- |
| Curriculum catalog | `ai-catalog.ts` | Unique explanations, experiments, verified calcs |
| Conversations | `datasets/conversations.ts` | Personas × topics, including Socratic |
| Explanations / hints / analogies / misconceptions / starters / follow-ups / comparisons | `datasets/libraries.ts` | Style and level variants |
| Solutions / feedback / templates / diagnoses / unit checks | `datasets/practice.ts` | Difficulty profiles |
| Scans / OCR / graphs / tables / sim recs | `datasets/scans-graphs.ts` | Confidence bands |
| Plans / coach / flashcards / quizzes / recs / summaries | `datasets/study.ts` | Ranked recommendations |
| Lab / notebook / motivation / favorites / export | `datasets/assist.ts` | Assistance labeled |
| Intents / parse / cache / sessions / prompts | `datasets/intents-edge.ts` | Negative fixtures |

## Configuration and failure

See `docs/AI_MOCK_DATA.md`. Inspector: Settings → Mock data panel (`app/dev/mock-data.tsx`), development only.

## Performance

Repositories and getters memoize. Screens import `ai-screen-adapters.ts`, not fixture arrays. Conversation generation runs once per process.
