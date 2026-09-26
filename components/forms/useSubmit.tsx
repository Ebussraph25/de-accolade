"use client";
import { useState } from "react";

type State = { status: "idle" | "sending" | "done" | "error"; message?: string; errors: Record<string, string> };

export function useSubmit(endpoint: string) {
  const [started] = useState(() => Date.now());
  const [state, setState] = useState<State>({ status: "idle", errors: {} });

  async function submit(form: HTMLFormElement, extra: Record<string, unknown> = {}) {
    setState({ status: "sending", errors: {} });
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...extra, t: started }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setState({ status: "error", message: json.message ?? "Something went wrong. Try again.", errors: json.errors ?? {} });
        return false;
      }
      setState({ status: "done", errors: {} });
      form.reset();
      return true;
    } catch {
      setState({ status: "error", message: "You appear to be offline. Check your connection and try again.", errors: {} });
      return false;
    }
  }
  return { state, submit };
}

/** Hidden honeypot field. Real visitors never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Leave this field empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}
