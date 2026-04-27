"use client";

import type React from "react";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Box className="h-4 w-4 text-neutral-300" />}
        title="Verified creator profiles"
        description="Real audience data, rates, portfolio proof, and platform sync in one professional profile."
      />
      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Settings className="h-4 w-4 text-neutral-300" />}
        title="Campaign operations"
        description="Deliverables, reviews, approvals, and payments move through one workspace."
      />
      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Lock className="h-4 w-4 text-neutral-300" />}
        title="Trust and safety"
        description="Brand-safe profiles, verified metrics, and campaign history reduce fake-follower risk."
      />
      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Sparkles className="h-4 w-4 text-neutral-300" />}
        title="AI deal agents"
        description="Draft outreach, shortlist creators, price campaigns, and recommend next actions."
      />
      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Search className="h-4 w-4 text-neutral-300" />}
        title="Creator discovery"
        description="Search by niche, location, audience, engagement, budget, and campaign match."
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-white/10 p-2 md:rounded-3xl md:p-3">
        <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-[#121212] p-6 shadow-[0px_0px_27px_0px_rgba(45,45,45,0.55)]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 p-2">{icon}</div>
            <div className="space-y-3">
              <h3 className="pt-0.5 font-sans text-xl font-semibold text-white md:text-2xl">{title}</h3>
              <p className="font-sans text-sm leading-6 text-neutral-400 md:text-base">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
