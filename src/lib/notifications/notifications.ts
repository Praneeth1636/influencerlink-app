import { buildSeedData } from "@/lib/db/seed";
import type { Notification, User } from "@/lib/db/schema";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  actorLabel: string;
  createdAt: Date;
  readAt: Date | null;
  href: string;
};

type NotificationRow = {
  notification: Notification;
  actor: User | null;
};

export function mapNotifications(rows: NotificationRow[]): NotificationItem[] {
  return rows.map(({ notification, actor }) => {
    const copy = getNotificationCopy(notification.type);

    return {
      id: notification.id,
      type: notification.type,
      title: copy.title,
      body: copy.body,
      actorLabel: actor?.email ?? "CreatorLink",
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      href: getNotificationHref(notification)
    };
  });
}

export function buildSeedNotifications(handle = "sararivera") {
  const seed = buildSeedData();
  const creator = seed.creators.find((row) => row.handle === handle) ?? seed.creators[0];
  const creatorUser = seed.users.find((row) => row.id === creator?.userId);

  if (!creator || !creatorUser) {
    return [];
  }

  const creatorApplications = seed.jobApplications
    .filter((application) => application.creatorId === creator.id)
    .slice(0, 6);

  return creatorApplications.map((application, index): NotificationItem => {
    const job = seed.jobs.find((row) => row.id === application.jobId);
    const brand = seed.brands.find((row) => row.id === job?.brandId);
    const isUnread = index < 3;

    return {
      id: `seed-notification-${application.id}`,
      type: "job_application.status_updated",
      title: `${brand?.name ?? "A brand"} updated your application`,
      body: `${job?.title ?? "Creator brief"} is now ${application.status}.`,
      actorLabel: brand?.name ?? "CreatorLink",
      createdAt: application.updatedAt ?? application.createdAt ?? new Date("2026-04-01T00:00:00.000Z"),
      readAt: isUnread ? null : (application.updatedAt ?? application.createdAt ?? null),
      href: "/jobs/saved"
    };
  });
}

export function getUnreadCount(items: NotificationItem[]) {
  return items.filter((item) => !item.readAt).length;
}

function getNotificationCopy(type: string) {
  if (type === "job_application.submitted") {
    return {
      title: "New creator application",
      body: "A creator applied to one of your open briefs."
    };
  }

  if (type === "job_application.status_updated") {
    return {
      title: "Application status updated",
      body: "A brand moved your application to a new stage."
    };
  }

  return {
    title: "New notification",
    body: "Something changed in your CreatorLink workspace."
  };
}

function getNotificationHref(notification: Notification) {
  if (notification.type === "job_application.submitted") {
    return "/notifications";
  }

  if (notification.type === "job_application.status_updated") {
    return "/jobs/saved";
  }

  return "/notifications";
}
