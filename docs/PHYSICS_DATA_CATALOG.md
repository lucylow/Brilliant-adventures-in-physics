# Physics Data Catalog (Expansion II)

Educational fixtures only. Values are internally coherent; they are not instrument logs or survey catalogs.

## Mechanics

Calculated problem families in `lib/mock/expansion/datasets/mechanics-pack.ts`:

- 1D kinematics (`v = v₀ + at`, `x = v₀t + ½at²`)
- Free fall (`t = √(2h/g)`, air neglected)
- Projectile range (engine `projectile()`, drag neglected)
- Kinetic friction, incline components, Atwood acceleration
- Kinetic / gravitational / elastic energy, work, power
- Momentum, impulse, 1D inelastic catch, equal-mass elastic exchange
- Centripetal acceleration, torque, rolling kinetic energy, `L = Iω`

## Lab experiments

`createLabExperimentCatalog()` — 15 fully specified labs plus 60 additional educational benches (75+). Each record includes objective, hypothesis, equipment, variables, procedure, CSV `data`, analysis questions, and related concept/equation/simulation ids.

Headline labs: incline cart, measuring *g*, Hooke, friction, cart collision, pendulum, wave speed, resonance tube, Ohm, RC charging, lens conjugates, calorimetry, Boyle check, photoelectric bench, Snell tank.

## Circuits and fields

- Series, parallel, combination, RC loops with `V = IR` derived currents
- Faults: open, short, wrong resistor, reversed polarity, missing part, meter error, overload, wrong connection
- Bounded dipole field grid (5×5) for mobile
- Wire / loop / solenoid / Lorentz educational samples
- 50+ free-body diagrams with net-force from vector sums

## Waves, sound, thermal, modern, space

- Transverse / longitudinal / standing wave records (`v = fλ`)
- Tuning, echo, Doppler sound sketches
- Specific heat, latent heat, ideal-gas energy sketches
- `γ(β)` for `β < 1` only; hydrogen Balmer-style transitions from the Rydberg educational model
- Standard solar-system bodies plus clearly labeled `EDUCATIONAL_FIXTURE` exoplanet / black-hole demos
- Intro cosmology: example redshift, order-of-magnitude `H₀`, CMB temperature

## Literacy

Formula index, SI units, conversions via `convert()`, constants (`c`, `G`, `h`, `e`, `k_B`, `N_A`, `ε₀`, `μ₀`, `g`), scale comparisons, 100 graph-reading items, 100 table items, lab-design prompts, classroom safety reminders (no dangerous procedures).

## Calendar and journeys

- 90 daily challenges, 12 weekly campaigns, 6 seasonal mock campaigns
- 365 questions of the day (day-of-year selection)
- 300 science facts, 300+ flashcards, 100+ micro-lessons
- 15 learner journeys, 10/20/40/60 mock exams
- 40+ space missions with deterministic branch table
