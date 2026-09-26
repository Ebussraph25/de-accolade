"use client";
import { useTransition } from "react";
import { resetStaffPassword } from "@/app/admin/actions";

export function ResetPasswordButton({ userId, name }: { userId: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className="text-sm font-semibold text-accent hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(`Give ${name} a new temporary password? Their current password will stop working.`)) return;
        start(async () => {
          const r = await resetStaffPassword(userId);
          if (!r.ok) return alert(r.message ?? "That didn't work.");
          const pw = r.message?.replace("New temporary password: ", "") ?? "";
          prompt(`New temporary password for ${name}. Copy it and share it privately:`, pw);
        });
      }}>
      {pending ? "…" : "Reset password"}
    </button>
  );
}
