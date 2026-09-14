import { createMockNotebookEntry } from "../factories/notebook";
import { isoDaysAgo } from "../clock";
import type { MockNotebookRecord } from "../types";

const NOTES: Array<Omit<MockNotebookRecord, "userId" | "createdAt"> & { daysAgo: number }> = [
  { id: "note-kinematics-signs", title: "Sign convention for free fall", type: "reflection", content: "If up is positive, g is negative. Mixing this with unsigned 9.8 m/s² flipped the final velocity.", links: ["kinematics"], conceptId: "kinematics", favorite: true, bookmark: true, daysAgo: 5 },
  { id: "note-units-work", title: "Joule versus newton-meter", type: "mistake", content: "N·m is a joule for work, but torque uses the same unit. Write the quantity name.", links: ["work"], conceptId: "work", daysAgo: 3 },
  { id: "note-projectile-split", title: "Two motions at once", type: "experiment", content: "Horizontal speed stayed near 13 m/s while vertical speed changed every sample.", links: ["projectile-motion"], conceptId: "projectile-motion", favorite: true, daysAgo: 2 },
  { id: "note-ohm", title: "Ohmic means linear", type: "reflection", content: "V = IR is for ohmic resistors. A bulb’s resistance changes with temperature.", links: ["circuits"], conceptId: "ohms-law", bookmark: true, daysAgo: 7 },
  { id: "note-mass-cancel", title: "Why mass canceled", type: "reflection", content: "Pendulum period independent of mass because m appears in both F = ma and mg.", links: ["pendulum"], conceptId: "pendulum", daysAgo: 6 },
  { id: "note-friction-max", title: "Static friction is a range", type: "mistake", content: "I used f = μN on a crate at rest that was not at the slipping point.", links: ["friction"], conceptId: "friction", daysAgo: 9 },
  { id: "note-energy-zero", title: "Choosing U = 0", type: "reflection", content: "The zero of gravitational potential is a choice. Only differences matter in mgh problems.", links: ["energy"], conceptId: "gravitational-energy", daysAgo: 4 },
  { id: "note-snell", title: "Toward the normal", type: "experiment", content: "Air to glass: the ray bent toward the normal. Measured 19.5° versus 19.5° from Snell.", links: ["optics"], conceptId: "snells-law", favorite: true, daysAgo: 8 },
  { id: "note-photon", title: "Color as energy", type: "reflection", content: "Shorter λ is larger E = hc/λ. Intensity is photon count, not photon energy.", links: ["modern-energy"], conceptId: "photons", daysAgo: 11 },
  { id: "note-relativity", title: "v stays below c", type: "mistake", content: "I plugged v = c into γ and the calculator exploded. The formula requires v < c.", links: ["relativity"], conceptId: "special-relativity", daysAgo: 12 },
];

export function createNotebookCatalog(userId: string): MockNotebookRecord[] {
  const extras: MockNotebookRecord[] = Array.from({ length: 40 }, (_, index) =>
    createMockNotebookEntry({
      id: `note-extra-${index + 1}`,
      userId,
      title: index % 3 === 0 ? `Saved equation ${index + 1}` : index % 3 === 1 ? `Lab note ${index + 1}` : `Bookmark ${index + 1}`,
      type: index % 3 === 1 ? "experiment" : index % 5 === 0 ? "mistake" : "reflection",
      content: `Local note ${index + 1}: keep the governing idea, the unit, and one assumption visible.`,
      links: [["kinematics", "energy", "circuits", "waves", "optics"][index % 5]],
      conceptId: ["kinematics", "energy", "circuits", "wave-motion", "optics"][index % 5],
      createdAt: isoDaysAgo(1 + (index % 50), 5),
      favorite: index % 7 === 0,
      bookmark: index % 4 === 0,
    }),
  );
  return [
    ...NOTES.map((note) => createMockNotebookEntry({ ...note, userId, createdAt: isoDaysAgo(note.daysAgo, 10) })),
    ...extras,
  ];
}
