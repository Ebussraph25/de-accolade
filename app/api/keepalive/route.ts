import { NextResponse, type NextRequest } from "next/server";
import { publicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/**
 * Called once a day by Vercel Cron (see vercel.json). A tiny read keeps the free Supabase
 * project from being paused for inactivity during quiet weeks.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const db = publicClient();
  if (!db) return NextResponse.json({ ok: true, database: "not configured" });
  const { count, error } = await db.from("articles").select("id", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, error: "database unreachable" }, { status: 503 });
  return NextResponse.json({ ok: true, publishedStories: count ?? 0, at: new Date().toISOString() });
}
