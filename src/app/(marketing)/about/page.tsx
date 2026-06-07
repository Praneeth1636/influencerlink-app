import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, MessageCircle, Search, Sparkles } from "lucide-react";

const principles = [
  {
    icon: BadgeCheck,
    title: "Proof over vanity",
    text: "Creator profiles should show audience quality, campaign performance, response behavior, and work samples."
  },
  {
    icon: Search,
    title: "Discovery with context",
    text: "Brands should search by the things that matter: niche, audience fit, engagement, budget, and availability."
  },
  {
    icon: MessageCircle,
    title: "One collaboration loop",
    text: "Feed signal, outreach, briefs, applications, and messages should feel like one product."
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-6xl bg-[radial-gradient(circle_at_24%_20%,rgba(140,201,232,0.22),transparent_34%),radial-gradient(circle_at_76%_18%,rgba(216,107,61,0.13),transparent_32%)] blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 text-center">
          <Link className="logoMark authLogo mx-auto bg-[#37352f]" href="/" aria-label="Terrace">
            <span />
            <span />
            <span />
          </Link>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">About Terrace</p>
            <h1 className="mx-auto mt-4 max-w-5xl text-[clamp(44px,8vw,96px)] leading-[0.93] font-semibold tracking-[-0.08em]">
              A professional network for creator-brand work.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#787774]">
              Terrace turns creator proof into a hiring surface. Creators build a living media kit, brands find the
              right people, and collaboration starts from a feed that actually means something.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article
                className="rounded-[28px] border border-[#e9e9e7] bg-white p-7 shadow-[0_18px_46px_rgba(17,24,39,0.04)]"
                key={item.title}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4ee] text-[#D86B3D]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-7 text-2xl font-semibold tracking-[-0.045em]">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#787774]">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6">
        <div className="grid overflow-hidden rounded-[34px] border border-[#e9e9e7] bg-white shadow-[0_28px_80px_rgba(17,24,39,0.07)] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-[#37352f] p-8 text-white sm:p-10">
            <Sparkles className="h-6 w-6 text-[#f5b38e]" />
            <h2 className="mt-8 text-5xl leading-[0.98] font-semibold tracking-[-0.07em]">The feed is the moat.</h2>
            <p className="mt-5 text-sm leading-7 text-white/62">
              A profile database can be copied. A network of verified wins, follows, replies, and reputation gets
              stronger every day.
            </p>
            <Link
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#37352f]"
              href="/feed"
            >
              Open feed
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 p-6 sm:p-8">
            {[
              ["Creators", "Profiles, posts, milestones, metrics, applications, DMs."],
              ["Brands", "Company pages, search, briefs, shortlists, DMs, team workflows."],
              ["AI layer", "Brief matching, profile suggestions, DM drafts, and smart job descriptions."]
            ].map(([title, text]) => (
              <article className="rounded-[24px] border border-[#e9e9e7] bg-[#fbfbfa] p-6" key={title}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#edf8ff] text-[#2f83b7]">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </span>
                  <h3 className="text-xl font-semibold tracking-[-0.04em]">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#787774]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
