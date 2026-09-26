import type { NextRequest } from "next/server";
import { fail, looksLikeBot, ok, rateLimited, readJson, sameOrigin } from "@/lib/api";
import { fieldErrors, newsletterSchema } from "@/lib/validation";
import { publicClient } from "@/lib/supabase/public";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Request not allowed.");
  const parsed = newsletterSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(422, "Check the highlighted fields.", fieldErrors(parsed.error));
  if (looksLikeBot(parsed.data)) return ok(); // silently accept
  if (await rateLimited(req, "newsletter", 5, 3600)) return fail(429, "Too many attempts. Try again in an hour.");
  const db = publicClient();
  if (!db) return ok({ demo: true });
  const { error } = await db.from("subscribers").insert({ email: parsed.data.email, language: parsed.data.language });
  if (error && error.code !== "23505") return fail(500, "We couldn't save your subscription. Try again shortly.");
  return ok();
}
