"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError(null);
        const f = new FormData(e.currentTarget);
        const supabase = browserClient();
        // Phones often auto-capitalise or add a trailing space; emails are case-insensitive.
        const email = String(f.get("email")).trim().toLowerCase();
        const { error } = await supabase.auth.signInWithPassword({ email, password: String(f.get("password")).replace(/^\s+|\s+$/g, "") });
        if (error) {
          setBusy(false);
          setError(error.status === 429 ? "Too many attempts. Wait a few minutes and try again." : "Email or password is incorrect.");
          return;
        }
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        router.replace(data?.nextLevel === "aal2" && data.currentLevel !== "aal2" ? "/admin/login/mfa" : next);
        router.refresh();
      }}
    >
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="field" /></div>
      <div>
        <div className="flex items-baseline justify-between"><label htmlFor="password" className="label">Password</label><Link href="/admin/login/forgot" className="text-sm text-accent hover:underline">Forgot password?</Link></div>
        <input id="password" name="password" type={show ? "text" : "password"} required autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="field" />
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4" /> Show password
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-live">{error}</p>}
      <button className="btn btn-primary mt-2 w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
