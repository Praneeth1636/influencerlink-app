import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const sessionCookieName = "influencerlink_session";

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;
  return db.getUserBySession(token);
}

export async function getCurrentSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(sessionCookieName)?.value ?? null;
}
