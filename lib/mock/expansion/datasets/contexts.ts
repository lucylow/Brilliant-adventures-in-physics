import type { ContextExample, ExplanationBlock } from "../types";

export function createContextExamples(): ContextExample[] {
  return [
    { id: "ctx-car-brake", domain: "cars", title: "ABS braking distance", situation: "A car slows from highway speed on dry pavement.", conceptId: "friction", governingIdea: "Friction supplies the average stopping force; kinetic energy becomes thermal." },
    { id: "ctx-car-curve", domain: "cars", title: "Unbanked curve", situation: "A car turns at constant speed.", conceptId: "centripetal-acceleration", governingIdea: "Static friction toward the center supplies m v²/r." },
    { id: "ctx-bike-gear", domain: "bikes", title: "Gear ratio", situation: "A cyclist shifts to a smaller front chainring.", conceptId: "torque", governingIdea: "Torque and angular speed trade through the chain." },
    { id: "ctx-bike-coast", domain: "bikes", title: "Coasting downhill", situation: "Pedaling stops on a slope.", conceptId: "energy", governingIdea: "Gravitational energy becomes kinetic minus drag work." },
    { id: "ctx-baseball", domain: "sports", title: "Fly ball", situation: "A hit leaves the bat at a known speed and angle.", conceptId: "projectile-motion", governingIdea: "Range without drag is an upper bound." },
    { id: "ctx-basketball", domain: "sports", title: "Free throw arc", situation: "The ball must pass through a hoop at a fixed height.", conceptId: "projectile-motion", governingIdea: "Two launch angles can share a landing point." },
    { id: "ctx-soccer", domain: "sports", title: "Curving kick", situation: "Spin produces a side force in air.", conceptId: "fluids", governingIdea: "Magnus effect is a fluid-force sketch, not a new law of motion." },
    { id: "ctx-hockey", domain: "sports", title: "Puck on ice", situation: "A pass slides nearly uniformly.", conceptId: "friction", governingIdea: "Small μ_k means a long coasting distance." },
    { id: "ctx-tennis", domain: "sports", title: "Racket impulse", situation: "Contact lasts a few milliseconds.", conceptId: "impulse", governingIdea: "J = Δp; a longer contact lowers peak force." },
    { id: "ctx-golf", domain: "sports", title: "Dimpled ball", situation: "A drive travels farther than a smooth sphere would.", conceptId: "fluids", governingIdea: "Drag depends on the flow regime around the ball." },
    { id: "ctx-ski", domain: "sports", title: "Packed-snow slope", situation: "A skier starts from rest.", conceptId: "inclined-plane", governingIdea: "mg sinθ down the slope, friction opposing slip." },
    { id: "ctx-cycle-sprint", domain: "sports", title: "Track sprint", situation: "A rider accelerates out of the saddle.", conceptId: "power", governingIdea: "P = Fv at the contact patch in a simplified model." },
    { id: "ctx-orbit", domain: "space", title: "Why the ISS does not fall down", situation: "Continuous free fall around Earth.", conceptId: "orbits", governingIdea: "Sideways speed matches the curvature." },
    { id: "ctx-reentry", domain: "space", title: "Heat shield energy", situation: "Kinetic energy dumps into the atmosphere.", conceptId: "energy", governingIdea: "Work by drag is the energy ledger, not a temperature slogan." },
    { id: "ctx-guitar", domain: "music", title: "Fret position", situation: "Shortening a string raises pitch.", conceptId: "standing-waves", governingIdea: "f = nv/(2L) for a string fixed at both ends." },
    { id: "ctx-pipe", domain: "music", title: "Closed pipe", situation: "A clarinet-like air column.", conceptId: "sound", governingIdea: "Odd harmonics of λ/4 in the simple model." },
    { id: "ctx-beats", domain: "music", title: "Out-of-tune unison", situation: "Two nearby frequencies.", conceptId: "sound", governingIdea: "Beat frequency is |f1 − f2|." },
    { id: "ctx-phone", domain: "phones", title: "Speaker resonance", situation: "A notification tone peaks at one frequency.", conceptId: "simple-harmonic-motion", governingIdea: "A driven oscillator has a resonance peak." },
    { id: "ctx-camera", domain: "cameras", title: "Lens focus", situation: "Object distance changes.", conceptId: "thin-lenses", governingIdea: "1/f = 1/do + 1/di." },
    { id: "ctx-bridge", domain: "bridges", title: "Span load", situation: "A deck carries a truck.", conceptId: "torque", governingIdea: "Static equilibrium: ΣF = 0 and Στ = 0." },
    { id: "ctx-coaster", domain: "roller-coasters", title: "Loop-the-loop", situation: "Speed at the top of a vertical loop.", conceptId: "energy", governingIdea: "Energy plus a_c = v²/r at the top." },
    { id: "ctx-weather", domain: "weather", title: "Why wind has force", situation: "Air momentum changes at a wall.", conceptId: "momentum", governingIdea: "Force is the rate of momentum delivery." },
    { id: "ctx-mri", domain: "medical", title: "MRI as magnetism (conceptual)", situation: "Spins in a strong B field.", conceptId: "magnetic-field", governingIdea: "Educational pointer only; not a clinical protocol." },
    { id: "ctx-xray", domain: "medical", title: "Photon energy", situation: "A high-frequency photon.", conceptId: "photons", governingIdea: "E = hf; this is not an imaging how-to." },
    { id: "ctx-solar", domain: "energy", title: "Panel area", situation: "Incident solar power.", conceptId: "intensity", governingIdea: "P = IA for a simple perpendicular panel." },
    { id: "ctx-wind", domain: "energy", title: "Turbine kinetic flux", situation: "Air of density ρ through area A.", conceptId: "kinetic-energy", governingIdea: "Power scales as ½ρAv³ in the introductory model." },
    { id: "ctx-battery", domain: "electronics", title: "Phone cell energy", situation: "Rated in mAh at a nominal voltage.", conceptId: "electric-power", governingIdea: "E ≈ QV with Q from ampere-hours." },
    { id: "ctx-motor", domain: "electronics", title: "DC motor stall", situation: "Current rises when ω → 0.", conceptId: "ohms-law", governingIdea: "Back emf drops; I ≈ V/R at stall in a toy model." },
    { id: "ctx-robot-arm", domain: "robotics", title: "Arm joint torque", situation: "A payload at a known lever arm.", conceptId: "torque", governingIdea: "τ = rF⊥ at the joint." },
    { id: "ctx-robot-wheel", domain: "robotics", title: "Wheel slip", situation: "Commanded acceleration exceeds μN/m.", conceptId: "friction", governingIdea: "Static friction caps the launch a." },
  ];
}

export function createExplanationLibrary(): ExplanationBlock[] {
  const kinds: ExplanationBlock["kind"][] = ["definition", "intuition", "equation", "worked-example", "common-mistake", "visual-analogy", "checkpoint", "summary"];
  const concepts = ["kinematics", "forces", "energy", "momentum", "ohms-law", "wave-motion", "snells-law", "orbits", "photoelectric-effect", "pendulum"];
  const bodies: Record<ExplanationBlock["kind"], (name: string) => string> = {
    definition: (name) => `${name} is defined by a relation among measurable quantities.`,
    intuition: (name) => `Ask what would change ${name} if one control were doubled.`,
    equation: (name) => `Write the introductory equation for ${name} with SI units beside each symbol.`,
    "worked-example": (name) => `Substitute one numerical set into the ${name} relation and box the unit.`,
    "common-mistake": (name) => `A frequent mix-up is treating ${name} as a nearby everyday word rather than the defined quantity.`,
    "visual-analogy": (name) => `Sketch the system boundary first, then the arrows that belong to ${name}.`,
    checkpoint: (name) => `Can you name the unknown, the unit, and one assumption for ${name}?`,
    summary: (name) => `${name} is used when those assumptions hold; write them beside the answer.`,
  };
  return concepts.flatMap((conceptId) =>
    kinds.map((kind) => ({
      id: `explain-${conceptId}-${kind}`,
      kind,
      conceptId,
      title: `${kind} · ${conceptId.replace(/-/g, " ")}`,
      body: bodies[kind](conceptId.replace(/-/g, " ")),
    })),
  );
}

export function createSportsMusicEngineeringNotes(): ContextExample[] {
  return [
    { id: "ctx-hockey-impulse", domain: "sports", title: "Boards collision", situation: "A puck changes direction quickly.", conceptId: "impulse", governingIdea: "Large Δp in small Δt means a large average force." },
    { id: "ctx-string-harmonic", domain: "music", title: "Second harmonic", situation: "A light touch at the midpoint.", conceptId: "standing-waves", governingIdea: "A node at L/2 selects n = 2." },
    { id: "ctx-bridge-wind", domain: "bridges", title: "Wind load sketch", situation: "A steady wind on a deck.", conceptId: "fluids", governingIdea: "Drag is an external force in ΣF = 0." },
    { id: "ctx-gear-train", domain: "electronics", title: "Reduction gearbox", situation: "Motor shaft to wheel.", conceptId: "torque", governingIdea: "Ideal gears trade ω for τ." },
    { id: "ctx-greenhouse", domain: "weather", title: "IR absorption concept", situation: "Atmosphere and outgoing radiation.", conceptId: "heat", governingIdea: "Educational energy-budget sketch, not a climate forecast." },
    { id: "ctx-efficiency", domain: "energy", title: "Heater vs heat pump slogan", situation: "Electrical energy into a room.", conceptId: "heat", governingIdea: "A resistive heater’s energy ledger is IVΔt." },
  ];
}
