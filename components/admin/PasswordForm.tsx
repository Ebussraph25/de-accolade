"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";

export function PasswordForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="grid gap-4" onSubmit={async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const f = new FormData(form);
      const pw = String(f.get("password")), confirm = String(f.get("confirm"));
      if (pw.length < 10) return setMsg({ ok: false, text: "Use at least 10 characters." });
      if (pw !== confirm) return setMsg({ ok: false, text: "The passwords don't match." });
      setBusy(true);
      const { error } = await browserClient().auth.updateUser({ password: pw });
      setBusy(false);
      if (error) return setMsg({ ok: false, text: error.message.includes("session") ? "Your reset link has expired. Request a new one." : error.message });
      form.reset();
      if (redirectTo) router.replace(redirectTo);
      else setMsg({ ok: true, text: "Password updated." });
    }}>
      <div><label htmlFor="password" className="label">New password</label><input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="field" /></div>
      <div><label htmlFor="confirm" className="label">Confirm new password</label><input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="field" /></div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-accent" : "text-live"}`}>{msg.text}</p>}
      <div><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save password"}</button></div>
    </form>
  );
}
