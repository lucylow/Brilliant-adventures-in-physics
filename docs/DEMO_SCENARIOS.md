# Demo Scenarios

All learners and classroom rows are **fictional**. Social-proof metrics are labeled `DEMO_AGGREGATE_NOT_PRODUCTION`.

## Gen-1 (unchanged)

`fresh-user`, `beginner`, `active-learner`, `advanced-learner`, `power-user`, `exam-prep`, `explorer`, `offline-user`, `returning-user`, `empty-state`, `error-state`

Default demo: `active-learner` / Maya.

## Expansion II scenarios

| Id | Learner | Pack | Use |
| --- | --- | --- | --- |
| `showcase` | Jordan Blake | rich | Screenshots, Figma, investor walkthrough |
| `mechanics-lab` | Noah Okonkwo | explorer | Labs, FBDs, mechanics problems |
| `space-week` | Priya Nair | advanced | Missions, spectra, educational astro |
| `exam-sprint` | Taylor Kim | exam-prep | Timed papers and review queue |

Switch from the development inspector (`app/dev/mock-data.tsx`) or:

```
EXPO_PUBLIC_USE_MOCK_DATA=true
EXPO_PUBLIC_MOCK_SCENARIO=showcase
```

## Home-feed variety

`selectHomeScenarioPack(dataset)` derives different hero / challenge / mission / simulation / review fields from mastery, the daily calendar, and recommendations. Ten distinct gen-1 learners plus the four Expansion II scenarios already produce different Home surfaces.

## Practice modes (derived)

Selectors + review queue cover remedial (weak mastery), balanced (demo), challenge (power user), exam (exam-sprint), streak (high streak learners), and quick-session (daily challenge).

## Lab focus

Use `mechanics-lab`, `explorer` (simulation-heavy), `space-week`, or Maya’s mixed demo. Electronics-focused: Casey / Jordan favorite topics include circuits.

## Tutor prompts

Extra sessions cover first question, misconception (“current is used up”), units, hints-only, harder derivation, and visual interference. `selectTutorSuggestions` mixes session prompts with “why does this happen?” cards.

## Showcase seed

`seedShowcase()` / scenario `showcase` is the dense walkthrough: populated Home, Tutor history, large practice bank, Adventure missions (including space quests), Lab experiments, Progress mastery, Notebook discovery notes, Achievements, Activity (up to 180 feed items), and Recommendations.
