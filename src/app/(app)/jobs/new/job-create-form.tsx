"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [values, setValues] = useState<JobCreateFormValues>(defaultValues);
  const [status, setStatus] = useState<string | null>(null);
  const memberships = trpc.brand.myMemberships.useQuery(undefined, {
    retry: false
  });
  const mutation = trpc.job.create.useMutation();
  const membershipRows = memberships.data ?? [];
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
      className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.045] p-6"
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
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#D85A30]/12 text-[#ffb49c] ring-1 ring-[#D85A30]/20">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Brand brief builder</p>
          <h2 className="text-2xl font-black tracking-[-0.04em]">Post a creator campaign</h2>
        </div>
      </div>

      <Field label="Brand" name="brandId">
        {memberships.isLoading ? (
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white/48">
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
            className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-[#D85A30]/60"
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
          className="rounded-xl border-white/10 bg-black/25 text-white placeholder:text-white/28 focus-visible:ring-[#D85A30]"
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
          className="min-h-36 rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white transition outline-none placeholder:text-white/28 focus:border-[#D85A30]/60"
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
            className="min-h-32 rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white transition outline-none placeholder:text-white/28 focus:border-[#D85A30]/60"
            id="deliverablesText"
            onChange={(event) => updateValue("deliverablesText", event.target.value)}
            value={values.deliverablesText}
          />
        </Field>

        <Field label="Niches" name="nichesText">
          <textarea
            className="min-h-32 rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white transition outline-none placeholder:text-white/28 focus:border-[#D85A30]/60"
            id="nichesText"
            onChange={(event) => updateValue("nichesText", event.target.value)}
            value={values.nichesText}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Min followers" name="minFollowers">
          <Input
            className="rounded-xl border-white/10 bg-black/25 text-white focus-visible:ring-[#D85A30]"
            id="minFollowers"
            min="0"
            onChange={(event) => updateValue("minFollowers", event.target.value)}
            type="number"
            value={values.minFollowers}
          />
        </Field>
        <Field label="Min engagement" name="minEngagement">
          <Input
            className="rounded-xl border-white/10 bg-black/25 text-white focus-visible:ring-[#D85A30]"
            id="minEngagement"
            onChange={(event) => updateValue("minEngagement", event.target.value)}
            value={values.minEngagement}
          />
        </Field>
        <Field label="Min budget" name="budgetMinDollars">
          <Input
            className="rounded-xl border-white/10 bg-black/25 text-white focus-visible:ring-[#D85A30]"
            id="budgetMinDollars"
            min="0"
            onChange={(event) => updateValue("budgetMinDollars", event.target.value)}
            type="number"
            value={values.budgetMinDollars}
          />
        </Field>
        <Field label="Max budget" name="budgetMaxDollars">
          <Input
            className="rounded-xl border-white/10 bg-black/25 text-white focus-visible:ring-[#D85A30]"
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
            className="rounded-xl border-white/10 bg-black/25 text-white focus-visible:ring-[#D85A30]"
            id="deadline"
            onChange={(event) => updateValue("deadline", event.target.value)}
            type="date"
            value={values.deadline}
          />
        </Field>
        <Field label="Location" name="location">
          <Input
            className="rounded-xl border-white/10 bg-black/25 text-white placeholder:text-white/28 focus-visible:ring-[#D85A30]"
            id="location"
            onChange={(event) => updateValue("location", event.target.value)}
            placeholder="Los Angeles, CA"
            value={values.location}
          />
        </Field>
        <Field label="Status" name="status">
          <select
            className="h-10 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-[#D85A30]/60"
            id="status"
            onChange={(event) => updateValue("status", event.target.value as JobCreateFormValues["status"])}
            value={values.status}
          >
            <option value="open">Publish open</option>
            <option value="draft">Save draft</option>
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-bold text-white/68">
        <input
          checked={values.remote}
          className="h-4 w-4 accent-[#D85A30]"
          onChange={(event) => updateValue("remote", event.target.checked)}
          type="checkbox"
        />
        Remote campaign
      </label>

      <Button
        className="h-11 rounded-xl bg-[#D85A30] font-black text-white hover:bg-[#c54f29]"
        disabled={mutation.isPending || memberships.isLoading || !canPostForSelectedBrand}
      >
        {mutation.isPending ? "Publishing..." : "Publish brief"}
      </Button>

      {status && <p className="text-sm leading-6 text-white/58">{status}</p>}
    </form>
  );
}

function BrandState({ description, title }: { description: string; title: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/8 text-white/54">
        <Building2 className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/52">{description}</p>
      </div>
    </div>
  );
}

function Field({ children, label, name }: { children: React.ReactNode; label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label className="text-white/70" htmlFor={name}>
        {label}
      </Label>
      {children}
    </div>
  );
}
