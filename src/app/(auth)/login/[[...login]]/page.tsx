import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { clerkLightAppearance } from "@/components/auth/clerk-appearance";
import { LampContainer } from "@/components/ui/lamp";
import { NoiseBackground } from "@/components/ui/noise-background";

export default function LoginPage() {
  return (
    <main className="creatorlink-auth-light relative grid min-h-screen overflow-hidden bg-[#fbfaf8] px-4 py-8 font-sans text-[#111318] sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-5xl bg-[radial-gradient(circle_at_24%_20%,rgba(140,201,232,0.34),transparent_34%),radial-gradient(circle_at_78%_16%,rgba(246,176,132,0.32),transparent_30%)] blur-3xl"
      />
      <div
        aria-hidden
        className="creatorlink-float-slow pointer-events-none absolute top-24 left-[10%] hidden rounded-3xl border border-[#e8ebef] bg-white/82 px-4 py-3 text-sm font-semibold text-[#566174] shadow-[0_18px_46px_rgba(17,24,39,0.08)] backdrop-blur-xl lg:block"
      >
        94% creator fit
      </div>
      <div
        aria-hidden
        className="creatorlink-float pointer-events-none absolute right-[12%] bottom-24 hidden rounded-3xl border border-[#e8ebef] bg-white/82 px-4 py-3 text-sm font-semibold text-[#566174] shadow-[0_18px_46px_rgba(17,24,39,0.08)] backdrop-blur-xl lg:block"
      >
        8 warm messages
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-[460px] content-center">
        <Link className="mx-auto mb-8 flex items-center gap-3" href="/" aria-label="Terrace">
          <span className="logoMark miniLogo bg-[#111318]" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="text-2xl font-semibold tracking-[-0.04em]">Terrace</span>
        </Link>

        <LampContainer className="creatorlink-animate-in mb-5 min-h-[180px] rounded-[28px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8ebef] bg-white/80 px-4 py-2 text-sm font-bold text-[#657082] shadow-sm backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-[#D86B3D]" />
            Welcome back
          </div>
          <h1 className="text-[clamp(38px,8vw,62px)] leading-[0.96] font-semibold tracking-[-0.075em]">
            Sign in to Terrace.
          </h1>
        </LampContainer>

        <section
          className="creatorlink-signup-form creatorlink-animate-in creatorlink-delay-1 w-full rounded-[24px] border border-[#e8ebef] bg-white/92 p-2.5 shadow-[0_24px_58px_rgba(17,24,39,0.09)] backdrop-blur-xl"
          id="login-form"
        >
          <div className="rounded-[19px] border border-[#f0f2f5] bg-white p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">Login</p>
              <h2 className="mt-2 text-[28px] leading-tight font-semibold tracking-[-0.045em]">Continue your work</h2>
              <p className="mt-2 text-sm leading-6 text-[#687386]">Feed, search, messages, and briefs are waiting.</p>
            </div>
            <SignIn
              appearance={clerkLightAppearance}
              path="/login"
              routing="path"
              signUpUrl="/signup"
              fallbackRedirectUrl="/onboarding"
            />
            <p className="mt-5 text-center text-sm text-[#7b8494]">
              New to Terrace?{" "}
              <Link className="font-semibold text-[#111318] hover:underline" href="/signup">
                Create an account
              </Link>
            </p>
          </div>
        </section>

        <div className="creatorlink-animate-in creatorlink-delay-2 mt-6 flex flex-col items-center gap-4 text-center">
          <NoiseBackground containerClassName="rounded-2xl">
            <Link
              className="inline-flex h-[50px] items-center justify-center rounded-[14px] bg-white px-7 text-sm font-semibold text-[#111318] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(17,24,39,0.12)] transition active:scale-[0.99]"
              href="/signup"
            >
              Start free instead
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </NoiseBackground>
          <p className="text-xs font-medium text-[#9aa3b2]">Protected by Clerk. No credit card needed to start.</p>
        </div>
      </section>
    </main>
  );
}
