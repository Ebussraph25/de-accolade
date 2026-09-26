"use client";
import Link from "next/link";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  if (sent) return <p role="status">If that address belongs to a newsroom account, a reset link is on its way. <Link href="/admin/login" className="text-accent underline">Back to sign in</Link></p>;
  return (
    <form className="grid gap-4" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const email = String(new FormData(e.currentTarget).get("email"));
      await browserClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset` });
      setSent(true); // same message either way, so the form can't be used to discover accounts
    }}>
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
      <Link href="/admin/login" className="text-center text-sm text-muted hover:underline">Back to sign in</Link>
    </form>
  );
}
