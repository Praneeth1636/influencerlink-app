import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  MessageCircle,
  Play,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  WandSparkles
} from "lucide-react";
import { clerkLightAppearance } from "@/components/auth/clerk-appearance";
import { SignupProofBoard } from "@/components/features/signup/signup-proof-board";
import { NoiseBackground } from "@/components/ui/noise-background";
import { WobbleCard } from "@/components/ui/wobble-card";

const creatorTiles = [
  { name: "Sara Rivera", niche: "Beauty", metric: "2.4M reach", tone: "bg-[#F4B995]" },
  { name: "Maya Torres", niche: "Fitness", metric: "6.8% eng", tone: "bg-[#BEE5F6]" },
  { name: "Dev Shah", niche: "Food", metric: "8.1% eng", tone: "bg-[#F9D9C8]" },
  { name: "Lena Brooks", niche: "Fashion", metric: "$1.8K avg", tone: "bg-[#DDEFF8]" }
];

const trustedLogos = ["Glossier", "Resy", "Sephora", "Alo", "Linear", "Notion"];

const marketCards = [
  { label: "Verified creator profiles", value: "50K+", detail: "reach, audience, rates, and work samples" },
  { label: "Brand discovery", value: "300ms", detail: "search by niche, spend, age range, and platform" },
  { label: "Warm outreach", value: "2.8x", detail: "better reply rates with creator-fit context" }
];

const roleCards = [
  {
    icon: Users,
    title: "For creators",
    description: "Turn every win into proof: drops, campaigns, reach snapshots, rates, and open-to-collab signals.",
    tags: ["Portfolio", "Metrics", "Open to collabs"]
  },
  {
    icon: BriefcaseBusiness,
    title: "For brands",
    description:
      "Find creators by audience fit, budget, niche, engagement, and message them without leaving the workflow.",
    tags: ["Search", "DMs", "Shortlists"]
  },
  {
    icon: WandSparkles,
    title: "AI matching",
    description:
      "Paste a campaign brief and get creator matches with plain-English reasons instead of spreadsheet chaos.",
    tags: ["Briefs", "Match score", "Reasons"]
  }
];

const contentStream = [
  { title: "Skin launch reel", meta: "Sara Rivera · 2.1M reach", color: "bg-[#f5c3a7]" },
  { title: "GRWM tutorial", meta: "Maya Torres · 8.4% eng", color: "bg-[#c9eafa]" },
  { title: "Brand brief", meta: "Glossier · $8.5K", color: "bg-[#fff0e5]" },
  { title: "Creator shortlist", meta: "18 matches · 94% fit", color: "bg-[#dff1f8]" },
  { title: "Campaign post", meta: "Alo · live metrics", color: "bg-[#f9d9c8]" },
  { title: "Open to collabs", meta: "Lena Brooks · fashion", color: "bg-[#e7f6fb]" }
];

const workflowSteps = [
  { icon: ShieldCheck, title: "Verify", text: "Creators connect platforms and build a trusted profile." },
  { icon: Search, title: "Discover", text: "Brands filter by audience, niche, price, and creative style." },
  { icon: MessageCircle, title: "Message", text: "Outreach, briefs, replies, and follow-ups stay in one thread." },
  { icon: BarChart3, title: "Measure", text: "Campaign wins become reusable portfolio proof." }
];

export default function SignupPage() {
  return (
    <main className="creatorlink-auth-light min-h-screen overflow-hidden bg-[#fbfaf8] font-sans text-[#111318]">
      <header className="sticky top-0 z-50 border-b border-[#eceff3] bg-white/86 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center gap-5 px-4 sm:h-20 sm:gap-8 sm:px-6">
          <Link className="flex items-center gap-3" href="/" aria-label="Terrace">
            <span className="logoMark miniLogo bg-[#111318]" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">Terrace</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-[#303541] lg:flex">
            <NavItem label="Features" />
            <NavItem label="Creators" />
            <NavItem label="Brands" />
            <Link className="transition hover:text-[#D86B3D]" href="/pricing">
              Pricing
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              className="hidden h-12 items-center justify-center rounded-xl border border-[#e6e8ed] bg-white px-7 text-sm font-semibold shadow-sm transition hover:bg-[#f8fafc] sm:inline-flex"
              href="/login"
            >
              Sign In
            </Link>
            <NoiseBackground containerClassName="rounded-xl">
              <a
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-white px-5 text-sm font-semibold text-[#111318] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(17,24,39,0.10)] transition active:scale-[0.99] sm:h-11 sm:px-7"
                href="#signup-form"
              >
                Sign Up
              </a>
            </NoiseBackground>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-[1440px] gap-10 px-4 pt-12 pb-12 sm:gap-12 sm:px-6 sm:pt-16 lg:gap-16 lg:pt-20 lg:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 mx-auto h-[520px] max-w-6xl bg-[radial-gradient(circle_at_18%_28%,rgba(140,201,232,0.34),transparent_34%),radial-gradient(circle_at_78%_16%,rgba(246,176,132,0.32),transparent_30%)] blur-3xl"
        />
        <div
          aria-hidden
          className="creatorlink-float-slow pointer-events-none absolute top-28 left-10 hidden rounded-3xl border border-[#e8ebef] bg-white/82 px-4 py-3 text-sm font-semibold text-[#566174] shadow-[0_18px_46px_rgba(17,24,39,0.08)] backdrop-blur-xl xl:block"
        >
          7.2% avg engagement
        </div>
        <div
          aria-hidden
          className="creatorlink-float pointer-events-none absolute top-48 right-12 hidden rounded-3xl border border-[#e8ebef] bg-white/82 px-4 py-3 text-sm font-semibold text-[#566174] shadow-[0_18px_46px_rgba(17,24,39,0.08)] backdrop-blur-xl xl:block"
        >
          94% brand fit
        </div>

        <div className="creatorlink-animate-in relative z-10 mx-auto grid max-w-5xl justify-items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8ebef] bg-white/80 px-4 py-2 text-sm font-bold text-[#657082] shadow-sm sm:mb-8">
            <Sparkles className="h-4 w-4 text-[#D86B3D]" />
            The professional network for creator deals
          </div>

          <h1 className="max-w-5xl font-sans text-[clamp(42px,7vw,104px)] leading-[0.94] font-semibold tracking-[-0.075em]">
            Creator proof
            <br />
            for ambitious brands
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#687386] sm:mt-8 sm:text-xl">
            Terrace helps creators showcase verified reach and helps brands find the right people to hire, message, and
            brief — all in one calm, beautiful workspace.
          </p>

          <div className="mt-8 grid w-full max-w-sm gap-3 sm:mt-9 sm:w-auto sm:max-w-none sm:grid-cols-[auto_auto]">
            <NoiseBackground containerClassName="rounded-2xl">
              <a
                className="inline-flex h-[52px] w-full items-center justify-center rounded-[14px] bg-white px-9 text-base font-semibold text-[#111318] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(17,24,39,0.12)] transition active:scale-[0.99]"
                href="#signup-form"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </NoiseBackground>
            <Link
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl border border-[#e2e6ec] bg-white px-9 text-base font-semibold text-[#111318] shadow-sm transition hover:bg-[#f8fafc]"
              href="/login"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-sm font-medium text-[#9aa3b2]">Free to start. No credit card required.</p>
        </div>

        <div className="creatorlink-animate-in creatorlink-delay-1 relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-start">
          <div className="order-2 lg:order-1">
            <ProductPreview />
          </div>

          <section
            className="creatorlink-signup-form order-1 mx-auto w-full max-w-[410px] rounded-[24px] border border-[#e8ebef] bg-white/92 p-2.5 shadow-[0_24px_58px_rgba(17,24,39,0.09)] backdrop-blur-xl lg:sticky lg:top-28 lg:order-2"
            id="signup-form"
          >
            <div className="rounded-[19px] border border-[#f0f2f5] bg-white p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">Create your account</p>
                <h2 className="mt-2 font-sans text-[28px] leading-tight font-semibold tracking-[-0.045em]">
                  Join Terrace
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#687386]">
                  Choose creator or brand during onboarding after signup.
                </p>
              </div>
              <SignUp
                appearance={clerkLightAppearance}
                path="/signup"
                routing="path"
                signInUrl="/login"
                fallbackRedirectUrl="/onboarding"
              />
              <p className="mt-5 text-center text-sm text-[#7b8494]">
                Already have an account?{" "}
                <Link className="font-semibold text-[#111318] hover:underline" href="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>

        <MarketProof />
        <AudienceWobbleGrid />
        <SignupProofBoard />
        <ContentMarquee />
        <WorkflowStrip />

        <section className="creatorlink-animate-in creatorlink-delay-3 relative z-10 mx-auto grid w-full max-w-6xl gap-7 pt-2">
          <p className="text-center text-sm font-bold text-[#8a94a5]">Built for creator teams, agencies, and brands</p>
          <div className="grid grid-cols-2 gap-5 text-center text-xl font-black tracking-[-0.03em] text-[#9aa3b2] sm:grid-cols-3 lg:grid-cols-6">
            {trustedLogos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>
      </section>
      <SignupFooter />
    </main>
  );
}

function AudienceWobbleGrid() {
  return (
    <section className="creatorlink-animate-in creatorlink-delay-2 relative z-10 mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-3">
      {roleCards.map((card, index) => {
        const Icon = card.icon;
        const layoutClass = index === 0 ? "lg:col-span-2" : index === 2 ? "lg:col-span-3" : "lg:col-span-1";

        return (
          <WobbleCard containerClassName={`min-h-[320px] bg-[#101217] ${layoutClass}`} key={card.title}>
            <div className="flex h-full min-h-[260px] flex-col justify-between">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#f5b38e]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-6 max-w-2xl text-3xl leading-[1.02] font-semibold tracking-[-0.055em] text-white md:text-5xl">
                  {card.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">{card.description}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {card.tags.map((item) => (
                  <span
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/68"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </WobbleCard>
        );
      })}
    </section>
  );
}

function MarketProof() {
  return (
    <section className="creatorlink-animate-in creatorlink-delay-2 relative z-10 mx-auto grid w-full max-w-6xl gap-5 md:grid-cols-3">
      {marketCards.map((card) => (
        <article
          className="rounded-[24px] border border-[#e8ebef] bg-white/82 p-6 shadow-[0_20px_54px_rgba(17,24,39,0.06)] backdrop-blur-xl"
          key={card.label}
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-[#8a94a5] uppercase">{card.label}</p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[#111318]">{card.value}</p>
          <p className="mt-2 text-sm leading-6 text-[#687386]">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}

function ContentMarquee() {
  return (
    <section className="creatorlink-animate-in creatorlink-delay-2 relative z-10 mx-auto grid w-full max-w-[1440px] gap-7 overflow-hidden py-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#D86B3D] uppercase">What the feed becomes</p>
        <h2 className="mt-3 text-[clamp(34px,5vw,64px)] leading-[0.98] font-semibold tracking-[-0.065em]">
          Proof, jobs, drops, and wins in one place.
        </h2>
        <p className="mt-5 text-lg leading-8 text-[#687386]">
          A creator feed should feel like a living portfolio, not a boring profile database.
        </p>
      </div>

      <div className="creatorlink-marquee-mask -mx-6 overflow-hidden py-4">
        <div className="creatorlink-marquee flex w-max gap-4 px-6">
          {[...contentStream, ...contentStream].map((item, index) => (
            <article
              className={`${item.color} grid h-52 w-56 shrink-0 content-between rounded-[26px] border border-white/70 p-5 shadow-[0_18px_46px_rgba(17,24,39,0.08)]`}
              key={`${item.title}-${index}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-xs font-semibold">
                  {index % 2 === 0 ? <Video className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#566174]">Live</span>
              </div>
              <div>
                <h3 className="text-xl leading-6 font-semibold tracking-[-0.045em]">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold text-[#566174]">{item.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowStrip() {
  return (
    <section className="creatorlink-animate-in creatorlink-delay-3 relative z-10 mx-auto grid w-full max-w-6xl gap-6 rounded-[30px] border border-[#e8ebef] bg-white/82 p-5 shadow-[0_24px_64px_rgba(17,24,39,0.07)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr] lg:p-7">
      <div className="rounded-[24px] bg-[#0b0d12] p-7 text-white">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#8CC9E8] uppercase">How Terrace works</p>
        <h2 className="mt-4 text-4xl leading-[1] font-semibold tracking-[-0.06em]">
          From profile proof to paid partnership.
        </h2>
        <p className="mt-5 text-sm leading-6 text-white/62">
          Creators and brands share one network, one feed, one message loop, and one source of verified campaign truth.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            ["Profile", "verified metrics"],
            ["Search", "audience fit"],
            ["Deal", "brief to DM"]
          ].map(([label, detail]) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4" key={label}>
              <p className="text-lg font-semibold tracking-[-0.04em] text-white">{label}</p>
              <p className="mt-1 text-xs leading-5 text-white/50">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid content-center gap-4">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <article
              className="group grid gap-4 rounded-[22px] border border-[#e8ebef] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(17,24,39,0.08)] sm:grid-cols-[52px_minmax(0,1fr)]"
              key={step.title}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8fc] text-[#111318] transition group-hover:bg-[#fff0e8]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.045em]">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#687386]">{step.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SignupFooter() {
  return (
    <footer className="border-t border-[#eceff3] bg-white/70">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-8 text-sm text-[#687386] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-[#111318]">Terrace</p>
          <p className="mt-1">Creator hiring, verified proof, and brand outreach in one network.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
          <Link className="transition hover:text-[#111318]" href="/about">
            About
          </Link>
          <Link className="transition hover:text-[#111318]" href="/contact">
            Contact
          </Link>
          <Link className="transition hover:text-[#111318]" href="/pricing">
            Pricing
          </Link>
          <Link className="transition hover:text-[#111318]" href="/login">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function NavItem({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 font-semibold transition hover:text-[#D86B3D]" type="button">
      {label}
      <ChevronDown className="h-4 w-4 text-[#7b8494]" />
    </button>
  );
}

function ProductPreview() {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#171a20] bg-[#080a0f] p-3 shadow-[0_34px_90px_rgba(17,24,39,0.18)] sm:rounded-[28px] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[72px_minmax(0,1fr)_260px]">
        <aside className="hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 lg:grid">
          <div className="logoMark miniLogo bg-transparent" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className="mt-5 grid gap-4 text-white/48">
            <Search className="h-5 w-5" />
            <BriefcaseBusiness className="h-5 w-5" />
            <BadgeCheck className="h-5 w-5" />
            <Radio className="h-5 w-5" />
          </div>
        </aside>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            {creatorTiles.map((tile, index) => (
              <article
                className={`creatorlink-float-card min-h-36 rounded-2xl p-4 sm:min-h-44 ${tile.tone}`}
                key={tile.name}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-sm font-black text-[#111318]">
                    {tile.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.04em] text-[#111318]">{tile.name}</p>
                    <p className="text-sm font-bold text-[#373d48]/70">{tile.niche}</p>
                    <p className="mt-3 rounded-full bg-white/70 px-3 py-1.5 text-xs font-black text-[#111318]">
                      {tile.metric}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black tracking-[0.16em] text-white/45 uppercase">AI match brief</p>
                <p className="mt-1 text-lg font-black text-white">Beauty creators under $3K</p>
              </div>
              <span className="rounded-full bg-[#8CC9E8] px-3 py-1.5 text-xs font-semibold text-[#071018]">94%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="creatorlink-progress h-full w-[78%] rounded-full bg-[#D86B3D]" />
            </div>
          </div>
        </div>

        <aside className="grid content-between rounded-2xl bg-white p-4 text-[#111318]">
          <div className="rounded-2xl bg-[#eef8fc] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black">Glossier launch</p>
              <Play className="h-5 w-5 text-[#D86B3D]" />
            </div>
            <p className="mt-8 text-4xl font-black tracking-[-0.06em]">2.1M</p>
            <p className="text-sm font-bold text-[#687386]">verified reach</p>
          </div>
          <div className="mt-4 rounded-2xl bg-[#fff0e8] p-4">
            <p className="text-sm font-black">Creator response</p>
            <p className="mt-8 text-4xl font-black tracking-[-0.06em]">7h</p>
            <p className="text-sm font-bold text-[#687386]">median reply time</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
