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
  const { userId } = await auth();

  // Local-demo / E2E bypass: only for ANONYMOUS browsing. A real signed-in
  // user must still go through the DB onboarded check — otherwise localhost
  // would loop them back through onboarding on every sign-in even after
  // they've finished.
  if (!userId) {
    if (process.env.E2E_BYPASS_AUTH === "true" || isLocalDemoRequest(requestHeaders)) {
      return <OnboardingFlow />;
    }
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
