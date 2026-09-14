import { createMockTopic } from "../factories/topic";
import type { MockDifficulty, MockTopic } from "../types";

type TopicSeed = {
  id: string;
  name: string;
  shortDescription: string;
  domain: string;
  difficulty: MockDifficulty;
  estimatedMinutes: number;
  prerequisites: string[];
  icon: string;
  accent: string;
  featured?: boolean;
};

const TOPICS: TopicSeed[] = [
  { id: "mechanics", name: "Mechanics", shortDescription: "Motion, forces, energy, and momentum as one connected story.", domain: "Mechanics", difficulty: "easy", estimatedMinutes: 90, prerequisites: [], icon: "⚙", accent: "#2563EB", featured: true },
  { id: "kinematics", name: "Kinematics", shortDescription: "Describe position, velocity, and acceleration without naming the cause.", domain: "Mechanics", difficulty: "easy", estimatedMinutes: 40, prerequisites: [], icon: "→", accent: "#2563EB", featured: true },
  { id: "projectile-motion", name: "Projectile Motion", shortDescription: "Split motion into independent horizontal and vertical parts.", domain: "Mechanics", difficulty: "medium", estimatedMinutes: 35, prerequisites: ["kinematics"], icon: "⌒", accent: "#1D4ED8" },
  { id: "dynamics", name: "Dynamics", shortDescription: "Use Newton’s laws to relate net force to acceleration.", domain: "Mechanics", difficulty: "medium", estimatedMinutes: 50, prerequisites: ["kinematics"], icon: "F", accent: "#1E40AF", featured: true },
  { id: "forces", name: "Forces", shortDescription: "Weight, normal force, friction, and tension as interactions.", domain: "Mechanics", difficulty: "medium", estimatedMinutes: 45, prerequisites: ["dynamics"], icon: "↓", accent: "#1E3A8A" },
  { id: "energy", name: "Energy", shortDescription: "Track kinetic and potential energy and the work that transfers them.", domain: "Mechanics", difficulty: "medium", estimatedMinutes: 45, prerequisites: ["kinematics"], icon: "E", accent: "#0F766E", featured: true },
  { id: "momentum", name: "Momentum", shortDescription: "Impulse changes momentum; collisions conserve it when external impulse is negligible.", domain: "Mechanics", difficulty: "medium", estimatedMinutes: 40, prerequisites: ["kinematics"], icon: "p", accent: "#0E7490" },
  { id: "rotation", name: "Rotation", shortDescription: "Torque, moment of inertia, and angular momentum for spinning systems.", domain: "Mechanics", difficulty: "hard", estimatedMinutes: 50, prerequisites: ["forces", "energy"], icon: "↻", accent: "#0369A1" },
  { id: "gravitation", name: "Gravitation", shortDescription: "Inverse-square gravity, orbits, and escape speed.", domain: "Mechanics", difficulty: "hard", estimatedMinutes: 40, prerequisites: ["forces", "energy"], icon: "◉", accent: "#1D4ED8" },
  { id: "waves", name: "Waves", shortDescription: "A disturbance transfers energy; speed, frequency, and wavelength are linked.", domain: "Waves", difficulty: "medium", estimatedMinutes: 40, prerequisites: [], icon: "~", accent: "#7C3AED", featured: true },
  { id: "sound", name: "Sound", shortDescription: "Mechanical waves in air, with pitch, loudness, and Doppler shifts.", domain: "Waves", difficulty: "medium", estimatedMinutes: 30, prerequisites: ["waves"], icon: "♪", accent: "#6D28D9" },
  { id: "oscillations", name: "Oscillations", shortDescription: "Simple harmonic motion around a stable equilibrium.", domain: "Waves", difficulty: "medium", estimatedMinutes: 35, prerequisites: ["energy"], icon: "∿", accent: "#5B21B6" },
  { id: "electricity", name: "Electricity", shortDescription: "Charge, fields, and potential as the language of electrostatics.", domain: "Electricity", difficulty: "medium", estimatedMinutes: 50, prerequisites: [], icon: "q", accent: "#CA8A04", featured: true },
  { id: "circuits", name: "Circuits", shortDescription: "Ohm’s law, Kirchhoff’s rules, and energy transfer in a closed path.", domain: "Electricity", difficulty: "medium", estimatedMinutes: 45, prerequisites: ["electricity"], icon: "⎓", accent: "#A16207", featured: true },
  { id: "magnetism", name: "Magnetism", shortDescription: "Magnetic fields from currents and the force on moving charge.", domain: "Electricity", difficulty: "hard", estimatedMinutes: 40, prerequisites: ["electricity"], icon: "B", accent: "#854D0E" },
  { id: "electromagnetism", name: "Electromagnetism", shortDescription: "Induction, Faraday’s law, and the coupling of E and B fields.", domain: "Electricity", difficulty: "hard", estimatedMinutes: 45, prerequisites: ["magnetism", "circuits"], icon: "Φ", accent: "#713F12" },
  { id: "optics", name: "Optics", shortDescription: "Reflection, refraction, lenses, and interference of light.", domain: "Waves", difficulty: "medium", estimatedMinutes: 45, prerequisites: ["waves"], icon: "◇", accent: "#DB2777", featured: true },
  { id: "thermodynamics", name: "Thermodynamics", shortDescription: "Heat, temperature, work, and the direction of energy flow.", domain: "Thermal", difficulty: "medium", estimatedMinutes: 45, prerequisites: ["energy"], icon: "T", accent: "#EA580C" },
  { id: "statistical-physics", name: "Statistical Physics", shortDescription: "Connect microscopic motion to temperature, entropy, and distributions.", domain: "Thermal", difficulty: "challenge", estimatedMinutes: 40, prerequisites: ["thermodynamics"], icon: "Σ", accent: "#C2410C" },
  { id: "modern-physics", name: "Modern Physics", shortDescription: "Photons, mass–energy, and the limits of classical models.", domain: "Modern Physics", difficulty: "hard", estimatedMinutes: 40, prerequisites: ["waves", "energy"], icon: "ħ", accent: "#7C3AED", featured: true },
  { id: "quantum-physics", name: "Quantum Physics", shortDescription: "States, probability amplitudes, and quantized energy.", domain: "Modern Physics", difficulty: "challenge", estimatedMinutes: 50, prerequisites: ["modern-physics"], icon: "ψ", accent: "#6D28D9" },
  { id: "atomic-physics", name: "Atomic Physics", shortDescription: "Electron energy levels, spectra, and the Bohr model’s limits.", domain: "Modern Physics", difficulty: "hard", estimatedMinutes: 35, prerequisites: ["quantum-physics"], icon: "⚛", accent: "#5B21B6" },
  { id: "molecular-physics", name: "Molecular Physics", shortDescription: "Bonding, vibration, and rotation of molecules.", domain: "Modern Physics", difficulty: "hard", estimatedMinutes: 30, prerequisites: ["atomic-physics"], icon: "⚭", accent: "#4C1D95" },
  { id: "nuclear-physics", name: "Nuclear Physics", shortDescription: "Binding energy, decay, and conservation in nuclear reactions.", domain: "Modern Physics", difficulty: "hard", estimatedMinutes: 35, prerequisites: ["modern-physics"], icon: "n", accent: "#9333EA" },
  { id: "particle-physics", name: "Particle Physics", shortDescription: "Quarks, leptons, and the Standard Model catalog.", domain: "Modern Physics", difficulty: "challenge", estimatedMinutes: 40, prerequisites: ["nuclear-physics"], icon: "γ", accent: "#7E22CE" },
  { id: "condensed-matter", name: "Condensed Matter", shortDescription: "Crystals, bands, and collective behavior in solids.", domain: "Modern Physics", difficulty: "challenge", estimatedMinutes: 35, prerequisites: ["quantum-physics"], icon: "▦", accent: "#6B21A8" },
  { id: "biophysics", name: "Biophysics", shortDescription: "Diffusion, membranes, and physical models of living systems.", domain: "Fluids", difficulty: "hard", estimatedMinutes: 30, prerequisites: ["thermodynamics"], icon: "♥", accent: "#BE123C" },
  { id: "astrophysics", name: "Astrophysics", shortDescription: "Stars, spectra, and gravitational environments beyond Earth.", domain: "Mechanics", difficulty: "hard", estimatedMinutes: 40, prerequisites: ["gravitation"], icon: "★", accent: "#1D4ED8", featured: true },
  { id: "cosmology", name: "Cosmology", shortDescription: "Expansion, redshift, and large-scale structure of the universe.", domain: "Modern Physics", difficulty: "challenge", estimatedMinutes: 35, prerequisites: ["astrophysics", "relativity"], icon: "✦", accent: "#312E81" },
  { id: "relativity", name: "Relativity", shortDescription: "Invariant c, time dilation, and mass–energy equivalence.", domain: "Modern Physics", difficulty: "hard", estimatedMinutes: 40, prerequisites: ["kinematics", "energy"], icon: "c", accent: "#4338CA", featured: true },
];

export function createTopicCatalog(): MockTopic[] {
  return TOPICS.map((topic) => createMockTopic(topic));
}
