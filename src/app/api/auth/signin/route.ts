import { badRequest, json, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

type SigninBody = {
  email?: string;
};

export async function POST(request: Request) {
  const body = await readJson<SigninBody>(request);
  if (!body?.email || !body.email.includes("@")) return badRequest("Valid email is required.");

  const user =
    db.getUserByEmail(body.email) ??
    db.createUser({ email: body.email, name: body.email.split("@")[0], accountType: "creator" });
  const session = db.createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  return json({ user });
}
