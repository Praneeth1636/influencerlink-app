"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { NoiseBackground } from "@/components/ui/noise-background";
import { ImageUpload } from "@/components/upload/image-upload";
import { NICHES, type Niche } from "@/lib/constants/niches";
import { checkHandleAvailability, completeCreatorOnboarding } from "@/lib/onboarding/actions";

// Lazy-loaded so the Clerk org components don't get evaluated at module load.
// If anything in the brand subtree blows up, AccountTypeStep + CreatorPath
// continue to render — we don't take the whole page to a blank screen.
const BrandPath = dynamic(() => import("./brand-path").then((m) => m.BrandPath), {
  ssr: false,
  loading: () => <p className="text-sm font-medium text-[#787774]">Loading brand setup…</p>
});

type Path = "creator" | "brand";

const inputClassName =
  "h-[52px] rounded-2xl border-[#d8dee8] bg-[#f8fafc] px-5 text-base text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(17,24,39,0.04)] placeholder:text-[#667085] focus-visible:ring-[#8CC9E8]/30";

export function OnboardingFlow() {
  const [path, setPath] = useState<Path | null>(null);
  const { signOut } = useClerk();

  return (
    <main className="creatorlink-auth-light relative min-h-screen overflow-hidden bg-white px-4 py-8 font-sans text-[#37352f] sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-6xl bg-[radial-gradient(circle_at_20%_18%,rgba(140,201,232,0.34),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(246,176,132,0.32),transparent_30%)] blur-3xl"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] opacity-45">
        <BackgroundRippleEffect />
      </div>

      <div className="relative z-10 mx-auto grid max-w-5xl gap-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Terrace" className="inline-flex items-center gap-3">
            <span className="logoMark miniLogo" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="flex items-baseline text-2xl font-semibold tracking-[-0.04em]">
              Terrace<span className="text-[#D86B3D]">.</span>
            </span>
          </Link>
          <button
            type="button"
            className="text-sm font-semibold text-[#787774] transition hover:text-[#37352f]"
            onClick={() => {
              void signOut({ redirectUrl: "/" });
            }}
          >
            Sign out
          </button>
        </header>

        <section className="creatorlink-animate-in rounded-[32px] border border-[#e9e9e7] bg-white/78 p-5 shadow-[0_28px_72px_rgba(17,24,39,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1fr)]">
            <div className="max-w-2xl text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e9e9e7] bg-white/80 px-4 py-2 text-sm font-bold text-[#657082] shadow-sm">
                <Sparkles className="h-4 w-4 text-[#D86B3D]" />
                First, shape your Terrace
              </div>
              <h1 className="text-[clamp(42px,7vw,74px)] leading-[0.94] font-semibold tracking-[-0.075em]">
                Pick your side. See the network come alive.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#787774]">
                Creators build verified proof. Brands build a hiring surface. Both meet in the same Terrace flow.
              </p>
            </div>
            <OnboardingProductPreview />
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            {path === null && <AccountTypeStep onPick={setPath} />}
            {path === "creator" && <CreatorPath onBack={() => setPath(null)} />}
            {path === "brand" && <BrandPath onBack={() => setPath(null)} />}
          </div>
        </section>
      </div>
    </main>
  );
}

function OnboardingProductPreview() {
  return (
    <div className="creatorlink-float-slow relative hidden min-h-[410px] overflow-hidden rounded-[30px] border border-[#151922]/10 bg-[#0d1016] p-5 text-white shadow-[0_28px_76px_rgba(17,24,39,0.18)] lg:block">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(140,201,232,0.26),transparent_32%),radial-gradient(circle_at_88%_85%,rgba(216,107,61,0.24),transparent_34%)]"
      />
      <div className="absolute top-5 right-5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/62">
        live setup
      </div>

      <div className="relative z-10 grid gap-4">
        <div className="w-[78%] rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f5b38e] text-sm font-black text-[#37352f]">
              SR
            </div>
            <div>
              <p className="text-sm font-semibold">Sara Rivera</p>
              <p className="text-xs text-white/48">Beauty creator · LA</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["2.4M", "Reach"],
              ["5.8%", "Eng"],
              ["$3.2K", "Avg"]
            ].map(([value, label]) => (
              <div className="rounded-2xl bg-white/[0.07] p-3" key={label}>
                <p className="text-lg font-semibold tracking-[-0.04em]">{value}</p>
                <p className="text-[11px] text-white/42">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="creatorlink-float-card ml-auto w-[78%] rounded-3xl border border-white/10 bg-white/[0.08] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#f5b38e] uppercase">Brand search</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Women 18-30", "Skincare", "$1K-$4K", "TikTok"].map((item) => (
              <span
                className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs text-white/66"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-white p-3 text-[#37352f]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">94% match</p>
              <span className="rounded-full bg-[#fff0e8] px-2.5 py-1 text-[11px] font-bold text-[#D86B3D]">
                top fit
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#787774]">
              High beauty audience fit and reliable response time.
            </p>
          </div>
        </div>

        <div className="w-[62%] rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <p className="text-sm font-semibold">Campaign brief</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="creatorlink-progress h-full w-[82%] rounded-full bg-[#8CC9E8]" />
          </div>
          <p className="mt-2 text-xs text-white/46">Building shortlist...</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: choose path
// ---------------------------------------------------------------------------

function AccountTypeStep({ onPick }: { onPick: (path: Path) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BackgroundGradient containerClassName="transition duration-300 hover:-translate-y-1">
        <button
          className="group relative h-full w-full overflow-hidden rounded-[28px] bg-[#0b0d12] p-6 text-left text-white transition duration-300 sm:p-7"
          onClick={() => onPick("creator")}
          type="button"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(140,201,232,0.22),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(216,107,61,0.22),transparent_30%)]" />
          <div className="pointer-events-none absolute -right-10 bottom-6 h-32 w-48 rotate-[-12deg] rounded-[32px] border border-white/10 bg-white/[0.04] transition duration-500 group-hover:rotate-[-7deg]" />
          <div className="relative z-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#f5b38e]">
              <Users className="h-5 w-5" />
            </span>
            <p className="mt-8 text-xs font-semibold tracking-[0.18em] text-white/52 uppercase">For creators</p>
            <p className="mt-2 text-4xl leading-[1] font-semibold tracking-[-0.06em]">Build your media kit</p>
            <p className="mt-4 text-sm leading-6 text-white/58">
              Connect your platforms, set rates, and surface to brands looking for your niche.
            </p>
          </div>
        </button>
      </BackgroundGradient>
      <BackgroundGradient containerClassName="transition duration-300 hover:-translate-y-1">
        <button
          className="group relative h-full w-full overflow-hidden rounded-[28px] bg-white p-6 text-left transition duration-300 sm:p-7"
          onClick={() => onPick("brand")}
          type="button"
        >
          <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-[#fff0e8]" />
          <div className="pointer-events-none absolute -right-8 bottom-7 h-28 w-44 rotate-[-12deg] rounded-[32px] border border-[#e9d8cf] bg-[#fff8f3] transition duration-500 group-hover:rotate-[-7deg]" />
          <div className="relative z-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0e8] text-[#D86B3D]">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <p className="mt-8 text-xs font-semibold tracking-[0.18em] text-[#8a94a5] uppercase">For brands</p>
            <p className="mt-2 text-4xl leading-[1] font-semibold tracking-[-0.06em]">Run a campaign</p>
            <p className="mt-4 text-sm leading-6 text-[#787774]">
              Spin up a team, search creators, and brief campaigns end to end.
            </p>
          </div>
        </button>
      </BackgroundGradient>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creator path
// ---------------------------------------------------------------------------

function CreatorPath({ onBack }: { onBack: () => void }) {
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [niches, setNiches] = useState<Niche[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  function toggleNiche(n: Niche) {
    setNiches((current) =>
      current.includes(n) ? current.filter((x) => x !== n) : current.length >= 5 ? current : [...current, n]
    );
  }

  async function checkHandle(value: string) {
    const cleaned = value.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,30}$/.test(cleaned)) {
      setHandleStatus("invalid");
      return;
    }
    setHandleStatus("checking");
    const result = await checkHandleAvailability(cleaned);
    setHandleStatus(result.available ? "available" : "taken");
  }

  function submit() {
    setErrors({});
    startTransition(async () => {
      const result = await completeCreatorOnboarding({
        handle: handle.toLowerCase(),
        displayName,
        headline,
        bio,
        location,
        niches,
        avatarUrl: avatarUrl ?? "",
        coverUrl: coverUrl ?? ""
      });
      if (result && !result.ok) {
        setErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form
      className="grid gap-5 rounded-[28px] border border-[#e9e9e7] bg-white p-5 shadow-[0_18px_46px_rgba(17,24,39,0.06)] sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <BackLink onClick={onBack} />

      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">Creator setup</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em]">Build your public proof.</h2>
      </div>

      <Field label="Handle" hint="Lowercase letters, numbers, underscores. 3–30 characters." error={errors.handle?.[0]}>
        <Input
          aria-describedby="handle-status"
          maxLength={30}
          onBlur={(event) => checkHandle(event.target.value)}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="sara_creates"
          className={inputClassName}
          value={handle}
        />
        <p className="mt-1.5 h-4 text-xs" id="handle-status">
          {handleStatus === "checking" && <span className="text-muted-foreground">Checking…</span>}
          {handleStatus === "available" && <span className="text-emerald-400">Available</span>}
          {handleStatus === "taken" && <span className="text-rose-400">Already taken</span>}
          {handleStatus === "invalid" && <span className="text-rose-400">Invalid format</span>}
        </p>
      </Field>

      <Field label="Display name" error={errors.displayName?.[0]}>
        <Input
          className={inputClassName}
          maxLength={80}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Sara Rivera"
          value={displayName}
        />
      </Field>

      <Field label="Headline" hint="One line that sums up what you cover." error={errors.headline?.[0]}>
        <Input
          className={inputClassName}
          maxLength={120}
          onChange={(event) => setHeadline(event.target.value)}
          placeholder="Skincare routines for sensitive skin"
          value={headline}
        />
      </Field>

      <Field label="Bio" error={errors.bio?.[0]}>
        <textarea
          className="min-h-[120px] w-full rounded-2xl border border-[#d8dee8] bg-[#f8fafc] px-5 py-4 text-base text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(17,24,39,0.04)] placeholder:text-[#667085] focus:ring-4 focus:ring-[#8CC9E8]/25 focus:outline-none"
          maxLength={500}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell brands what you make and who watches it."
          value={bio}
        />
      </Field>

      <Field label="Location" error={errors.location?.[0]}>
        <Input
          className={inputClassName}
          maxLength={80}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Brooklyn, NY"
          value={location}
        />
      </Field>

      <Field label="Niches" hint={`Pick 1–5. ${niches.length}/5 selected.`} error={errors.niches?.[0]}>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => {
            const active = niches.includes(n);
            return (
              <button
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[#37352f] text-white"
                    : "border border-[#d8dee8] bg-white text-[#566174] hover:border-[#bfc8d4]"
                }`}
                key={n}
                onClick={() => toggleNiche(n)}
                type="button"
              >
                {n}
              </button>
            );
          })}
        </div>
      </Field>

      <Separator className="bg-muted/30" />

      <PlaceholderBlock icon={<BadgeCheck className="h-4 w-4" />} title="Connect platforms">
        Instagram, TikTok, and YouTube connection is available after platform approval. Until then, your media kit can
        be completed manually.
      </PlaceholderBlock>

      <div className="grid gap-4 rounded-[24px] border border-[#e9e9e7] bg-[#fbfbfa] p-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <ImageUpload
          aspect="square"
          hint="JPG, PNG, WebP, or GIF. Max 5 MB."
          kind="avatar"
          label="Profile photo"
          onChange={setAvatarUrl}
          value={avatarUrl}
        />
        <ImageUpload
          aspect="wide"
          hint="Cover image. Max 8 MB."
          kind="cover"
          label="Cover"
          onChange={setCoverUrl}
          value={coverUrl}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <NoiseBackground containerClassName="rounded-2xl">
          <Button
            className="h-12 rounded-[14px] border-0 bg-white px-6 text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(17,24,39,0.12)] hover:bg-white"
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving…" : "Finish creator setup"}
          </Button>
        </NoiseBackground>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Brand path lives in ./brand-path so we can next/dynamic it. Anything below
// is shared form helpers used by the creator path.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function Field({
  children,
  error,
  hint,
  label
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-semibold text-[#263142]">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs leading-5 text-[#7b8494]">{hint}</p>}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="self-start text-xs font-semibold tracking-wide text-[#787774] uppercase transition hover:text-[#37352f]"
      onClick={onClick}
      type="button"
    >
      <ArrowLeft className="mr-2 inline h-3.5 w-3.5" />
      Change account type
    </button>
  );
}

function PlaceholderBlock({
  children,
  icon,
  title
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8dee8] bg-[#fbfbfa] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#8a94a5] uppercase">
        {icon}
        Placeholder · {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#787774]">{children}</p>
    </div>
  );
}
