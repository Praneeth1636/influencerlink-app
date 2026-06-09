import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocalDemoRequest } from "@/lib/auth/local-demo";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { OnboardingFlow } from "./onboarding-flow";

const log = logger.child({ module: "onboarding/page" });

export default async function OnboardingPage() {
  const requestHeaders = await headers();

  // Local-demo / E2E bypass runs before auth(); those modes deliberately skip
  // Clerk middleware, so calling auth() first would throw.
  if (process.env.E2E_BYPASS_AUTH === "true" || isLocalDemoRequest(requestHeaders)) {
    return <OnboardingFlow />;
  }

  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  let row: typeof users.$inferSelect | undefined;
  try {
    [row] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  } catch (err) {
    log.error({ err, userId }, "failed to load onboarding status");
  }

  if (row?.onboardedAt) {
    redirect(row.type === "brand_member" ? "/search" : "/feed");
  }

  return <OnboardingFlow />;
}
