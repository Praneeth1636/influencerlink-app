// Email service. The single integration seam between the rest of the app and
// the email transport. Every send goes through here so we get audit logs,
// uniform error handling, and a single place to add quotas/idempotency later.

import { auditLogs, type User } from "@/lib/db/schema";
import { deliverEmail, EmailNotConfiguredError, type EmailEnvelope } from "@/lib/email/resend";
import { logger } from "@/lib/logger";
import type { Database } from "@/server/trpc";

const log = logger.child({ module: "email-service" });

export type SendResult = { ok: true; id: string } | { ok: false; reason: "not_configured" | "delivery_failed" };

type SendOptions = {
  envelope: EmailEnvelope;
  category: string;
  user?: Pick<User, "id"> | null;
  metadata?: Record<string, unknown>;
};

/**
 * Sends an email and writes an audit log row. Soft-fails when Resend is not
 * configured (returns { ok: false, reason: "not_configured" }) so callers can
 * decide whether the failure is fatal — webhooks should not 500 just because
 * an email key is missing.
 */
export async function sendEmail(db: Database, options: SendOptions): Promise<SendResult> {
  try {
    const result = await deliverEmail(options.envelope);

    await db.insert(auditLogs).values({
      userId: options.user?.id ?? null,
      action: "email.sent",
      entityType: "email",
      entityId: null,
      metadata: {
        category: options.category,
        to: options.envelope.to,
        resendId: result.id,
        ...options.metadata
      }
    });

    log.info({ category: options.category, resendId: result.id }, "email sent");
    return { ok: true, id: result.id };
  } catch (err) {
    if (err instanceof EmailNotConfiguredError) {
      log.warn({ category: options.category }, "email skipped — RESEND_API_KEY not set");
      return { ok: false, reason: "not_configured" };
    }
    log.error({ err, category: options.category }, "email delivery failed");
    return { ok: false, reason: "delivery_failed" };
  }
}
