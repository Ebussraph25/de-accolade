import Link from "next/link";
import { requirePage, roleLabel } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { Sidebar, type NavItem } from "@/components/admin/Sidebar";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requirePage("reporter");
  const isEditor = staff.role !== "reporter";
  let pendingComments = 0, pendingArticles = 0, newInbox = 0;
  if (isEditor) {
    const db = await serverClient();
    const [c, a, m, b] = await Promise.all([
      db.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("articles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
      db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);
    pendingComments = c.count ?? 0; pendingArticles = a.count ?? 0; newInbox = (m.count ?? 0) + (b.count ?? 0);
  }
  const items: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/articles", label: isEditor ? "Stories" : "My stories", badge: pendingArticles },
    { href: "/admin/articles/new", label: "Write a story" },
    ...(isEditor ? [
      { href: "/admin/comments", label: "Comments", badge: pendingComments },
      { href: "/admin/breaking", label: "Breaking ticker" },
      { href: "/admin/inbox", label: "Inbox", badge: newInbox },
    ] : []),
    ...(staff.role === "super_admin" ? [{ href: "/admin/team", label: "Team & activity" }] : []),
    { href: "/admin/account", label: "My account" },
  ];
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar
        items={items}
        footer={
          <div className="border-t border-white/10 px-2 pt-4 text-sm text-white/80">
            <p className="font-semibold text-white">{staff.full_name}</p>
            <p className="text-white/60">{roleLabel[staff.role]}</p>
            <div className="mt-3 flex gap-4">
              <Link href="/" target="_blank" className="hover:text-gold-400">View site</Link>
              <form action={signOut}><button className="hover:text-gold-400">Sign out</button></form>
            </div>
          </div>
        }
      />
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
