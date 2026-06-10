import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { clerkLightAppearance } from "@/components/auth/clerk-appearance";
import { isLocalDemoRequest } from "@/lib/auth/local-demo";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export default async function SignupPage() {
  // If the user already has an active Clerk session, sending them to the
  // signup widget makes Clerk flash the form then redirect them away after
  // a few seconds (it picks up the existing session). Short-circuit that —
  // bounce them to the right place immediately based on DB state.
  // Local-demo / E2E bypass skips Clerk middleware, so auth() would throw.
  if (!isLocalDemoRequest(await headers())) {
    const { userId } = await auth();
    if (userId) {
      const [row] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
      if (row?.onboardedAt) {
        redirect(row.type === "brand_member" ? "/dashboard" : "/feed");
      }
      redirect("/onboarding");
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-white px-4 py-8 font-sans text-[#37352f] sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-5xl bg-[radial-gradient(circle_at_24%_20%,rgba(140,201,232,0.28),transparent_36%),radial-gradient(circle_at_78%_16%,rgba(246,176,132,0.26),transparent_32%)] blur-3xl"
      />

      <section className="relative z-10 mx-auto grid w-full max-w-[408px]">
        <Link href="/" aria-label="Terrace" className="mx-auto mb-6 inline-flex items-center gap-3">
          <span className="logoMark miniLogo" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="flex items-baseline text-2xl font-semibold tracking-[-0.04em]">
            Terrace<span className="text-[#e08550]">.</span>
          </span>
        </Link>

        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e9e9e7] bg-white px-4 py-1.5 text-xs font-semibold text-[#657082] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#e08550]" />
            Create your account
          </div>
          <h1 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.045em] sm:text-[36px]">Join Terrace.</h1>
          <p className="mt-3 text-sm leading-6 text-[#787774]">
            Pick creator or brand during onboarding. Free to start.
          </p>
        </div>

        <section className="creatorlink-signup-form w-full rounded-[18px] border border-[#e9e9e7] bg-white p-4 shadow-[0_18px_46px_rgba(17,24,39,0.06)] sm:p-5">
          <SignUp
            appearance={clerkLightAppearance}
            path="/signup"
            routing="path"
            signInUrl="/login"
            fallbackRedirectUrl="/onboarding"
          />
          <p className="mt-5 text-center text-sm text-[#7b8494]">
            Already have an account?{" "}
            <Link className="font-semibold text-[#37352f] hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs font-medium text-[#9b9a97]">
          Protected by Clerk. No credit card required.
        </p>
      </section>
    </main>
  );
}
