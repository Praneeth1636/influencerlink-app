import Link from "next/link";
import { Bell, BriefcaseBusiness, CheckCircle2, Circle } from "lucide-react";
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
    <main className="mx-auto grid max-w-[1120px] gap-6 bg-white px-5 py-8 font-sans text-[#37352f]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.045em]">Notifications</h1>
          <p className="mt-1.5 text-sm leading-6 text-[#787774]">Follows, replies, applications, and deal activity.</p>
        </div>
        <MarkAllNotificationsReadButton unreadCount={unreadCount} />
      </header>

      <section className="grid gap-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
        ) : (
          <div className="rounded-xl border border-[#e9e9e7] bg-white p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f7f7f5] text-[#787774]">
              <Bell className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold tracking-[-0.025em]">You&apos;re all caught up</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#787774]">
              Activity lands here: gig applications, replies from brands, and new followers.
            </p>
            <Link
              className="mt-6 inline-flex h-10 items-center rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#262420]"
              href="/jobs"
            >
              Browse gigs
            </Link>
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
          ? "grid gap-4 rounded-xl border border-[#f3d5c4] bg-[#faf0ea] p-5 transition hover:border-[#e7b598] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          : "grid gap-4 rounded-xl border border-[#e9e9e7] bg-white p-5 transition hover:border-[#dcdfe5] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
      }
      href={notification.href}
    >
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-[#e08550] ring-1 ring-[#e9e9e7]">
        <BriefcaseBusiness className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-[-0.035em]">{notification.title}</h2>
          {isUnread ? (
            <span className="inline-flex items-center rounded-full bg-[#e08550] px-2 py-0.5 text-[11px] font-semibold text-white">
              New
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-[#787774]">{notification.body}</p>
        <p className="mt-3 text-xs font-medium text-[#9b9a97]">
          {notification.actorLabel} · {formatNotificationDate(notification.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-[#9b9a97]">
        {isUnread ? <Circle className="h-3 w-3 fill-[#e08550] text-[#e08550]" /> : <CheckCircle2 className="h-4 w-4" />}
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
