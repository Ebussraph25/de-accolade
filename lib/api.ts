import "server-only";
import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { publicClient } from "./supabase/public";

export const ok = (data: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...data });
export const fail = (status: number, message: string, errors?: Record<string, string>) =>
  NextResponse.json({ ok: false, message, errors }, { status });

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Rate limit per IP (hashed — raw IPs are never stored). Fails open if the DB is unavailable. */
export async function rateLimited(req: NextRequest, bucket: string, max: number, windowSeconds: number) {
  const db = publicClient();
  if (!db) return false;
  const key = `${bucket}:${createHash("sha256").update(clientIp(req) + (process.env.RATE_LIMIT_SALT ?? "")).digest("hex").slice(0, 32)}`;
  const { data, error } = await db.rpc("check_rate_limit", { p_key: key, p_max: max, p_window_seconds: windowSeconds });
  if (error) return false;
  return data === false;
}

/** True when the request looks automated: honeypot filled, or form submitted implausibly fast. */
export function looksLikeBot(body: { website?: string; t?: number }) {
  if (body.website) return true;
  if (body.t && Date.now() - body.t < 2500) return true;
  return false;
}

/** Only accept JSON posts from our own origin (CSRF defence in depth on top of SameSite cookies). */
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function readJson(req: NextRequest) {
  try {
    const text = await req.text();
    if (text.length > 20_000) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
