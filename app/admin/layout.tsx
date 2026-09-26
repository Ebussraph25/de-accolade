import type { Metadata } from "next";
import { hasSupabase } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = { title: { default: "Newsroom", template: "%s | De Accolade Newsroom" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface">{hasSupabase ? children : <SetupNotice />}</div>;
}
