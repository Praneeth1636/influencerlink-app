"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  Command,
  MessageCircle,
  Search,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { TerraceBentoGrid } from "@/components/features/marketing/terrace-bento-grid";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import { cn } from "@/lib/utils";

export type LandingCreatorRow = {
  name: string;
  niche: string;
  reach: string;
  status: string;
};

const boardMessages = [
  "BRAND BRIEF LIVE\n18 CREATORS MATCHED\n94% FIT",
  "CREATOR RATE VERIFIED\nREPLY TIME 2H\nREADY THIS WEEK",
  "CAMPAIGN PROOF SYNCED\nTIKTOK + IG\nBRAND SAFE"
];

const searchPrompts = [
  "Beauty creators in LA with strong routine videos",
  "UGC skincare creators, $2K to $4K, US audience",
  "Lifestyle creators with verified engagement over 7%"
];

const heroVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
    y: 0
  }
};

const staggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.08, staggerChildren: 0.09 }
  }
};

const proofStats = [
  ["4.3M", "verified reach tracked"],
  ["18", "creator matches"],
  ["94%", "brief fit"],
  ["2h", "median reply"]
];

const featureCards = [
  {
    icon: BadgeCheck,
    title: "Proof-first profiles",
    text: "Creators carry verified reach, rates, past work, and campaign proof into every brand conversation."
  },
  {
    icon: Search,
    title: "Search that feels alive",
    text: "Brands describe the campaign, Terrace turns the signal into creator matches, budget fit, and outreach."
  },
  {
    icon: MessageCircle,
    title: "Briefs become threads",
    text: "Discovery, shortlist, pitch, and collaboration messages stay connected to the same creator proof."
  },
  {
    icon: TrendingUp,
    title: "Signals keep moving",
    text: "Campaign wins, social metrics, saved jobs, and open-to-work status keep the marketplace fresh."
  }
];

export function TerraceLandingExperience({ creatorRows }: { creatorRows: LandingCreatorRow[] }) {
  const [boardIndex, setBoardIndex] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const boardTimer = window.setInterval(() => setBoardIndex((index) => (index + 1) % boardMessages.length), 5200);
    const promptTimer = window.setInterval(() => setPromptIndex((index) => (index + 1) % searchPrompts.length), 3800);

    return () => {
      window.clearInterval(boardTimer);
      window.clearInterval(promptTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcfd] font-sans text-[#15171c]">
      <section className="relative overflow-hidden pt-10 sm:pt-12">
        <DiagonalLineBackground reducedMotion={prefersReducedMotion} />
        <motion.div
          animate="visible"
          className="relative mx-auto flex max-w-[1680px] flex-col items-center px-4 pb-0 text-center sm:px-6 lg:px-10"
          initial="hidden"
          variants={staggerVariants}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e6e8ec] bg-[#fbfcfd]/90 px-4 py-2 text-sm font-semibold text-[#667085] shadow-[0_16px_44px_rgba(17,24,39,0.08)] backdrop-blur"
            variants={heroVariants}
          >
            <Sparkles className="h-4 w-4 text-[#D86B3D]" />
            Creator proof, brand hiring, one Terrace
          </motion.div>

          <motion.h1
            className="max-w-5xl text-[clamp(44px,6.8vw,96px)] leading-[0.9] font-semibold tracking-[-0.07em] text-[#23272f]"
            variants={heroVariants}
          >
            Creator deals,
            <br />
            verified.
          </motion.h1>

          <motion.p className="mt-5 max-w-2xl text-base leading-7 text-[#667085] sm:text-lg" variants={heroVariants}>
            Terrace turns creator proof, brand briefs, social metrics, and campaign messages into one marketplace that
            feels calm enough to use every day.
          </motion.p>

          <motion.div className="mt-6 flex flex-col gap-3 sm:flex-row" variants={heroVariants}>
            <Link
              className="group inline-flex h-12 items-center justify-center rounded-full bg-[#15171c] px-7 text-sm font-semibold text-[#fbfcfd] shadow-[0_18px_46px_rgba(17,24,39,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#282d36]"
              href="/signup"
            >
              Start free
              <ArrowRight className="ml-2 h-4 w-4 transition duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#dfe4eb] bg-[#fbfcfd] px-7 text-sm font-semibold text-[#23272f] shadow-[0_12px_30px_rgba(17,24,39,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#cfeffc]"
              href="/feed"
            >
              View product
            </Link>
          </motion.div>

          <motion.div
            className="relative mt-7 w-full max-w-[1120px] overflow-visible xl:max-w-[1240px]"
            initial={{ opacity: 1, rotateX: 0, y: 0 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductShowcase creatorRows={creatorRows} prompt={searchPrompts[promptIndex]} />
          </motion.div>
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-4 pt-10 pb-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
          <SignalBoard message={boardMessages[boardIndex]} />
          <CreatorMarketsPanel reducedMotion={prefersReducedMotion} />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                className="group rounded-[26px] border border-[#e8ebef] bg-[#fbfcfd] p-6 shadow-[0_18px_52px_rgba(17,24,39,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#cfeffc]"
                initial={{ opacity: 0, y: 20 }}
                key={feature.title}
                transition={{ delay: index * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-80px" }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#f5d5c3] bg-[#fff3ec] text-[#D86B3D] transition duration-300 group-hover:rotate-3">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[#23272f]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{feature.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <TerraceBentoGrid />

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid overflow-hidden rounded-[34px] border border-[#e6e8ec] bg-[#15171c] shadow-[0_30px_90px_rgba(17,24,39,0.16)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="p-8 text-[#fbfcfd] sm:p-10 lg:p-12">
            <Camera className="h-6 w-6 text-[#f7a777]" />
            <h2 className="mt-8 max-w-lg text-5xl leading-[0.96] font-semibold tracking-[-0.065em] sm:text-6xl">
              Every campaign win becomes reusable proof.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#d5d9df]/70">
              Verified drops, profile views, application history, and brand replies become the layer creators can carry
              into every deal.
            </p>
            <Link
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#fbfcfd] px-6 text-sm font-semibold text-[#15171c] transition duration-300 hover:-translate-y-0.5"
              href="/signup"
            >
              Create account
            </Link>
          </div>
          <div className="relative min-h-[520px] overflow-hidden bg-[#1e232b] p-6 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(216,107,61,0.18),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(140,201,232,0.2),transparent_28%)]" />
            <div className="relative grid gap-3">
              {creatorRows.map((creator, index) => (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#fbfcfd]/[0.06] p-4 text-[#fbfcfd] backdrop-blur"
                  initial={{ opacity: 0, x: 28 }}
                  key={creator.name}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <InitialsAvatar name={creator.name} className="bg-[#cfeffc] text-[#1c4458]" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{creator.name}</p>
                    <p className="text-sm text-[#d5d9df]/68">
                      {creator.niche} / {creator.reach}
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-[#94d4f3]/20 bg-[#94d4f3]/10 px-3 py-1 text-xs font-semibold text-[#cfeffc]">
                    {creator.status}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="absolute right-8 bottom-8 left-8 rounded-[28px] border border-white/10 bg-[#fbfcfd] p-5 text-[#23272f] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#D86B3D] uppercase">Saved shortlist</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {["Rate verified", "Brief fit high", "DM ready"].map((item) => (
                  <span
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#e6e8ec] bg-[#fbfcfd] px-3 py-2 text-xs font-semibold text-[#475467]"
                    key={item}
                  >
                    <Check className="h-3.5 w-3.5 text-[#D86B3D]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DiagonalLineBackground({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(140,201,232,0.26),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(216,107,61,0.18),transparent_28%)]" />
      <div
        className="absolute -inset-x-28 -top-24 h-[760px] opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(48deg, transparent 0 92px, rgba(143,154,169,0.17) 92px 93px, transparent 93px 186px)"
        }}
      />
      <motion.div
        className="absolute top-40 right-[16%] h-px w-24 rotate-45 bg-[#D86B3D]"
        animate={reducedMotion ? { opacity: 0.7 } : { opacity: [0.2, 1, 0.2], x: [0, 18, 0] }}
        transition={{ duration: 5.4, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}

function ProductShowcase({ creatorRows, prompt }: { creatorRows: LandingCreatorRow[]; prompt: string }) {
  return (
    <div className="relative mx-auto w-full">
      <div className="overflow-hidden rounded-t-[34px] border border-[#e6e8ec] bg-[#f3f5f7] p-3 shadow-[0_24px_76px_rgba(17,24,39,0.13)] sm:p-4 lg:p-5">
        <div className="rounded-t-[26px] border border-[#e0e4ea] bg-[#fbfcfd] p-3 lg:p-4">
          <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-[#d2d8e0]" />
          <div className="max-h-[360px] overflow-hidden rounded-[20px] border border-[#e6e8ec] bg-[#fbfcfd] text-left xl:max-h-[390px]">
            <div className="flex items-center justify-between border-b border-[#e6e8ec] p-3 lg:p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#15171c] text-xs font-semibold text-[#fbfcfd]">
                  T
                </span>
                <span className="text-sm font-semibold text-[#23272f]">Terrace</span>
              </div>
              <div className="hidden w-full max-w-sm items-center gap-3 rounded-full border border-[#e6e8ec] bg-[#f7f9fb] px-4 py-2 text-sm text-[#667085] md:flex lg:max-w-lg">
                <Search className="h-4 w-4 text-[#D86B3D]" />
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 6 }}
                  key={prompt}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {prompt}
                </motion.span>
              </div>
              <Command className="h-5 w-5 text-[#98a2b3]" />
            </div>

            <div className="grid min-h-[340px] bg-[#f7f9fb] lg:grid-cols-[220px_1fr] xl:grid-cols-[250px_1fr]">
              <aside className="hidden border-r border-[#e6e8ec] bg-[#fbfcfd] p-3 lg:block lg:p-4">
                {["Feed", "Search", "Briefs", "Messages"].map((item, index) => (
                  <div
                    className={cn(
                      "mb-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#667085]",
                      index === 1 && "bg-[#fff3ec] text-[#D86B3D]"
                    )}
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </aside>

              <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[1fr_292px] lg:gap-4 lg:p-5 xl:grid-cols-[1fr_330px]">
                <div className="grid gap-3">
                  {creatorRows.map((creator, index) => (
                    <motion.div
                      className="rounded-[18px] border border-[#e6e8ec] bg-[#fbfcfd] p-3 shadow-[0_10px_26px_rgba(17,24,39,0.04)] lg:p-4"
                      initial={{ opacity: 0, y: 12 }}
                      key={creator.name}
                      transition={{ delay: 0.42 + index * 0.08, duration: 0.42 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={creator.name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#23272f]">{creator.name}</p>
                          <p className="text-sm text-[#667085]">
                            {creator.niche} / {creator.reach}
                          </p>
                        </div>
                        <span className="ml-auto rounded-full border border-[#cfeffc] bg-[#f1faff] px-3 py-1 text-xs font-semibold text-[#2b8fc4]">
                          {creator.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-[20px] border border-[#e6e8ec] bg-[#15171c] p-4 text-[#fbfcfd] lg:p-5">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#f7a777] uppercase">Brief scan</p>
                  <p className="mt-2 text-lg leading-tight font-semibold tracking-[-0.05em] lg:text-xl">
                    Beauty creators, women 18-30, strong TikTok demos.
                  </p>
                  <div className="mt-3 grid gap-1.5">
                    {proofStats.map(([value, label]) => (
                      <div
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#fbfcfd]/[0.07] px-3 py-2 text-xs"
                        key={label}
                      >
                        <span className="text-[#d5d9df]/70">{label}</span>
                        <span className="font-semibold text-[#fbfcfd]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-3 w-[86%] rounded-b-[26px] border-x border-b border-[#e0e4ea] bg-[#e9edf2]" />
      </div>
    </div>
  );
}

function SignalBoard({ message }: { message: string }) {
  return (
    <div className="grid min-h-[420px] content-between rounded-[30px] border border-[#e6e8ec] bg-[#15171c] p-6 text-[#fbfcfd] shadow-[0_20px_58px_rgba(17,24,39,0.13)] sm:p-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-[#f7a777] uppercase">Live signal board</p>
        <h2 className="mt-3 max-w-md text-3xl leading-tight font-semibold tracking-[-0.055em] sm:text-4xl">
          Live deal signals, not another spreadsheet.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#d5d9df]/68">
          Brief activity, creator readiness, and proof updates stay visible as the marketplace moves.
        </p>
      </div>
      <TextFlippingBoard
        characterClassName="h-8 min-w-6 rounded-md border-white/10 bg-[#fbfcfd]/[0.07] px-1.5 text-sm text-[#fbfcfd] sm:h-9 sm:min-w-7 sm:text-base"
        className="mt-7 rounded-[22px] border-white/10 bg-[#20242c] p-3 shadow-none"
        key={message}
        text={message}
      />
    </div>
  );
}

function CreatorMarketsPanel({ reducedMotion }: { reducedMotion: boolean | null }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const shineX = useTransform(x, [-180, 180], ["18%", "82%"]);
  const shineY = useTransform(y, [-180, 180], ["18%", "72%"]);
  const marketBackground = useTransform(
    [shineX, shineY],
    ([sx, sy]) =>
      `radial-gradient(circle at ${sx} ${sy}, rgba(140,201,232,0.22), transparent 34%), radial-gradient(circle at 20% 78%, rgba(216,107,61,0.12), transparent 28%)`
  );

  const markets = [
    { city: "Los Angeles", niche: "Beauty", fit: "96%", tone: "bg-[#fff3ec] text-[#9d4c27]" },
    { city: "New York", niche: "Fashion", fit: "91%", tone: "bg-[#eff8ff] text-[#246b92]" },
    { city: "London", niche: "Lifestyle", fit: "88%", tone: "bg-[#f6f7f9] text-[#475467]" },
    { city: "Toronto", niche: "Wellness", fit: "84%", tone: "bg-[#fff8e8] text-[#886018]" }
  ];

  return (
    <motion.div
      className="relative min-h-[420px] overflow-hidden rounded-[30px] border border-[#e6e8ec] bg-[#fbfcfd] p-6 shadow-[0_18px_52px_rgba(17,24,39,0.06)] sm:p-8"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background: reducedMotion
            ? "radial-gradient(circle at 70% 22%, rgba(140,201,232,0.18), transparent 34%)"
            : marketBackground
        }}
      />

      <div className="relative">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#D86B3D] uppercase">Creator markets</p>
        <h2 className="mt-3 max-w-md text-3xl leading-tight font-semibold tracking-[-0.055em] text-[#23272f] sm:text-4xl">
          See where the right creators are active.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#667085]">
          Market signals stay readable: location, niche, match fit, and outreach readiness.
        </p>
      </div>

      <div className="relative mt-7 grid gap-3">
        {markets.map((market, index) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-[18px] border border-[#e6e8ec] bg-[#fbfcfd]/90 p-3 shadow-[0_10px_28px_rgba(17,24,39,0.04)]"
            initial={{ opacity: 0, x: 16 }}
            key={market.city}
            transition={{ delay: index * 0.08, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xs font-semibold",
                market.tone
              )}
            >
              {market.fit}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[#23272f]">{market.city}</span>
              <span className="block truncate text-sm text-[#667085]">{market.niche} creators trending</span>
            </span>
            <span className="rounded-full border border-[#cfeffc] bg-[#f1faff] px-3 py-1 text-xs font-semibold text-[#2b8fc4]">
              Ready
            </span>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-5 rounded-[22px] border border-[#e6e8ec] bg-[#15171c] p-4 text-[#fbfcfd]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold tracking-[0.16em] text-[#f7a777] uppercase">Search heat</span>
          <span className="rounded-full bg-[#fbfcfd]/10 px-3 py-1 text-xs font-semibold text-[#d5d9df]">Live</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Beauty", "UGC", "Skincare"].map((tag, index) => (
            <motion.span
              animate={reducedMotion ? { opacity: 1 } : { opacity: [0.72, 1, 0.72] }}
              className="rounded-2xl border border-white/10 bg-[#fbfcfd]/[0.07] px-3 py-2 text-center text-xs font-semibold text-[#d5d9df]"
              key={tag}
              transition={{ delay: index * 0.2, duration: 2.6, repeat: Infinity }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f7c7ad] text-xs font-semibold text-[#7a3419]",
        className
      )}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </div>
  );
}
