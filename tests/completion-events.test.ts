import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { recordLabCompletion, recordLessonCompletion } from "../lib/progress-store";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe("completion events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  });

  it("normalizes and persists one lesson event without duplicate credit", async () => {
    const first = await recordLessonCompletion("Projectile motion", "2026-01-01T00:00:00.000Z");
    expect(first.lessonsCompleted).toBe(1);
    expect(first.completionEvents).toEqual([{ id: "lesson:projectile-motion", kind: "lesson", contentId: "projectile-motion", topic: "projectile-motion", completedAt: "2026-01-01T00:00:00.000Z" }]);

    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(first));
    const repeated = await recordLessonCompletion("projectile-motion", "2026-01-02T00:00:00.000Z");
    expect(repeated.lessonsCompleted).toBe(1);
    expect(repeated.completionEvents).toEqual(first.completionEvents);
  });

  it("keeps lesson and Lab evidence distinct while sharing topic matching", async () => {
    const lesson = await recordLessonCompletion("projectile-motion", "2026-01-01T00:00:00.000Z");
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(lesson));
    const lab = await recordLabCompletion("projectile motion", "2026-01-02T00:00:00.000Z");
    expect(lab.lessonsCompleted).toBe(1);
    expect(lab.labsCompleted).toBe(1);
    expect(lab.completionEvents?.map((event) => event.id)).toEqual(["lesson:projectile-motion", "lab:projectile-motion"]);
  });

  it("tracks separate content IDs independently within the same topic", async () => {
    const first = await recordLessonCompletion({ contentId: "projectile-motion-lesson-1", topic: "projectile-motion", completedAt: "2026-01-01T00:00:00.000Z" });
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(first));
    const second = await recordLessonCompletion({ contentId: "projectile-motion-lesson-2", topic: "projectile-motion", completedAt: "2026-01-02T00:00:00.000Z" });
    expect(second.lessonsCompleted).toBe(2);
    expect(second.completionEvents?.map((event) => event.contentId)).toEqual(["projectile-motion-lesson-1", "projectile-motion-lesson-2"]);
  });
});
