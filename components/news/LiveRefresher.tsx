"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Re-fetches the live timeline every minute while the tab is visible. */
export function LiveRefresher({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, seconds * 1000);
    return () => clearInterval(id);
  }, [auto, router, seconds]);
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
      <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-[var(--live)]" />
      Update automatically
    </label>
  );
}
