"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { motion, useMotionValue, useTransform, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

type BentoItem = {
  id: string;
  title: string;
  description: string;
  eyebrow: string;
  feature: "spotlight" | "metrics" | "timeline" | "match";
  className?: string;
};

const bentoItems: BentoItem[] = [
  {
    id: "profiles",
    title: "Profiles that prove the work",
    description:
      "Creators show reach, content drops, campaign wins, rates, and collaboration signals in one trusted profile.",
    eyebrow: "Creator proof",
    feature: "spotlight",
    className: "md:col-span-1"
  },
  {
    id: "matching",
    title: "Describe the creator you need",
    description:
      "Brands search by niche, budget, audience, engagement, and verified fit without living in spreadsheets.",
    eyebrow: "AI matching",
    feature: "match",
    className: "md:col-span-2"
  },
  {
    id: "campaigns",
    title: "From brief to booked",
    description:
      "Run the whole hiring loop: public briefs, creator applications, shortlists, messages, and campaign proof.",
    eyebrow: "Workflow",
    feature: "timeline",
    className: "md:col-span-1"
  },
  {
    id: "signals",
    title: "Metrics brands can scan",
    description: "A clean read on reach, engagement, audience fit, response speed, and campaign history.",
    eyebrow: "Live signals",
    feature: "metrics",
    className: "md:col-span-2"
  }
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" },
    y: 0
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.12, staggerChildren: 0.1 }
  }
};

const proofItems = ["Verified reach", "Audience demographics", "Past brand work", "Open-to-collab status"];

const timelineItems = [
  { label: "Brief posted", icon: BriefcaseBusiness },
  { label: "Creators apply", icon: Users },
  { label: "Brand shortlists", icon: BadgeCheck },
  { label: "DMs open", icon: MessageSquare }
];

const metrics = [
  { label: "Reach fit", value: 92, icon: Users },
  { label: "Engagement", value: 74, icon: TrendingUp },
  { label: "Response", value: 88, icon: Clock },
  { label: "Brand safety", value: 96, icon: BadgeCheck }
];

export function TerraceBentoGrid() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">How Terrace works</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#37352f] md:text-5xl">
            One network for creators and the brands hiring them.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#787774]">
            Same product, same language, same feed. Creators share proof, brands discover fit, and both sides move into
            messaging when the signal is right.
          </p>
        </div>

        <motion.div
          className="grid gap-5 md:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          {bentoItems.map((item) => (
            <BentoCard item={item} key={item.id} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BentoCard({ item }: { item: BentoItem }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [1.2, -1.2]);
  const rotateY = useTransform(x, [-100, 100], [-1.2, 1.2]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 100);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.article
      className={cn("h-full", item.className)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      variants={fadeInUp}
      whileHover={{ y: -4 }}
    >
      <div className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[28px] border border-[#e9e9e7] bg-white p-5 shadow-[0_18px_46px_rgba(17,24,39,0.045)] transition duration-500 hover:border-[#dce3ea] hover:shadow-[0_24px_58px_rgba(17,24,39,0.07)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(216,107,61,0.08),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(140,201,232,0.12),transparent_30%)]" />
        <div className="relative z-10 flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[#D86B3D] uppercase">{item.eyebrow}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#37352f]">{item.title}</h3>
            </div>
            <div className="rounded-full border border-[#e9e9e7] bg-white p-2 text-[#787774] opacity-0 transition group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <p className="text-sm leading-6 text-[#787774]">{item.description}</p>

          <div className="mt-auto">{renderFeature(item.feature)}</div>
        </div>
      </div>
    </motion.article>
  );
}

function renderFeature(feature: BentoItem["feature"]) {
  if (feature === "spotlight") return <SpotlightFeature />;
  if (feature === "metrics") return <MetricsFeature />;
  if (feature === "timeline") return <TimelineFeature />;
  return <MatchFeature />;
}

function SpotlightFeature() {
  return (
    <ul className="grid gap-2">
      {proofItems.map((item, index) => (
        <motion.li
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 rounded-2xl border border-[#e9e9e7] bg-white px-3 py-2 text-sm font-medium text-[#303847]"
          initial={{ opacity: 0, x: -8 }}
          key={item}
          transition={{ delay: 0.08 * index }}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D86B3D]" />
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

function MatchFeature() {
  return (
    <div className="rounded-[22px] border border-[#e9e9e7] bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#8a94a5] uppercase">
        <Sparkles className="h-3.5 w-3.5 text-[#D86B3D]" />
        Brand brief
      </div>
      <p className="mt-3 text-sm leading-6 text-[#303847]">
        “Beauty creator, women 18-30, $2K-$4K, strong routine videos, US audience.”
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {["94% fit", "2.4M reach", "$3.2K avg"].map((item) => (
          <div
            className="rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-[#303847]"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineFeature() {
  return (
    <div className="relative grid gap-3">
      <div className="absolute top-5 bottom-5 left-[18px] w-px bg-[#e9e9e7]" />
      {timelineItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="relative flex items-center gap-3"
            initial={{ opacity: 0, x: -8 }}
            key={item.label}
            transition={{ delay: index * 0.08 }}
          >
            <div className="z-10 grid h-9 w-9 place-items-center rounded-full border border-[#e9e9e7] bg-white text-[#D86B3D]">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-[#303847]">{item.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function MetricsFeature() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#e9e9e7] bg-white p-3"
            initial={{ opacity: 0, y: 8 }}
            key={metric.label}
            transition={{ delay: 0.08 * index }}
          >
            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-[#303847]">
              <span className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-[#D86B3D]" />
                {metric.label}
              </span>
              <span>{metric.value}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0f2f5]">
              <motion.div
                animate={{ width: `${metric.value}%` }}
                className="h-full rounded-full bg-[linear-gradient(90deg,#D86B3D,#8CC9E8)]"
                initial={{ width: 0 }}
                transition={{ delay: 0.1 * index, duration: 1.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default TerraceBentoGrid;
