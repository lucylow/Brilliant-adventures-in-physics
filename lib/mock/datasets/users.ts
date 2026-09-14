import { createMockUser } from "../factories/user";
import { isoDaysAgo } from "../clock";
import type { EducationLevel } from "@/lib/education";
import type { LearnerGoal, LearnerLevel } from "@/lib/onboarding";
import type { MockLearnerProfile } from "../types";

type Persona = {
  id: string;
  displayName: string;
  learningLevel: EducationLevel;
  learnerLevel: LearnerLevel;
  goal: LearnerGoal;
  goals: string[];
  favoriteTopics: string[];
  createdDaysAgo: number;
  lastActiveHours: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalLessons: number;
  totalProblems: number;
  totalExperiments: number;
  masterySummary: Record<string, number>;
  bio: string;
  accent: string;
};

const PERSONAS: Persona[] = [
  { id: "user-alex", displayName: "Alex Rivera", learningLevel: "middle-school", learnerLevel: "new", goal: "understand", goals: ["Learn what velocity means", "Try one lab"], favoriteTopics: ["kinematics"], createdDaysAgo: 14, lastActiveHours: 20, xp: 80, level: 2, streak: 1, longestStreak: 2, totalLessons: 2, totalProblems: 4, totalExperiments: 0, masterySummary: { kinematics: 0.28, energy: 0.08 }, bio: "A beginner building a first map of motion.", accent: "#2563EB" },
  { id: "user-maya", displayName: "Maya Chen", learningLevel: "high-school", learnerLevel: "school", goal: "practice", goals: ["Master projectile motion", "Keep a study streak"], favoriteTopics: ["kinematics", "projectile-motion", "energy"], createdDaysAgo: 86, lastActiveHours: 3, xp: 1280, level: 7, streak: 6, longestStreak: 12, totalLessons: 18, totalProblems: 64, totalExperiments: 7, masterySummary: { kinematics: 0.87, forces: 0.64, energy: 0.72, momentum: 0.48, "quantum-physics": 0.12 }, bio: "A high-school learner who checks units before the final number.", accent: "#7C3AED" },
  { id: "user-noah", displayName: "Noah Okonkwo", learningLevel: "intro-college", learnerLevel: "school", goal: "understand", goals: ["Connect mechanics to engineering statics", "Use free-body diagrams fluently"], favoriteTopics: ["dynamics", "rotation", "energy"], createdDaysAgo: 210, lastActiveHours: 8, xp: 2460, level: 11, streak: 4, longestStreak: 21, totalLessons: 32, totalProblems: 110, totalExperiments: 12, masterySummary: { kinematics: 0.91, forces: 0.84, energy: 0.8, rotation: 0.61, circuits: 0.44 }, bio: "An engineering student who wants models that survive a design check.", accent: "#EA580C" },
  { id: "user-priya", displayName: "Priya Nair", learningLevel: "high-school", learnerLevel: "school", goal: "experiment", goals: ["Link spectra to atomic models", "Explore gravity wells"], favoriteTopics: ["astrophysics", "optics", "gravitation"], createdDaysAgo: 140, lastActiveHours: 6, xp: 1680, level: 8, streak: 9, longestStreak: 14, totalLessons: 22, totalProblems: 51, totalExperiments: 15, masterySummary: { optics: 0.77, gravitation: 0.58, "wave-motion": 0.7, "modern-physics": 0.33 }, bio: "An astronomy enthusiast who treats every spectrum as a clue.", accent: "#0891B2" },
  { id: "user-jordan", displayName: "Jordan Blake", learningLevel: "advanced", learnerLevel: "exam", goal: "practice", goals: ["Contest-style problem solving", "Minimize careless unit errors"], favoriteTopics: ["momentum", "rotation", "circuits", "relativity"], createdDaysAgo: 300, lastActiveHours: 2, xp: 4120, level: 16, streak: 18, longestStreak: 30, totalLessons: 48, totalProblems: 220, totalExperiments: 20, masterySummary: { kinematics: 0.96, forces: 0.93, energy: 0.9, momentum: 0.88, rotation: 0.81, circuits: 0.74, relativity: 0.55 }, bio: "A competitive STEM learner who still writes the principle before the algebra.", accent: "#16A34A" },
  { id: "user-sam", displayName: "Sam Ortega", learningLevel: "high-school", learnerLevel: "new", goal: "understand", goals: ["Rebuild forgotten kinematics", "Return without rushing"], favoriteTopics: ["kinematics", "forces"], createdDaysAgo: 400, lastActiveHours: 30, xp: 540, level: 4, streak: 0, longestStreak: 9, totalLessons: 9, totalProblems: 22, totalExperiments: 3, masterySummary: { kinematics: 0.41, forces: 0.22, energy: 0.18 }, bio: "A returning learner restarting from motion graphs after a long pause.", accent: "#DB2777" },
  { id: "user-taylor", displayName: "Taylor Kim", learningLevel: "high-school", learnerLevel: "exam", goal: "practice", goals: ["Exam-ready mechanics", "Timed practice with unit checks"], favoriteTopics: ["kinematics", "energy", "circuits", "optics"], createdDaysAgo: 60, lastActiveHours: 5, xp: 1980, level: 9, streak: 11, longestStreak: 11, totalLessons: 24, totalProblems: 140, totalExperiments: 6, masterySummary: { kinematics: 0.82, energy: 0.76, circuits: 0.69, optics: 0.58, momentum: 0.51 }, bio: "Exam preparation with a bias toward worked solutions and common mistakes.", accent: "#CA8A04" },
  { id: "user-morgan", displayName: "Morgan Ellis", learningLevel: "intro-college", learnerLevel: "school", goal: "experiment", goals: ["Run every featured simulation", "Save lab snapshots"], favoriteTopics: ["waves", "circuits", "projectile-motion", "quantum-physics"], createdDaysAgo: 95, lastActiveHours: 4, xp: 1520, level: 8, streak: 5, longestStreak: 8, totalLessons: 16, totalProblems: 40, totalExperiments: 28, masterySummary: { "wave-motion": 0.71, circuits: 0.66, kinematics: 0.6, "quantum-physics": 0.24 }, bio: "A simulation enthusiast who changes one variable at a time.", accent: "#9333EA" },
  { id: "user-riley", displayName: "Riley Das", learningLevel: "middle-school", learnerLevel: "new", goal: "experiment", goals: ["See a wave on screen", "Ask why mass cancels"], favoriteTopics: ["waves", "forces"], createdDaysAgo: 20, lastActiveHours: 12, xp: 160, level: 2, streak: 2, longestStreak: 2, totalLessons: 3, totalProblems: 6, totalExperiments: 2, masterySummary: { waves: 0.2, forces: 0.15 }, bio: "Curious about waves and magnets, still learning the vocabulary.", accent: "#0EA5E9" },
  { id: "user-casey", displayName: "Casey Nguyen", learningLevel: "intro-college", learnerLevel: "school", goal: "understand", goals: ["Own Kirchhoff’s laws", "Stop mixing series and parallel"], favoriteTopics: ["circuits", "electricity", "magnetism"], createdDaysAgo: 175, lastActiveHours: 9, xp: 2210, level: 10, streak: 3, longestStreak: 16, totalLessons: 28, totalProblems: 98, totalExperiments: 11, masterySummary: { charge: 0.86, circuits: 0.79, field: 0.68, magnetism: 0.42 }, bio: "Thinks in circuit diagrams and energy ledgers.", accent: "#F97316" },
  { id: "user-avery", displayName: "Avery Patel", learningLevel: "advanced", learnerLevel: "exam", goal: "understand", goals: ["Quantum states without mysticism", "Photoelectric numbers that check out"], favoriteTopics: ["quantum-physics", "modern-physics", "atomic-physics"], createdDaysAgo: 240, lastActiveHours: 7, xp: 3340, level: 14, streak: 8, longestStreak: 19, totalLessons: 40, totalProblems: 150, totalExperiments: 14, masterySummary: { "modern-energy": 0.84, "photoelectric-effect": 0.77, "quantum-physics": 0.61, relativity: 0.48 }, bio: "Wants quantum language that stays tied to measurements.", accent: "#8B5CF6" },
  { id: "user-quinn", displayName: "Quinn Brooks", learningLevel: "high-school", learnerLevel: "school", goal: "practice", goals: ["Energy bar charts", "Work with angles"], favoriteTopics: ["energy", "work", "elasticity"], createdDaysAgo: 70, lastActiveHours: 15, xp: 910, level: 6, streak: 4, longestStreak: 7, totalLessons: 12, totalProblems: 44, totalExperiments: 4, masterySummary: { energy: 0.7, work: 0.55, elasticity: 0.4 }, bio: "Prefers energy methods when free-body diagrams get crowded.", accent: "#14B8A6" },
  { id: "user-harper", displayName: "Harper Singh", learningLevel: "high-school", learnerLevel: "school", goal: "experiment", goals: ["Optics bench intuition", "Snell’s law with real angles"], favoriteTopics: ["optics", "waves"], createdDaysAgo: 110, lastActiveHours: 11, xp: 1180, level: 7, streak: 2, longestStreak: 10, totalLessons: 15, totalProblems: 38, totalExperiments: 9, masterySummary: { optics: 0.73, "wave-motion": 0.65, sound: 0.4 }, bio: "Builds ray diagrams before calculating.", accent: "#EC4899" },
  { id: "user-rowan", displayName: "Rowan Adeyemi", learningLevel: "intro-college", learnerLevel: "school", goal: "understand", goals: ["Orbits from energy", "Escape velocity without memorizing"], favoriteTopics: ["gravitation", "astrophysics", "energy"], createdDaysAgo: 188, lastActiveHours: 18, xp: 1870, level: 9, streak: 1, longestStreak: 13, totalLessons: 21, totalProblems: 72, totalExperiments: 8, masterySummary: { gravitation: 0.69, energy: 0.78, kinematics: 0.85 }, bio: "Treats planets as energy problems with a gravitational potential.", accent: "#3B82F6" },
  { id: "user-sage", displayName: "Sage Feldman", learningLevel: "advanced", learnerLevel: "exam", goal: "practice", goals: ["Thermo identities", "Ideal gas with units that survive"], favoriteTopics: ["thermodynamics", "statistical-physics", "energy"], createdDaysAgo: 260, lastActiveHours: 6, xp: 2780, level: 12, streak: 7, longestStreak: 22, totalLessons: 33, totalProblems: 130, totalExperiments: 10, masterySummary: { heat: 0.81, "gas-laws": 0.74, thermodynamics: 0.66, energy: 0.83 }, bio: "Keeps heat, temperature, and internal energy in separate columns.", accent: "#F59E0B" },
  { id: "user-cameron", displayName: "Cameron Walsh", learningLevel: "middle-school", learnerLevel: "new", goal: "understand", goals: ["Finish onboarding", "First correct practice item"], favoriteTopics: ["kinematics"], createdDaysAgo: 3, lastActiveHours: 26, xp: 20, level: 1, streak: 1, longestStreak: 1, totalLessons: 1, totalProblems: 1, totalExperiments: 0, masterySummary: { kinematics: 0.1 }, bio: "Just arrived and still choosing a first path.", accent: "#64748B" },
  { id: "user-drew", displayName: "Drew Alvarez", learningLevel: "high-school", learnerLevel: "school", goal: "practice", goals: ["Momentum in collisions", "Stop forgetting mass in p = mv"], favoriteTopics: ["momentum", "collisions"], createdDaysAgo: 55, lastActiveHours: 9, xp: 760, level: 5, streak: 3, longestStreak: 6, totalLessons: 10, totalProblems: 36, totalExperiments: 3, masterySummary: { momentum: 0.57, collisions: 0.49, energy: 0.45 }, bio: "Collision tables first, then a kinetic-energy check.", accent: "#22C55E" },
  { id: "user-elliot", displayName: "Elliot Park", learningLevel: "intro-college", learnerLevel: "exam", goal: "practice", goals: ["SHM phase", "Pendulum small-angle assumption"], favoriteTopics: ["oscillations", "waves"], createdDaysAgo: 130, lastActiveHours: 14, xp: 1440, level: 7, streak: 0, longestStreak: 8, totalLessons: 17, totalProblems: 61, totalExperiments: 7, masterySummary: { oscillation: 0.72, "wave-motion": 0.68, energy: 0.6 }, bio: "Wants the small-angle assumption written beside every pendulum period.", accent: "#A855F7" },
  { id: "user-finley", displayName: "Finley Brooks", learningLevel: "high-school", learnerLevel: "school", goal: "experiment", goals: ["Build a series circuit", "Measure current from V/R"], favoriteTopics: ["circuits", "electricity"], createdDaysAgo: 44, lastActiveHours: 16, xp: 640, level: 5, streak: 2, longestStreak: 5, totalLessons: 8, totalProblems: 27, totalExperiments: 8, masterySummary: { circuits: 0.52, charge: 0.48 }, bio: "Learns electricity by assembling the path before the equation.", accent: "#EAB308" },
  { id: "user-hayden", displayName: "Hayden Cole", learningLevel: "advanced", learnerLevel: "school", goal: "understand", goals: ["Nuclear binding energy", "Decay as conservation, not magic"], favoriteTopics: ["nuclear-physics", "particle-physics"], createdDaysAgo: 320, lastActiveHours: 22, xp: 3010, level: 13, streak: 2, longestStreak: 17, totalLessons: 36, totalProblems: 99, totalExperiments: 9, masterySummary: { "nuclear-physics": 0.63, "modern-energy": 0.8, "particle-physics": 0.41 }, bio: "Reads binding energy as a mass defect, not a slogan.", accent: "#C026D3" },
  { id: "user-kai", displayName: "Kai Mendoza", learningLevel: "high-school", learnerLevel: "school", goal: "understand", goals: ["Fluids without fear", "Buoyancy as displaced weight"], favoriteTopics: ["fluids", "biophysics"], createdDaysAgo: 78, lastActiveHours: 10, xp: 880, level: 6, streak: 5, longestStreak: 5, totalLessons: 11, totalProblems: 33, totalExperiments: 5, masterySummary: { fluids: 0.61, buoyancy: 0.54, pressure: 0.4 }, bio: "Connects swimming, diving, and density to hydrostatic pressure.", accent: "#06B6D4" },
  { id: "user-logan", displayName: "Logan Hart", learningLevel: "intro-college", learnerLevel: "exam", goal: "practice", goals: ["Special relativity algebra", "Gamma factors that stay below infinity"], favoriteTopics: ["relativity", "modern-physics"], createdDaysAgo: 200, lastActiveHours: 4, xp: 2560, level: 11, streak: 6, longestStreak: 15, totalLessons: 29, totalProblems: 118, totalExperiments: 6, masterySummary: { "relativistic-energy": 0.58, "relativistic-momentum": 0.5, kinematics: 0.9 }, bio: "Checks v < c before any Lorentz factor.", accent: "#6366F1" },
  { id: "user-nico", displayName: "Nico Rahman", learningLevel: "high-school", learnerLevel: "school", goal: "experiment", goals: ["Photoelectric graphs", "Threshold frequency as a measurement"], favoriteTopics: ["modern-physics", "optics"], createdDaysAgo: 99, lastActiveHours: 13, xp: 1120, level: 7, streak: 3, longestStreak: 9, totalLessons: 14, totalProblems: 42, totalExperiments: 11, masterySummary: { "photoelectric-effect": 0.46, optics: 0.62, "modern-energy": 0.51 }, bio: "Treats photoelectric data as evidence, not a story about particles only.", accent: "#D946EF" },
  { id: "user-parker", displayName: "Parker Singh", learningLevel: "middle-school", learnerLevel: "new", goal: "understand", goals: ["Name the forces on an incline", "Keep weight and normal distinct"], favoriteTopics: ["forces", "kinematics"], createdDaysAgo: 18, lastActiveHours: 7, xp: 210, level: 2, streak: 3, longestStreak: 3, totalLessons: 4, totalProblems: 9, totalExperiments: 1, masterySummary: { forces: 0.31, kinematics: 0.36 }, bio: "Still drawing arrows, which is the right place to start.", accent: "#FB7185" },
];

export function createUserCatalog(): MockLearnerProfile[] {
  return PERSONAS.map((persona) =>
    createMockUser({
      id: persona.id,
      displayName: persona.displayName,
      avatar: { initials: persona.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), motif: "learner", accent: persona.accent },
      learningLevel: persona.learningLevel,
      learnerLevel: persona.learnerLevel,
      goal: persona.goal,
      goals: persona.goals,
      favoriteTopics: persona.favoriteTopics,
      createdAt: isoDaysAgo(persona.createdDaysAgo, 8),
      lastActiveAt: isoDaysAgo(0, persona.lastActiveHours),
      xp: persona.xp,
      level: persona.level,
      streak: persona.streak,
      longestStreak: persona.longestStreak,
      totalLessons: persona.totalLessons,
      totalProblems: persona.totalProblems,
      totalExperiments: persona.totalExperiments,
      masterySummary: persona.masterySummary,
      bio: persona.bio,
    }),
  );
}

export function findPersona(id: string): MockLearnerProfile | undefined {
  return createUserCatalog().find((user) => user.id === id);
}
