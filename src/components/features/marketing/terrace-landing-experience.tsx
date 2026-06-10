"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants
} from "motion/react";
import { cn } from "@/lib/utils";

export type LandingCreatorRow = {
  name: string;
  niche: string;
  reach: string;
  status: string;
};

/* Warm palette: golden-hour terrace. Cream canvas (#faf5ef), terracotta
 * carry (#c75b2e), deep warm ink (#221c16). Sky blue only as counterpoint. */
const easeOutQuint = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutQuint }
  }
};

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.11 } }
};

const heroPhotos = [
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    alt: "Creator in a mustard jacket, mid-shoot against a warm wall",
    platform: "Instagram",
    handle: "@amara.films",
    rotate: -5,
    depth: 28
  },
  {
    src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
    alt: "Creator laughing in golden-hour light",
    platform: "TikTok",
    handle: "@goldenhourgrace",
    rotate: 3.5,
    depth: 46
  },
  {
    src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=900&q=80",
    alt: "Street-style creator checking the frame",
    platform: "YouTube",
    handle: "@dispatch.daily",
    rotate: -2,
    depth: 64
  }
];

const platformTint: Record<string, string> = {
  Instagram: "bg-[#fdeee4] text-[#b4490f]",
  TikTok: "bg-[#221c16] text-[#faf5ef]",
  YouTube: "bg-[#fdeaea] text-[#a52a2a]"
};

export function TerraceLandingExperience({ creatorRows }: { creatorRows: LandingCreatorRow[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#faf5ef] font-sans text-[#221c16]">
      <Hero reducedMotion={prefersReducedMotion} />
      <LiveRow creatorRows={creatorRows} />
      <CreatorStory />
      <BrandStory />
      <ProofSection creatorRows={creatorRows} />
      <ClosingCta />
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

function Hero({ reducedMotion }: { reducedMotion: boolean | null }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !stackRef.current) return;
    const rect = stackRef.current.getBoundingClientRect();
    mx.set((event.clientX - rect.left - rect.width / 2) / rect.width);
    my.set((event.clientY - rect.top - rect.height / 2) / rect.height);
  }

  return (
    <section
      className="relative overflow-hidden"
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      onMouseMove={handleMove}
    >
      {/* Late-afternoon wash: one warm light source, top right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 620px at 78% -10%, rgba(199,91,46,0.14), transparent 62%), radial-gradient(700px 420px at 8% 108%, rgba(140,201,232,0.12), transparent 60%)"
        }}
      />

      <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-5 pt-16 pb-14 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-6 lg:pt-24 lg:pb-24">
        <motion.div animate="visible" initial="hidden" variants={heroStagger}>
          <motion.p className="text-sm font-semibold text-[#9a6a4b]" variants={rise}>
            The creator and brand network
          </motion.p>

          <motion.h1
            className="mt-5 font-serif text-[clamp(46px,7.2vw,104px)] leading-[0.94] font-bold tracking-[-0.035em] text-[#221c16]"
            variants={rise}
          >
            Your feed is
            <br />
            your résumé.
          </motion.h1>

          <motion.p className="mt-7 max-w-[36rem] text-lg leading-8 text-[#6b5d4f]" variants={rise}>
            Terrace syncs your Instagram, TikTok, and YouTube into one verified profile. Brands browse the work itself,
            post gigs, and book you in the same conversation.
          </motion.p>

          <motion.div className="mt-9 flex flex-wrap items-center gap-4" variants={rise}>
            <Link
              className="group inline-flex h-13 items-center gap-2 rounded-full bg-[#221c16] px-8 text-[15px] font-semibold text-[#faf5ef] transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.98]"
              href="/signup"
            >
              Claim your handle
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              className="inline-flex h-13 items-center rounded-full px-5 text-[15px] font-semibold text-[#221c16] underline decoration-[#c75b2e]/40 decoration-2 underline-offset-8 transition-colors hover:decoration-[#c75b2e]"
              href="/search"
              prefetch={false}
            >
              Browse creators
            </Link>
          </motion.div>
        </motion.div>

        {/* Layered creator photographs settle in like prints on a table. */}
        <div className="relative mx-auto h-[460px] w-full max-w-[440px] sm:h-[520px]" ref={stackRef}>
          {heroPhotos.map((photo, index) => (
            <HeroPhotoCard
              index={index}
              key={photo.handle}
              photo={photo}
              reducedMotion={reducedMotion}
              sx={sx}
              sy={sy}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroPhotoCard({
  photo,
  index,
  sx,
  sy,
  reducedMotion
}: {
  photo: (typeof heroPhotos)[number];
  index: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reducedMotion: boolean | null;
}) {
  const x = useTransform(sx, (v) => v * photo.depth);
  const y = useTransform(sy, (v) => v * photo.depth * 0.6);

  return (
    <motion.figure
      animate={{ opacity: 1, y: 0, rotate: photo.rotate, scale: 1 }}
      className={cn(
        "absolute overflow-hidden rounded-[22px] bg-[#fffdfa] p-2.5 pb-4 shadow-[0_24px_70px_rgba(60,38,20,0.18)]",
        index === 0 && "top-2 left-0 z-10 w-[58%]",
        index === 1 && "top-[26%] right-0 z-20 w-[62%]",
        index === 2 && "bottom-0 left-[8%] z-30 w-[56%]"
      )}
      initial={reducedMotion ? false : { opacity: 0, y: 80, rotate: photo.rotate * 3, scale: 0.94 }}
      style={reducedMotion ? undefined : { x, y }}
      transition={{ delay: 0.25 + index * 0.16, duration: 0.9, ease: easeOutQuint }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px]">
        <Image
          alt={photo.alt}
          className="object-cover"
          fill
          priority={index < 2}
          sizes="(max-width: 1024px) 60vw, 300px"
          src={photo.src}
        />
      </div>
      <figcaption className="flex items-center justify-between px-1.5 pt-2.5">
        <span className="text-[13px] font-semibold text-[#221c16]">{photo.handle}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", platformTint[photo.platform])}>
          {photo.platform}
        </span>
      </figcaption>
    </motion.figure>
  );
}

/* ── Live row: real creators from the marketplace ─────────────────────── */

function LiveRow({ creatorRows }: { creatorRows: LandingCreatorRow[] }) {
  return (
    <section className="border-y border-[#eadfd2] bg-[#fffdfa]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:gap-10">
        <p className="shrink-0 text-sm font-semibold text-[#9a6a4b]">
          On the terrace
          <span className="relative mx-2 inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c75b2e] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c75b2e]" />
          </span>
          right now
        </p>
        <div className="flex flex-1 flex-wrap gap-x-8 gap-y-3">
          {creatorRows.map((creator, index) => (
            <motion.span
              className="flex items-center gap-2.5 text-sm"
              initial={{ opacity: 0, y: 10 }}
              key={creator.name}
              transition={{ delay: index * 0.09, duration: 0.5, ease: easeOutQuint }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Initials name={creator.name} />
              <span className="font-semibold text-[#221c16]">{creator.name}</span>
              <span className="text-[#8a7a69]">
                {creator.niche} · {creator.reach}
              </span>
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Creator story ─────────────────────────────────────────────────────── */

function CreatorStory() {
  return (
    <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-32">
      <Reveal>
        <div className="relative">
          <div className="relative aspect-[5/6] overflow-hidden rounded-[28px]">
            <Image
              alt="Hands steadying a camera between takes"
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 90vw, 520px"
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=80"
            />
          </div>
          {/* The one product chip this section needs: a post arriving from a platform. */}
          <motion.div
            className="absolute -right-4 bottom-10 flex items-center gap-3 rounded-2xl bg-[#fffdfa] py-3 pr-5 pl-4 shadow-[0_18px_50px_rgba(60,38,20,0.2)] sm:-right-8"
            initial={{ opacity: 0, x: 32 }}
            transition={{ delay: 0.3, duration: 0.7, ease: easeOutQuint }}
            viewport={{ once: true, margin: "-120px" }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fdeee4] text-[13px] font-bold text-[#b4490f]">
              IG
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-[#221c16]">New post synced</span>
              <span className="text-[#8a7a69]">added to your proof</span>
            </span>
          </motion.div>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="text-sm font-semibold text-[#9a6a4b]">For creators</p>
        <h2 className="mt-4 max-w-[18ch] font-serif text-[clamp(34px,4.4vw,60px)] leading-[1.02] font-bold tracking-[-0.03em]">
          Publish once. It counts everywhere.
        </h2>
        <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[#6b5d4f]">
          Every post you publish flows into one profile with your niche, your audience, and your rates. No media kit to
          keep alive; the work speaks while you shoot the next thing.
        </p>
        <ul className="mt-8 grid max-w-[34rem] gap-4">
          {[
            ["Synced platforms", "Instagram, TikTok, and YouTube posts land in your feed automatically."],
            ["Gigs that fit", "Apply to brand briefs matched to your niche, audience, and rate."],
            ["Ranks", "Climb your niche leaderboard as your work compounds."]
          ].map(([title, body]) => (
            <li className="flex gap-4" key={title}>
              <span aria-hidden className="mt-[11px] h-px w-7 shrink-0 bg-[#c75b2e]" />
              <p className="text-[15px] leading-7 text-[#6b5d4f]">
                <strong className="font-semibold text-[#221c16]">{title}.</strong> {body}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ── Brand story ───────────────────────────────────────────────────────── */

const brandResults = [
  { name: "Amara Cole", niche: "Beauty · routine videos", reach: "412K", open: true },
  { name: "Jules Ortiz", niche: "Skincare · UGC", reach: "188K", open: true },
  { name: "Dana Reyes", niche: "Lifestyle · vlogs", reach: "1.1M", open: false }
];

function BrandStory() {
  return (
    <section className="bg-[#f3eadf]">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-32">
        <Reveal className="order-2 lg:order-1">
          <p className="text-sm font-semibold text-[#9a6a4b]">For brands</p>
          <h2 className="mt-4 max-w-[16ch] font-serif text-[clamp(34px,4.4vw,60px)] leading-[1.02] font-bold tracking-[-0.03em]">
            Hire from the work itself.
          </h2>
          <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[#6b5d4f]">
            Describe the campaign in plain language. Terrace reads niche, audience, growth, and past brand work, then
            puts real creators in front of you with their proof attached. Shortlist, message, book: one thread from
            brief to deal.
          </p>
          <Link
            className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-[#221c16]"
            href="/jobs/new"
            prefetch={false}
          >
            Post your first gig
            <ArrowUpRight className="h-4 w-4 text-[#c75b2e] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <Reveal className="order-1 lg:order-2" delay={0.12}>
          <div className="rounded-[26px] bg-[#fffdfa] p-5 shadow-[0_30px_80px_rgba(60,38,20,0.12)] sm:p-6">
            <p className="rounded-2xl bg-[#f6efe6] px-4 py-3 text-[15px] text-[#6b5d4f]">
              “Beauty creators in LA with strong routine videos”
            </p>
            <div className="mt-4 grid gap-2.5">
              {brandResults.map((row, index) => (
                <motion.div
                  className="flex items-center gap-3 rounded-2xl border border-[#f0e7da] px-4 py-3"
                  initial={{ opacity: 0, y: 14 }}
                  key={row.name}
                  transition={{ delay: 0.25 + index * 0.12, duration: 0.55, ease: easeOutQuint }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <Initials name={row.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#221c16]">{row.name}</p>
                    <p className="truncate text-[13px] text-[#8a7a69]">{row.niche}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#221c16] tabular-nums">{row.reach}</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      row.open ? "bg-[#e7f3ea] text-[#22663a]" : "bg-[#f1ece5] text-[#8a7a69]"
                    )}
                  >
                    {row.open ? "Open" : "Booked"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Proof section: dark, warm, the brand's quiet flex ─────────────────── */

function ProofSection({ creatorRows }: { creatorRows: LandingCreatorRow[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ offset: ["start end", "end start"], target: sectionRef });
  const glowY = useTransform(scrollYProgress, [0, 1], ["-12%", "16%"]);

  return (
    <section className="relative overflow-hidden bg-[#1d1813] text-[#faf5ef]" ref={sectionRef}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-[120%]"
        style={{
          background:
            "radial-gradient(900px 520px at 24% 30%, rgba(199,91,46,0.22), transparent 60%), radial-gradient(640px 420px at 86% 70%, rgba(140,201,232,0.1), transparent 55%)",
          y: glowY
        }}
      />
      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-36">
        <Reveal>
          <h2 className="max-w-[14ch] font-serif text-[clamp(38px,5vw,72px)] leading-[1] font-bold tracking-[-0.03em]">
            Proof travels with you.
          </h2>
          <p className="mt-7 max-w-[32rem] text-lg leading-8 text-[#cdbfae]">
            Campaign wins, brand replies, and finished work attach to your profile, not to a thread that dies when the
            deal closes. The next negotiation starts from everything you have already done.
          </p>
          <Link
            className="mt-9 inline-flex h-13 items-center gap-2 rounded-full bg-[#faf5ef] px-8 text-[15px] font-semibold text-[#221c16] transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.98]"
            href="/signup"
          >
            Start your profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="grid gap-3">
            {creatorRows.map((creator, index) => (
              <motion.div
                className="flex items-center gap-4 rounded-2xl border border-[#faf5ef]/[0.09] bg-[#faf5ef]/[0.05] p-4"
                initial={{ opacity: 0, x: 36 }}
                key={creator.name}
                transition={{ delay: index * 0.12, duration: 0.6, ease: easeOutQuint }}
                viewport={{ once: true, margin: "-100px" }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <Initials className="bg-[#3a2d21] text-[#e8b18f]" name={creator.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{creator.name}</p>
                  <p className="truncate text-sm text-[#a8967f]">
                    {creator.niche} · {creator.reach}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    creator.status === "Open" ? "bg-[#2a4232]/80 text-[#a4d8b4]" : "bg-[#faf5ef]/10 text-[#cdbfae]"
                  )}
                >
                  {creator.status}
                </span>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Closing: terracotta drench ────────────────────────────────────────── */

function ClosingCta() {
  return (
    <section className="bg-[#c75b2e]">
      <div className="mx-auto flex max-w-[1320px] flex-col items-start gap-9 px-5 py-24 sm:px-8 lg:py-36">
        <Reveal>
          <h2 className="max-w-[12ch] font-serif text-[clamp(52px,9vw,128px)] leading-[0.95] font-bold tracking-[-0.035em] text-[#faf5ef]">
            Pull up a chair.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              className="inline-flex h-14 items-center gap-2 rounded-full bg-[#221c16] px-9 text-base font-semibold text-[#faf5ef] transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.98]"
              href="/signup"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[15px] font-medium text-[#f6d9c8]">Free for creators. Brands pay when they book.</p>
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
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3d9c6] text-xs font-bold text-[#8a4317]",
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
