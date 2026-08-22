import { kineticEnergy, ohmsLaw, projectile, thermalEnergy, wave } from "./physics";

export type PracticeQuestion = { id: string; prompt: string; unit: string; solve: () => number; concept: string; conceptId: string };

export const practiceQuestions: PracticeQuestion[] = [
  { id: "projectile-range", prompt: "A ball is launched at 18 m/s at 42° from level ground. What is its horizontal range?", unit: "m", solve: () => projectile({ speed: 18, angleDeg: 42, height: 0 }).range, concept: "Projectile motion", conceptId: "kinematics" },
  { id: "final-velocity", prompt: "A car starts at 4 m/s and accelerates at 2 m/s² for 5 s. What is its final velocity?", unit: "m/s", solve: () => 4 + 2 * 5, concept: "Kinematics", conceptId: "kinematics" },
  { id: "kinetic-energy", prompt: "A 2 kg object moves at 3 m/s. What is its kinetic energy?", unit: "J", solve: () => kineticEnergy(2, 3), concept: "Energy", conceptId: "energy" },
  { id: "wave-speed", prompt: "A wave has frequency 4 Hz and wavelength 0.5 m. What is its speed?", unit: "m/s", solve: () => wave({ frequencyHz: 4, wavelengthM: 0.5 }).speedMps, concept: "Wave motion", conceptId: "wave-motion" },
  { id: "thermal-energy", prompt: "How much energy warms 0.5 kg of water by 10 K? Use c = 4186 J/(kg·K).", unit: "J", solve: () => thermalEnergy({ massKg: 0.5, specificHeatJPerKgK: 4186, temperatureChangeK: 10 }), concept: "Heat capacity", conceptId: "heat" },
  { id: "ohms-current", prompt: "A 12 V source is connected to a 3 Ω resistor. What current flows?", unit: "A", solve: () => ohmsLaw(12, 3).current, concept: "Circuits", conceptId: "circuits" },
];

export function practiceQuestionIndexForConcept(conceptId: string): number | null {
  const normalized = conceptId.trim().toLowerCase();
  const index = practiceQuestions.findIndex((question) => question.conceptId === normalized);
  return index >= 0 ? index : null;
}

export function hasPracticeQuestion(conceptId: string): boolean {
  return practiceQuestionIndexForConcept(conceptId) !== null;
}
