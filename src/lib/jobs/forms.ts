export type JobCreateFormValues = {
  brandId: string;
  title: string;
  description: string;
  deliverablesText: string;
  nichesText: string;
  minFollowers: string;
  minEngagement: string;
  budgetMinDollars: string;
  budgetMaxDollars: string;
  deadline: string;
  location: string;
  remote: boolean;
  status: "draft" | "open";
};

export type JobApplicationFormValues = {
  pitch: string;
  proposedRateDollars: string;
};

export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function dollarsToCents(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }

  return Math.round(amount * 100);
}

export function optionalInteger(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export function optionalDate(value: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function toJobCreateInput(values: JobCreateFormValues) {
  return {
    brandId: values.brandId.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
    deliverables: splitLines(values.deliverablesText).map((title) => ({ title })),
    niches: splitCsv(values.nichesText),
    minFollowers: optionalInteger(values.minFollowers),
    minEngagement: values.minEngagement.trim() || undefined,
    budgetMinCents: dollarsToCents(values.budgetMinDollars),
    budgetMaxCents: dollarsToCents(values.budgetMaxDollars),
    deadline: optionalDate(values.deadline),
    location: values.location.trim() || undefined,
    remote: values.remote,
    status: values.status
  };
}

export function toJobApplicationInput(jobId: string, values: JobApplicationFormValues) {
  return {
    jobId,
    pitch: values.pitch.trim(),
    proposedRateCents: dollarsToCents(values.proposedRateDollars),
    attachments: []
  };
}
