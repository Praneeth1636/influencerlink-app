import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_123", {
  appInfo: {
    name: "CreatorLink",
    version: "0.1.0"
  }
});
