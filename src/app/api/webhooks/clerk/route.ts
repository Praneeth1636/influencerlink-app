import { headers } from "next/headers";
import { Webhook } from "svix";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

const log = logger.child({ route: "POST /api/webhooks/clerk" });

// ---------------------------------------------------------------------------
// Webhook event shapes (subset of Clerk's event catalogue)
// ---------------------------------------------------------------------------

type EmailAddress = { id: string; email_address: string };

type UserCreatedData = {
  id: string;
  email_addresses: EmailAddress[];
  primary_email_address_id: string;
};

type UserUpdatedData = UserCreatedData;

type UserDeletedData = { id: string; deleted: boolean };

type OrgCreatedData = {
  id: string;
  name: string;
  slug: string;
  created_by: string;
};

type OrgMembershipCreatedData = {
  organization: { id: string };
  public_user_data: { user_id: string };
  role: string;
};

type ClerkEvent =
  | { type: "user.created"; data: UserCreatedData }
  | { type: "user.updated"; data: UserUpdatedData }
  | { type: "user.deleted"; data: UserDeletedData }
  | { type: "organization.created"; data: OrgCreatedData }
  | { type: "organizationMembership.created"; data: OrgMembershipCreatedData };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function primaryEmail(data: UserCreatedData): string {
  const hit = data.email_addresses.find((e) => e.id === data.primary_email_address_id);
  return hit?.email_address ?? data.email_addresses[0]?.email_address ?? "";
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    log.error("CLERK_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerStore = await headers();
  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  let event: ClerkEvent;

  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as ClerkEvent;
  } catch (err) {
    log.warn({ err }, "Webhook signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  log.info({ type: event.type }, "Clerk webhook received");

  try {
    switch (event.type) {
      case "user.created": {
        const email = primaryEmail(event.data);
        await db.insert(users).values({
          clerkId: event.data.id,
          email,
          type: "creator"
        });
        log.info({ clerkId: event.data.id, email }, "user.created: users row inserted");
        break;
      }

      case "user.updated": {
        const email = primaryEmail(event.data);
        await db.update(users).set({ email }).where(eq(users.clerkId, event.data.id));
        log.info({ clerkId: event.data.id, email }, "user.updated: email synced");
        break;
      }

      case "user.deleted": {
        // ON DELETE CASCADE in the schema propagates to creators, brandMembers, etc.
        await db.delete(users).where(eq(users.clerkId, event.data.id));
        log.info({ clerkId: event.data.id }, "user.deleted: row cascade-deleted");
        break;
      }

      case "organization.created": {
        // The brands row is created during the brand onboarding form (Phase 3.2).
        // Log for audit; no DB write here.
        log.info(
          { orgId: event.data.id, name: event.data.name, createdBy: event.data.created_by },
          "organization.created: noted — brands row created during onboarding"
        );
        break;
      }

      case "organizationMembership.created": {
        // brand_members row is written during onboarding or invite acceptance.
        log.info(
          {
            orgId: event.data.organization.id,
            userId: event.data.public_user_data.user_id,
            role: event.data.role
          },
          "organizationMembership.created: noted — brand_members row written during onboarding"
        );
        break;
      }

      default: {
        log.debug({ type: (event as { type: string }).type }, "Unhandled Clerk event type");
      }
    }
  } catch (err) {
    log.error({ err, type: event.type }, "Webhook handler DB error");
    return new Response("Internal error", { status: 500 });
  }

  return new Response(null, { status: 204 });
}
