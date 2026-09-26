"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";

/** Small button that runs a server action, refreshes the page, and reports errors. */
export function ActionButton({ run, children, confirmText, className = "" }: { run: () => Promise<ActionResult>; children: React.ReactNode; confirmText?: string; className?: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending} className={`text-sm font-semibold hover:underline disabled:opacity-50 ${className}`}
      onClick={() => {
        if (confirmText && !confirm(confirmText)) return;
        start(async () => { const r = await run(); if (!r.ok) alert(r.message ?? "That didn't work."); router.refresh(); });
      }}>
      {pending ? "…" : children}
    </button>
  );
}
