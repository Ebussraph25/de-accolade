import type { NextRequest } from "next/server";
import { fail, looksLikeBot, ok, rateLimited, readJson, sameOrigin } from "@/lib/api";
import { commentSchema, fieldErrors } from "@/lib/validation";
import { publicClient } from "@/lib/supabase/public";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Request not allowed.");
  const parsed = commentSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(422, "Check the highlighted fields.", fieldErrors(parsed.error));
  if (looksLikeBot(parsed.data)) return ok();
  if (await rateLimited(req, "comment", 6, 600)) return fail(429, "You're commenting too quickly. Wait a few minutes.");
  const db = publicClient();
  if (!db) return ok({ demo: true });
  const { article_id, name, email, body } = parsed.data;
  // Comments always enter the moderation queue; RLS enforces status = 'pending'.
  const { error } = await db.from("comments").insert({ article_id, name, email, body, status: "pending" });
  if (error) return fail(500, "We couldn't post your comment. Try again shortly.");
  return ok();
}
