"use client";
import { useActionState, useEffect, useRef } from "react";
import type { ActionResult } from "@/app/admin/actions";

/** Form bound to a server action; shows the result and clears itself after success. */
export function SimpleForm({ action, children, className = "", resetOnSuccess = true }: { action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>; children: React.ReactNode; className?: string; resetOnSuccess?: boolean }) {
  const [state, formAction, pending] = useActionState(action, { ok: true });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok && state.message && resetOnSuccess) ref.current?.reset(); }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className} aria-busy={pending}>
      <fieldset disabled={pending} className="contents">{children}</fieldset>
      {state.message && <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-accent" : "text-live"}`}>{state.message}</p>}
    </form>
  );
}
