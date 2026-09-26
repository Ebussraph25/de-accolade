import type { NextRequest } from "next/server";
import { ok, fail, readJson, sameOrigin } from "@/lib/api";
import { publicClient } from "@/lib/supabase/public";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Request not allowed.");
  const body = await readJson(req);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return fail(422, "Invalid article.");
  const db = publicClient();
  if (db) await db.rpc("increment_article_view", { p_slug: slug });
  return ok();
}
