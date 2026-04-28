"use client";

import { useState, useTransition } from "react";
import { CreateOrganization, OrganizationList, useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NICHES, type Niche } from "@/lib/constants/niches";
import { checkHandleAvailability, completeBrandOnboarding, completeCreatorOnboarding } from "@/lib/onboarding/actions";
import { slugifyBrandName } from "@/lib/onboarding/schemas";

type Path = "creator" | "brand";

export function OnboardingFlow() {
  const [path, setPath] = useState<Path | null>(null);

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-xs font-black tracking-[0.24em] text-white/40 uppercase">Welcome to InfluencerLink</p>
          <h1 className="mt-2 text-4xl font-light tracking-tight">Set up your account</h1>
        </header>

        {path === null && <AccountTypeStep onPick={setPath} />}
        {path === "creator" && <CreatorPath onBack={() => setPath(null)} />}
        {path === "brand" && <BrandPath onBack={() => setPath(null)} />}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Step 1: choose path
// ---------------------------------------------------------------------------

function AccountTypeStep({ onPick }: { onPick: (path: Path) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-white/30 hover:bg-white/[0.06]"
        onClick={() => onPick("creator")}
        type="button"
      >
        <p className="text-xs font-black tracking-[0.18em] text-white/40 uppercase">For creators</p>
        <p className="mt-2 text-2xl font-semibold">Build your media kit</p>
        <p className="mt-3 text-sm text-white/60">
          Connect your platforms, set rates, and surface to brands looking for your niche.
        </p>
      </button>
      <button
        className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-white/30 hover:bg-white/[0.06]"
        onClick={() => onPick("brand")}
        type="button"
      >
        <p className="text-xs font-black tracking-[0.18em] text-white/40 uppercase">For companies</p>
        <p className="mt-2 text-2xl font-semibold">Run a campaign</p>
        <p className="mt-3 text-sm text-white/60">Spin up a team, search creators, and brief campaigns end to end.</p>
      </button>
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
        niches
      });
      if (result && !result.ok) {
        setErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <BackLink onClick={onBack} />

      <Field label="Handle" hint="Lowercase letters, numbers, underscores. 3–30 characters." error={errors.handle?.[0]}>
        <Input
          aria-describedby="handle-status"
          maxLength={30}
          onBlur={(event) => checkHandle(event.target.value)}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="sara_creates"
          value={handle}
        />
        <p className="mt-1.5 h-4 text-xs" id="handle-status">
          {handleStatus === "checking" && <span className="text-white/50">Checking…</span>}
          {handleStatus === "available" && <span className="text-emerald-400">Available</span>}
          {handleStatus === "taken" && <span className="text-rose-400">Already taken</span>}
          {handleStatus === "invalid" && <span className="text-rose-400">Invalid format</span>}
        </p>
      </Field>

      <Field label="Display name" error={errors.displayName?.[0]}>
        <Input
          maxLength={80}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Sara Rivera"
          value={displayName}
        />
      </Field>

      <Field label="Headline" hint="One line that sums up what you cover." error={errors.headline?.[0]}>
        <Input
          maxLength={120}
          onChange={(event) => setHeadline(event.target.value)}
          placeholder="Skincare routines for sensitive skin"
          value={headline}
        />
      </Field>

      <Field label="Bio" error={errors.bio?.[0]}>
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-[#303030] bg-[#1f1f1f] px-4 py-3 text-base text-white placeholder:text-[#929292]"
          maxLength={500}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell brands what you make and who watches it."
          value={bio}
        />
      </Field>

      <Field label="Location" error={errors.location?.[0]}>
        <Input
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
                className={`rounded-full px-3 py-1.5 text-sm transition ${active ? "bg-white text-black" : "border border-white/15 text-white/70 hover:border-white/40"}`}
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

      <Separator className="bg-white/10" />

      <PlaceholderBlock title="Connect platforms">
        Instagram, TikTok, and YouTube OAuth lights up in Phase 10. For now, your media kit shows the empty state.
      </PlaceholderBlock>

      <PlaceholderBlock title="Avatar &amp; cover">
        Image uploads (R2 + signed URLs) ship in Phase 9. We will use a placeholder gradient until then.
      </PlaceholderBlock>

      <div className="flex items-center justify-end gap-3">
        <Button disabled={pending} type="submit">
          {pending ? "Saving…" : "Finish creator setup"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Brand path
// ---------------------------------------------------------------------------

function BrandPath({ onBack }: { onBack: () => void }) {
  const { organization, isLoaded } = useOrganization();
  const [step, setStep] = useState<"org" | "profile">("org");

  if (step === "org" && organization) {
    return <BrandProfileStep onBack={() => setStep("org")} orgId={organization.id} orgName={organization.name} />;
  }

  return (
    <div className="grid gap-6">
      <BackLink onClick={onBack} />
      <p className="text-sm text-white/60">
        Brand teams are Clerk Organizations. Create a new one or join an existing team if you were invited.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 text-sm font-bold tracking-wide text-white/80">Existing teams</h3>
        <OrganizationList
          afterCreateOrganizationUrl="/onboarding"
          afterSelectOrganizationUrl="/onboarding"
          hidePersonal
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 text-sm font-bold tracking-wide text-white/80">Create a new brand team</h3>
        <CreateOrganization afterCreateOrganizationUrl="/onboarding" skipInvitationScreen={false} />
      </div>

      {!isLoaded && <p className="text-xs text-white/40">Loading Clerk org state…</p>}
      {isLoaded && organization && (
        <Button onClick={() => setStep("profile")} type="button">
          Continue with {organization.name}
        </Button>
      )}
    </div>
  );
}

function BrandProfileStep({ onBack, orgId, orgName }: { onBack: () => void; orgId: string; orgName: string }) {
  const [name, setName] = useState(orgName);
  const [slug, setSlug] = useState(slugifyBrandName(orgName));
  const [industry, setIndustry] = useState("");
  const [sizeRange, setSizeRange] = useState("");
  const [about, setAbout] = useState("");
  const [plan, setPlan] = useState<"free" | "growth" | "scale">("free");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  function submit() {
    setErrors({});
    startTransition(async () => {
      const result = await completeBrandOnboarding({ orgId, name, slug, industry, sizeRange, about, plan });
      if (result && !result.ok) {
        setErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <BackLink onClick={onBack} />

      <Field label="Brand name" error={errors.name?.[0]}>
        <Input
          onChange={(event) => {
            setName(event.target.value);
            setSlug(slugifyBrandName(event.target.value));
          }}
          value={name}
        />
      </Field>

      <Field label="URL slug" hint="Used in your public brand page URL." error={errors.slug?.[0]}>
        <Input onChange={(event) => setSlug(event.target.value)} value={slug} />
      </Field>

      <Field label="Industry" error={errors.industry?.[0]}>
        <Input
          onChange={(event) => setIndustry(event.target.value)}
          placeholder="Beauty, DTC, SaaS…"
          value={industry}
        />
      </Field>

      <Field label="Team size" error={errors.sizeRange?.[0]}>
        <select
          className="h-[48px] w-full rounded-xl border border-[#303030] bg-[#1f1f1f] px-4 text-base text-white"
          onChange={(event) => setSizeRange(event.target.value)}
          value={sizeRange}
        >
          <option value="">Select…</option>
          <option value="1-10">1–10</option>
          <option value="11-50">11–50</option>
          <option value="51-200">51–200</option>
          <option value="201-1000">201–1000</option>
          <option value="1000+">1000+</option>
        </select>
      </Field>

      <Field label="About" error={errors.about?.[0]}>
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-[#303030] bg-[#1f1f1f] px-4 py-3 text-base text-white placeholder:text-[#929292]"
          maxLength={1000}
          onChange={(event) => setAbout(event.target.value)}
          placeholder="What does your brand stand for?"
          value={about}
        />
      </Field>

      <Separator className="bg-white/10" />

      <Field label="Plan" hint="Stripe checkout connects in Phase 8. We stash your pick on Clerk metadata for now.">
        <div className="grid gap-3 sm:grid-cols-3">
          {(["free", "growth", "scale"] as const).map((tier) => (
            <button
              aria-pressed={plan === tier}
              className={`rounded-xl border px-4 py-3 text-left ${plan === tier ? "border-white bg-white/10" : "border-white/15 hover:border-white/40"}`}
              key={tier}
              onClick={() => setPlan(tier)}
              type="button"
            >
              <p className="text-base font-semibold capitalize">{tier}</p>
              <p className="mt-1 text-xs text-white/50">
                {tier === "free" && "Browse, save creators."}
                {tier === "growth" && "DMs, briefs, 3 active campaigns."}
                {tier === "scale" && "Unlimited campaigns, recruiter seats."}
              </p>
            </button>
          ))}
        </div>
      </Field>

      <PlaceholderBlock title="Invite teammates">
        Use Clerk&apos;s organization invites once your team is set up — admins can invite from the org dashboard.
      </PlaceholderBlock>

      <div className="flex items-center justify-end gap-3">
        <Button disabled={pending} type="submit">
          {pending ? "Saving…" : "Finish brand setup"}
        </Button>
      </div>
    </form>
  );
}

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
      <Label className="text-sm font-semibold text-white/80">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="self-start text-xs font-semibold tracking-wide text-white/50 uppercase hover:text-white"
      onClick={onClick}
      type="button"
    >
      ← Change account type
    </button>
  );
}

function PlaceholderBlock({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4">
      <p className="text-xs font-black tracking-[0.2em] text-white/40 uppercase">Placeholder · {title}</p>
      <p className="mt-2 text-sm text-white/60">{children}</p>
    </div>
  );
}
