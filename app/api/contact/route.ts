import type { NextRequest } from "next/server";
import { fail, looksLikeBot, ok, rateLimited, readJson, sameOrigin } from "@/lib/api";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { publicClient } from "@/lib/supabase/public";
import { notifyNewsroom } from "@/lib/notify";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Request not allowed.");
  const parsed = contactSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(422, "Check the highlighted fields.", fieldErrors(parsed.error));
  if (looksLikeBot(parsed.data)) return ok();
  if (await rateLimited(req, "contact", 5, 3600)) return fail(429, "Too many messages. Try again in an hour.");
  const { name, email, phone, subject, message } = parsed.data;
  const db = publicClient();
  if (!db) return ok({ demo: true });
  const { error } = await db.from("contact_messages").insert({ name, email, phone: phone || null, subject, message });
  if (error) return fail(500, "We couldn't send your message. Email us directly instead.");
  await notifyNewsroom(`Contact form: ${subject}`, { Name: name, Email: email, Phone: phone, Message: message });
  return ok();
}
