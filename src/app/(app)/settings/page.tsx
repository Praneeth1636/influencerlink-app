import Link from "next/link";
import { Bell, CreditCard, Shield, UserRound } from "lucide-react";
import { resolveAppRole } from "@/lib/auth/role";

function getSections(profileHref: string) {
  return [
    {
      title: "Profile settings",
      body: "Edit creator or company identity, headline, niches, public rates, and collaboration status.",
      href: profileHref,
      icon: UserRound
    },
    {
      title: "Billing",
      body: "Manage plan, usage, invoices, and Stripe customer portal access.",
      href: "/settings/billing",
      icon: CreditCard
    },
    {
      title: "Notifications",
      body: "Control email, product, and brief-match notifications.",
      href: "/notifications",
      icon: Bell
    },
    {
      title: "Trust and safety",
      body: "Manage privacy, blocked accounts, reports, and verification preferences.",
      href: "/contact",
      icon: Shield
    }
  ];
}

export default async function SettingsPage() {
  const role = await resolveAppRole();
  const sections = getSections(role === "brand" ? "/dashboard" : "/creator");

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="sticky top-0 z-40 border-b border-[#e9e9e7] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[980px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9b9a97] uppercase">Settings</p>
            <p className="hidden text-sm text-[#787774] sm:block">
              Account, billing, notifications, and trust controls
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[980px] gap-6 px-5 py-7">
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Settings</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                className="rounded-[24px] border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)] transition hover:-translate-y-0.5 hover:border-[#f3d5c4]"
                href={section.href}
                key={section.title}
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#fbfbfa] text-[#e08550] ring-1 ring-[#e9e9e7]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.035em]">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#787774]">{section.body}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
