"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setStaffRole } from "@/app/admin/actions";

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string | null; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select aria-label="Role" className="field w-auto py-1 text-sm" disabled={disabled || pending} value={role ?? ""}
      onChange={(e) => {
        const v = e.target.value || null;
        if (v === null && !confirm("Remove this person's newsroom access?")) return;
        start(async () => { const r = await setStaffRole(userId, v); if (!r.ok) alert(r.message); router.refresh(); });
      }}>
      <option value="super_admin">Super admin</option>
      <option value="editor">Editor</option>
      <option value="reporter">Reporter</option>
      <option value="">No access</option>
    </select>
  );
}
