import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [row] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (row?.onboardedAt) {
    redirect(row.type === "brand_member" ? "/search" : "/feed");
  }

  return <OnboardingFlow />;
}
