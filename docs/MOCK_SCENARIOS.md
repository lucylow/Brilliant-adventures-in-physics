# Mock scenarios

Each scenario selects a seed pack and a default learner. The same seed always rebuilds the same catalog.

| Id | Learner | Pack | What it demonstrates |
| --- | --- | --- | --- |
| `fresh-user` | Cameron Walsh | minimal | First-run Home, almost no history |
| `beginner` | Alex Rivera | minimal | Early kinematics, short streak |
| `active-learner` | Maya Chen | demo | **Default.** Populated Home, Practice, Progress, Lab, Tutor, Notebook |
| `advanced-learner` | Noah Okonkwo | advanced | Engineering student, rotation and circuits |
| `power-user` | Jordan Blake | rich | Dense history, many earned achievements, mock plus entitlements |
| `exam-prep` | Taylor Kim | exam-prep | Timed practice, review queue |
| `explorer` | Morgan Ellis | explorer | Simulation-heavy Lab and saved experiments |
| `offline-user` | Sam Ortega | offline | Cached content plus pending tutor/save retries |
| `returning-user` | Sam Ortega | demo | Broken streak, leftover mastery |
| `empty-state` | Cameron Walsh | minimal | Catalog exists; learner has no attempts, notes, or missions |
| `error-state` | Maya Chen | errors | Failure-oriented offline/tutor recovery |

Set from env: `EXPO_PUBLIC_MOCK_SCENARIO=exam-prep`  
or at runtime: `setMockScenario("explorer")`.

## Screen coverage

| Screen | Primary datasets |
| --- | --- |
| Home | users, learningState, recommendations, activity, missions, simulations |
| Practice | problems, attempts, reviewQueue, mastery |
| Progress | mastery, dailyActivity, achievements, missions, learningState |
| Lab | simulations, experiments, snapshots |
| Tutor | tutorSessions (messages marked `MOCK_TUTOR` / `AI_EXPLANATION` / `VERIFIED_CALCULATION`) |
| Notebook | notebook |
| Concepts | concepts, topics |
| Lesson | lessons, equations |
| Settings | users, subscription (fictional, no sensitive PII) |
| Scan / Lens | scanResults, lensRecords (`MOCK_RECOGNITION`) |
| Adventure | missions with steps pointing at lessons / problems / simulations |

## Screen test matrix

Every important surface should be renderable from:

- **normal** — `active-learner`
- **empty** — `empty-state` / `fresh-user`
- **loading** — latency `realistic` or `slow`
- **error** — `error-state` plus injected `tutor.get` / `save-experiment`
- **offline** — `offline-user` or network `offline`
- **rich data** — `power-user`

The mock panel (`/dev/mock-data`) switches scenario, learner, latency, network, and injected failures without a rebuild.
