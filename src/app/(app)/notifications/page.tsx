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
      <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div>
            <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
              <Bell className="mr-2 h-3.5 w-3.5" />
              Workspace alerts
            </Badge>
            <h1 className="mt-5 max-w-3xl text-[clamp(34px,6vw,64px)] leading-[0.96] font-black tracking-[-0.06em]">
              Track every creator opportunity as it moves.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
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
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
            <p className="text-lg font-black">No notifications yet</p>
            <p className="mt-2 text-sm leading-6 text-white/50">
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
          ? "grid gap-4 rounded-2xl border border-[#D85A30]/25 bg-[#D85A30]/10 p-5 transition hover:border-[#D85A30]/45 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          : "grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-white/20 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
      }
      href={notification.href}
    >
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black/25 text-[#ffb49c] ring-1 ring-white/10">
        <BriefcaseBusiness className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black tracking-[-0.035em]">{notification.title}</h2>
          {isUnread ? (
            <span className="inline-flex items-center rounded-full bg-[#D85A30] px-2 py-0.5 text-[11px] font-black">
              New
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-white/56">{notification.body}</p>
        <p className="mt-3 text-xs font-bold text-white/35">
          {notification.actorLabel} · {formatNotificationDate(notification.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-black text-white/35">
        {isUnread ? <Circle className="h-3 w-3 fill-[#D85A30] text-[#D85A30]" /> : <CheckCircle2 className="h-4 w-4" />}
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
