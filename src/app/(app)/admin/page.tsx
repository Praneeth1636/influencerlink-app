// Admin moderation surface. Role-gated at the page level (creators/brands
// land on / instead) and at the tRPC layer (every admin.* procedure
// re-validates via adminMiddleware). Defense in depth — a misconfigured
// route can never leak admin reads.

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AlertTriangle, ListChecks, Users } from "lucide-react";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import { AdminUserActions } from "./user-actions";
import { AdminReportActions } from "./report-actions";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [me] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!me || me.type !== "admin") redirect("/feed");

  const caller = await createTRPCServerCaller();
  const [stats, openReports, recentAudit, recentUsers] = await Promise.all([
    caller.admin.stats(),
    caller.admin.openReports({ limit: 25 }),
    caller.admin.recentAudit({ limit: 30 }),
    caller.admin.searchUsers({ query: "" })
  ]);

  return (
    <main className="min-h-screen bg-white p-6 font-sans text-[#111318] sm:p-10">
      <section className="mx-auto max-w-[1280px] space-y-8">
        <header className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.04)]">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9aa3b2] uppercase">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Moderation surface</h1>
          <p className="mt-1 text-sm text-[#687386]">
            Reports, users, and audit log. Be deliberate — every action here writes to the audit trail.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
            <Stat label="Total users" value={String(stats.users.total)} icon={Users} />
            <Stat label="Suspended" value={String(stats.users.suspended)} icon={AlertTriangle} tone="warn" />
            <Stat label="Creators" value={String(stats.users.creators)} icon={Users} />
            <Stat label="Brands" value={String(stats.users.brands)} icon={Users} />
            <Stat label="Open reports" value={String(stats.openReports)} icon={ListChecks} tone="warn" />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Open reports" eyebrow="Reports">
            {openReports.length === 0 ? (
              <p className="text-sm text-[#687386]">No open reports.</p>
            ) : (
              <ul className="space-y-3">
                {openReports.map(({ report, reporter }) => (
                  <li key={report.id} className="rounded-2xl border border-[#ececec] bg-[#fbfcfd] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9aa3b2] uppercase">
                          {report.targetType}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#687386]">{report.targetId.slice(0, 8)}…</p>
                        <p className="mt-2 text-sm font-semibold">{report.reason}</p>
                        <p className="mt-1 text-xs text-[#9aa3b2]">
                          by {reporter.email} · {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <AdminReportActions reportId={report.id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent activity" eyebrow="Audit log">
            <ul className="space-y-2 text-sm">
              {recentAudit.map(({ audit, actor }) => (
                <li key={audit.id} className="flex items-start gap-2 border-b border-[#f0f0f0] pb-2 last:border-0">
                  <span className="inline-flex shrink-0 rounded-full border border-[#ececec] bg-[#fbfcfd] px-2 py-0.5 font-mono text-[10px] text-[#687386]">
                    {audit.action}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-[#687386]">
                      {actor?.email ?? "system"} · {audit.entityType} · {new Date(audit.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        <Panel title="Users" eyebrow="Roster">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold tracking-[0.14em] text-[#9aa3b2] uppercase">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-t border-[#f0f0f0]">
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full border border-[#ececec] bg-[#fbfcfd] px-2 py-0.5 text-xs">
                        {u.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {u.suspendedAt ? (
                        <span className="rounded-full border border-[#fbd5d5] bg-[#fff2f2] px-2 py-0.5 text-xs text-[#a4262c]">
                          suspended
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#bfe8d0] bg-[#e8f8ef] px-2 py-0.5 text-xs text-[#147a3b]">
                          active
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-[#687386]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">
                      <AdminUserActions userId={u.id} suspended={!!u.suspendedAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#ececec] bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,0.03)]">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#9aa3b2] uppercase">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Users; tone?: "warn" }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 ${tone === "warn" ? "border-[#fce4cf]" : "border-[#ececec]"} shadow-[0_8px_24px_rgba(17,24,39,0.03)]`}
    >
      <div className="flex items-center justify-between text-[#9aa3b2]">
        <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
    </div>
  );
}
