// Typed email template builders. Each returns { subject, html, text } so the
// caller can pass them straight into deliverEmail. Templates here stay
// framework-free (no React Email yet) — strings are the lowest-friction
// surface and let the rest of the email pipeline ship today.

import type { EmailEnvelope } from "./resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://terrace.app";
const SUPPORT_EMAIL = process.env.EMAIL_REPLY_TO ?? "support@terrace.app";

// ─────────────────────────────────────────────────────────────────────────
// Shared layout — every transactional email gets the same chrome so we
// look like one product across the inbox.
// ─────────────────────────────────────────────────────────────────────────

interface LayoutOptions {
  preheader?: string; // inbox preview text (not visible in body)
  body: string; // inner HTML — should NOT include outer wrapper
}

function wrapInLayout({ preheader = "", body }: LayoutOptions): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#fbfcfd;font-family:-apple-system,system-ui,'Segoe UI',Roboto,sans-serif;color:#111318;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>` : ""}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fbfcfd;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border:1px solid #ececec;border-radius:20px;overflow:hidden;">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #ececec;">
          <a href="${APP_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;color:#111318;">
            <span style="display:inline-block;width:24px;height:24px;background:#D85A30;border-radius:6px;"></span>
            <span style="font-weight:700;font-size:16px;letter-spacing:-0.01em;">Terrace</span>
          </a>
        </td></tr>
        <tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#252932;">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #ececec;background:#fbfcfd;font-size:12px;color:#9aa3b2;line-height:1.5;">
          Terrace · <a href="mailto:${SUPPORT_EMAIL}" style="color:#9aa3b2;">${SUPPORT_EMAIL}</a><br/>
          The professional network for creator deals.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#090b10;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">${label}</a>`;
}

type WelcomeInput = {
  to: string;
  displayName?: string | null;
};

export function welcomeEmail(input: WelcomeInput): EmailEnvelope {
  const greeting = input.displayName ? `Hi ${input.displayName},` : "Hi there,";

  const html = wrapInLayout({
    preheader: "Welcome to Terrace — finish setting up your account.",
    body: `
      <h1 style="font-size:24px;font-weight:700;letter-spacing:-0.025em;margin:0 0 16px;">Welcome to Terrace.</h1>
      <p style="margin:0 0 12px;">${greeting}</p>
      <p style="margin:0 0 24px;">You're in. The next step is finishing your account setup so brands and creators can find you.</p>
      <p style="margin:0 0 24px;">${ctaButton("Continue onboarding", `${APP_URL}/onboarding`)}</p>
      <p style="margin:0;font-size:13px;color:#687386;">Reply to this email if you hit anything weird — we read every reply.</p>
    `
  });

  const text = [
    `Welcome to Terrace.`,
    ``,
    greeting,
    ``,
    `You're in. Finish setting up your account so brands and creators can find you.`,
    ``,
    `Continue onboarding: ${APP_URL}/onboarding`,
    ``,
    `Reply if you hit anything weird.`,
    ``,
    `— Terrace`
  ].join("\n");

  return {
    to: input.to,
    subject: "Welcome to Terrace",
    html,
    text,
    tags: [{ name: "category", value: "welcome" }]
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Application + payment + message templates — build the HTML body once,
// callers pass them into createNotification's email payload.
// ─────────────────────────────────────────────────────────────────────────

export function applicationReceivedEmail(input: {
  jobId: string;
  jobTitle: string;
  creatorName: string;
  pitch: string;
}) {
  const reviewUrl = `${APP_URL}/jobs/${input.jobId}/applicants`;
  return {
    subject: `New application: ${input.jobTitle}`,
    text: `${input.creatorName} just applied to your brief "${input.jobTitle}".\n\nPitch:\n${input.pitch}\n\nReview applicants: ${reviewUrl}`,
    html: wrapInLayout({
      preheader: `${input.creatorName} applied to ${input.jobTitle}`,
      body: `
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#9aa3b2;text-transform:uppercase;">New application</p>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 16px;"><strong>${input.creatorName}</strong> applied to ${input.jobTitle}.</h1>
        <div style="background:#fbfcfd;border:1px solid #ececec;border-radius:14px;padding:16px;margin:0 0 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;color:#9aa3b2;text-transform:uppercase;">Pitch</p>
          <p style="margin:0;color:#5f6673;">${escapeHtml(input.pitch)}</p>
        </div>
        <p style="margin:0 0 24px;">${ctaButton("Review applicants", reviewUrl)}</p>
      `
    })
  };
}

export function applicationStatusEmail(input: {
  jobId: string;
  jobTitle: string;
  status: "shortlisted" | "hired" | "rejected" | "submitted";
}) {
  const briefUrl = `${APP_URL}/jobs/${input.jobId}`;
  const headline =
    input.status === "hired"
      ? `You got hired for "${input.jobTitle}"`
      : input.status === "shortlisted"
        ? `You're shortlisted for "${input.jobTitle}"`
        : input.status === "rejected"
          ? `Update on "${input.jobTitle}"`
          : `Application update — "${input.jobTitle}"`;
  const body =
    input.status === "hired"
      ? `Congratulations — the brand picked you. They'll fund the brief soon, then you can start delivering.`
      : input.status === "shortlisted"
        ? `The brand moved your application to the shortlist. Keep an eye on this thread for the next step.`
        : input.status === "rejected"
          ? `The brand passed on this brief. Plenty of other briefs match your niche.`
          : `Your application status changed.`;
  return {
    subject: headline,
    text: `${headline}\n\n${body}\n\nBrief: ${briefUrl}`,
    html: wrapInLayout({
      preheader: headline,
      body: `
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#9aa3b2;text-transform:uppercase;">Application update</p>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 16px;">${headline}</h1>
        <p style="margin:0 0 24px;">${body}</p>
        <p style="margin:0 0 24px;">${ctaButton("View brief", briefUrl)}</p>
      `
    })
  };
}

export function paymentCapturedEmail(input: { jobTitle: string; payoutCents: number; currency: string }) {
  const dashboardUrl = `${APP_URL}/jobs/saved`;
  const amount = formatCurrency(input.payoutCents, input.currency);
  return {
    subject: `Brief funded — start delivering`,
    text: `The brand funded "${input.jobTitle}". ${amount} releases to your Stripe account after delivery is confirmed.\n\nView details: ${dashboardUrl}`,
    html: wrapInLayout({
      preheader: `Brief funded — ${amount} held until delivery.`,
      body: `
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#147a3b;text-transform:uppercase;">Brief funded</p>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 16px;">Start delivering "${input.jobTitle}".</h1>
        <p style="margin:0 0 16px;">The brand paid. We're holding <strong>${amount}</strong> for you. Funds release to your Stripe account once the brand confirms delivery.</p>
        <p style="margin:0 0 24px;">${ctaButton("View brief", dashboardUrl)}</p>
      `
    })
  };
}

export function paymentReleasedEmail(input: { jobTitle: string; payoutCents: number; currency: string }) {
  const dashboardUrl = `${APP_URL}/jobs/saved`;
  const amount = formatCurrency(input.payoutCents, input.currency);
  return {
    subject: `Funds released for "${input.jobTitle}"`,
    text: `${amount} is on its way to your Stripe account. Stripe typically settles within 2-7 business days.\n\nView details: ${dashboardUrl}`,
    html: wrapInLayout({
      preheader: `${amount} on the way to your account.`,
      body: `
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#2f83b7;text-transform:uppercase;">Payment released</p>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 16px;">${amount} on the way.</h1>
        <p style="margin:0 0 16px;">The brand confirmed delivery on "${input.jobTitle}". Funds were transferred to your Stripe account — typical settlement is 2-7 business days.</p>
        <p style="margin:0 0 24px;">${ctaButton("View brief", dashboardUrl)}</p>
      `
    })
  };
}

export function newMessageEmail(input: { threadId: string; preview: string; senderName?: string }) {
  const threadUrl = `${APP_URL}/messages/${input.threadId}`;
  const sender = input.senderName ?? "Someone";
  return {
    subject: "New message on Terrace",
    text: `${sender} sent you a message:\n\n${input.preview}\n\nReply: ${threadUrl}`,
    html: wrapInLayout({
      preheader: `${sender}: ${input.preview.slice(0, 80)}`,
      body: `
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#9aa3b2;text-transform:uppercase;">New message</p>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 16px;">${sender} sent you a message.</h1>
        <div style="background:#fbfcfd;border:1px solid #ececec;border-radius:14px;padding:16px;margin:0 0 24px;color:#5f6673;">
          ${escapeHtml(input.preview)}
        </div>
        <p style="margin:0 0 24px;">${ctaButton("Reply", threadUrl)}</p>
      `
    })
  };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br/>");
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}
