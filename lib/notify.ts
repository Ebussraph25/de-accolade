import "server-only";

/**
 * Optional email alert to the newsroom (contact form, bookings) via Resend.
 * Set RESEND_API_KEY, NOTIFY_EMAIL_TO and NOTIFY_EMAIL_FROM to enable. Failures never block the user.
 */
export async function notifyNewsroom(subject: string, lines: Record<string, string | undefined | null>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM;
  if (!key || !to || !from) return;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const html = Object.entries(lines)
    .filter(([, v]) => v)
    .map(([k, v]) => `<p><strong>${esc(k)}:</strong><br>${esc(String(v)).replace(/\n/g, "<br>")}</p>`)
    .join("");
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), subject, html }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* non-fatal */
  }
}
