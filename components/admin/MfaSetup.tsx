"use client";
/* eslint-disable @next/next/no-img-element -- Supabase returns the QR code as an SVG data URL */
import { useCallback, useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

type Factor = { id: string; friendly_name?: string; status: string };

export function MfaSetup({ highlight }: { highlight?: boolean }) {
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enrol, setEnrol] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => browserClient().auth.mfa.listFactors().then(({ data }) => setFactors((data?.totp ?? []) as Factor[])), []);
  useEffect(() => {
    let alive = true;
    browserClient().auth.mfa.listFactors().then(({ data }) => { if (alive) setFactors((data?.totp ?? []) as Factor[]); });
    return () => { alive = false; };
  }, []);

  const verified = factors?.filter((f) => f.status === "verified") ?? [];

  async function start() {
    setBusy(true); setMsg(null);
    const supabase = browserClient();
    // Clear any half-finished enrolment first.
    for (const f of factors ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (error || !data) return setMsg({ ok: false, text: error?.message ?? "Couldn't start setup." });
    setEnrol({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  return (
    <div className={highlight ? "outline outline-2 outline-offset-4 outline-gold-500" : ""}>
      {factors === null ? <p className="text-sm text-muted">Checking…</p> : verified.length > 0 ? (
        <div>
          <p className="font-medium text-emerald-700 dark:text-emerald-400">Two-factor authentication is on.</p>
          <p className="mt-1 text-sm text-muted">You&apos;ll enter a code from your authenticator app each time you sign in.</p>
          <button type="button" className="mt-3 text-sm font-semibold text-live hover:underline" disabled={busy}
            onClick={async () => {
              if (!confirm("Turn off two-factor authentication? Your account will be protected by your password only.")) return;
              setBusy(true);
              const { error } = await browserClient().auth.mfa.unenroll({ factorId: verified[0].id });
              setBusy(false);
              setMsg(error ? { ok: false, text: error.message.includes("aal2") ? "Sign out and back in with your code, then try again." : error.message } : { ok: true, text: "Two-factor authentication turned off." });
              load();
            }}>Turn off</button>
        </div>
      ) : enrol ? (
        <form className="grid gap-4" onSubmit={async (e) => {
          e.preventDefault(); setBusy(true);
          const code = String(new FormData(e.currentTarget).get("code")).replace(/\s/g, "");
          const { error } = await browserClient().auth.mfa.challengeAndVerify({ factorId: enrol.id, code });
          setBusy(false);
          if (error) return setMsg({ ok: false, text: "That code didn't match. Try the newest code from your app." });
          setEnrol(null); setMsg({ ok: true, text: "Two-factor authentication is now on." }); load();
        }}>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Open Google Authenticator, Microsoft Authenticator or 1Password.</li>
            <li>Scan this QR code, or enter the key manually.</li>
            <li>Type the 6-digit code the app shows.</li>
          </ol>
          <div className="flex flex-wrap items-center gap-5">
            <img src={enrol.qr} alt="QR code for your authenticator app" className="h-40 w-40 bg-white p-2" />
            <p className="text-xs text-muted">Key: <code className="break-all bg-surface px-1 text-fg">{enrol.secret}</code></p>
          </div>
          <div className="flex items-end gap-3">
            <div><label htmlFor="mfa-code" className="label">Code</label><input id="mfa-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required className="field w-40 font-mono text-lg tracking-widest" /></div>
            <button className="btn btn-primary" disabled={busy}>{busy ? "Checking…" : "Turn on"}</button>
          </div>
        </form>
      ) : (
        <div>
          <p className="text-sm text-muted">Protect your account with a code from your phone, so a stolen password isn&apos;t enough to get in.</p>
          <button type="button" className="btn btn-primary mt-3" onClick={start} disabled={busy}>{busy ? "Starting…" : "Set up two-factor authentication"}</button>
        </div>
      )}
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 text-sm ${msg.ok ? "text-accent" : "text-live"}`}>{msg.text}</p>}
    </div>
  );
}
