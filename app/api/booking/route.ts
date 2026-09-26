import type { NextRequest } from "next/server";
import { fail, looksLikeBot, ok, rateLimited, readJson, sameOrigin } from "@/lib/api";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { publicClient } from "@/lib/supabase/public";
import { notifyNewsroom } from "@/lib/notify";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Request not allowed.");
  const parsed = bookingSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(422, "Check the highlighted fields.", fieldErrors(parsed.error));
  if (looksLikeBot(parsed.data)) return ok();
  if (await rateLimited(req, "booking", 5, 3600)) return fail(429, "Too many requests. Try again in an hour.");
  const b = parsed.data;
  const db = publicClient();
  if (!db) return ok({ demo: true });
  const { error } = await db.from("bookings").insert({
    name: b.name, email: b.email, phone: b.phone, package: b.package,
    event_date: b.event_date || null, location: b.location || null, details: b.details || null,
  });
  if (error) return fail(500, "We couldn't save your booking request. Call or email us instead.");
  await notifyNewsroom(`Coverage booking: ${b.package}`, {
    Name: b.name, Email: b.email, Phone: b.phone, Package: b.package, Date: b.event_date, Location: b.location, Details: b.details,
  });
  return ok();
}
