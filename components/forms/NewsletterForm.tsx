"use client";
import { Honeypot, useSubmit } from "./useSubmit";

export function NewsletterForm({ title, cta, lang = "en", tone = "light" }: { title: string; cta: string; lang?: string; tone?: "light" | "dark" }) {
  const { state, submit } = useSubmit("/api/newsletter");
  const dark = tone === "dark";
  return (
    <div>
      <p className={`headline text-2xl md:text-[1.75rem] ${dark ? "text-white" : ""}`}>{title}</p>
      {state.status === "done" ? (
        <p role="status" className={`mt-4 font-medium ${dark ? "text-gold-400" : "text-accent"}`}>You&apos;re subscribed. Look out for our next edition in your inbox.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget, { language: lang }); }} className="relative mt-4 flex flex-col gap-2 sm:flex-row" noValidate>
          <Honeypot />
          <label htmlFor={`nl-${tone}`} className="sr-only">Email address</label>
          <input id={`nl-${tone}`} type="email" name="email" required placeholder="you@example.com" autoComplete="email"
            className={`field flex-1 ${dark ? "border-white/20 bg-white/10 text-white placeholder:text-white/50" : ""}`} />
          <button className="btn btn-gold" disabled={state.status === "sending"}>{state.status === "sending" ? "Subscribing…" : cta}</button>
        </form>
      )}
      {state.status === "error" && <p role="alert" className={`mt-2 text-sm ${dark ? "text-red-300" : "text-live"}`}>{state.errors.email ?? state.message}</p>}
      <p className={`mt-2 text-xs ${dark ? "text-white/60" : "text-muted"}`}>One email a week, plus breaking alerts. Unsubscribe any time.</p>
    </div>
  );
}
