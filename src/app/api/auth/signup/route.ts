import { badRequest, json, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

type SignupBody = {
  email?: string;
  name?: string;
  accountType?: "creator" | "brand" | "agency" | "manager";
};

export async function POST(request: Request) {
  const body = await readJson<SignupBody>(request);
  if (!body?.email || !body.email.includes("@")) return badRequest("Valid email is required.");
  if (!body.name || body.name.trim().length < 2) return badRequest("Full name is required.");

  const existing = db.getUserByEmail(body.email);
  const user = existing ?? db.createUser({ email: body.email, name: body.name.trim(), accountType: body.accountType ?? "creator" });
  const session = db.createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  return json({ user });
}
