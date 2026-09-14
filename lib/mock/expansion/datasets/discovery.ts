import type { DiscoveryCard, MisconceptionRecord, WhyQuestion } from "../types";
import type { MockDifficulty } from "../../types";

const CARD_SEEDS: Array<[string, string, string, string, string, string, MockDifficulty]> = [
  ["float-iss", "Why astronauts float", "They are in continuous free fall with the station.", "Orbit is falling around Earth, not escaping gravity.", "Separates ‘no gravity’ folklore from centripetal free fall.", "orbits", "easy"],
  ["sky-blue", "Why the sky is blue", "Air molecules scatter shorter wavelengths more.", "Rayleigh scattering, not a blue solid sky.", "Connects waves to everyday color.", "wave-motion", "easy"],
  ["gps-relativity", "How GPS needs relativity", "Satellite clocks run at a different rate than ground clocks.", "Special and gravitational time shifts are both in the model.", "Shows why γ is not only a thought experiment.", "time-dilation", "hard"],
  ["rainbow", "Why rainbows separate colors", "Water drops refract and internally reflect sunlight.", "Dispersion plus geometry, not a painted arc.", "Links Snell’s law to weather.", "snells-law", "medium"],
  ["satellite-fall", "Why satellites do not fall straight down", "They have enough sideways speed to miss Earth.", "v = √(GM/r) for a circular model.", "Same physics as a projectile that never hits.", "orbits", "medium"],
  ["seatbelt", "Why you lurch forward", "Your body tends to keep its velocity when the car slows.", "Inertia, not a mysterious ‘force of motion’.", "Newton 1 in a car.", "inertia", "easy"],
  ["ice-friction", "Why ice can be slippery", "A thin water layer and low shear strength reduce friction.", "Not ‘zero friction’.", "Friction still exists; it is smaller.", "friction", "medium"],
  ["guitar-pitch", "Why a shorter string sounds higher", "Shorter L raises f for the same harmonic.", "f = nv/2L for a string fixed at both ends.", "Music as standing waves.", "standing-waves", "easy"],
  ["moon-orbit", "Why the Moon stays in orbit", "Gravity supplies the inward acceleration.", "No extra outward centrifugal force on the inertial-frame diagram.", "Same idea as the ISS.", "gravitation", "medium"],
  ["lens-magnify", "Why a lens can magnify", "It rearranges vergence so the image angle is larger.", "m = −di/do for a thin lens.", "Cameras and eyes share this model.", "thin-lenses", "medium"],
  ["ohm-current", "Why current falls when R rises", "For a fixed V, I = V/R.", "Charge is not used up; the rate changes.", "Circuit energy vs current.", "ohms-law", "easy"],
  ["photoelectric-color", "Why color can beat brightness", "Photon energy is hf, not intensity.", "A dim violet lamp can eject electrons a bright red lamp cannot.", "Quantum intro without mysticism.", "photoelectric-effect", "hard"],
  ["boiling-altitude", "Why water boils cooler up a mountain", "Lower air pressure lowers the boiling temperature.", "Boiling is vapor pressure matching surroundings.", "Thermal + atmosphere.", "phase-changes", "medium"],
  ["echo", "Why an echo returns later", "Sound travels at a finite speed and covers 2d.", "d = vt/2 with v ≈ 340 m/s in air.", "Waves carry timing information.", "sound", "easy"],
  ["compass-wire", "Why a compass twitch near a wire", "A current produces a magnetic field.", "Right-hand rule for direction.", "Oersted’s observation as a lab.", "magnetic-field", "medium"],
  ["induction-flash", "Why a magnet flash-lights an LED coil", "Changing flux induces emf.", "Faraday, not a stored charge in the magnet.", "Energy comes from the motion.", "faradays-law", "hard"],
  ["blackbody-stars", "Why hot stars look blue", "Wien’s law shifts the peak to shorter λ.", "Color is a spectrum, not a paint.", "Astrophysics meets thermal radiation.", "blackbody", "hard"],
  ["redshift", "Why distant galaxies look redder", "Cosmic expansion stretches wavelength.", "Educational Hubble relation, not a new discovery claim.", "Cosmology intro.", "hubble-expansion", "hard"],
  ["buoyancy-ship", "Why a steel ship floats", "It displaces a water weight equal to its own.", "Average density, not ‘steel is lighter than water’.", "Archimedes.", "buoyancy", "easy"],
  ["pressure-ears", "Why ears pop in an elevator", "External pressure changes with height.", "ΔP ≈ ρgh for a small height change.", "Fluids in daily life.", "pressure", "easy"],
];

export function createDiscoveryCards(): DiscoveryCard[] {
  const core = CARD_SEEDS.map(([id, title, hook, fact, why, concept, difficulty]) => ({
    id: `discover-${id}`,
    title,
    hook,
    fact,
    whyItMatters: why,
    relatedConcepts: [concept],
    relatedSimulation: concept === "orbits" ? "sim-orbit" : concept === "ohms-law" ? "sim-circuit" : concept === "photoelectric-effect" ? "sim-photoelectric" : undefined,
    difficulty,
    estimatedReadTime: difficulty === "easy" ? 2 : difficulty === "hard" ? 4 : 3,
  }));
  const extras: DiscoveryCard[] = [
    "vectors", "acceleration", "work", "momentum", "impulse", "torque", "energy", "circuits", "interference", "entropy",
    "charge", "electric-potential", "capacitance", "inductance", "diffraction", "polarization", "ideal-gas-law", "special-relativity", "de-broglie-wavelength", "hydrogen-spectrum",
    "radioactive-decay", "nuclear-binding", "kepler", "escape-velocity", "simple-harmonic-motion", "beats", "doppler-effect", "thin-lenses", "critical-angle", "rc-circuits",
    "lorentz-force", "lenz-law", "transformers", "photons", "wave-particle-duality", "uncertainty-principle", "mass-energy", "time-dilation", "length-contraction", "stellar-spectra",
    "cosmic-microwave", "fluids", "drag", "rolling", "center-of-mass", "mechanical-energy", "hookes-law", "atwood", "free-body-diagrams", "projectile-range",
    "air-resistance-projectiles", "power", "specific-heat", "thermal-expansion", "first-law-thermo", "series-parallel", "kirchhoffs-laws", "electric-power", "gauss-law", "ampere-law",
    "youngs-double-slit", "standing-waves", "resonance", "weight", "inertia", "equilibrium", "angular-momentum", "moment-of-inertia", "gravitational-field", "hubble-expansion",
    "semiconductors", "diffusion", "membrane-potential", "quarks", "leptons", "band-theory", "compton", "work-function", "threshold-frequency", "simple-circuits-energy",
  ].map((concept, index) => ({
    id: `discover-extra-${concept}`,
    title: `A closer look at ${concept.replace(/-/g, " ")}`,
    hook: `The everyday story of ${concept.replace(/-/g, " ")} hides a conservation or field rule.`,
    fact: `Introductory physics treats ${concept.replace(/-/g, " ")} with a named equation and a stated assumption. This card is educational, not a journal result.`,
    whyItMatters: "It keeps vocabulary aligned across lessons, labs, and Tutor.",
    relatedConcepts: [concept],
    difficulty: index % 5 === 0 ? "hard" : index % 2 ? "medium" : "easy",
    estimatedReadTime: 3,
  }));
  return [...core, ...extras];
}

const WHY: Array<[string, string, string, string, string, string, string]> = [
  ["lurch", "Why does a passenger lurch forward?", "The body keeps its velocity.", "When the car’s velocity drops, an unbalanced force on the passenger (seatbelt) is needed to match it.", "A ‘forward force’ throws you.", "Draw the passenger free-body during braking.", "inertia"],
  ["ice", "Why does ice reduce friction?", "The contact layer shears easily.", "Kinetic friction is smaller on ice; it is not zero, so stopping still takes distance.", "Ice cancels Newton’s laws.", "Compare f_k on wood vs ice with the same N.", "friction"],
  ["string", "Why does a guitar string change pitch?", "Frequency scales as 1/L and √T.", "Tightening raises wave speed; shortening raises f for the same harmonic.", "Pitch is only loudness.", "Mark a node and pluck a harmonic.", "standing-waves"],
  ["moon", "Why does the Moon stay in orbit?", "It is falling around Earth.", "Centripetal acceleration is GM/r², supplied by gravity.", "The Moon is outside gravity.", "Sketch v tangent and a inward.", "orbits"],
  ["magnify", "Why does a lens magnify?", "It changes the vergence of rays.", "A real image from a convex lens is inverted; a virtual image can be upright and enlarged.", "Lenses add a zoom force.", "Ray diagram with F labeled.", "thin-lenses"],
  ["resistance", "Why does current change with resistance?", "I = V/R at fixed V.", "Larger R means a smaller charge flow rate, not ‘used up’ charge.", "Current is consumed.", "Ohm’s law plot through the origin.", "ohms-law"],
  ["hot-cold", "Why does metal feel colder than wood?", "It conducts heat away faster.", "Touch temperature is about heat flow, not the thermometer reading of the room.", "Metal is actually colder.", "Same T, different conductivity.", "heat"],
  ["echo-delay", "Why is there a delay before an echo?", "Sound is not instantaneous.", "Round trip time is 2d/v.", "The wall thinks.", "Clap in a hallway and estimate d.", "sound"],
  ["compass", "Why does a wire move a compass?", "Currents make B fields.", "The needle aligns with the local B.", "The wire is magnetized like a bar.", "Compass circles a vertical wire.", "magnetic-field"],
  ["led-coil", "Why does moving a magnet light an LED?", "Changing flux induces emf.", "A static magnet on the table does nothing.", "Magnets store voltage.", "Move the magnet, then hold it still.", "faradays-law"],
];

export function createWhyQuestions(): WhyQuestion[] {
  const extraConcepts = ["projectile-motion", "energy", "momentum", "torque", "buoyancy", "pressure", "doppler-effect", "photoelectric-effect", "time-dilation", "entropy"];
  const core = WHY.map(([id, question, intuition, physicsExplanation, misconception, visualSuggestion, conceptId]) => ({
    id: `why-${id}`,
    question,
    intuition,
    physicsExplanation,
    misconception,
    visualSuggestion,
    conceptId,
  }));
  const extras = extraConcepts.map((conceptId) => ({
    id: `why-${conceptId}`,
    question: `Why does ${conceptId.replace(/-/g, " ")} show up in this situation?`,
    intuition: "Name the conserved quantity or the field responsible.",
    physicsExplanation: `Use the introductory ${conceptId.replace(/-/g, " ")} model with its stated assumptions.`,
    misconception: "Treating the name as a force of its own.",
    visualSuggestion: "Write the governing equation beside a sketch.",
    conceptId,
  }));
  return [...core, ...extras];
}

const MISC: Array<[string, string, string, string, string, string, string?]> = [
  ["velocity is speed", "velocity", "Everyday speech uses them interchangeably.", "Velocity includes direction; speed is the magnitude.", "Is a car going north at 20 m/s the same state as south at 20 m/s?", "lesson-velocity", "sim-kinematics-track"],
  ["acceleration is going fast", "acceleration", "Large v feels dramatic.", "Acceleration is Δv/Δt, including slowing and turning.", "Can a fast car have zero acceleration?", "lesson-acceleration"],
  ["moving requires a force", "newtons-laws", "You push to keep a box sliding on rough ground.", "Net force changes velocity; zero net force allows constant v.", "What force keeps a hockey puck moving on ideal ice?", "lesson-newtons-laws"],
  ["normal equals weight always", "normal-force", "It is true on a horizontal rest case.", "N is the contact force; it changes in elevators and on inclines.", "Is N equal to mg in a rising elevator?", "lesson-forces"],
  ["friction is μN always", "friction", "The sliding formula is taught first.", "Static friction is ≤ μN and can be smaller.", "A book at rest: is f = μN?", "lesson-friction"],
  ["centrifugal force on the FBD", "centripetal-acceleration", "In the car you feel thrown out.", "In inertial frames the inward net force is real; the ‘outward force’ is not an interaction.", "What supplies a_c for a satellite?", "lesson-centripetal-acceleration", "sim-orbit"],
  ["mass cancels so it does not matter", "pendulum", "T is independent of mass in the simple model.", "Mass canceled because it appeared in both mg and ma, not because mass is unreal.", "Would a bowling-ball pendulum and a pebble share T?", "lesson-pendulum", "sim-pendulum"],
  ["heat is a substance", "heat", "Caloric language survives in casual talk.", "Heat is energy in transit; objects have internal energy.", "Does a cup ‘contain heat’?", "lesson-heat"],
  ["current is used up", "current", "The far bulb looks dimmer in some series strings.", "In a single loop, I is the same; brightness is power.", "Series vs parallel currents?", "lesson-circuits", "sim-circuit"],
  ["voltage flows", "electric-potential", "Meters have red and black leads.", "Voltage is a difference; current is the flow of charge.", "Can you have V without I?", "lesson-electric-potential"],
  ["photons are tiny billiard balls only", "photons", "Particle language is vivid.", "They also interfere; energy is still hf.", "What does a double-slit with one photon at a time show?", "lesson-photons"],
  ["E=mc2 powers cars", "mass-energy", "The equation is famous.", "Chemical energy changes are tiny mass defects, not a fuel slogan.", "When is E=mc² the right tool?", "lesson-mass-energy"],
  ["g disappears in orbit", "orbits", "Astronauts float.", "g is weaker but not zero; they are in free fall.", "Compute g at 400 km.", "lesson-orbits", "sim-orbit"],
  ["light needs a medium", "em-waves", "Sound does.", "EM waves propagate in vacuum at c.", "How does sunlight reach Earth?", "lesson-em-waves"],
  ["bigger amplitude means faster wave", "wave-motion", "Taller water waves look faster.", "For small waves v is set by the medium, not A.", "Does louder sound travel faster?", "lesson-wave-motion"],
  ["image is always behind a mirror", "mirrors", "Bathroom mirrors do that.", "Concave mirrors can make real inverted images.", "Where is the image if do > f?", "lesson-reflection"],
  ["n is always 1.5", "index-of-refraction", "Glass labs repeat that number.", "n is material and wavelength dependent.", "Why does a prism make a spectrum?", "lesson-optics"],
  ["temperature is heat", "temperature", "Hot and cold are felt together.", "T is the scale; Q is transferred energy.", "Can two objects share T with different Q history?", "lesson-temperature"],
  ["absolute zero is reachable in the fridge", "temperature", "Colder is just a setting.", "Third-law style limits; a kitchen fridge is not a dilution refrigerator.", "What does 0 K mean?", "lesson-temperature"],
  ["entropy is only messy rooms", "entropy", "The metaphor is sticky.", "Entropy counts accessible microstates / energy spread.", "Does shuffling cards change thermodynamic entropy much?", "lesson-entropy"],
];

export function createMisconceptionCatalog(): MisconceptionRecord[] {
  const core = MISC.map(([misconception, conceptId, why, correct, diagnostic, lesson, sim], index) => ({
    id: `misc-${index + 1}`,
    conceptId,
    misconception,
    whyItSeemsReasonable: why,
    correctModel: correct,
    diagnosticQuestion: diagnostic,
    remediationLesson: lesson,
    remediationSimulation: sim,
  }));
  const extraIds = ["impulse", "torque", "work", "power", "elastic-collisions", "inelastic-collisions", "magnetic-field", "faradays-law", "snells-law", "thin-lenses", "diffraction", "doppler-effect", "ideal-gas-law", "buoyancy", "pressure", "special-relativity", "time-dilation", "de-broglie-wavelength", "photoelectric-effect", "bohr-model", "radioactive-decay", "kepler", "escape-velocity", "rc-circuits", "kirchhoffs-laws", "series-parallel", "lorentz-force", "polarization", "standing-waves", "beats", "hookes-law", "mechanical-energy", "center-of-mass", "rolling", "drag", "atwood", "free-body-diagrams", "projectile-range", "weight", "inertia", "equilibrium", "angular-momentum", "capacitance", "inductance", "electric-field", "charge", "photons", "wave-particle-duality", "uncertainty-principle", "hubble-expansion", "blackbody", "specific-heat", "phase-changes", "thermal-expansion", "first-law-thermo", "fluids", "fluid-flow", "resonance", "simple-harmonic-motion", "vectors", "components", "relative-velocity", "normal-force", "tension", "inclined-plane", "gravitational-field", "mass-energy", "relativistic-energy", "hydrogen-spectrum", "nuclear-binding", "particle-physics-catalog", "semiconductors", "diffusion", "stellar-spectra", "cosmic-microwave", "length-contraction", "work-function", "threshold-frequency", "youngs-double-slit", "critical-angle", "magnification", "electric-power", "current", "grounding"];
  const extras = extraIds.map((conceptId, index) => ({
    id: `misc-extra-${conceptId}`,
    conceptId,
    misconception: `Treating ${conceptId.replace(/-/g, " ")} as a label instead of a relation among measured quantities.`,
    whyItSeemsReasonable: "The name is memorable; the conditions of the model are not.",
    correctModel: `Write the governing relation for ${conceptId.replace(/-/g, " ")} and list the assumptions (ideal string, no drag, v < c, ohmic, small angle, …).`,
    diagnosticQuestion: `Which assumption would make the ${conceptId.replace(/-/g, " ")} formula fail?`,
    remediationLesson: `lesson-${conceptId}`,
  }));
  return [...core, ...extras];
}
