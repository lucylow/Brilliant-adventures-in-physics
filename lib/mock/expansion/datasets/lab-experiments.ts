import { isoDaysAgo } from "../../clock";
import { createMockExperiment } from "../../factories/experiment";
import { createCsvTable } from "../generators/csv";
import { lensPair, ohmTable, pendulumTrials, projectileRow, rcCharge, snellRow, springHooke, waveRow } from "../physics";
import type { LabExperiment } from "../types";
import type { MockDifficulty } from "../../types";

type Spec = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: MockDifficulty;
  conceptId: string;
  objective: string;
  hypothesis: string;
  equipment: string[];
  setup: string;
  independent: string;
  dependent: string;
  controls: string[];
  procedure: string[];
  observations: string[];
  expectedPattern: string;
  analysis: string[];
  conclusion: string;
  equations: string[];
  simulation?: string;
  status?: LabExperiment["status"];
  columns: Array<{ header: string; unit: string }>;
  rows: number[][];
  variables: Record<string, number>;
};

function build(spec: Spec, index: number): LabExperiment {
  const id = `lab-${spec.slug}`;
  const createdAt = isoDaysAgo(2 + (index % 40), 9);
  const base = createMockExperiment({
    id,
    title: spec.title,
    category: spec.category,
    conceptId: spec.conceptId,
    status: spec.status ?? (index % 11 === 0 ? "draft" : index % 13 === 0 ? "failed" : "completed"),
    description: spec.objective,
    components: spec.equipment,
    variables: spec.variables,
    initialConditions: { t0: 0 },
    expectedObservation: spec.expectedPattern,
    points: spec.rows.slice(0, 3).map((row) => ({ time: row[0] ?? 0, distance: row[1] ?? 0 })),
    summary: spec.conclusion,
    createdAt,
    updatedAt: createdAt,
  });
  return {
    ...base,
    subtitle: spec.subtitle,
    difficulty: spec.difficulty,
    objective: spec.objective,
    hypothesis: spec.hypothesis,
    equipment: spec.equipment,
    setup: spec.setup,
    controlledVariables: spec.controls,
    independentVariable: spec.independent,
    dependentVariable: spec.dependent,
    procedure: spec.procedure,
    observations: spec.observations,
    data: createCsvTable(`csv-${spec.slug}`, spec.title, id, spec.columns, spec.rows),
    expectedPattern: spec.expectedPattern,
    analysisQuestions: spec.analysis,
    conclusion: spec.conclusion,
    relatedConcepts: [spec.conceptId],
    relatedEquations: spec.equations,
    relatedSimulation: spec.simulation,
  };
}

const PENDULUM = pendulumTrials(1, 5);
const SPRING = springHooke(80, [0.02, 0.04, 0.06, 0.08, 0.1]);
const OHM = ohmTable([2, 4, 6, 8, 12]);
const RC = rcCharge(12, 2000, 0.001, [0, 0.5, 1, 2, 4]);
const LENS = lensPair(0.2, [0.3, 0.4, 0.5, 0.8]);
const SNELL = [20, 30, 40, 50].map((angle) => snellRow(1, 1.5, angle));
const WAVE = [2, 4, 5, 8].map((f) => waveRow(f, 0.4));
const PROJ = [20, 30, 45, 60].map((angle) => projectileRow(18, angle));

const SPECS: Spec[] = [
  { slug: "incline-cart", title: "Ball on an Incline", subtitle: "Constant acceleration down a ramp", category: "mechanical", difficulty: "easy", conceptId: "kinematics", objective: "Test whether displacement grows with t² on a straight incline.", hypothesis: "If acceleration is constant, x should be quadratic in t.", equipment: ["ramp", "cart", "photogate"], setup: "A low-friction cart starts from rest on a fixed angle.", independent: "time", dependent: "displacement", controls: ["angle", "mass"], procedure: ["Mark the origin.", "Release from rest.", "Record x at equal times."], observations: ["Distance grew faster than linearly."], expectedPattern: "x ∝ t²", analysis: ["Is a constant?", "What would drag do to the graph?"], conclusion: "The x–t² plot was approximately linear; air resistance was neglected.", equations: ["x = ½at²"], simulation: "sim-kinematics-track", columns: [{ header: "t", unit: "s" }, { header: "x", unit: "m" }], rows: [[0, 0], [0.4, 0.32], [0.8, 1.28], [1.2, 2.88]], variables: { angleDeg: 18, massKg: 0.5 } },
  { slug: "measure-g", title: "Measuring g", subtitle: "Free-fall timing", category: "mechanical", difficulty: "medium", conceptId: "free-fall", objective: "Estimate g from drop times.", hypothesis: "t² should be proportional to 2h/g.", equipment: ["meter stick", "drop timer"], setup: "Masses dropped from known heights with air resistance neglected.", independent: "height", dependent: "time", controls: ["mass shape"], procedure: ["Measure h.", "Time five drops.", "Plot t² vs h."], observations: ["Times clustered tightly except the shortest drop."], expectedPattern: "t² ∝ h", analysis: ["How does reaction time bias g?", "Why is the shortest drop noisiest?"], conclusion: "The slope implied g ≈ 9.7 m/s²; reaction time dominates short drops.", equations: ["h = ½gt²"], columns: [{ header: "h", unit: "m" }, { header: "t", unit: "s" }], rows: [[0.4, 0.286], [0.8, 0.404], [1.2, 0.495], [1.6, 0.571]], variables: { g: 9.8 } },
  { slug: "spring-k", title: "Spring Constant", subtitle: "Hooke’s law check", category: "mechanical", difficulty: "easy", conceptId: "elasticity", objective: "Find k from F vs x.", hypothesis: "Force is linear in extension for small x.", equipment: ["spring", "masses", "ruler"], setup: "Hang known weights and measure extension from the unstretched length.", independent: "extension", dependent: "force", controls: ["spring identity"], procedure: ["Zero the ruler.", "Add mass.", "Record extension."], observations: ["The F–x graph was linear until the last mass."], expectedPattern: "F = kx", analysis: ["Where does Hooke’s law fail?", "Is the intercept zero?"], conclusion: `Slope gave k ≈ ${SPRING[SPRING.length - 1].k} N/m within the linear region.`, equations: ["F = −kx"], simulation: "sim-spring", columns: [{ header: "x", unit: "m" }, { header: "F", unit: "N" }], rows: SPRING.map((row) => [row.extension, row.force]), variables: { k: 80 } },
  { slug: "friction-wood", title: "Friction Investigation", subtitle: "Static vs kinetic on wood", category: "mechanical", difficulty: "medium", conceptId: "friction", objective: "Compare static and kinetic friction on a wooden block.", hypothesis: "The pull to start motion exceeds the pull to keep it moving.", equipment: ["block", "spring scale", "surface"], setup: "Horizontal surface; increase force until slip, then keep constant speed.", independent: "normal force", dependent: "friction", controls: ["surface"], procedure: ["Weigh the block.", "Add mass.", "Record breakaway and sliding forces."], observations: ["Breakaway force was larger than sliding force each trial."], expectedPattern: "f_s,max ≥ f_k", analysis: ["Why is static friction a range?", "Did f stay proportional to N?"], conclusion: "μ_s > μ_k; neither should be treated as a universal constant.", equations: ["f ≤ μN"], columns: [{ header: "N", unit: "N" }, { header: "fs", unit: "N" }, { header: "fk", unit: "N" }], rows: [[10, 4.1, 3.2], [15, 6.0, 4.8], [20, 8.2, 6.3]], variables: { muS: 0.41, muK: 0.32 } },
  { slug: "cart-collision", title: "Momentum Cart Collision", subtitle: "Inelastic bumper catch", category: "mechanical", difficulty: "medium", conceptId: "inelastic-collisions", objective: "Check momentum conservation in a sticking collision.", hypothesis: "Total p is conserved if the track impulse is negligible.", equipment: ["two carts", "track", "velocity sensors"], setup: "Cart A hits cart B at rest and they couple.", independent: "incoming speed", dependent: "outgoing speed", controls: ["masses"], procedure: ["Measure masses.", "Launch A.", "Record v before and after."], observations: ["Kinetic energy dropped; momentum nearly matched."], expectedPattern: "m1v1 = (m1+m2)v", analysis: ["Where did the missing K go?", "Was the track impulse small?"], conclusion: "Momentum agreed within 4%; K did not — an inelastic signature.", equations: ["p_i = p_f"], simulation: "sim-collision", columns: [{ header: "vA", unit: "m/s" }, { header: "vAfter", unit: "m/s" }], rows: [[0.8, 0.39], [1.2, 0.58], [1.6, 0.79]], variables: { m1: 0.5, m2: 0.5 } },
  { slug: "pendulum-period", title: "Pendulum Period", subtitle: "Small-angle timing", category: "mechanical", difficulty: "easy", conceptId: "pendulum", objective: "Test T = 2π√(L/g) for small amplitudes.", hypothesis: "Period depends on length, not mass.", equipment: ["string", "bob", "photogate"], setup: "Displace < 10° and time ten swings.", independent: "length", dependent: "period", controls: ["amplitude", "mass"], procedure: ["Measure L to the bob center.", "Time ten periods.", "Divide by ten."], observations: ["Mass changes did not shift T beyond uncertainty."], expectedPattern: "T ∝ √L", analysis: ["Why divide by ten?", "When does the small-angle model fail?"], conclusion: "Measured periods tracked the predicted values within 0.02 s.", equations: ["T = 2π√(L/g)"], simulation: "sim-pendulum", columns: [{ header: "trial", unit: "1" }, { header: "Tpred", unit: "s" }, { header: "Tmeas", unit: "s" }], rows: PENDULUM.map((row) => [row.trial, row.predictedS, row.measuredS]), variables: { lengthM: 1 } },
  { slug: "wave-speed-string", title: "Wave Speed", subtitle: "Pulse on a taut string", category: "waves", difficulty: "medium", conceptId: "wave-motion", objective: "Compare v = fλ with v = √(T/μ).", hypothesis: "Higher tension raises speed.", equipment: ["string", "pulley", "strobe"], setup: "Drive a standing wave and measure λ and f.", independent: "tension", dependent: "speed", controls: ["linear density"], procedure: ["Find a clear harmonic.", "Measure node spacing.", "Compute v = fλ."], observations: ["Speed rose with √T."], expectedPattern: "v = fλ = √(T/μ)", analysis: ["How many loops is n?", "Did you count nodes or antinodes?"], conclusion: "Both speed estimates agreed within 6%.", equations: ["v = fλ"], simulation: "sim-wave-interfere", columns: [{ header: "f", unit: "Hz" }, { header: "lambda", unit: "m" }, { header: "v", unit: "m/s" }], rows: WAVE.map((row) => [row.frequencyHz, row.wavelengthM, row.speed]), variables: { mu: 0.008 } },
  { slug: "resonance-tube", title: "Resonance", subtitle: "Closed tube first harmonic", category: "waves", difficulty: "medium", conceptId: "sound", objective: "Find λ/4 for a closed pipe.", hypothesis: "The shortest resonant length is about λ/4 plus an end correction.", equipment: ["tube", "tuning fork", "water reservoir"], setup: "Raise water until the loudest resonance.", independent: "frequency", dependent: "length", controls: ["tube diameter"], procedure: ["Sound the fork.", "Adjust length.", "Record L."], observations: ["A clear amplitude peak appeared near L = v/4f."], expectedPattern: "L ≈ λ/4", analysis: ["Why is there an end correction?", "What is the next resonance?"], conclusion: "First resonance matched λ/4 after a 0.3 d end correction.", equations: ["L = λ/4"], columns: [{ header: "f", unit: "Hz" }, { header: "L", unit: "m" }], rows: [[256, 0.33], [320, 0.26], [384, 0.22], [512, 0.16]], variables: { v: 340 } },
  { slug: "ohms-law", title: "Ohm's Law", subtitle: "Linear V–I for a resistor", category: "circuits", difficulty: "easy", conceptId: "ohms-law", objective: "Test whether I = V/R for a carbon resistor.", hypothesis: "The V–I graph is a straight line through the origin.", equipment: ["power supply", "resistor", "ammeter"], setup: "Fixed R; vary V and record I.", independent: "voltage", dependent: "current", controls: ["temperature"], procedure: ["Set V.", "Read I.", "Compute R = V/I."], observations: ["Current tracked V/R to two digits."], expectedPattern: "I ∝ V", analysis: ["Would a lamp stay linear?", "Where is power on this graph?"], conclusion: "The resistor was ohmic over 2–12 V.", equations: ["V = IR"], simulation: "sim-circuit", columns: [{ header: "V", unit: "V" }, { header: "R", unit: "ohm" }, { header: "I", unit: "A" }, { header: "P", unit: "W" }], rows: OHM.map((row) => [row.voltage, row.resistance, row.current, row.power]), variables: { voltage: 12 } },
  { slug: "rc-charging", title: "RC Charging", subtitle: "Exponential approach to V", category: "circuits", difficulty: "hard", conceptId: "capacitance", objective: "Measure the time constant τ = RC.", hypothesis: "Voltage approaches the supply exponentially.", equipment: ["resistor", "capacitor", "voltmeter"], setup: "Charge from 0 V through R = 2 kΩ, C = 1 mF.", independent: "time", dependent: "capacitor voltage", controls: ["R", "C"], procedure: ["Discharge.", "Close the switch.", "Log V(t)."], observations: ["V(τ) was near 63% of 12 V."], expectedPattern: "V = V₀(1 − e^(−t/RC))", analysis: ["What is 63% of 12 V?", "How would doubling C change τ?"], conclusion: "τ ≈ 2.0 s matched RC.", equations: ["τ = RC"], columns: [{ header: "t", unit: "s" }, { header: "V", unit: "V" }], rows: RC.map((row) => [row.t, row.v]), variables: { R: 2000, C: 0.001 } },
  { slug: "lens-focal", title: "Lens Focal Length", subtitle: "Thin-lens conjugate pairs", category: "optics", difficulty: "medium", conceptId: "thin-lenses", objective: "Find f from object and image distances.", hypothesis: "1/f = 1/do + 1/di for a thin lens in air.", equipment: ["convex lens", "screen", "optical bench"], setup: "Move the object until a sharp real image forms.", independent: "object distance", dependent: "image distance", controls: ["lens"], procedure: ["Measure do.", "Focus the screen.", "Record di."], observations: ["Images inverted; |m| fell as do increased."], expectedPattern: "1/f constant", analysis: ["Is the image real?", "What happens if do < f?"], conclusion: "Mean f was 0.20 m across four conjugates.", equations: ["1/f = 1/do + 1/di"], simulation: "sim-optics", columns: [{ header: "do", unit: "m" }, { header: "di", unit: "m" }, { header: "f", unit: "m" }, { header: "m", unit: "1" }], rows: LENS.map((row) => [row.do, row.di, row.f, row.m]), variables: { f: 0.2 } },
  { slug: "thermal-eq", title: "Thermal Equilibrium", subtitle: "Hot metal into water", category: "thermal", difficulty: "medium", conceptId: "heat", objective: "Estimate specific heat of a metal sample.", hypothesis: "Energy lost by the metal equals energy gained by water (no losses).", equipment: ["calorimeter", "thermometer", "balance"], setup: "Drop heated metal into known water mass.", independent: "metal mass", dependent: "final temperature", controls: ["water mass"], procedure: ["Heat the metal.", "Transfer quickly.", "Record T_f."], observations: ["Water rose several degrees; metal cooled a lot."], expectedPattern: "m_m c_m ΔT_m = − m_w c_w ΔT_w", analysis: ["What leaks energy?", "Why stir?"], conclusion: "c_metal ≈ 390 J/(kg·K), consistent with a copper-like sample under the no-loss assumption.", equations: ["Q = mcΔT"], columns: [{ header: "mm", unit: "kg" }, { header: "Tf", unit: "C" }], rows: [[0.12, 28.4], [0.18, 31.1], [0.24, 33.6]], variables: { cw: 4180 } },
  { slug: "gas-pressure", title: "Gas Pressure", subtitle: "Boyle check at room T", category: "thermal", difficulty: "medium", conceptId: "ideal-gas-law", objective: "Test PV ≈ constant for trapped air.", hypothesis: "At fixed T and n, P ∝ 1/V.", equipment: ["syringe", "pressure sensor"], setup: "Slow compressions so temperature stays near ambient.", independent: "volume", dependent: "pressure", controls: ["temperature"], procedure: ["Set V.", "Wait.", "Read P."], observations: ["PV stayed within 5% except the fastest compression."], expectedPattern: "PV constant", analysis: ["Why wait after moving the plunger?", "Is air ideal here?"], conclusion: "The isotherm was a reasonable 1/V curve.", equations: ["PV = nRT"], columns: [{ header: "V", unit: "m3" }, { header: "P", unit: "kPa" }], rows: [[0.00002, 101], [0.000015, 134], [0.00001, 198]], variables: { T: 295 } },
  { slug: "photoelectric-bench", title: "Photoelectric Effect", subtitle: "Stopping voltage vs frequency", category: "modern", difficulty: "hard", conceptId: "photoelectric-effect", objective: "Show that K_max depends on frequency, not intensity.", hypothesis: "A threshold frequency exists; intensity changes rate, not K_max.", equipment: ["photocell", "filters", "stopping-voltage supply"], setup: "Illuminate a metal and find the stopping voltage.", independent: "frequency", dependent: "stopping voltage", controls: ["metal"], procedure: ["Choose a filter.", "Increase stopping V until current vanishes.", "Repeat at another intensity."], observations: ["Brighter light increased current but not stopping voltage."], expectedPattern: "K_max = hf − φ", analysis: ["What is the intercept?", "Why doesn’t intensity set K_max?"], conclusion: "The slope matched h/e within the educational apparatus uncertainty.", equations: ["K_max = hf − φ"], simulation: "sim-photoelectric", columns: [{ header: "f", unit: "1e14 Hz" }, { header: "Vs", unit: "V" }], rows: [[5.5, 0.2], [6.5, 0.6], [7.5, 1.0], [8.5, 1.4]], variables: { phiEv: 2.0 } },
  { slug: "snell-tank", title: "Refraction Tank", subtitle: "Air to water angles", category: "optics", difficulty: "easy", conceptId: "snells-law", objective: "Verify n1 sinθ1 = n2 sinθ2.", hypothesis: "The ray bends toward the normal entering water.", equipment: ["ray box", "semicircle tank"], setup: "Measure incident and refracted angles from the normal.", independent: "incident angle", dependent: "refracted angle", controls: ["n"], procedure: ["Align the normal.", "Record θ1 and θ2.", "Compute n2."], observations: ["θ2 was smaller than θ1 for every trial."], expectedPattern: "sinθ1 / sinθ2 ≈ 1.33", analysis: ["Did you measure from the normal?", "Where does TIR start?"], conclusion: "Mean n_water ≈ 1.33 from four angles.", equations: ["n1 sinθ1 = n2 sinθ2"], columns: [{ header: "theta1", unit: "deg" }, { header: "theta2", unit: "deg" }], rows: SNELL.filter((row) => row.refractedDeg !== null).map((row) => [row.incidentDeg, row.refractedDeg as number]), variables: { n1: 1, n2: 1.5 } },
];

const MORE: Array<[string, string, string, string, MockDifficulty, string, string]> = [
  ["atwood-timing", "Atwood Machine", "mechanical", "atwood", "medium", "acceleration", "Two unequal hanging masses."],
  ["rolling-cylinder", "Rolling Without Slip", "mechanical", "rolling", "hard", "energy partition", "A cylinder rolls from rest down a rail."],
  ["center-of-mass-plank", "Center of Mass Balance", "mechanical", "torque", "medium", "support position", "A plank balances on a fulcrum."],
  ["impulse-crash", "Bumper Impulse", "mechanical", "impulse", "medium", "contact time", "A cart hits a spring bumper."],
  ["drag-coffee-filter", "Coffee-Filter Drag", "mechanical", "free-fall", "hard", "terminal speed", "Filters reach a nearly constant speed."],
  ["relative-walkway", "Relative Velocity Walkway", "mechanical", "velocity", "easy", "ground speed", "Walkers on a moving belt."],
  ["circular-string", "Rubber-Stopper Circle", "mechanical", "centripetal-acceleration", "medium", "period vs radius", "A stopper whirled on a string."],
  ["statics-boom", "Hinged Boom", "mechanical", "torque", "hard", "hinge force", "A strut holds a hanging sign."],
  ["precession-demo", "Gyro Precession Demo", "mechanical", "angular-momentum", "challenge", "precession rate", "Educational qualitative demo only."],
  ["beats-forks", "Tuning-Fork Beats", "waves", "sound", "medium", "beat frequency", "Two close forks."],
  ["doppler-buggy", "Doppler Buggy", "waves", "doppler-effect", "hard", "observed frequency", "A source moves past a mic."],
  ["standing-string", "Standing Wave Map", "waves", "interference", "medium", "harmonic number", "Nodes on a driven string."],
  ["ripple-interference", "Ripple Tank Interference", "waves", "interference", "medium", "path difference", "Two point sources."],
  ["polarization-film", "Polarizer Pair", "optics", "optics", "medium", "transmitted intensity", "Malus’s law educational check."],
  ["tir-prism", "TIR in a Prism", "optics", "total-internal-reflection", "medium", "critical angle", "Ray inside glass to air."],
  ["diffraction-slit", "Single-Slit Pattern", "optics", "diffraction", "hard", "fringe location", "Laser on a slit."],
  ["double-slit", "Young’s Double Slit", "optics", "youngs-double-slit", "hard", "fringe spacing", "Laser, two slits, screen."],
  ["concave-mirror", "Spherical Mirror", "optics", "reflection", "medium", "image distance", "Concave mirror conjugates."],
  ["dispersion-prism", "Prism Dispersion", "optics", "optics", "easy", "deviation vs color", "Qualitative spectrum."],
  ["kirchhoff-junction", "Junction Current Split", "circuits", "circuits", "medium", "branch currents", "Two parallel resistors."],
  ["series-resistors", "Series Drop Map", "circuits", "circuits", "easy", "voltage drops", "Three resistors in series."],
  ["parallel-resistors", "Parallel Equivalent", "circuits", "circuits", "easy", "total current", "Two branches."],
  ["combination-bridge", "Simple Combination", "circuits", "circuits", "hard", "equivalent R", "Series-parallel mix."],
  ["inductor-rl", "RL Growth", "circuits", "magnetism", "hard", "current vs time", "Educational RL rise."],
  ["ac-rc-phase", "AC Phase Shift", "circuits", "circuits", "challenge", "phase", "Qualitative oscilloscope demo."],
  ["diode-knee", "Diode Threshold Concept", "circuits", "circuits", "medium", "forward voltage", "Conceptual fixture, not a design guide."],
  ["solenoid-field", "Solenoid Compass", "magnetism", "magnetism", "medium", "field direction", "Compass around a coil."],
  ["wire-field", "Straight-Wire Field", "magnetism", "magnetism", "medium", "B vs r", "Compass deflection vs distance."],
  ["motor-torque", "Simple Motor Torque", "magnetism", "magnetism", "hard", "stall vs current", "Educational toy motor."],
  ["induction-loop", "Moving-Bar Emf", "magnetism", "faradays-law", "hard", "induced emf", "Bar on rails in B."],
  ["calorimetry-ice", "Ice Latent Heat", "thermal", "phase-changes", "medium", "melted mass", "Ice into warm water."],
  ["expansion-rod", "Metal Rod Expansion", "thermal", "thermal-expansion", "easy", "ΔL vs ΔT", "Heated aluminum rod."],
  ["kinetic-theory-p", "P vs T at Fixed V", "thermal", "gas-laws", "medium", "slope", "Trapped air, slow heating."],
  ["cooling-newton", "Cooling Curve", "thermal", "heat", "medium", "exponential decay", "Hot water in still air."],
  ["time-dilation-muon", "Muon Lifetime Demo", "modern", "special-relativity", "challenge", "γ", "Educational numbers, v < c."],
  ["debroglie-electron", "Electron Wavelength", "modern", "de-broglie-wavelength", "hard", "λ = h/p", "Calculated, not imaged."],
  ["balmer-tube", "Hydrogen Spectrum", "modern", "hydrogen-spectrum", "hard", "wavelength", "Discharge tube, known lines."],
  ["half-life-dice", "Dice Decay Analog", "modern", "radioactive-decay", "easy", "remaining fraction", "Classroom analog only."],
  ["orbit-period", "Orbital Period Model", "space", "orbits", "hard", "T vs r", "Educational Kepler check."],
  ["escape-speed-lab", "Escape Speed Estimate", "space", "escape-velocity", "hard", "v_esc", "Uses published GM, not a launch."],
  ["redshift-demo", "Galaxy Redshift Demo", "space", "hubble-expansion", "medium", "z", "Educational spectrum shift."],
  ["hubble-fit", "Hubble Fit Classroom", "space", "hubble-expansion", "hard", "slope", "Demo distances, labeled MOCK."],
  ["projectile-range-table", "Projectile Range Table", "mechanical", "projectile-motion", "easy", "range vs angle", "Same speed, several angles."],
  ["energy-loop", "Energy on a Loop", "mechanical", "energy", "hard", "speed at top", "Hot-wheels loop, g assumed constant."],
  ["power-stairs", "Stair-Climbing Power", "mechanical", "work", "easy", "P = mgh/t", "Body-weight educational."],
  ["buoyancy-block", "Apparent Weight in Water", "mechanical", "buoyancy", "medium", "buoyant force", "Spring scale in a beaker."],
  ["pressure-depth", "Hydrostatic Pressure", "mechanical", "pressure", "easy", "P vs depth", "Sensor in a column."],
  ["venturi-speed", "Flow Speed Estimate", "mechanical", "fluid-flow", "hard", "Bernoulli educational", "Assumes inviscid flow."],
  ["shm-mass-spring", "Mass-Spring Period", "mechanical", "simple-harmonic-motion", "medium", "T vs √m", "Horizontal air track."],
  ["torque-wrench", "Bolt Torque", "mechanical", "torque", "easy", "τ = rF", "Educational wrench, no shop procedure."],
  ["angular-accel-disk", "Disk Angular Acceleration", "mechanical", "rotation", "medium", "α from θ(t)", "Rotary sensor."],
  ["inelastic-clay", "Clay Wad Collision", "mechanical", "inelastic-collisions", "medium", "shared speed", "Ballistic pendulum analog."],
  ["elastic-magnets", "Magnetic Bumper Elastic", "mechanical", "elastic-collisions", "hard", "velocity exchange", "Equal-mass carts."],
  ["cm-two-body", "Two-Body CM Track", "mechanical", "momentum", "medium", "CM velocity", "Isolated track pair."],
  ["inclined-friction", "Incline Friction Angle", "mechanical", "friction", "medium", "tanθ ≈ μ", "Raise until slip."],
  ["connected-table", "Table-and-Hanging Mass", "mechanical", "newtons-laws", "medium", "acceleration", "Atwood variant."],
  ["work-variable-force", "Spring Work Area", "mechanical", "work", "medium", "area under F–x", "Graphical work."],
  ["potential-curve", "Energy Landscape", "mechanical", "potential-energy", "hard", "stable points", "Qualitative well."],
  ["echo-distance", "Clap Echo Distance", "waves", "sound", "easy", "d = vt/2", "Hallway timing."],
  ["guitar-harmonic", "Guitar Harmonic", "waves", "sound", "easy", "f vs length", "Lightly touching a node."],
  ["speaker-beats", "Speaker Beats", "waves", "sound", "medium", "Δf", "Two oscillators."],
  ["capacitor-energy", "Capacitor Energy", "circuits", "capacitance-energy", "medium", "U = ½CV²", "Calculated from V and C."],
  ["kirchhoff-loop", "Single-Loop Emf", "circuits", "circuits", "medium", "ΣV = 0", "Battery plus two R."],
  ["equipotential-paper", "Conductive Paper Map", "electricity", "electric-potential", "medium", "equipotentials", "Two electrodes on paper."],
  ["field-mapping", "Electric Field Arrows", "electricity", "electric-field", "hard", "E direction", "From potential gradient."],
];

const CONCEPT_ALIAS: Record<string, string> = {
  magnetism: "magnetic-field",
  electromagnetism: "electromagnetic-induction",
  circuits: "ohms-law",
};

function moreToSpec(entry: (typeof MORE)[number], index: number): Spec {
  const [slug, title, category, rawConcept, difficulty, dependent, setup] = entry;
  const conceptId = CONCEPT_ALIAS[rawConcept] ?? rawConcept;
  const rows = Array.from({ length: 4 }, (_, row) => [row, roundRow(index, row)]);
  return {
    slug,
    title,
    subtitle: setup,
    category,
    difficulty,
    conceptId,
    objective: `Collect a short ${dependent} series for ${title.toLowerCase()}.`,
    hypothesis: `The measured ${dependent} should follow the standard introductory model for ${conceptId.replace(/-/g, " ")}.`,
    equipment: ["timer", "meter stick", "notebook"],
    setup,
    independent: "trial index",
    dependent,
    controls: ["room temperature"],
    procedure: ["Assemble the apparatus.", "Change one control.", "Record four trials."],
    observations: [`${dependent} changed smoothly across trials.`],
    expectedPattern: "A monotonic or periodic pattern consistent with the named model.",
    analysis: ["Which quantity was independent?", "What was the largest source of uncertainty?"],
    conclusion: `${title} produced a coherent educational dataset. It is a mock lab export, not a live instrument log.`,
    equations: ["see related concept"],
    columns: [{ header: "trial", unit: "1" }, { header: "value", unit: "1" }],
    rows,
    variables: { index: index + 1 },
  };
}

function roundRow(index: number, row: number): number {
  return Math.round((1 + index * 0.07 + row * 0.31) * 100) / 100;
}

let cached: LabExperiment[] | null = null;

export function createLabExperimentCatalog(): LabExperiment[] {
  if (cached) return cached;
  const extras = MORE.map((entry, index) => moreToSpec(entry, index));
  cached = [...SPECS, ...extras].map((spec, index) => build(spec, index));
  return cached;
}
