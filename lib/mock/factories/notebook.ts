import { clone } from "../utils/clone";
import { isoDaysAgo } from "../clock";
import type { MockNotebookRecord } from "../types";

export function createMockNotebookEntry(overrides: Partial<MockNotebookRecord> = {}): MockNotebookRecord {
  return clone({
    id: "note-kinematics-signs",
    title: "Sign convention for free fall",
    type: "reflection",
    content: "If up is positive, g is negative. Mixing this with unsigned 9.8 m/s² is how I lost the direction of the final velocity.",
    links: ["kinematics"],
    createdAt: isoDaysAgo(5, 9),
    userId: "user-maya",
    conceptId: "kinematics",
    favorite: true,
    bookmark: true,
    ...overrides,
  });
}
