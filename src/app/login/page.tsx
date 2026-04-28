"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { LogoSparkles } from "@/components/ui/sparkles";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"creator" | "brand">("creator");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isSignIn = mode === "signin";

  function portalFor(user?: { accountType?: string }) {
    return user?.accountType === "brand" || user?.accountType === "agency" || user?.accountType === "manager"
      ? "/feed"
      : "/creator";
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch(isSignIn ? "/api/auth/signin" : "/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isSignIn ? { email } : { email, name, accountType })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Something went wrong. Please try again.");
      return;
    }

    const payload = (await response.json()) as { user?: { accountType?: string } };
    router.push(portalFor(payload.user));
    router.refresh();
  }

  async function continueWithGoogle() {
    setError("");
    setIsSubmitting(true);
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@influencerlink.ai" })
    });
    setIsSubmitting(false);
    if (!response.ok) {
      setError("Unable to start demo session.");
      return;
    }
    const payload = (await response.json()) as { user?: { accountType?: string } };
    router.push(portalFor(payload.user));
    router.refresh();
  }

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
        <div className="grid w-full max-w-[600px] gap-9">
          <div className="grid justify-items-center gap-4 text-center">
            <div className="grid justify-items-center lg:hidden">
              <Link className="logoMark authLogo" href="/login" aria-label="InfluencerLink">
                <span />
                <span />
                <span />
              </Link>
              <LogoSparkles className="h-12" />
            </div>
            <h2 className="text-[42px] font-bold tracking-[-0.03em]">{isSignIn ? "Sign in" : "Sign up"}</h2>
            <p className="text-xl text-[#9f9f9f]">
              {isSignIn
                ? "Welcome back! Please sign in to continue."
                : "Choose creator or company and enter the right portal."}
            </p>
          </div>

          <Button
            className="h-[60px] rounded-xl border border-[#3a3a3a] bg-[#282828] text-xl font-semibold text-white hover:bg-[#303030]"
            onClick={continueWithGoogle}
          >
            <span className="mr-3 text-[24px] font-black text-[#4285f4]">G</span>
            Continue with Google
          </Button>

          <div className="flex items-center gap-5 text-[#8b8b8b]">
            <Separator className="bg-[#424242]" />
            <span className="text-base">or</span>
            <Separator className="bg-[#424242]" />
          </div>

          <form className="grid gap-7" onSubmit={submitAuth}>
            {!isSignIn && (
              <div className="grid gap-3">
                <Label className="text-lg font-semibold text-[#dfdfdf]" htmlFor="name">
                  Full name
                </Label>
                <Input
                  className="h-[62px] rounded-xl border-[#303030] bg-[#282828] px-5 text-xl text-white placeholder:text-[#929292]"
                  id="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Sara Rivera"
                  value={name}
                />
              </div>
            )}

            <div className="grid gap-3">
              <Label className="text-lg font-semibold text-[#dfdfdf]" htmlFor="email">
                Email address
              </Label>
              <Input
                className="h-[62px] rounded-xl border-[#303030] bg-[#282828] px-5 text-xl text-white placeholder:text-[#929292]"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hello@app.com"
                type="email"
                value={email}
              />
            </div>

            {!isSignIn && (
              <div className="grid gap-3">
                <Label className="text-lg font-semibold text-[#dfdfdf]" htmlFor="account-type">
                  Account type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`h-[54px] rounded-xl border border-[#303030] text-lg font-semibold ${accountType === "creator" ? "bg-[#282828] text-white" : "bg-[#1f1f1f] text-[#a8a8a8]"}`}
                    onClick={() => setAccountType("creator")}
                    type="button"
                  >
                    Creator
                  </button>
                  <button
                    className={`h-[54px] rounded-xl border border-[#303030] text-lg font-semibold ${accountType === "brand" ? "bg-[#282828] text-white" : "bg-[#1f1f1f] text-[#a8a8a8]"}`}
                    onClick={() => setAccountType("brand")}
                    type="button"
                  >
                    Company
                  </button>
                </div>
              </div>
            )}

            {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

            <Button
              className="mt-3 h-[60px] rounded-xl bg-[#2d73ff] text-xl font-semibold text-white shadow-[0_18px_40px_rgba(45,115,255,0.24)] hover:bg-[#2167f2]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Working..." : isSignIn ? "Continue" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-xl text-[#9f9f9f]">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="font-bold text-white"
              onClick={() => setMode(isSignIn ? "signup" : "signin")}
              type="button"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-base text-[#666]">
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
