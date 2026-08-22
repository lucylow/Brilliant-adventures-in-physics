import { elasticCollision1D, kineticEnergy, momentum, ohmsLaw, photonEnergyFromWavelength, projectile, refraction, thermalEnergy, wave } from "./physics";

export type PracticeQuestion = { id: string; prompt: string; unit: string; solve: () => number; concept: string; conceptId: string };

export const practiceQuestions: PracticeQuestion[] = [
  { id: "projectile-range", prompt: "A ball is launched at 18 m/s at 42° from level ground. What is its horizontal range?", unit: "m", solve: () => projectile({ speed: 18, angleDeg: 42, height: 0 }).range, concept: "Projectile motion", conceptId: "kinematics" },
  { id: "final-velocity", prompt: "A car starts at 4 m/s and accelerates at 2 m/s² for 5 s. What is its final velocity?", unit: "m/s", solve: () => 4 + 2 * 5, concept: "Kinematics", conceptId: "kinematics" },
  { id: "kinetic-energy", prompt: "A 2 kg object moves at 3 m/s. What is its kinetic energy?", unit: "J", solve: () => kineticEnergy(2, 3), concept: "Energy", conceptId: "energy" },
  { id: "wave-speed", prompt: "A wave has frequency 4 Hz and wavelength 0.5 m. What is its speed?", unit: "m/s", solve: () => wave({ frequencyHz: 4, wavelengthM: 0.5 }).speedMps, concept: "Wave motion", conceptId: "wave-motion" },
  { id: "thermal-energy", prompt: "How much energy warms 0.5 kg of water by 10 K? Use c = 4186 J/(kg·K).", unit: "J", solve: () => thermalEnergy({ massKg: 0.5, specificHeatJPerKgK: 4186, temperatureChangeK: 10 }), concept: "Heat capacity", conceptId: "heat" },
  { id: "ohms-current", prompt: "A 12 V source is connected to a 3 Ω resistor. What current flows?", unit: "A", solve: () => ohmsLaw(12, 3).current, concept: "Circuits", conceptId: "circuits" },
  { id: "momentum", prompt: "What momentum does a 2 kg object have while moving at 5 m/s?", unit: "kg·m/s", solve: () => momentum(2, 5), concept: "Momentum", conceptId: "momentum" },
  { id: "elastic-collision", prompt: "A 2 kg cart at 4 m/s collides elastically with a stationary 2 kg cart. What is the second cart’s final speed?", unit: "m/s", solve: () => elasticCollision1D(2, 4, 2, 0).finalVelocity2Mps, concept: "Elastic collisions", conceptId: "collisions" },
  { id: "refracted-angle", prompt: "Light enters glass (n = 1.5) from air (n = 1.0) at 30°. What is the refracted angle?", unit: "°", solve: () => refraction({ incidentAngleDeg: 30, refractiveIndexFrom: 1, refractiveIndexTo: 1.5 }).refractedAngleDeg ?? 0, concept: "Optics", conceptId: "optics" },
  { id: "photon-energy", prompt: "What is the energy of a photon with wavelength 500 nm?", unit: "J", solve: () => photonEnergyFromWavelength(500e-9), concept: "Photon energy", conceptId: "modern-energy" },
];

export function practiceQuestionIndexForConcept(conceptId: string): number | null {
  const normalized = conceptId.trim().toLowerCase();
  const index = practiceQuestions.findIndex((question) => question.conceptId === normalized);
  return index >= 0 ? index : null;
}

export function hasPracticeQuestion(conceptId: string): boolean {
  return practiceQuestionIndexForConcept(conceptId) !== null;
}
