import Link from "next/link";
import GlowingEffectDemo from "@/components/glowing-effect-demo";
import SVGMaskEffectDemo from "@/components/svg-mask-effect-demo";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AuroraBackground className="min-h-[620px] px-6 py-24">
        <div className="mx-auto flex min-h-[460px] max-w-6xl flex-col items-center justify-center gap-6 text-center">
          <div className="logoMark authLogo" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.04em] md:text-7xl">
            The professional network for creator-brand deals.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-neutral-300 md:text-xl">
            InfluencerLink helps creators prove their value and helps brands discover, contact, and manage the right
            partners.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-white px-6 text-black hover:bg-neutral-200">
              <Link href="/feed">Explore feed</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
            >
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </AuroraBackground>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <WavyBackground className="mx-auto px-8 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold md:text-6xl">About us</h2>
            <p className="mt-5 text-lg leading-8 text-neutral-200 md:text-xl">
              We are building the creator economy’s LinkedIn: profiles, discovery, outreach, campaign workspaces,
              payments, and reputation in one place.
            </p>
          </div>
        </WavyBackground>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <GlowingEffectDemo />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SVGMaskEffectDemo />
      </section>

      <section className="relative mx-auto flex w-full max-w-7xl items-center justify-center overflow-hidden rounded-3xl px-6">
        <DottedGlowBackground className="pointer-events-none opacity-40" opacity={1} gap={10} radius={1.4} />
        <div className="relative z-10 flex w-full flex-col items-center justify-between gap-8 px-8 py-16 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-4xl font-normal tracking-tight text-neutral-400 sm:text-5xl">
              Ready to build the <span className="font-bold text-white">creator network?</span>
            </h2>
            <p className="mt-4 max-w-lg text-base text-neutral-300">
              Start with a working marketplace, then layer in verified analytics, AI agents, contracts, and escrow.
            </p>
          </div>
          <Button
            asChild
            className="rounded-lg bg-white px-8 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
          >
            <Link href="/feed">View product</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
