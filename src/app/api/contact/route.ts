import { badRequest, json, readJson } from "@/lib/api";
import { db } from "@/lib/prototype-db";

export const runtime = "nodejs";

type ContactBody = {
  fullName?: string;
  email?: string;
  company?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = await readJson<ContactBody>(request);
  if (!body?.fullName || body.fullName.trim().length < 2) return badRequest("Full name is required.");
  if (!body.email || !body.email.includes("@")) return badRequest("Valid email is required.");
  if (!body.message || body.message.trim().length < 5) return badRequest("Message is required.");
  return json({
    contact: db.createContactMessage({
      fullName: body.fullName.trim(),
      email: body.email,
      company: body.company?.trim(),
      message: body.message.trim()
    })
  });
}
