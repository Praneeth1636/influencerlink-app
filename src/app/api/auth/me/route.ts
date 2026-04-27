import { getCurrentUser } from "@/lib/auth";
import { json, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return json({ user });
}
