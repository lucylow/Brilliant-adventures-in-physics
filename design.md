# PhysicaAI Mobile Interface Design

## Product direction

PhysicaAI is a portrait-first, one-handed physics tutor and pocket laboratory. The interface should feel like a focused scientific instrument: bright neutral surfaces, strong hierarchy, readable equations, restrained blue accents, and clear verification states. The first release prioritizes a complete learning loop over feature breadth.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Home | Personalized greeting, daily recommendation, recent activity, mastery snapshot, and quick actions for Tutor, Scan Problem, Physics Lens, and Simulations. |
| Tutor | Chat conversation, question composer, hint ladder, explain-simpler action, similar-problem action, verified calculation cards, and saved conversation state. |
| Scan Problem | Capture/library entry, manual text fallback, recognition review, editable variables and units, confidence warnings, and solve handoff. |
| Physics Lens | Safe experiment setup, manual measurements, simulation/manual-input alternative, data table, graph, calculation summary, and AI interpretation entry point. |
| Lab | Simulation catalog with kinematics, projectile motion, Newton’s laws, circuits, waves, and springs. |
| Simulation detail | Interactive viewport, play/pause/step/reset controls, variable sliders, equation display, live measurements, and deterministic result indicators. |
| Practice | Topic filters, adaptive question card, answer entry, hint ladder, immediate verification, solution reveal, and next-question action. |
| Progress | Topic mastery, recent attempts, streak/history, misconception signals, and recommended next topics. |
| Profile and Settings | Learning level, tutor style, curriculum, local data controls, privacy/reset controls, and demo-mode status. |

## Key user flows

1. **Tutor loop:** Home → Ask PhysicaAI → enter a question → receive a structured explanation → request a hint or simpler explanation → open a related simulation or practice question → mastery updates.
2. **Problem-solving loop:** Home → Scan Problem → choose typed/manual route or image placeholder route → review extracted variables → edit uncertain values → solve with deterministic engine → save result → generate similar practice.
3. **Simulation loop:** Home or Lab → select simulation → adjust variables → play, pause, step, or reset → inspect live values and equations → send the result to Tutor or save the experiment.
4. **Practice loop:** Practice → select topic → answer question → deterministic validation → receive supportive feedback → use hint ladder if needed → continue or review solution → update progress.
5. **Persistence loop:** Any completed attempt or saved problem → local state store → Home and Progress derive their summaries from stored records after app restart.

## Color choices

The brand uses `#F7F8FA` for the app background, `#FFFFFF` for surfaces, `#111827` for primary text, `#667085` for secondary text, `#2563EB` for primary actions and verified science accents, `#DBEAFE` for soft information surfaces, `#15803D` for correct or verified states, `#B45309` for review-needed states, `#B91C1C` for errors, and `#0F172A` for simulation viewports.

## Interaction and accessibility rules

All primary actions use native Pressable feedback and accessible labels. Inputs remain usable with the keyboard open, long content scrolls within safe areas, and every loading, error, empty, and success state offers a clear next action. Numerical results always show units and distinguish deterministic engine verification from explanatory AI content.
