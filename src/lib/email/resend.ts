// Lazy Resend client. Mirrors the storage/r2.ts pattern: env vars are read on
// first use, so build/server start does not require an API key. When the key
// is missing, EmailNotConfiguredError is thrown by sendEmail; callers turn
// that into either a soft-skip (welcome emails) or a 5xx (transactional ops).

import { Resend } from "resend";

let cachedClient: Resend | null = null;

export class EmailNotConfiguredError extends Error {
  readonly statusCode = 503;
  constructor() {
    super("Email is not configured. Set RESEND_API_KEY (and optionally EMAIL_FROM, EMAIL_REPLY_TO).");
    this.name = "EmailNotConfiguredError";
  }
}

export type EmailEnvelope = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
};

export type EmailSendResult = { id: string };

export function getDefaultFromAddress(): string {
  return process.env.EMAIL_FROM ?? "InfluencerLink <notifications@influencerlink.app>";
}

export function getDefaultReplyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO;
}

function getClient(): Resend {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new EmailNotConfiguredError();
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export async function deliverEmail(envelope: EmailEnvelope): Promise<EmailSendResult> {
  const client = getClient();
  const replyTo = envelope.replyTo ?? getDefaultReplyTo();
  const { data, error } = await client.emails.send({
    from: getDefaultFromAddress(),
    to: envelope.to,
    subject: envelope.subject,
    html: envelope.html,
    text: envelope.text,
    ...(replyTo ? { replyTo } : {}),
    ...(envelope.tags ? { tags: envelope.tags } : {})
  });
  if (error) {
    throw new Error(`Resend delivery failed: ${error.message}`);
  }
  if (!data?.id) {
    throw new Error("Resend delivery returned no id");
  }
  return { id: data.id };
}

// Test seam — call between tests to drop the cached client.
export function _resetForTests() {
  cachedClient = null;
}
