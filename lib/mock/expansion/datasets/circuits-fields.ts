import { ohmsLaw, PHYSICS, weightForce } from "@/lib/physics";
import { roundPhysics } from "../../utils/physics-values";
import { createUncertainty } from "../generators/vectors";
import { createVectorSet } from "../generators/vectors";
import type { CircuitDefinition, CircuitFault, FieldGrid, FieldSample, ForceVector, FreeBodyDiagram, MagnetismRecord, ScientificFigure } from "../types";

function resistor(id: string, ohms: number): CircuitDefinition["components"][number] {
  return { id, kind: "resistor", label: id.toUpperCase(), value: ohms, unit: "Ω" };
}

export function createCircuitCatalog(): CircuitDefinition[] {
  const series = ohmsLaw(12, 6);
  const parallelReq = 1 / (1 / 4 + 1 / 12);
  const parallel = ohmsLaw(12, parallelReq);
  const rc = { current: roundPhysics(12 / 2000, 5), power: roundPhysics(12 * 12 / 2000, 4) };
  return [
    {
      id: "circuit-series-3",
      title: "Three resistors in series",
      topology: "series",
      components: [resistor("r1", 2), resistor("r2", 4), resistor("r3", 6), { id: "bat", kind: "source", label: "ε", value: 12, unit: "V" }],
      sourceVoltage: 12,
      equivalentResistance: 12,
      current: ohmsLaw(12, 12).current,
      power: ohmsLaw(12, 12).power,
      measurements: [{ quantity: "I", value: ohmsLaw(12, 12).current, unit: "A" }, { quantity: "V2", value: 4, unit: "V" }],
      conceptId: "series-parallel",
    },
    {
      id: "circuit-parallel-2",
      title: "Two resistors in parallel",
      topology: "parallel",
      components: [resistor("r1", 4), resistor("r2", 12), { id: "bat", kind: "source", label: "ε", value: 12, unit: "V" }],
      sourceVoltage: 12,
      equivalentResistance: roundPhysics(parallelReq, 3),
      current: roundPhysics(parallel.current, 3),
      power: roundPhysics(parallel.power, 3),
      measurements: [{ quantity: "I1", value: 3, unit: "A" }, { quantity: "I2", value: 1, unit: "A" }],
      conceptId: "series-parallel",
    },
    {
      id: "circuit-rc-charge",
      title: "RC charging loop",
      topology: "rc",
      components: [resistor("r", 2000), { id: "c", kind: "capacitor", label: "C", value: 0.001, unit: "F" }, { id: "bat", kind: "source", label: "ε", value: 12, unit: "V" }],
      sourceVoltage: 12,
      equivalentResistance: 2000,
      current: rc.current,
      power: rc.power,
      measurements: [{ quantity: "tau", value: 2, unit: "s" }],
      conceptId: "rc-circuits",
    },
    {
      id: "circuit-single-ohm",
      title: "Ohmic test loop",
      topology: "series",
      components: [resistor("r", 4), { id: "bat", kind: "source", label: "ε", value: 12, unit: "V" }, { id: "a", kind: "ammeter", label: "A", value: series.current, unit: "A" }],
      sourceVoltage: 12,
      equivalentResistance: 4,
      current: series.current,
      power: series.power,
      measurements: [{ quantity: "I", value: series.current, unit: "A" }],
      conceptId: "ohms-law",
    },
    {
      id: "circuit-combo",
      title: "Series–parallel mix",
      topology: "combination",
      components: [resistor("r1", 3), resistor("r2", 6), resistor("r3", 6), { id: "bat", kind: "source", label: "ε", value: 9, unit: "V" }],
      sourceVoltage: 9,
      equivalentResistance: 6,
      current: 1.5,
      power: 13.5,
      measurements: [{ quantity: "Req", value: 6, unit: "Ω" }],
      conceptId: "series-parallel",
    },
  ];
}

export function createCircuitFaults(): CircuitFault[] {
  return [
    { id: "fault-open", circuitId: "circuit-series-3", kind: "open", symptoms: ["Ammeter reads 0 A", "All resistor voltages 0 V"], observations: ["Supply still reads 12 V at the terminals"], diagnosticHints: ["An open anywhere in a series loop stops current."], expectedFix: "Restore the broken connection at R2.", relatedConcept: "circuits" },
    { id: "fault-short", circuitId: "circuit-parallel-2", kind: "short", symptoms: ["Supply current spikes", "One branch voltage collapses"], observations: ["R2 feels warm in the demo narrative only"], diagnosticHints: ["A short bypasses the intended load."], expectedFix: "Remove the jumper across R2.", relatedConcept: "series-parallel" },
    { id: "fault-wrong-r", circuitId: "circuit-single-ohm", kind: "wrong-resistor", symptoms: ["I = 1.0 A instead of 3.0 A"], observations: ["Color bands read 12 Ω, not 4 Ω"], diagnosticHints: ["Compute R = V/I from the meter."], expectedFix: "Replace with the 4 Ω resistor.", relatedConcept: "ohms-law" },
    { id: "fault-reversed", circuitId: "circuit-rc-charge", kind: "reversed-polarity", symptoms: ["Electrolytic capacitor marked reverse"], observations: ["Voltage magnitude grows with the wrong sign on the logger"], diagnosticHints: ["Polarized capacitors have a marked negative lead."], expectedFix: "Flip the capacitor orientation.", relatedConcept: "capacitance" },
    { id: "fault-missing", circuitId: "circuit-combo", kind: "missing", symptoms: ["One node is floating"], observations: ["R3 is in the kit, not on the board"], diagnosticHints: ["Compare the schematic to the breadboard."], expectedFix: "Insert R3.", relatedConcept: "series-parallel" },
    { id: "fault-meter", circuitId: "circuit-single-ohm", kind: "measurement-error", symptoms: ["Ammeter in parallel with R"], observations: ["Supply current is huge; resistor voltage near 0"], diagnosticHints: ["Ammeters belong in series."], expectedFix: "Move the ammeter into the loop.", relatedConcept: "current" },
    { id: "fault-overload", circuitId: "circuit-parallel-2", kind: "overload", symptoms: ["Fuse symbol trips in the sim"], observations: ["Total current 6 A on a 3 A fuse"], diagnosticHints: ["Parallel branches add current."], expectedFix: "Increase equivalent R or fuse rating in the model.", relatedConcept: "electric-power" },
    { id: "fault-wrong-wire", circuitId: "circuit-series-3", kind: "wrong-connection", symptoms: ["R3 is in a side branch"], observations: ["Voltages do not add to 12 V"], diagnosticHints: ["Series means one path."], expectedFix: "Place R3 back in the single loop.", relatedConcept: "kirchhoffs-laws" },
  ];
}

export function createFieldGrid(): FieldGrid {
  const charges = [{ x: -0.04, y: 0, q: 1e-9 }, { x: 0.04, y: 0, q: -1e-9 }];
  const samples: FieldSample[] = [];
  for (let ix = 0; ix < 5; ix += 1) {
    for (let iy = 0; iy < 5; iy += 1) {
      const x = -0.08 + ix * 0.04;
      const y = -0.08 + iy * 0.04;
      let ex = 0;
      let ey = 0;
      let potential = 0;
      for (const charge of charges) {
        const dx = x - charge.x;
        const dy = y - charge.y;
        const r2 = dx * dx + dy * dy + 1e-6;
        const r = Math.sqrt(r2);
        const mag = (PHYSICS.k * charge.q) / r2;
        ex += mag * (dx / r);
        ey += mag * (dy / r);
        potential += (PHYSICS.k * charge.q) / r;
      }
      samples.push({ x, y, ex: roundPhysics(ex, 1), ey: roundPhysics(ey, 1), potential: roundPhysics(potential, 1) });
    }
  }
  return {
    id: "field-dipole",
    title: "Educational electric dipole samples",
    conceptId: "electric-field",
    charges,
    samples,
    assumption: "Two point charges in vacuum; grid is coarse for mobile performance.",
  };
}

export function createMagnetismRecords(): MagnetismRecord[] {
  return [
    { id: "mag-wire", title: "B around a long wire", setup: "straight-wire", currentA: 5, distanceM: 0.02, fieldT: roundPhysics(2e-7 * 5 / 0.02, 8), angleDeg: 90, direction: "circles the wire by right-hand rule", conceptId: "magnetic-field" },
    { id: "mag-loop", title: "Loop center field", setup: "loop", currentA: 2, distanceM: 0.05, fieldT: roundPhysics((4 * Math.PI * 1e-7 * 2) / (2 * 0.05), 8), angleDeg: 90, direction: "along the axis", conceptId: "magnetic-field" },
    { id: "mag-solenoid", title: "Long solenoid interior", setup: "solenoid", currentA: 1.2, distanceM: 0.01, fieldT: roundPhysics(4 * Math.PI * 1e-7 * 800 * 1.2, 6), angleDeg: 0, direction: "along the solenoid axis", conceptId: "ampere-law" },
    { id: "mag-charge", title: "Moving charge in B", setup: "moving-charge", currentA: 0, distanceM: 0, fieldT: 0.05, forceN: roundPhysics(1.6e-19 * 2e6 * 0.05, 22), velocityMps: 2e6, chargeC: 1.6e-19, angleDeg: 90, direction: "perpendicular to v and B", conceptId: "lorentz-force" },
  ];
}

const FBD_SEEDS: Array<{ id: string; title: string; situation: string; conceptId: string; forces: ForceVector[]; assumption: string }> = [
  { id: "fbd-table", title: "Block on a table", situation: "At rest on a horizontal surface", conceptId: "normal-force", forces: [{ name: "gravity", magnitude: 20, angleDeg: 270, unit: "N" }, { name: "normal", magnitude: 20, angleDeg: 90, unit: "N" }], assumption: "No horizontal forces." },
  { id: "fbd-incline", title: "Block on an incline", situation: "At rest on a rough 30° ramp", conceptId: "inclined-plane", forces: [{ name: "gravity", magnitude: 20, angleDeg: 270, unit: "N" }, { name: "normal", magnitude: roundPhysics(20 * Math.cos(Math.PI / 6)), angleDeg: 120, unit: "N" }, { name: "friction", magnitude: roundPhysics(20 * Math.sin(Math.PI / 6)), angleDeg: 30, unit: "N" }], assumption: "Static friction prevents slip." },
  { id: "fbd-pulley", title: "Hanging mass", situation: "Atwood lighter mass", conceptId: "atwood", forces: [{ name: "gravity", magnitude: 10, angleDeg: 270, unit: "N" }, { name: "tension", magnitude: 12, angleDeg: 90, unit: "N" }], assumption: "Ideal string." },
  { id: "fbd-pendulum", title: "Pendulum bob", situation: "At the end of a swing", conceptId: "pendulum", forces: [{ name: "gravity", magnitude: 5, angleDeg: 270, unit: "N" }, { name: "tension", magnitude: 4.6, angleDeg: 70, unit: "N" }], assumption: "Massless string." },
  { id: "fbd-brake", title: "Car braking", situation: "Level road, slowing", conceptId: "friction", forces: [{ name: "gravity", magnitude: 12000, angleDeg: 270, unit: "N" }, { name: "normal", magnitude: 12000, angleDeg: 90, unit: "N" }, { name: "friction", magnitude: 3600, angleDeg: 180, unit: "N" }], assumption: "Single particle model of the car." },
  { id: "fbd-projectile", title: "Projectile in flight", situation: "After leaving the launcher", conceptId: "projectile-motion", forces: [{ name: "gravity", magnitude: 2, angleDeg: 270, unit: "N" }], assumption: "Air resistance neglected." },
  { id: "fbd-elevator", title: "Elevator cab", situation: "Accelerating upward", conceptId: "normal-force", forces: [{ name: "gravity", magnitude: 800, angleDeg: 270, unit: "N" }, { name: "normal", magnitude: 880, angleDeg: 90, unit: "N" }], assumption: "Rigid floor." },
  { id: "fbd-rocket", title: "Rocket in air", situation: "Vertical burn, educational", conceptId: "newtons-laws", forces: [{ name: "gravity", magnitude: 5000, angleDeg: 270, unit: "N" }, { name: "thrust", magnitude: 12000, angleDeg: 90, unit: "N" }, { name: "drag", magnitude: 800, angleDeg: 270, unit: "N" }], assumption: "Thrust treated as a single force." },
  { id: "fbd-satellite", title: "Satellite in circular orbit", situation: "Low Earth educational model", conceptId: "orbits", forces: [{ name: "gravity", magnitude: 8000, angleDeg: 270, unit: "N" }], assumption: "Gravity is the centripetal force; no extra ‘centrifugal’ arrow." },
  { id: "fbd-roll", title: "Rolling cylinder", situation: "Down a rough rail without slip", conceptId: "rolling", forces: [{ name: "gravity", magnitude: 30, angleDeg: 270, unit: "N" }, { name: "normal", magnitude: 26, angleDeg: 110, unit: "N" }, { name: "friction", magnitude: 4, angleDeg: 200, unit: "N" }], assumption: "Static friction, not kinetic." },
];

const FBD_MORE = ["hovercraft", "skydiver-terminal", "skydiver-open", "boat-drag", "train-curve", "bike-brake", "ladder-wall", "sign-boom", "spring-hang", "spring-horizontal", "cart-fan", "cart-pull", "person-scale", "person-jump", "box-push-static", "box-push-kinetic", "ice-puck", "banked-curve", "unbanked-curve", "tetherball", "yo-yo", "spool-pull", "wheel-axle", "crane-hook", "hot-air-balloon", "submarine", "fish-swim", "drone-hover", "glider", "parachute", "tow-truck", "trailer-hitch", "ski-slope", "ice-skater", "swimmer-push", "climber-hold", "bookshelf", "door-hinge", "wrench-nut", "seesaw"];

export function createFreeBodyCatalog(): FreeBodyDiagram[] {
  const core = FBD_SEEDS.map((seed) => {
    const net = seed.forces.reduce((sum, force) => {
      const rad = (force.angleDeg * Math.PI) / 180;
      return { x: sum.x + force.magnitude * Math.cos(rad), y: sum.y + force.magnitude * Math.sin(rad) };
    }, { x: 0, y: 0 });
    const netForceN = roundPhysics(Math.hypot(net.x, net.y));
    return { ...seed, netForceN, equilibrium: netForceN < 0.5 };
  });
  const extras = FBD_MORE.map((slug, index) => {
    const weight = weightForce(2 + (index % 8));
    const forces: ForceVector[] = [
      { name: "gravity", magnitude: roundPhysics(weight), angleDeg: 270, unit: "N" },
      { name: "normal", magnitude: roundPhysics(weight * (0.7 + (index % 5) * 0.05)), angleDeg: 90, unit: "N" },
    ];
    if (index % 2 === 0) forces.push({ name: "friction", magnitude: roundPhysics(3 + index * 0.2), angleDeg: 180, unit: "N" });
    if (index % 3 === 0) forces.push({ name: "drag", magnitude: roundPhysics(1 + index * 0.1), angleDeg: 200, unit: "N" });
    const net = forces.reduce((sum, force) => {
      const rad = (force.angleDeg * Math.PI) / 180;
      return { x: sum.x + force.magnitude * Math.cos(rad), y: sum.y + force.magnitude * Math.sin(rad) };
    }, { x: 0, y: 0 });
    return {
      id: `fbd-${slug}`,
      title: slug.replace(/-/g, " "),
      situation: `Educational free-body for ${slug.replace(/-/g, " ")}.`,
      conceptId: index % 2 ? "forces" : "free-body-diagrams",
      forces,
      netForceN: roundPhysics(Math.hypot(net.x, net.y)),
      equilibrium: false,
      assumption: "Single-particle educational diagram.",
    };
  });
  return [...core, ...extras];
}

export function createFigures(): ScientificFigure[] {
  return [
    { id: "fig-fbd", title: "Generic free-body", description: "Forces drawn on one object only.", kind: "free-body", elements: ["object", "force arrows"], labels: ["Fg", "N"], conceptIds: ["free-body-diagrams"] },
    { id: "fig-ray", title: "Thin-lens ray sketch", description: "Parallel, central, and focal rays.", kind: "ray", elements: ["lens", "object", "image"], labels: ["F", "2F"], conceptIds: ["thin-lenses"] },
    { id: "fig-circuit", title: "Series loop", description: "Battery and two resistors.", kind: "circuit", elements: ["battery", "R1", "R2"], labels: ["ε", "I"], conceptIds: ["circuits"] },
    { id: "fig-force", title: "Force vectors on a crate", description: "Push, friction, weight, normal.", kind: "force-vectors", elements: ["crate"], labels: ["F", "f"], conceptIds: ["forces"] },
    { id: "fig-velocity", title: "Projectile components", description: "vx constant, vy changing.", kind: "velocity-vectors", elements: ["arc"], labels: ["vx", "vy"], conceptIds: ["projectile-motion"] },
    { id: "fig-e", title: "Point-charge field", description: "Radial arrows, density as magnitude.", kind: "electric-field", elements: ["+q"], labels: ["E"], conceptIds: ["electric-field"] },
    { id: "fig-b", title: "Wire field circles", description: "Concentric circles around I.", kind: "magnetic-field", elements: ["wire"], labels: ["I", "B"], conceptIds: ["magnetic-field"] },
    { id: "fig-orbit", title: "Circular orbit", description: "v tangent, a inward.", kind: "orbit", elements: ["planet", "satellite"], labels: ["v", "a_c"], conceptIds: ["orbits"] },
    { id: "fig-levels", title: "Hydrogen levels", description: "n = 1, 2, 3 with a photon arrow.", kind: "energy-level", elements: ["levels"], labels: ["n=1", "n=2"], conceptIds: ["bohr-model"] },
    { id: "fig-wave", title: "Transverse snapshot", description: "Amplitude and wavelength marked.", kind: "wave", elements: ["sine"], labels: ["A", "λ"], conceptIds: ["wave-motion"] },
  ];
}

export function createVectorLibrary() {
  return [
    createVectorSet("vec-2force", "Two pulls on a ring", "vectors", "two-vector", [{ magnitude: 5, angleDeg: 0, label: "F1" }, { magnitude: 5, angleDeg: 90, label: "F2" }]),
    createVectorSet("vec-3force", "Three-force knot", "vectors", "three-vector", [{ magnitude: 8, angleDeg: 0, label: "A" }, { magnitude: 6, angleDeg: 120, label: "B" }, { magnitude: 4, angleDeg: 240, label: "C" }]),
    createVectorSet("vec-eq", "Equilibrium check", "equilibrium", "equilibrium", [{ magnitude: 10, angleDeg: 0, label: "T1" }, { magnitude: 10, angleDeg: 180, label: "T2" }]),
    createVectorSet("vec-rel", "Riverboat relative velocity", "relative-velocity", "relative-velocity", [{ magnitude: 4, angleDeg: 90, label: "v_boat" }, { magnitude: 2, angleDeg: 0, label: "v_current" }], "m/s"),
    createVectorSet("vec-proj", "Launch components", "projectile-motion", "projectile-components", [{ magnitude: 18, angleDeg: 40, label: "v" }], "m/s"),
  ];
}

export function createUncertaintySet() {
  return [
    createUncertainty("u-period", "pendulum period", 2.007, "s", 0.01, "random", "Stopwatch human timing."),
    createUncertainty("u-volt", "ohmic voltage", 12, "V", 0.1, "resolution", "0.1 V meter division."),
    createUncertainty("u-mass", "cart mass", 0.5, "kg", 0.002, "absolute", "Balance tolerance."),
    createUncertainty("u-temp", "calorimeter", 28.4, "C", 0.2, "systematic", "Stem correction neglected."),
    createUncertainty("u-amp", "branch current", 3, "A", 2, "percent", "Clamp meter 2% of reading."),
  ];
}
