import Link from "next/link";
import { Bell, BriefcaseBusiness, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  buildSeedNotifications,
  getUnreadCount,
  mapNotifications,
  type NotificationItem
} from "@/lib/notifications/notifications";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import { MarkAllNotificationsReadButton } from "./notification-actions";

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = getUnreadCount(notifications);

  return (
    <main className="mx-auto grid max-w-[1120px] gap-6 px-5 py-8">
      <section className="border-border bg-muted/30 rounded-3xl border p-6 shadow-2xl shadow-black/20">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div>
            <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
              <Bell className="mr-2 h-3.5 w-3.5" />
              Workspace alerts
            </Badge>
            <h1 className="mt-5 max-w-3xl text-[clamp(34px,6vw,64px)] leading-[0.96] font-black tracking-[-0.06em]">
              Track every creator opportunity as it moves.
            </h1>
            <p className="text-foreground/55 mt-4 max-w-2xl text-sm leading-7">
              Notifications now sit behind real tRPC procedures. Job applications and recruiter status changes create
              alerts so creators and brands can react without digging through every page.
            </p>
          </div>

          <MarkAllNotificationsReadButton unreadCount={unreadCount} />
        </div>
      </section>

      <section className="grid gap-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
        ) : (
          <div className="border-border bg-card rounded-xl border p-6">
            <p className="text-lg font-black">No notifications yet</p>
            <p className="text-foreground/50 mt-2 text-sm leading-6">
              Apply to briefs, publish jobs, or move applicants through the pipeline to create alerts.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

async function getNotifications() {
  try {
    const caller = await createTRPCServerCaller();
    return mapNotifications(await caller.notification.list({ limit: 30 }));
  } catch {
    return buildSeedNotifications();
  }
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  const isUnread = !notification.readAt;

  return (
    <Link
      className={
        isUnread
          ? "border-primary/25 bg-primary/10 hover:border-primary/45 grid gap-4 rounded-2xl border p-5 transition sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          : "border-border bg-card hover:border-border grid gap-4 rounded-xl border p-5 transition sm:grid-cols-[auto_minmax(0,1fr)_auto]"
      }
      href={notification.href}
    >
      <div className="bg-muted/30 text-primary ring-border grid h-11 w-11 place-items-center rounded-2xl ring-1">
        <BriefcaseBusiness className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black tracking-[-0.035em]">{notification.title}</h2>
          {isUnread ? (
            <span className="bg-primary inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-black">
              New
            </span>
          ) : null}
        </div>
        <p className="text-foreground/56 mt-1 text-sm leading-6">{notification.body}</p>
        <p className="text-muted-foreground mt-3 text-xs font-bold">
          {notification.actorLabel} · {formatNotificationDate(notification.createdAt)}
        </p>
      </div>
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-black">
        {isUnread ? <Circle className="fill-primary text-primary h-3 w-3" /> : <CheckCircle2 className="h-4 w-4" />}
        {isUnread ? "Unread" : "Read"}
      </div>
    </Link>
  );
}

function formatNotificationDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}
