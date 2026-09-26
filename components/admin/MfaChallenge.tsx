"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";

export function MfaChallenge() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError(null);
        const code = String(new FormData(e.currentTarget).get("code")).replace(/\s/g, "");
        const supabase = browserClient();
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const factor = factors?.totp.find((f) => f.status === "verified");
        if (!factor) { setBusy(false); setError("No authenticator is set up for this account."); return; }
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
        if (error) { setBusy(false); setError("That code didn't work. Check the time on your phone and try the newest code."); return; }
        router.replace("/admin/dashboard");
        router.refresh();
      }}
    >
      <div>
        <label htmlFor="code" className="label">Verification code</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus className="field text-center font-mono text-2xl tracking-[0.4em]" />
      </div>
      {error && <p role="alert" className="text-sm text-live">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Verifying…" : "Verify"}</button>
      <button type="button" className="text-sm text-muted hover:underline" onClick={async () => { await browserClient().auth.signOut(); router.replace("/admin/login"); router.refresh(); }}>Use a different account</button>
    </form>
  );
}
