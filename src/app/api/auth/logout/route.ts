import { clearSessionCookie, getCurrentSessionToken } from "@/lib/auth";
import { db } from "@/lib/prototype-db";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export async function POST() {
  const token = await getCurrentSessionToken();
  if (token) db.deleteSession(token);
  await clearSessionCookie();
  return json({ ok: true });
}
