"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Heart, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Magnetic } from "@/components/features/marketing/landing-motion";
import { AttractButton } from "@/components/ui/attract-button";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import { cn } from "@/lib/utils";

export type LandingCreatorRow = {
  name: string;
  niche: string;
  reach: string;
  status: string;
};

/* Terrace palette: pure white canvas, warm ink #37352f, light orange
 * #ED9568 and light blue #8CC9E8 as the two accents. */
const easeOutQuint = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutQuint }
  }
};

/* Masked line reveal: the line slides up from behind its own baseline. */
const lineReveal: Variants = {
  hidden: { y: "112%" },
  visible: {
    y: 0,
    transition: { duration: 0.85, ease: easeOutQuint }
  }
};

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.11 } }
};

type HeroCard =
  | {
      kind: "post";
      platform: "Instagram" | "TikTok";
      handle: string;
      name: string;
      caption: string;
      rotate: number;
    }
  | { kind: "profile"; rotate: number };

const heroCards: HeroCard[] = [
  {
    kind: "post",
    platform: "Instagram",
    handle: "@amara.films",
    name: "Amara Films",
    caption: "Golden hour set. Full breakdown in the slides.",
    rotate: -5
  },
  { kind: "profile", rotate: 3.5 },
  {
    kind: "post",
    platform: "TikTok",
    handle: "@goldenhourgrace",
    name: "Golden Hour Grace",
    caption: "The three transitions everyone keeps asking about.",
    rotate: -2
  }
];

const platformTint: Record<string, string> = {
  Instagram: "bg-[#fff3ec] text-[#e08550]",
  TikTok: "bg-[#37352f] text-white",
  YouTube: "bg-[#f1faff] text-[#2b8fc4]"
};

export function TerraceLandingExperience({ creatorRows }: { creatorRows: LandingCreatorRow[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white font-sans text-[#37352f]">
      <Hero creatorRows={creatorRows} reducedMotion={prefersReducedMotion} />
      <CreatorStory reducedMotion={prefersReducedMotion} />
      <BrandStory reducedMotion={prefersReducedMotion} />
      <ProofSection creatorRows={creatorRows} reducedMotion={prefersReducedMotion} />
      <ClosingCta />
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

function Hero({ creatorRows, reducedMotion }: { creatorRows: LandingCreatorRow[]; reducedMotion: boolean | null }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const seated = creatorRows.slice(0, 3);

  return (
    <section className="relative overflow-hidden">
      {/* Soft orange + blue wash with the diagonal-line texture. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 620px at 78% -10%, rgba(237,149,104,0.13), transparent 62%), radial-gradient(700px 420px at 8% 108%, rgba(140,201,232,0.18), transparent 60%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-28 -top-24 h-[680px] opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(48deg, transparent 0 92px, rgba(143,154,169,0.14) 92px 93px, transparent 93px 186px)"
        }}
      />

      <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-5 pt-14 pb-12 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-6 lg:pt-20 lg:pb-16">
        <motion.div animate="visible" initial="hidden" variants={heroStagger}>
          <motion.p className="text-sm font-semibold text-[#e08550]" variants={rise}>
            The creator and brand network
          </motion.p>

          <motion.h1
            className="mt-5 text-[clamp(46px,7.2vw,104px)] leading-[0.96] font-semibold tracking-[-0.06em] text-[#37352f]"
            variants={heroStagger}
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" variants={lineReveal}>
                Proof gets
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" variants={lineReveal}>
                you paid.
              </motion.span>
            </span>
          </motion.h1>

          <motion.p className="mt-6 max-w-[36rem] text-lg leading-8 text-[#787774]" variants={rise}>
            Terrace syncs your Instagram, TikTok, and YouTube into one verified profile. Brands browse the work itself,
            post gigs, and book you in the same conversation.
          </motion.p>

          <motion.div className="mt-9" variants={rise}>
            <ClaimHandle reducedMotion={reducedMotion} />
            <div className="mt-5 flex items-center gap-3">
              <span className="flex -space-x-2">
                {seated.map((creator) => (
                  <Initials className="h-8 w-8 text-[10px] ring-2 ring-white" key={creator.name} name={creator.name} />
                ))}
              </span>
              <p className="text-sm text-[#9b9a97]">
                {seated
                  .slice(0, 2)
                  .map((creator) => creator.name.split(" ")[0])
                  .join(", ")}{" "}
                &amp; more are already seated.{" "}
                <Link
                  className="font-semibold text-[#37352f] underline decoration-[#8CC9E8] decoration-2 underline-offset-4 transition-colors hover:decoration-[#2b8fc4]"
                  href="/creators"
                >
                  Browse them
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Loose creator prints: pick one up, throw it, it springs back. */}
        <div className="relative mx-auto h-[460px] w-full max-w-[440px] sm:h-[520px]" ref={stackRef}>
          <motion.p
            animate={{ opacity: 1 }}
            className="absolute -top-9 right-2 z-40 flex items-end gap-1 text-[13px] text-[#9b9a97] italic"
            initial={{ opacity: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            go on, move one
            <svg
              aria-hidden
              className="h-7 w-9 translate-y-4 text-[#ED9568]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              viewBox="0 0 48 40"
            >
              <path d="M4 4c14 2 28 12 36 28" />
              <path d="m31 28 9 4 2-10" />
            </svg>
          </motion.p>
          {heroCards.map((card, index) => (
            <HeroDragCard card={card} dragArea={stackRef} index={index} key={index} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroDragCard({
  card,
  index,
  dragArea,
  reducedMotion
}: {
  card: HeroCard;
  index: number;
  dragArea: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean | null;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, rotate: card.rotate, scale: 1 }}
      className={cn(
        "absolute cursor-grab rounded-[22px] border border-[#f1f1ef] bg-white p-5 shadow-[0_24px_70px_rgba(17,24,39,0.14)] select-none active:cursor-grabbing",
        index === 0 && "top-4 left-0 z-10 w-[72%]",
        index === 1 && "top-[31%] right-0 z-20 w-[76%]",
        index === 2 && "bottom-4 left-[6%] z-30 w-[72%]"
      )}
      drag
      dragConstraints={dragArea}
      dragElastic={0.45}
      dragSnapToOrigin
      dragTransition={{ bounceDamping: 14, bounceStiffness: 220 }}
      initial={reducedMotion ? false : { opacity: 0, y: 80, rotate: card.rotate * 3, scale: 0.94 }}
      transition={{ delay: 0.25 + index * 0.16, duration: 0.9, ease: easeOutQuint }}
      whileDrag={{ rotate: 0, scale: 1.06, zIndex: 50, boxShadow: "0 36px 90px rgba(17,24,39,0.24)" }}
      whileHover={reducedMotion ? undefined : { rotate: card.rotate * 0.4, scale: 1.02 }}
    >
      {/* Idle drift keeps the stack alive after the entrance settles. */}
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
        className="pointer-events-none"
        transition={{ delay: 1.6 + index * 0.45, duration: 5 + index, ease: "easeInOut", repeat: Infinity }}
      >
        {card.kind === "post" ? <PostCardBody card={card} /> : <ProfileCardBody />}
      </motion.div>
    </motion.div>
  );
}

function PostCardBody({ card }: { card: Extract<HeroCard, { kind: "post" }> }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Initials className="h-9 w-9 text-[11px]" name={card.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#37352f]">{card.handle}</p>
          <p className="text-[11px] text-[#9b9a97]">just posted</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", platformTint[card.platform])}>
          {card.platform}
        </span>
      </div>
      <p className="mt-3.5 text-[15px] leading-7 font-medium text-[#37352f]">{card.caption}</p>
      <div className="mt-4 flex items-center gap-4 border-t border-[#f1f1ef] pt-3.5 text-[#9b9a97]">
        <Heart className="h-4 w-4" />
        <MessageCircle className="h-4 w-4" />
        <Send className="h-4 w-4" />
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#fff3ec] px-2.5 py-1 text-[11px] font-semibold text-[#e08550]">
          <Check className="h-3 w-3" />
          Synced to profile
        </span>
      </div>
    </div>
  );
}

const profilePlatforms = [
  { label: "Instagram", tint: "bg-[#ED9568]" },
  { label: "TikTok", tint: "bg-[#37352f]" },
  { label: "YouTube", tint: "bg-[#8CC9E8]" }
];

function ProfileCardBody() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Initials className="h-11 w-11 text-sm" name="Amara Films" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#37352f]">Amara Films</p>
          <p className="text-[12px] text-[#9b9a97]">Beauty · Los Angeles · open to collabs</p>
        </div>
        <span className="rounded-full bg-[#f1faff] px-2.5 py-1 text-[11px] font-semibold text-[#2b8fc4]">Terrace</span>
      </div>
      <div className="mt-4 grid gap-2">
        {profilePlatforms.map((platform) => (
          <div
            className="flex items-center gap-2.5 rounded-xl border border-[#f1f1ef] px-3 py-2 text-[13px] font-medium text-[#37352f]"
            key={platform.label}
          >
            <span className={cn("h-2 w-2 rounded-full", platform.tint)} />
            {platform.label}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e9e55]">
              <Check className="h-3 w-3" />
              synced
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3.5 text-[12px] font-medium text-[#9b9a97]">One profile. All the proof.</p>
    </div>
  );
}

/* ── Claim your handle: the CTA is the product ─────────────────────────── */

const placeholderHandles = ["yourname", "amara.films", "goldenhourgrace", "dispatch.daily"];

function ClaimHandle({ reducedMotion }: { reducedMotion: boolean | null }) {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || handle) return undefined;
    const timer = window.setInterval(
      () => setPlaceholderIndex((index) => (index + 1) % placeholderHandles.length),
      2400
    );
    return () => window.clearInterval(timer);
  }, [handle, reducedMotion]);

  return (
    <form
      className="flex h-14 w-full max-w-[26rem] items-center gap-1 rounded-full border border-[#e9e9e7] bg-white pr-2 pl-5 shadow-[0_14px_40px_rgba(17,24,39,0.08)] transition-all duration-300 focus-within:border-[#e7a27c] focus-within:shadow-[0_14px_40px_rgba(237,149,104,0.14),0_0_0_4px_rgba(237,149,104,0.1)]"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(handle ? `/signup?handle=${encodeURIComponent(handle)}` : "/signup");
      }}
    >
      <span className="shrink-0 text-[15px] font-medium text-[#9b9a97]">terrace.app/@</span>
      <div className="relative min-w-0 flex-1">
        {!handle && (
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[15px] text-[#c9c8c5]"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key={placeholderIndex}
              transition={{ duration: 0.25, ease: easeOutQuint }}
            >
              {placeholderHandles[placeholderIndex]}
            </motion.span>
          </AnimatePresence>
        )}
        <input
          aria-label="Choose your Terrace handle"
          autoComplete="off"
          className="w-full bg-transparent text-[15px] font-semibold text-[#37352f] outline-none"
          maxLength={30}
          name="handle"
          onChange={(event) => setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
          spellCheck={false}
          type="text"
          value={handle}
        />
      </div>
      <button
        aria-label="Claim your handle"
        className="group grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[#37352f] text-white transition-all duration-300 hover:scale-105 hover:bg-[#ED9568] active:scale-95"
        type="submit"
      >
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />
      </button>
    </form>
  );
}

/* ── Creator story ─────────────────────────────────────────────────────── */

const syncLanes = [
  { label: "Instagram", chip: "IG", tint: "bg-[#fff3ec] text-[#e08550]", dot: "bg-[#ED9568]", delay: 0 },
  { label: "TikTok", chip: "TT", tint: "bg-[#37352f] text-white", dot: "bg-[#37352f]", delay: 0.9 },
  { label: "YouTube", chip: "YT", tint: "bg-[#f1faff] text-[#2b8fc4]", dot: "bg-[#8CC9E8]", delay: 1.8 }
];

function CreatorStory({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-16">
      <Reveal>
        {/* Posts flow from every platform into one Terrace profile. */}
        <div className="rounded-[28px] border border-[#f1f1ef] bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.08)] sm:p-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-8 sm:gap-x-4">
            <motion.div
              animate={reducedMotion ? undefined : { scale: [1, 1.015, 1] }}
              className="w-[164px] self-center rounded-2xl border border-[#f1f1ef] bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.12)] sm:w-[190px]"
              style={{ gridColumn: "3", gridRow: "1 / span 3" }}
              transition={{ duration: 3.1, ease: "easeInOut", repeat: Infinity }}
            >
              <Initials className="h-10 w-10 text-[11px]" name="Amara Films" />
              <p className="mt-2.5 text-sm font-semibold text-[#37352f]">Amara Films</p>
              <p className="text-[11px] text-[#9b9a97]">Beauty · Los Angeles</p>
              <div className="mt-3 grid gap-1.5">
                {syncLanes.map((row) => (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#787774]" key={row.label}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", row.dot)} />
                    {row.label}
                    <Check className="ml-auto h-3 w-3 text-[#1e9e55]" />
                  </div>
                ))}
              </div>
            </motion.div>
            {syncLanes.map((lane) => (
              <div className="contents" key={lane.label}>
                <span
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl text-[12px] font-bold sm:h-11 sm:w-11",
                    lane.tint
                  )}
                >
                  {lane.chip}
                </span>
                <div className="relative h-px border-t border-dashed border-[#e1e1de]">
                  <motion.span
                    animate={reducedMotion ? undefined : { left: ["0%", "97%"], opacity: [0, 1, 1, 0] }}
                    className={cn("absolute top-[-3px] h-1.5 w-1.5 rounded-full", lane.dot)}
                    style={reducedMotion ? { left: "50%" } : undefined}
                    transition={{
                      delay: lane.delay,
                      duration: 2.2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 0.7,
                      times: [0, 0.12, 0.88, 1]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-7 text-center text-[13px] font-medium text-[#9b9a97]">
            Every post finds its way home. No uploads, no media kit.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="text-sm font-semibold text-[#e08550]">For creators</p>
        <h2 className="mt-4 max-w-[18ch] text-[clamp(34px,4.4vw,60px)] leading-[1.02] font-semibold tracking-[-0.05em]">
          Publish once. It counts everywhere.
        </h2>
        <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[#787774]">
          Every post you publish flows into one profile with your niche, your audience, and your rates. No media kit to
          keep alive; the work speaks while you shoot the next thing.
        </p>
        <ul className="mt-8 grid max-w-[34rem] gap-4">
          {[
            ["Synced platforms", "Instagram, TikTok, and YouTube posts land in your feed automatically."],
            ["Gigs that fit", "Apply to brand briefs matched to your niche, audience, and rate."],
            ["Ranks", "Climb your niche leaderboard as your work compounds."]
          ].map(([title, body], index) => (
            <motion.li
              className="flex gap-4"
              initial={{ opacity: 0, x: -18 }}
              key={title}
              transition={{ delay: 0.15 + index * 0.12, duration: 0.55, ease: easeOutQuint }}
              viewport={{ once: true, margin: "-80px" }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <span aria-hidden className="mt-[11px] h-px w-7 shrink-0 bg-[#ED9568]" />
              <p className="text-[15px] leading-7 text-[#787774]">
                <strong className="font-semibold text-[#37352f]">{title}.</strong> {body}
              </p>
            </motion.li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ── Brand story: queries type themselves, results re-rank live ────────── */

const brandScenes = [
  {
    query: "Beauty creators in LA with strong routine videos",
    results: [
      { name: "Amara Cole", niche: "Beauty · routine videos", reach: "412K", open: true },
      { name: "Jules Ortiz", niche: "Skincare · UGC", reach: "188K", open: true },
      { name: "Dana Reyes", niche: "Lifestyle · vlogs", reach: "1.1M", open: false }
    ]
  },
  {
    query: "UGC skincare creators with a US audience",
    results: [
      { name: "Jules Ortiz", niche: "Skincare · UGC", reach: "188K", open: true },
      { name: "Dana Reyes", niche: "Lifestyle · vlogs", reach: "1.1M", open: false },
      { name: "Amara Cole", niche: "Beauty · routine videos", reach: "412K", open: true }
    ]
  },
  {
    query: "Lifestyle vloggers open to collabs this week",
    results: [
      { name: "Dana Reyes", niche: "Lifestyle · vlogs", reach: "1.1M", open: false },
      { name: "Amara Cole", niche: "Beauty · routine videos", reach: "412K", open: true },
      { name: "Jules Ortiz", niche: "Skincare · UGC", reach: "188K", open: true }
    ]
  }
];

function BrandStory({ reducedMotion }: { reducedMotion: boolean | null }) {
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => setSceneIndex((index) => (index + 1) % brandScenes.length), 5400);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const scene = brandScenes[sceneIndex];

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-16">
        <Reveal className="order-2 lg:order-1">
          <p className="text-sm font-semibold text-[#2b8fc4]">For brands</p>
          <h2 className="mt-4 max-w-[16ch] text-[clamp(34px,4.4vw,60px)] leading-[1.02] font-semibold tracking-[-0.05em]">
            Hire from the work itself.
          </h2>
          <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[#787774]">
            Describe the campaign in plain language. Terrace reads niche, audience, growth, and past brand work, then
            puts real creators in front of you with their proof attached. Shortlist, message, book: one thread from
            brief to deal.
          </p>
          <Link
            className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-[#37352f]"
            href="/signup?intent=brand"
          >
            Start hiring creators
            <ArrowUpRight className="h-4 w-4 text-[#2b8fc4] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <Reveal className="order-1 lg:order-2" delay={0.12}>
          <div className="rounded-[26px] border border-[#ddeefa] bg-[#fbfdff] p-5 shadow-[0_30px_80px_rgba(43,143,196,0.1)] sm:p-6">
            <div className="flex min-h-[3.1rem] items-center rounded-2xl bg-[#f7f7f5] px-4 py-3 text-[15px] text-[#787774]">
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key={sceneIndex}
                  transition={{ duration: 0.2 }}
                >
                  “
                  {[...scene.query].map((character, index) => (
                    <motion.span
                      animate={{ opacity: 1 }}
                      initial={reducedMotion ? false : { opacity: 0 }}
                      key={`${sceneIndex}-${index}`}
                      transition={{ delay: 0.2 + index * 0.022, duration: 0.01 }}
                    >
                      {character}
                    </motion.span>
                  ))}
                  ”
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mt-4 grid gap-2.5">
              {scene.results.map((row, index) => (
                <motion.div
                  className="flex items-center gap-3 rounded-2xl border border-[#f1f1ef] bg-white px-4 py-3"
                  key={row.name}
                  layout
                  transition={{ duration: 0.55, ease: easeOutQuint }}
                >
                  <Initials name={row.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#37352f]">{row.name}</p>
                    <p className="truncate text-[13px] text-[#9b9a97]">{row.niche}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#37352f] tabular-nums">{row.reach}</span>
                  <motion.span
                    animate={index === 0 && !reducedMotion ? { scale: [1, 1.08, 1] } : undefined}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      row.open ? "bg-[#f1faff] text-[#2b8fc4]" : "bg-[#f7f7f5] text-[#9b9a97]"
                    )}
                    key={`${sceneIndex}-chip`}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    {row.open ? "Open" : "Booked"}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Proof section: creator rows + the signal board as an object ───────── */

const boardMessages = ["NEW GIG POSTED\nBEAUTY · LA", "POST SYNCED\n@AMARA.FILMS", "BRIEF MATCHED\nUGC SKINCARE"];

function ProofSection({
  creatorRows,
  reducedMotion
}: {
  creatorRows: LandingCreatorRow[];
  reducedMotion: boolean | null;
}) {
  const [boardIndex, setBoardIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => setBoardIndex((index) => (index + 1) % boardMessages.length), 5200);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-16">
        <Reveal>
          <p className="text-sm font-semibold text-[#e08550]">Your record</p>
          <h2 className="mt-4 max-w-[14ch] text-[clamp(34px,4.4vw,60px)] leading-[1.02] font-semibold tracking-[-0.05em] text-[#37352f]">
            Proof travels with you.
          </h2>
          <p className="mt-6 max-w-[32rem] text-lg leading-8 text-[#787774]">
            Campaign wins, brand replies, and finished work attach to your profile, not to a thread that dies when the
            deal closes. The next negotiation starts from everything you have already done.
          </p>
          <Magnetic className="mt-9">
            <Link
              className="inline-flex h-13 items-center gap-2 rounded-full bg-[#37352f] px-8 text-[15px] font-semibold text-white shadow-[0_14px_36px_rgba(17,24,39,0.14)] transition-shadow duration-300 hover:shadow-[0_20px_46px_rgba(17,24,39,0.2)]"
              href="/signup"
            >
              Start your profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="grid gap-3">
            {creatorRows.map((creator, index) => (
              <motion.div
                className="flex items-center gap-4 rounded-2xl border border-[#f1f1ef] bg-white p-4 shadow-[0_8px_24px_rgba(17,24,39,0.04)]"
                initial={{ opacity: 0, x: 36 }}
                key={creator.name}
                transition={{ delay: index * 0.12, duration: 0.6, ease: easeOutQuint }}
                viewport={{ once: true, margin: "-100px" }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <Initials name={creator.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#37352f]">{creator.name}</p>
                  <p className="truncate text-sm text-[#9b9a97]">
                    {creator.niche} · {creator.reach}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    creator.status === "Open" ? "bg-[#eaf7fd] text-[#2b8fc4]" : "bg-[#f7f7f5] text-[#9b9a97]"
                  )}
                >
                  {creator.status}
                </span>
              </motion.div>
            ))}
            {/* Split-flap signal board: a dark object on the page, not a dark page. */}
            <TextFlippingBoard
              characterClassName="h-8 min-w-6 rounded-md border-white/10 bg-white/[0.08] px-1.5 text-sm text-white sm:h-9 sm:min-w-7 sm:text-base"
              className="mt-2 rounded-[22px] border-transparent bg-[#37352f] p-4 shadow-[0_24px_60px_rgba(17,24,39,0.18)]"
              key={boardIndex}
              text={boardMessages[boardIndex]}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Closing: same world, bigger voice ─────────────────────────────────── */

function ClosingCta() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-white">
      <motion.div
        animate={{ x: ["-4%", "4%", "-4%"], y: ["-3%", "3%", "-3%"] }}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(820px 460px at 80% 10%, rgba(237,149,104,0.14), transparent 58%), radial-gradient(640px 420px at 12% 90%, rgba(140,201,232,0.16), transparent 55%)"
        }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="relative mx-auto flex max-w-[1320px] flex-col items-start gap-9 px-5 py-16 sm:px-8 lg:py-24">
        <motion.h2
          className="flex max-w-[12ch] flex-wrap gap-x-[0.24em] text-[clamp(52px,9vw,128px)] leading-[0.98] font-semibold tracking-[-0.06em] text-[#37352f]"
          initial="hidden"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
          viewport={{ once: true, margin: "-120px" }}
          whileInView="visible"
        >
          {["Pull", "up", "a", "chair."].map((word) => (
            <span className="overflow-hidden pb-[0.1em]" key={word}>
              <motion.span className="block" variants={lineReveal}>
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <Reveal delay={0.1}>
          <div className="flex flex-wrap items-center gap-5">
            <AttractButton
              attractRadius={52}
              className="h-14 rounded-full px-9 text-base font-semibold"
              onClick={() => router.push("/signup")}
              particleCount={12}
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </AttractButton>
            <p className="text-[15px] font-medium text-[#9b9a97]">Free for creators. Brands pay when they book.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Shared bits ───────────────────────────────────────────────────────── */

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      transition={{ delay, duration: 0.75, ease: easeOutQuint }}
      viewport={{ once: true, margin: "-90px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function Initials({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fdf3ec] text-xs font-bold text-[#e08550]",
        className
      )}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}
