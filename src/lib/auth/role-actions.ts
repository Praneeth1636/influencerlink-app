"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { APP_ROLE_COOKIE, type AppRole } from "@/lib/auth/role";

export async function setAppRolePreference(role: AppRole) {
  const cookieStore = await cookies();

  cookieStore.set(APP_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath("/", "layout");
}
