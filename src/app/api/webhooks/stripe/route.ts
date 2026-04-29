import type Stripe from "stripe";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe/client";
import {
  markStripeSubscriptionPastDue,
  syncCheckoutSession,
  syncStripeSubscription
} from "@/server/services/billing-service";

export const runtime = "nodejs";

const log = logger.child({ route: "POST /api/webhooks/stripe" });

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    log.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    log.warn({ error }, "Stripe webhook signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await syncCheckoutSession(db, event.data.object);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncStripeSubscription(db, event.data.object.id);
        break;
      }

      case "invoice.payment_failed": {
        const subscriptionId = getInvoiceSubscriptionId(event.data.object);
        if (subscriptionId) {
          await markStripeSubscriptionPastDue(db, subscriptionId);
        }
        break;
      }

      default: {
        log.debug({ type: event.type }, "Unhandled Stripe event type");
      }
    }
  } catch (error) {
    log.error({ error, type: event.type }, "Stripe webhook handler failed");
    return new Response("Internal error", { status: 500 });
  }

  return new Response(null, { status: 204 });
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const subscription = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null })
    .subscription;

  if (!subscription) {
    return null;
  }

  return typeof subscription === "string" ? subscription : subscription.id;
}
