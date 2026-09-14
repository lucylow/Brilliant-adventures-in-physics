# Demo AI demo scenarios (expansion III)

Use these from the mock-data panel or in tests. All of them are **Demo AI** recordings: same seed, same learner, same journey.

## Showcase selector

`SHOWCASES` in `lib/mock/ai/expansion/orchestration.ts`:

| Id | Title | What to record |
| --- | --- | --- |
| `tutor` | Tutor Demo | Question → explanation → follow-up |
| `scan` | Scan Demo | Image fixture → parse → clarification if needed |
| `experiment` | Experiment Demo | Setup → measure → analyze → report assist |
| `exam` | Exam Demo | Debrief → 20-minute plan → review |
| `simulation` | Simulation Demo | Copilot “what should I change?” + what-if |
| `personalization` | Personalization Demo | Same prompt, different learner factories |
| `recovery` | Recovery Demo | Returning learner, short recap, no guilt |
| `streaming` | Streaming Demo | Existing Expansion I stream scenarios |
| `verification` | Verification Demo | Deterministic projectile / Ohm check |
| `multimodal` | Multimodal Demo | FBD / circuit / ray / graph sessions |

`setAIDemoShowcase(id)` / `exportShowcaseConfig()` / `importShowcaseConfig()` are serializable. `resetAIScenarios()` returns to Tutor + `active`.

## Test users

`setAITestUserState`: `fresh` → beginner, `struggling`/`error` → struggling, `mastery` → high-performer, `exam` → exam, `returning`/`offline` → returning, otherwise intermediate.

## End-to-end flows

`getEndToEndFlows()` includes at least 30 journeys, among them:

- Tutor → practice → feedback → mastery
- Scan → parse → verify → solve
- Experiment → measure → analyze → report
- Simulation → ask why → modify parameter → predict → observe
- Exam → debrief → study plan → review

`generateTutorJourney` / `generateStudyJourney` / `generateExamJourney` / `generateSimulationJourney` / `generateExperimentJourney` / `generateRecoveryJourney` attach the same persona (name, level, style, strengths, weaknesses) to every step. `validateJourneyConsistency` fails if that drifts.

## Timeline

`getDemoTimeline()` is a fixed 09:00–09:40 script (lesson, practice, mistake, Tutor, simulation, review) so a recording can be repeated.

## Deep links

`/tutor`, `/lesson`, `/lab`, `/practice` — reasons are stored next to the path. They do not invent routes the app does not have.

## Provider switcher

Without restarting, `setMockAIConfig({ aiMode })` still selects Expansion I modes: Basic, Rich, Streaming, Failure, Offline, Slow. Expansion III showcases layer **on top** of that mode.
