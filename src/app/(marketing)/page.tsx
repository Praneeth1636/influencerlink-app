import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, Camera, MessageCircle, Search, Sparkles } from "lucide-react";
import { TerraceBentoGrid } from "@/components/features/marketing/terrace-bento-grid";
import { createTRPCServerCaller } from "@/lib/trpc/server";

function formatReach(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M reach`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K reach`;
  return `${n} reach`;
}

const heroCards = [
  { name: "Sara Rivera", role: "Beauty creator", metric: "2.4M reach", accent: "bg-[#f8d3c0]" },
  { name: "Maya Chen", role: "Lifestyle photo", metric: "8.1% eng", accent: "bg-[#dff1fb]" },
  { name: "Aera Studio", role: "Skincare brand", metric: "6 open briefs", accent: "bg-[#f6e6dd]" }
];

const features = [
  {
    icon: BadgeCheck,
    title: "Creator profiles",
    text: "Verified metrics, past brand work, rates, and content proof in one polished public page."
  },
  {
    icon: Search,
    title: "Brand discovery",
    text: "Search creators by niche, reach, engagement, location, audience fit, and collaboration status."
  },
  {
    icon: MessageCircle,
    title: "DMs and briefs",
    text: "Move from discovery to outreach without switching tools or losing context."
  },
  {
    icon: BarChart3,
    title: "Proof feed",
    text: "Creators post campaign wins, drops, milestones, and open-to-collab signals."
  }
];

// Placeholder rows shown only when the DB has no real creators yet. As soon
// as creators sign up + finish onboarding, the live list replaces this.
const fallbackCreatorRows = [
  { name: "Maya Chen", niche: "Photography", reach: "740K reach", status: "Open" },
  { name: "Leo Martin", niche: "Tech reviews", reach: "410K reach", status: "Booked" },
  { name: "Sara Okafor", niche: "Editorial fashion", reach: "1.2M reach", status: "Open" }
];

export default async function LandingPage() {
  // Pull real creators for the "Top matches this week" section. Public
  // procedure, no auth — safe to call from the marketing landing.
  const caller = await createTRPCServerCaller();
  const liveCreators = await caller.creator
    .list({ limit: 3 })
    .then((r) =>
      r.items.map((row) => ({
        name: row.creator.displayName,
        niche: row.creator.niches[0] ?? "Creator",
        reach: formatReach(row.aggregate?.totalReach ?? 0),
        status: row.creator.openToCollabs ? "Open" : "Booked"
      }))
    )
    .catch(() => []);

  const creatorRows = liveCreators.length ? liveCreators : fallbackCreatorRows;

  return (
    <div className="min-h-screen bg-white font-sans text-[#111318]">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[560px] max-w-7xl bg-[radial-gradient(circle_at_18%_18%,rgba(140,201,232,0.22),transparent_32%),radial-gradient(circle_at_82%_14%,rgba(216,107,61,0.16),transparent_30%)] blur-3xl"
        />
        <div className="relative mx-auto grid max-w-[1440px] gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:py-24">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ececec] bg-white px-4 py-2 text-sm font-semibold text-[#687386] shadow-sm">
              <Sparkles className="h-4 w-4 text-[#D86B3D]" />
              The professional network for creator deals
            </div>
            <h1 className="text-[clamp(48px,8vw,118px)] leading-[0.9] font-semibold tracking-[-0.085em]">
              Creator proof
              <br />
              meets brand hiring.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#687386] sm:text-xl">
              Terrace is where creators show verified reach, brands find the right partners, and both sides move from
              feed signal to collaboration in one calm workspace.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#111318] px-7 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(17,24,39,0.14)] transition hover:bg-[#1d222b]"
                href="/signup"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#ececec] bg-white px-7 text-sm font-semibold text-[#111318] transition hover:border-[#dce3ea]"
                href="/feed"
              >
                View product
              </Link>
            </div>
          </div>

          <div className="rounded-[34px] border border-[#ececec] bg-white p-4 shadow-[0_28px_80px_rgba(17,24,39,0.08)]">
            <div className="rounded-[28px] border border-[#ececec] bg-[#fbfcfd] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#9aa3b2] uppercase">Live network</p>
                <span className="rounded-full border border-[#d7edf8] bg-[#edf8ff] px-3 py-1 text-xs font-semibold text-[#2f83b7]">
                  AI match ready
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {heroCards.map((card) => (
                  <article className="rounded-[22px] border border-[#ececec] bg-white p-4" key={card.name}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-12 w-12 place-items-center rounded-full ${card.accent} text-sm font-semibold`}
                      >
                        {card.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{card.name}</h3>
                        <p className="text-sm text-[#687386]">{card.role}</p>
                      </div>
                      <span className="ml-auto rounded-full border border-[#ececec] px-3 py-1 text-xs font-semibold text-[#4b5563]">
                        {card.metric}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-4 overflow-hidden rounded-[24px] bg-[#111318] p-5 text-white">
                <p className="text-xs font-semibold tracking-[0.18em] text-[#f5b38e] uppercase">Brand brief</p>
                <p className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.05em]">
                  Find beauty creators for women 18-30, $2K-$4K, strong TikTok demos.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {["94% fit", "18 matches", "4 warm DMs"].map((item) => (
                    <span
                      className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white/72"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        <div className="grid gap-4 rounded-[30px] border border-[#ececec] bg-white p-4 shadow-[0_18px_54px_rgba(17,24,39,0.04)] sm:grid-cols-4">
          {[
            ["4.3M", "verified reach tracked"],
            ["300ms", "creator search target"],
            ["2.8x", "warmer outreach"],
            ["100%", "shared creator-brand UI"]
          ].map(([value, label]) => (
            <div className="rounded-[22px] border border-[#ececec] bg-[#fbfcfd] p-5" key={label}>
              <p className="text-3xl font-semibold tracking-[-0.055em]">{value}</p>
              <p className="mt-1 text-sm text-[#687386]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <TerraceBentoGrid />

      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">
            The feed is the product
          </p>
          <h2 className="mt-3 max-w-xl text-4xl leading-tight font-semibold tracking-[-0.06em] sm:text-6xl">
            Built like a social network, useful like a hiring tool.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#687386]">
            Creators post career proof. Brands discover who is active, who is trusted, and who fits the campaign.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                className="rounded-[26px] border border-[#ececec] bg-white p-6 shadow-[0_14px_40px_rgba(17,24,39,0.035)]"
                key={feature.title}
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff4ee] text-[#D86B3D]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#687386]">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6">
        <div className="grid overflow-hidden rounded-[34px] border border-[#ececec] bg-white shadow-[0_28px_80px_rgba(17,24,39,0.07)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">
              Creators brands can scan
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Top matches this week</h2>
            <div className="mt-8 grid gap-3">
              {creatorRows.map(({ name, niche, reach, status }) => (
                <div
                  className="flex items-center gap-3 rounded-[22px] border border-[#ececec] bg-[#fbfcfd] p-4"
                  key={name}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#dff1fb] text-xs font-semibold">
                    {name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-[#687386]">
                      {niche} · {reach}
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-[#d7eddc] bg-[#effaf3] px-3 py-1 text-xs font-semibold text-[#287944]">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[420px] bg-[#111318] p-8 text-white sm:p-10">
            <Camera className="h-6 w-6 text-[#f5b38e]" />
            <h3 className="mt-8 max-w-lg text-5xl leading-[0.98] font-semibold tracking-[-0.07em]">
              Every win becomes a reusable signal.
            </h3>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              Verified drops, profile views, application history, and brand replies become the proof layer creators can
              carry into every deal.
            </p>
            <Link
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#111318]"
              href="/signup"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
