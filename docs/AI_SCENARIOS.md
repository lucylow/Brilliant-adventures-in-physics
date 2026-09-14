# AI demo scenarios

All 25 scenarios are reproducible by id (`AI_DEMO_SCENARIOS` in `lib/mock/ai/ai-scenarios.ts`).

Set `EXPO_PUBLIC_MOCK_AI_SCENARIO` or `setMockAIScenario(id)`.

1. `first-tutor-question` — first structured Tutor turn
2. `follow-up-question` — “Why?” uses previous concept
3. `misconception-correction` — diagnostic + counterexample
4. `multi-step-problem` — projectile with verified range
5. `unit-error` — right digits, wrong unit
6. `hint-ladder` — subtle → final-check, no leaked answer at subtle
7. `simulation-recommendation` — maps question → sim + parameters
8. `physics-lens-scan` — mock textbook OCR
9. `low-ocr-confidence` — 0/O confusion, asks for confirmation
10. `ai-verification-mismatch` — 99 J vs verified 9 J
11. `offline-tutor` — `mock-offline`
12. `ai-timeout` — failureMode timeout
13. `rate-limit` — limited phase
14. `streaming-response` — `mock-streaming`
15. `cancelled-stream` — abort mid-stream
16. `learning-plan` — 7-day catch-up
17. `exam-analysis` — strengths / gaps
18. `weak-topic-recommendation` — ranked from mistakes
19. `strong-topic-challenge` — kinematics challenge
20. `notebook-summarization` — labeled assistance
21. `flashcard-generation` — lesson → cards
22. `graph-interpretation` — slope / intercept
23. `experiment-analysis` — model vs measurement
24. `concept-comparison` — velocity vs acceleration
25. `explain-simpler` — middle-school transform

## Showcase

`createShowcaseRequest()` / `projectileShowcaseTurns()` walk projectile motion from clarification through verified calculation, unit check, simulation, practice, hint, mistake, review, and notebook summary.

## Demo users

`allDemoUsers()` seeds persona-specific histories: beginner, intermediate/advanced, exam-prep, visual, simulation-first.
