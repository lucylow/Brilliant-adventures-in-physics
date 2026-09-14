import { clone } from "../utils/clone";
import { isoDaysAgo } from "../clock";
import type { MockNotification } from "../types";

export function createMockNotification(overrides: Partial<MockNotification> = {}): MockNotification {
  return clone({
    id: "notif-streak-3",
    userId: "user-maya",
    kind: "streak",
    title: "Three-day streak",
    body: "You studied three days in a row. A short kinematics review will keep the ideas warm.",
    createdAt: isoDaysAgo(0, 5),
    read: false,
    route: "/practice",
    ...overrides,
  });
}
