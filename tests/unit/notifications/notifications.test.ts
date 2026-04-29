import { describe, expect, it } from "vitest";
import { buildSeedNotifications, getUnreadCount, mapNotifications } from "@/lib/notifications/notifications";
import type { Notification, User } from "@/lib/db/schema";

const now = new Date("2026-04-29T12:00:00.000Z");

describe("notification mapping", () => {
  it("maps database notification rows into UI items", () => {
    const notification: Notification = {
      id: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      type: "job_application.status_updated",
      actorId: "33333333-3333-4333-8333-333333333333",
      entityType: "job_application",
      entityId: "44444444-4444-4444-8444-444444444444",
      readAt: null,
      createdAt: now
    };
    const actor: User = {
      id: "33333333-3333-4333-8333-333333333333",
      clerkId: "seed_brand_glossier",
      email: "glossier@brands.creatorlink.dev",
      type: "brand_member",
      onboardedAt: now,
      createdAt: now
    };

    expect(mapNotifications([{ notification, actor }])).toEqual([
      {
        id: notification.id,
        type: notification.type,
        title: "Application status updated",
        body: "A brand moved your application to a new stage.",
        actorLabel: actor.email,
        createdAt: now,
        readAt: null,
        href: "/jobs/saved"
      }
    ]);
  });

  it("builds seeded notifications for the demo creator workspace", () => {
    const notifications = buildSeedNotifications("sararivera");

    expect(notifications.length).toBeGreaterThan(0);
    expect(getUnreadCount(notifications)).toBeGreaterThan(0);
    expect(notifications[0]?.title).toContain("updated your application");
  });
});
