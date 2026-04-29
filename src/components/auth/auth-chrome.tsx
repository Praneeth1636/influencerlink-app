import type { ReactNode } from "react";
import Link from "next/link";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { LogoSparkles } from "@/components/ui/sparkles";

export function AuthChrome({
  children,
  title,
  subtitle,
  switchPrompt
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  switchPrompt: { question: string; href: string; label: string };
}) {
  return (
    <main className="grid min-h-screen bg-[#151515] text-white lg:grid-cols-[1.02fr_1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#090a12] lg:flex lg:items-center lg:justify-center">
        <BackgroundRippleEffect />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_18%,rgba(34,50,92,0.24),transparent_24%),linear-gradient(165deg,rgba(22,24,36,0.9)_0%,rgba(8,9,16,0.96)_44%,rgba(3,4,9,1)_100%)]" />
        <div className="absolute top-14 -left-24 h-44 w-[115%] -rotate-12 bg-[#151724]/80 shadow-[0_20px_90px_rgba(0,0,0,0.45)]" />
        <div className="absolute right-6 -bottom-32 h-[520px] w-[420px] rotate-[-18deg] rounded-[44px] border border-white/5 bg-[#11131f]/80 shadow-[0_0_120px_rgba(37,67,143,0.12)]" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[290px] -translate-x-1/4 rotate-[8deg] rounded-[42px] border border-white/5 bg-[#0d0f19]/80 shadow-[0_0_90px_rgba(255,255,255,0.04)]" />

        <div className="relative z-[1] grid justify-items-center gap-5">
          <div className="flex items-center gap-10">
            <div className="logoMark loginBrandLogo" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h1 className="text-[72px] font-light tracking-[-0.04em] text-white drop-shadow-[0_10px_28px_rgba(255,255,255,0.1)]">
              InfluencerLink
            </h1>
          </div>
          <LogoSparkles />
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-[520px] gap-8">
          <div className="grid justify-items-center gap-3 text-center">
            <div className="grid justify-items-center lg:hidden">
              <Link className="logoMark authLogo" href="/login" aria-label="InfluencerLink">
                <span />
                <span />
                <span />
              </Link>
              <LogoSparkles className="h-12" />
            </div>
            <h2 className="text-[40px] font-bold tracking-[-0.03em]">{title}</h2>
            <p className="text-lg text-[#9f9f9f]">{subtitle}</p>
          </div>

          <div className="grid justify-items-center">{children}</div>

          <p className="text-center text-base text-[#9f9f9f]">
            {switchPrompt.question}{" "}
            <Link className="font-bold text-white hover:underline" href={switchPrompt.href}>
              {switchPrompt.label}
            </Link>
          </p>

          <p className="text-center text-sm text-[#666]">
            © InfluencerLink ·{" "}
            <Link className="hover:text-white" href="/about">
              About
            </Link>{" "}
            ·{" "}
            <Link className="hover:text-white" href="/contact">
              Contact
            </Link>{" "}
            · Privacy · Terms
          </p>
        </div>
      </section>
    </main>
  );
}
