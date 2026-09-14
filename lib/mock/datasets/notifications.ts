import { createMockNotification } from "../factories/notification";
import { isoDaysAgo } from "../clock";
import type { MockNotification } from "../types";

export function createNotificationCatalog(userId: string, streak: number): MockNotification[] {
  const base: MockNotification[] = [
    createMockNotification({ id: "notif-streak", userId, kind: "streak", title: `${Math.max(1, streak)}-day streak`, body: "A short review will keep the ideas warm. There is no penalty for a missed day.", createdAt: isoDaysAgo(0, 5), read: false, route: "/practice" }),
    createMockNotification({ id: "notif-achievement", userId, kind: "achievement", title: "Achievement unlocked", body: "First Discovery is now on your shelf.", createdAt: isoDaysAgo(2, 7), read: true, route: "/progress" }),
    createMockNotification({ id: "notif-mission", userId, kind: "mission", title: "Mission ready", body: "Catch a Falling Satellite still has an open lab step.", createdAt: isoDaysAgo(1, 3), read: false, route: "/progress" }),
    createMockNotification({ id: "notif-sim", userId, kind: "simulation", title: "New simulation", body: "Photoelectric Bench is available in the Lab.", createdAt: isoDaysAgo(3, 9), read: false, route: "/lab" }),
    createMockNotification({ id: "notif-review", userId, kind: "review", title: "Review due", body: "Momentum is waiting in the review queue.", createdAt: isoDaysAgo(0, 8), read: false, route: "/practice" }),
    createMockNotification({ id: "notif-experiment", userId, kind: "experiment", title: "Experiment saved", body: "Rolling object on a ramp is in your notebook.", createdAt: isoDaysAgo(6, 11), read: true, route: "/notebook" }),
    createMockNotification({ id: "notif-milestone", userId, kind: "milestone", title: "Progress milestone", body: "You crossed 60% local accuracy in kinematics.", createdAt: isoDaysAgo(4, 6), read: true, route: "/progress" }),
    createMockNotification({ id: "notif-practice", userId, kind: "practice", title: "Practice reminder", body: "One projectile question is a good next step.", createdAt: isoDaysAgo(0, 12), read: false, route: "/practice" }),
  ];
  const extras = Array.from({ length: 24 }, (_, index) =>
    createMockNotification({
      id: `notif-extra-${index + 1}`,
      userId,
      kind: (["practice", "streak", "achievement", "mission", "simulation", "review"] as const)[index % 6],
      title: `Update ${index + 1}`,
      body: "A local mock notification for development. It is not a live push from a server.",
      createdAt: isoDaysAgo(index % 20, 2 + (index % 10)),
      read: index % 3 === 0,
      route: index % 2 ? "/progress" : "/practice",
    }),
  );
  return [...base, ...extras];
}
