"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { BriefcaseBusiness, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isLocalDemoHost, LOCAL_DEMO_BRAND_ID } from "@/lib/auth/local-demo";
import { type JobCreateFormValues, toJobCreateInput } from "@/lib/jobs/forms";
import { trpc } from "@/lib/trpc/client";

const defaultValues: JobCreateFormValues = {
  brandId: "",
  title: "",
  description: "",
  deliverablesText: "1 TikTok video\n1 Instagram Reel\nUsage rights for 30 days",
  nichesText: "Beauty, Lifestyle",
  minFollowers: "100000",
  minEngagement: "4.5",
  budgetMinDollars: "2500",
  budgetMaxDollars: "5000",
  deadline: "",
  location: "",
  remote: true,
  status: "open"
};

export function JobCreateForm() {
  const router = useRouter();
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const allowLocalDemo = isLocalDemoHost();
  const [values, setValues] = useState<JobCreateFormValues>(defaultValues);
  const [status, setStatus] = useState<string | null>(null);
  const memberships = trpc.brand.myMemberships.useQuery(undefined, {
    enabled: userLoaded && (isSignedIn || allowLocalDemo),
    retry: false
  });
  const mutation = trpc.job.create.useMutation();
  const localDemoMembershipRows = allowLocalDemo
    ? [
        {
          member: {
            brandId: LOCAL_DEMO_BRAND_ID,
            userId: "local-demo",
            role: "owner" as const,
            invitedBy: null,
            joinedAt: new Date()
          },
          brand: {
            id: LOCAL_DEMO_BRAND_ID,
            slug: "terrace-studio",
            name: "Terrace Studio",
            tagline: "Local demo brand workspace",
            about: "A local demo brand for testing Terrace briefs.",
            websiteUrl: "https://terrace.local",
            logoUrl: null,
            coverUrl: null,
            industry: "Beauty",
            sizeRange: "11-50",
            hqLocation: "Remote",
            verified: true,
            followerCount: 12800,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      ]
    : [];
  const membershipRows = memberships.data?.length ? memberships.data : localDemoMembershipRows;
  const canPostForSelectedBrand = membershipRows.some(
    (membership) =>
      membership.brand.id === values.brandId && ["owner", "admin", "recruiter"].includes(membership.member.role)
  );

  function updateValue<K extends keyof JobCreateFormValues>(key: K, value: JobCreateFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    const firstWritableBrand = memberships.data?.find((membership) =>
      ["owner", "admin", "recruiter"].includes(membership.member.role)
    );

    if (!values.brandId && firstWritableBrand) {
      setValues((current) => ({ ...current, brandId: firstWritableBrand.brand.id }));
    }
  }, [memberships.data, values.brandId]);

  return (
    <form
      className="terrace-panel grid gap-4 rounded-[20px] p-4 sm:gap-5 sm:rounded-[24px] sm:p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus(null);

        try {
          const created = await mutation.mutateAsync(toJobCreateInput(values));
          setStatus("Brief published. Opening the public brief page...");
          router.push(`/jobs/${created.id}`);
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Unable to publish this brief right now.");
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#faf0ea] text-[#e08550] ring-1 ring-[#f3d5c4]">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Brand brief builder</p>
          <h2 className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">Post a creator campaign</h2>
        </div>
      </div>

      <Field label="Brand" name="brandId">
        {userLoaded && !isSignedIn && !allowLocalDemo ? (
          <BrandState
            description="Sign in with a brand member account, or create a brand workspace during onboarding, to publish briefs."
            title="No brand session found"
          />
        ) : memberships.isLoading ? (
          <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] px-3 py-3 text-sm text-[#787774]">
            Loading your brand teams...
          </div>
        ) : memberships.isError ? (
          <BrandState
            description="Sign in with a brand member account to publish briefs."
            title="No brand session found"
          />
        ) : membershipRows.length === 0 ? (
          <BrandState
            description="Create or join a brand organization before posting campaign briefs."
            title="No brand memberships yet"
          />
        ) : (
          <select
            className="h-11 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] px-3 text-sm text-[#37352f] outline-none focus:border-[#9fc9e4] focus:bg-white"
            id="brandId"
            onChange={(event) => updateValue("brandId", event.target.value)}
            required
            value={values.brandId}
          >
            {membershipRows.map((membership) => (
              <option
                disabled={!["owner", "admin", "recruiter"].includes(membership.member.role)}
                key={membership.brand.id}
                value={membership.brand.id}
              >
                {membership.brand.name} · {membership.member.role}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Campaign title" name="title">
        <Input
          className="rounded-lg border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] placeholder:text-[#9b9a97] focus-visible:ring-[#9fc9e4]"
          id="title"
          maxLength={140}
          minLength={8}
          onChange={(event) => updateValue("title", event.target.value)}
          placeholder="Glossier: Summer skincare launch creator brief"
          required
          value={values.title}
        />
      </Field>

      <Field label="Brief" name="description">
        <textarea
          className="min-h-36 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] px-3 py-3 text-sm leading-6 text-[#37352f] transition outline-none placeholder:text-[#9b9a97] focus:border-[#9fc9e4] focus:bg-white"
          id="description"
          maxLength={6000}
          minLength={30}
          onChange={(event) => updateValue("description", event.target.value)}
          placeholder="Describe the campaign, audience, creative direction, timeline, and approval process."
          required
          value={values.description}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Deliverables" name="deliverablesText">
          <textarea
            className="min-h-32 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] px-3 py-3 text-sm leading-6 text-[#37352f] transition outline-none placeholder:text-[#9b9a97] focus:border-[#9fc9e4] focus:bg-white"
            id="deliverablesText"
            onChange={(event) => updateValue("deliverablesText", event.target.value)}
            value={values.deliverablesText}
          />
        </Field>

        <Field label="Niches" name="nichesText">
          <textarea
            className="min-h-32 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] px-3 py-3 text-sm leading-6 text-[#37352f] transition outline-none placeholder:text-[#9b9a97] focus:border-[#9fc9e4] focus:bg-white"
            id="nichesText"
            onChange={(event) => updateValue("nichesText", event.target.value)}
            value={values.nichesText}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Min followers" name="minFollowers">
          <Input
            className="rounded-lg border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] focus-visible:ring-[#9fc9e4]"
            id="minFollowers"
            min="0"
            onChange={(event) => updateValue("minFollowers", event.target.value)}
            type="number"
            value={values.minFollowers}
          />
        </Field>
        <Field label="Min engagement" name="minEngagement">
          <Input
            className="rounded-lg border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] focus-visible:ring-[#9fc9e4]"
            id="minEngagement"
            onChange={(event) => updateValue("minEngagement", event.target.value)}
            value={values.minEngagement}
          />
        </Field>
        <Field label="Min budget" name="budgetMinDollars">
          <Input
            className="rounded-lg border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] focus-visible:ring-[#9fc9e4]"
            id="budgetMinDollars"
            min="0"
            onChange={(event) => updateValue("budgetMinDollars", event.target.value)}
            type="number"
            value={values.budgetMinDollars}
          />
        </Field>
        <Field label="Max budget" name="budgetMaxDollars">
          <Input
            className="rounded-lg border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] focus-visible:ring-[#9fc9e4]"
            id="budgetMaxDollars"
            min="0"
            onChange={(event) => updateValue("budgetMaxDollars", event.target.value)}
            type="number"
            value={values.budgetMaxDollars}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Deadline" name="deadline">
          <Input
            className="rounded-lg border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] focus-visible:ring-[#9fc9e4]"
            id="deadline"
            onChange={(event) => updateValue("deadline", event.target.value)}
            type="date"
            value={values.deadline}
          />
        </Field>
        <Field label="Location" name="location">
          <Input
            className="rounded-lg border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] placeholder:text-[#9b9a97] focus-visible:ring-[#9fc9e4]"
            id="location"
            onChange={(event) => updateValue("location", event.target.value)}
            placeholder="Los Angeles, CA"
            value={values.location}
          />
        </Field>
        <Field label="Status" name="status">
          <select
            className="h-10 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] px-3 text-sm text-[#37352f] outline-none focus:border-[#9fc9e4] focus:bg-white"
            id="status"
            onChange={(event) => updateValue("status", event.target.value as JobCreateFormValues["status"])}
            value={values.status}
          >
            <option value="open">Publish open</option>
            <option value="draft">Save draft</option>
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-3 text-sm font-medium text-[#787774]">
        <input
          checked={values.remote}
          className="h-4 w-4 accent-[#e08550]"
          onChange={(event) => updateValue("remote", event.target.checked)}
          type="checkbox"
        />
        Remote campaign
      </label>

      <Button
        className="h-11 rounded-full bg-[#37352f] font-semibold text-white hover:bg-[#262420]"
        disabled={mutation.isPending || memberships.isLoading || !canPostForSelectedBrand}
      >
        {mutation.isPending ? "Publishing..." : "Publish brief"}
      </Button>

      {status && <p className="text-sm leading-6 text-[#787774]">{status}</p>}
    </form>
  );
}

function BrandState({ description, title }: { description: string; title: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#9b9a97]">
        <Building2 className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#37352f]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#787774]">{description}</p>
      </div>
    </div>
  );
}

function Field({ children, label, name }: { children: React.ReactNode; label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label className="text-[#787774]" htmlFor={name}>
        {label}
      </Label>
      {children}
    </div>
  );
}
