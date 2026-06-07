"use client";

// Brand-side onboarding path. Lives in its own file so we can lazy-load it
// from onboarding-flow — Clerk's <CreateOrganization>/<OrganizationList>
// imports were a candidate for the original blank-screen blowup. Isolating
// them means a failure in this subtree can't take down AccountTypeStep.

import { useState, useTransition } from "react";
import { CreateOrganization, OrganizationList, useOrganization } from "@clerk/nextjs";
import { ArrowLeft, Building2, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NoiseBackground } from "@/components/ui/noise-background";
import { completeBrandOnboarding } from "@/lib/onboarding/actions";
import { slugifyBrandName } from "@/lib/onboarding/schemas";

const inputClassName =
  "h-[52px] rounded-2xl border-[#d8dee8] bg-[#f8fafc] px-5 text-base text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(17,24,39,0.04)] placeholder:text-[#667085] focus-visible:ring-[#8CC9E8]/30";

export function BrandPath({ onBack }: { onBack: () => void }) {
  const { organization, isLoaded } = useOrganization();
  const [step, setStep] = useState<"org" | "profile">("org");

  if (step === "profile" && organization) {
    return <BrandProfileStep onBack={() => setStep("org")} orgId={organization.id} orgName={organization.name} />;
  }

  return (
    <div className="grid gap-5 rounded-[28px] border border-[#e9e9e7] bg-white p-5 shadow-[0_18px_46px_rgba(17,24,39,0.06)] sm:p-7">
      <BackLink onClick={onBack} />

      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">Brand setup</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em]">Create your hiring workspace.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#787774]">
          Brand teams use organizations, so recruiters, admins, and teammates can work from one shared Terrace page.
        </p>
      </div>

      <div className="rounded-[24px] border border-[#e9e9e7] bg-[#fbfbfa] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eaf7fd] text-[#3487ad]">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-[#263142]">Existing teams</h3>
            <p className="text-xs text-[#7b8494]">Join a brand workspace if you were invited.</p>
          </div>
        </div>
        <OrganizationList
          afterCreateOrganizationUrl="/onboarding"
          afterSelectOrganizationUrl="/onboarding"
          hidePersonal
        />
      </div>

      <div className="rounded-[24px] border border-[#e9e9e7] bg-[#fbfbfa] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff0e8] text-[#D86B3D]">
            <Building2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-[#263142]">Create a new brand team</h3>
            <p className="text-xs text-[#7b8494]">Start fresh with a shared company profile.</p>
          </div>
        </div>
        <CreateOrganization afterCreateOrganizationUrl="/onboarding" skipInvitationScreen={false} />
      </div>

      {!isLoaded && <p className="text-xs text-[#7b8494]">Loading Clerk org state...</p>}
      {isLoaded && organization && (
        <div className="flex justify-end">
          <NoiseBackground containerClassName="rounded-2xl">
            <Button
              className="h-12 rounded-[14px] border-0 bg-white px-6 text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(17,24,39,0.12)] hover:bg-white"
              onClick={() => setStep("profile")}
              type="button"
            >
              Continue with {organization.name}
            </Button>
          </NoiseBackground>
        </div>
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
      className="grid gap-5 rounded-[28px] border border-[#e9e9e7] bg-white p-5 shadow-[0_18px_46px_rgba(17,24,39,0.06)] sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <BackLink onClick={onBack} />

      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">Company profile</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em]">Make your brand discoverable.</h2>
        <p className="mt-3 text-sm leading-6 text-[#787774]">
          This becomes your public Terrace page for jobs, posts, and creator outreach.
        </p>
      </div>

      <Field label="Brand name" error={errors.name?.[0]}>
        <Input
          className={inputClassName}
          onChange={(event) => {
            setName(event.target.value);
            setSlug(slugifyBrandName(event.target.value));
          }}
          value={name}
        />
      </Field>

      <Field label="URL slug" hint="Used in your public brand page URL." error={errors.slug?.[0]}>
        <Input className={inputClassName} onChange={(event) => setSlug(event.target.value)} value={slug} />
      </Field>

      <Field label="Industry" error={errors.industry?.[0]}>
        <Input
          className={inputClassName}
          onChange={(event) => setIndustry(event.target.value)}
          placeholder="Beauty, DTC, SaaS..."
          value={industry}
        />
      </Field>

      <Field label="Team size" error={errors.sizeRange?.[0]}>
        <select
          className="h-[52px] w-full rounded-2xl border border-[#d8dee8] bg-[#f8fafc] px-5 text-base text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(17,24,39,0.04)] focus:ring-4 focus:ring-[#8CC9E8]/25 focus:outline-none"
          onChange={(event) => setSizeRange(event.target.value)}
          value={sizeRange}
        >
          <option value="">Select...</option>
          <option value="1-10">1-10</option>
          <option value="11-50">11-50</option>
          <option value="51-200">51-200</option>
          <option value="201-1000">201-1000</option>
          <option value="1000+">1000+</option>
        </select>
      </Field>

      <Field label="About" error={errors.about?.[0]}>
        <textarea
          className="min-h-[120px] w-full rounded-2xl border border-[#d8dee8] bg-[#f8fafc] px-5 py-4 text-base text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(17,24,39,0.04)] placeholder:text-[#667085] focus:ring-4 focus:ring-[#8CC9E8]/25 focus:outline-none"
          maxLength={1000}
          onChange={(event) => setAbout(event.target.value)}
          placeholder="What does your brand stand for?"
          value={about}
        />
      </Field>

      <Separator className="bg-muted/30" />

      <Field label="Plan" hint="Stripe checkout connects in Phase 8. We stash your pick on Clerk metadata for now.">
        <div className="grid gap-3 sm:grid-cols-3">
          {(["free", "growth", "scale"] as const).map((tier) => (
            <button
              aria-pressed={plan === tier}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                plan === tier
                  ? "border-[#37352f] bg-[#37352f] text-white shadow-[0_18px_38px_rgba(17,24,39,0.16)]"
                  : "border-[#d8dee8] bg-white text-[#37352f] hover:border-[#bfc8d4]"
              }`}
              key={tier}
              onClick={() => setPlan(tier)}
              type="button"
            >
              <p className="flex items-center gap-2 text-base font-semibold capitalize">
                {plan === tier && <CheckCircle2 className="h-4 w-4 text-[#f5b38e]" />}
                {tier}
              </p>
              <p className={`mt-1 text-xs ${plan === tier ? "text-white/62" : "text-[#787774]"}`}>
                {tier === "free" && "Browse, save creators."}
                {tier === "growth" && "DMs, briefs, 3 active campaigns."}
                {tier === "scale" && "Unlimited campaigns, recruiter seats."}
              </p>
            </button>
          ))}
        </div>
      </Field>

      <div className="rounded-2xl border border-dashed border-[#d8dee8] bg-[#fbfbfa] p-4">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#8a94a5] uppercase">
          Placeholder - Invite teammates
        </p>
        <p className="mt-2 text-sm leading-6 text-[#787774]">
          Use Clerk&apos;s organization invites once your team is set up. Admins can invite from the org dashboard.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <NoiseBackground containerClassName="rounded-2xl">
          <Button
            className="h-12 rounded-[14px] border-0 bg-white px-6 text-[#37352f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(17,24,39,0.12)] hover:bg-white"
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving..." : "Finish brand setup"}
          </Button>
        </NoiseBackground>
      </div>
    </form>
  );
}

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
