import { getStaff, atLeast } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

/** CSV export for the newsletter tool of your choice (Mailchimp, Brevo, Resend, …). Editors only. */
export async function GET() {
  const staff = await getStaff();
  if (!staff || !atLeast(staff.role, "editor")) return new Response("Forbidden", { status: 403 });
  const db = await serverClient();
  const { data } = await db.from("subscribers").select("email,language,created_at").order("created_at").limit(50000);
  const esc = (v: string) => (/[",\n]/.test(v) || /^[=+\-@]/.test(v) ? `"${v.replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"` : v);
  const csv = ["email,language,subscribed_at", ...(data ?? []).map((r) => [r.email, r.language, r.created_at].map(esc).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="de-accolade-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
