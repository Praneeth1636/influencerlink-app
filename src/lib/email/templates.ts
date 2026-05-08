// Typed email template builders. Each returns { subject, html, text } so the
// caller can pass them straight into deliverEmail. Templates here stay
// framework-free (no React Email yet) — strings are the lowest-friction
// surface and let the rest of the email pipeline ship today.

import type { EmailEnvelope } from "./resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://influencerlink.app";
const SUPPORT_EMAIL = process.env.EMAIL_REPLY_TO ?? "support@influencerlink.app";

type WelcomeInput = {
  to: string;
  displayName?: string | null;
};

export function welcomeEmail(input: WelcomeInput): EmailEnvelope {
  const greeting = input.displayName ? `Hi ${input.displayName},` : "Hi there,";

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111;">
      <h1 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Welcome to Terrace.</h1>
      <p style="font-size: 15px; line-height: 1.6;">${greeting}</p>
      <p style="font-size: 15px; line-height: 1.6;">
        You're in. The next step is finishing your account setup so brands and creators can find you.
      </p>
      <p style="margin: 28px 0;">
        <a href="${APP_URL}/onboarding"
           style="display: inline-block; background: #D85A30; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 700;">
          Continue onboarding
        </a>
      </p>
      <p style="font-size: 13px; color: #666; line-height: 1.6;">
        Reply to this email if you hit anything weird — we read every reply.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />
      <p style="font-size: 12px; color: #999;">Terrace · ${SUPPORT_EMAIL}</p>
    </div>
  `;

  const text = [
    `Welcome to Terrace.`,
    ``,
    greeting,
    ``,
    `You're in. Finish setting up your account so brands and creators can find you.`,
    ``,
    `Continue onboarding: ${APP_URL}/onboarding`,
    ``,
    `Reply to this email if you hit anything weird.`,
    ``,
    `— Terrace (${SUPPORT_EMAIL})`
  ].join("\n");

  return {
    to: input.to,
    subject: "Welcome to Terrace",
    html,
    text,
    tags: [{ name: "category", value: "welcome" }]
  };
}
